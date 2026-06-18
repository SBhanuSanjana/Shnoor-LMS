const express = require('express');
const pool = require('./db');

const router = express.Router();

// Get massive dashboard payload
router.get('/dashboard', async (req, res) => {
  try {
    const endDateStr = req.query.endDate || new Date().toISOString().split('T')[0];
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 14);
    const startDateStr = req.query.startDate || startDate.toISOString().split('T')[0];

    // 1. Summary Cards
    const totalUsersRes = await pool.query("SELECT COUNT(*) FROM users");
    const activeLearnersRes = await pool.query("SELECT COUNT(*) FROM users WHERE role = 'LEARNER' AND is_active = true");
    const coursesPublishedRes = await pool.query("SELECT COUNT(*) FROM courses WHERE is_published = true");
    const instructorsRes = await pool.query("SELECT COUNT(*) FROM users WHERE role = 'INSTRUCTOR'");
    const organizationsRes = await pool.query("SELECT COUNT(*) FROM organizations");
    const certsIssuedRes = await pool.query("SELECT COUNT(*) FROM certificate_requests WHERE status = 'APPROVED'");
    
    const enrollmentsTotalRes = await pool.query("SELECT COUNT(*) FROM enrollments");
    const completionsTotalRes = await pool.query("SELECT COUNT(*) FROM certificate_requests WHERE status = 'APPROVED'");
    
    const completionRate = parseInt(enrollmentsTotalRes.rows[0].count, 10) > 0 
      ? Math.round((parseInt(completionsTotalRes.rows[0].count, 10) / parseInt(enrollmentsTotalRes.rows[0].count, 10)) * 100) 
      : 0;
      
    const revenueRes = await pool.query(`
      SELECT SUM(amount) FROM payments 
      WHERE status IN ('COMPLETED', 'SUCCESS') AND created_at >= date_trunc('month', CURRENT_DATE)
    `);

    const summaryCards = {
      totalUsers: parseInt(totalUsersRes.rows[0].count, 10),
      activeLearners: parseInt(activeLearnersRes.rows[0].count, 10),
      coursesPublished: parseInt(coursesPublishedRes.rows[0].count, 10),
      instructors: parseInt(instructorsRes.rows[0].count, 10),
      organizations: parseInt(organizationsRes.rows[0].count, 10),
      certificatesIssued: parseInt(certsIssuedRes.rows[0].count, 10),
      completionRate: completionRate,
      revenueThisMonth: parseFloat(revenueRes.rows[0].sum || 0)
    };

    // 2. User Growth Trend (Daily within date range)
    const userGrowthQuery = `
      WITH dates AS (
        SELECT generate_series('${startDateStr}'::date, '${endDateStr}'::date, '1 day'::interval)::date as date
      )
      SELECT TO_CHAR(d.date, 'Mon DD') as date_str, COUNT(u.id) as count
      FROM dates d
      LEFT JOIN users u ON DATE(u.created_at) = d.date
      GROUP BY d.date
      ORDER BY d.date ASC
    `;
    const userGrowthRes = await pool.query(userGrowthQuery);
    
    let cumulativeUsers = 0;
    const baseUsersRes = await pool.query(`SELECT COUNT(*) FROM users WHERE created_at < '${startDateStr}'::date`);
    cumulativeUsers = parseInt(baseUsersRes.rows[0].count, 10);
    const userGrowthTrend = userGrowthRes.rows.map(row => {
      cumulativeUsers += parseInt(row.count, 10);
      return { date_str: row.date_str, count: cumulativeUsers };
    });

    // 3. User Role Distribution
    const roleDistQuery = `
      SELECT role, COUNT(*) as count 
      FROM users 
      WHERE is_active = true 
      GROUP BY role
    `;
    const roleDistRes = await pool.query(roleDistQuery);
    const roleDistribution = roleDistRes.rows.map(r => ({ role: r.role, count: parseInt(r.count, 10) }));

    // 4. Top Organizations by Users
    const topOrgsQuery = `
      SELECT o.name as org_name, COUNT(u.id) as total_users
      FROM organizations o
      LEFT JOIN users u ON u.organization_id = o.id
      GROUP BY o.id, o.name
      ORDER BY total_users DESC
      LIMIT 4
    `;
    const topOrgsRes = await pool.query(topOrgsQuery);
    const topOrganizations = topOrgsRes.rows.map(r => ({ org_name: r.org_name || 'Independent', total_users: parseInt(r.total_users, 10) }));

    // 5. Course Enrollments (Daily)
    const enrollmentsTrendQuery = `
      WITH dates AS (
        SELECT generate_series('${startDateStr}'::date, '${endDateStr}'::date, '1 day'::interval)::date as date
      )
      SELECT TO_CHAR(d.date, 'Mon DD') as date_str, COUNT(e.id) as count
      FROM dates d
      LEFT JOIN enrollments e ON DATE(e.created_at) = d.date
      GROUP BY d.date
      ORDER BY d.date ASC
    `;
    const enrollmentsTrendRes = await pool.query(enrollmentsTrendQuery);
    const enrollmentsTrend = enrollmentsTrendRes.rows.map(r => ({ date_str: r.date_str, count: parseInt(r.count, 10) }));

    // 6. Course Completion Rate (Daily)
    const completionTrendQuery = `
      WITH dates AS (
        SELECT generate_series('${startDateStr}'::date, '${endDateStr}'::date, '1 day'::interval)::date as date
      )
      SELECT TO_CHAR(d.date, 'Mon DD') as date_str, 
             COUNT(cr.id) as completions
      FROM dates d
      LEFT JOIN certificate_requests cr ON DATE(cr.created_at) = d.date AND cr.status = 'APPROVED'
      GROUP BY d.date
      ORDER BY d.date ASC
    `;
    const completionTrendRes = await pool.query(completionTrendQuery);
    const completionTrend = completionTrendRes.rows.map(r => ({ date_str: r.date_str, completions: parseInt(r.completions, 10) }));
    

    // 7. Recent Activity
    const activityQuery = `
      (SELECT 'user' as type, 'New user registered' as title, full_name || ' joined as a ' || LOWER(role::text) as description, created_at FROM users ORDER BY created_at DESC LIMIT 3)
      UNION ALL
      (SELECT 'course' as type, 'New course published' as title, '"' || title || '" published by ' || (SELECT full_name FROM users WHERE id = instructor_id) as description, created_at FROM courses WHERE is_published = true ORDER BY created_at DESC LIMIT 3)
      UNION ALL
      (SELECT 'certificate' as type, 'Certificate issued' as title, 'Certificate issued to ' || (SELECT full_name FROM users WHERE id = e.student_id) || ' for completing "' || (SELECT title FROM courses WHERE id = e.course_id) || '"' as description, cr.created_at FROM certificate_requests cr JOIN enrollments e ON cr.enrollment_id = e.id WHERE cr.status = 'APPROVED' ORDER BY created_at DESC LIMIT 3)
      ORDER BY created_at DESC
      LIMIT 4
    `;
    const activityRes = await pool.query(activityQuery);

    // 8. Popular Courses
    const popularCoursesQuery = `
      SELECT c.title, COUNT(e.id) as enrollment_count
      FROM courses c
      LEFT JOIN enrollments e ON c.id = e.course_id
      WHERE c.is_published = true
      GROUP BY c.id, c.title
      ORDER BY enrollment_count DESC
      LIMIT 4
    `;
    const popularCoursesRes = await pool.query(popularCoursesQuery);

    // 9. Learner Engagement
    const totalLearnersRes = await pool.query("SELECT COUNT(*) FROM users WHERE role = 'LEARNER'");
    const totalLearners = parseInt(totalLearnersRes.rows[0].count, 10);
    const activeLearners = summaryCards.activeLearners;
    const engagementPercentage = totalLearners > 0 ? Math.round((activeLearners / totalLearners) * 100) : 0;
    
    const inProgressRes = await pool.query("SELECT COUNT(*) FROM enrollments e LEFT JOIN certificate_requests cr ON e.id = cr.enrollment_id AND cr.status = 'APPROVED' WHERE cr.id IS NULL");
    
    const learnerEngagement = {
      engagementPercentage,
      activeLearners,
      coursesInProgress: parseInt(inProgressRes.rows[0].count, 10),
      completedCourses: parseInt(completionsTotalRes.rows[0].count, 10)
    };

    // 10. Revenue Trend (Daily)
    const revenueTrendQuery = `
      WITH dates AS (
        SELECT generate_series('${startDateStr}'::date, '${endDateStr}'::date, '1 day'::interval)::date as date
      )
      SELECT TO_CHAR(d.date, 'Mon DD') as date_str, 
             COALESCE(SUM(p.amount), 0) as revenue
      FROM dates d
      LEFT JOIN payments p ON DATE(p.created_at) = d.date AND p.status IN ('SUCCESS', 'COMPLETED')
      GROUP BY d.date
      ORDER BY d.date ASC
    `;
    const revenueTrendRes = await pool.query(revenueTrendQuery);
    const revenueTrend = revenueTrendRes.rows.map(r => ({ date_str: r.date_str, revenue: parseFloat(r.revenue) }));

    res.json({
      summaryCards,
      userGrowthTrend,
      roleDistribution,
      topOrganizations,
      enrollmentsTrend,
      completionTrend,
      revenueTrend,
      recentActivity: activityRes.rows,
      popularCourses: popularCoursesRes.rows,
      learnerEngagement
    });
  } catch (err) {
    console.error('Error fetching dashboard data:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Original users export routes
router.get('/users', async (req, res) => {
  try {
    const query = `
      SELECT 
        u.id, u.full_name, u.email, u.role, u.learner_type, u.is_active, u.created_at,
        o.name as organization_name,
        (SELECT COUNT(*) FROM enrollments e WHERE e.student_id = u.id) as courses_enrolled,
        (SELECT COUNT(*) FROM courses c WHERE c.instructor_id = u.id) as courses_published,
        (SELECT COUNT(*) FROM certificate_requests cr JOIN enrollments e ON cr.enrollment_id = e.id WHERE e.student_id = u.id AND cr.status = 'APPROVED') as certificates_received
      FROM users u
      LEFT JOIN organizations o ON u.organization_id = o.id
      WHERE u.role != 'ADMIN'
      ORDER BY u.created_at DESC
    `;
    const result = await pool.query(query);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching users for reports:', error);
    res.status(500).json({ error: 'Server error fetching users report' });
  }
});

router.get('/users/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const userQuery = `
      SELECT u.id, u.full_name, u.email, u.role, u.learner_type, u.is_active, u.created_at, u.phone_number,
             u.organization_id, o.name as organization_name
      FROM users u
      LEFT JOIN organizations o ON u.organization_id = o.id
      WHERE u.id = $1
    `;
    const userRes = await pool.query(userQuery, [id]);
    if (userRes.rows.length === 0) return res.status(404).json({ error: 'User not found' });
    const user = userRes.rows[0];

    const enrollmentsQuery = `
      SELECT 
        e.id as enrollment_id, c.id as course_id, c.title as course_title, e.created_at as enrolled_at,
        (SELECT COUNT(*) FROM lesson_progress lp WHERE lp.enrollment_id = e.id AND lp.is_completed = true) as lessons_completed,
        (SELECT score FROM quiz_attempts qa WHERE qa.enrollment_id = e.id ORDER BY created_at DESC LIMIT 1) as latest_quiz_score,
        (SELECT status FROM certificate_requests cr WHERE cr.enrollment_id = e.id LIMIT 1) as certificate_status
      FROM enrollments e
      JOIN courses c ON e.course_id = c.id
      WHERE e.student_id = $1
    `;
    const enrollmentsRes = await pool.query(enrollmentsQuery, [id]);

    let publishedCourses = [];
    let orgStats = null;
    
    if (user.role === 'INSTRUCTOR' || user.role === 'ADMIN') {
        const publishedCoursesQuery = `
            SELECT c.id, c.title, c.is_approved, c.is_published, c.created_at,
                   (SELECT COUNT(*) FROM enrollments e WHERE e.course_id = c.id) as total_enrollments
            FROM courses c
            WHERE c.instructor_id = $1
        `;
        const publishedCoursesRes = await pool.query(publishedCoursesQuery, [id]);
        publishedCourses = publishedCoursesRes.rows;
    } else if (user.role === 'ORGANIZATION_ADMIN' && user.organization_id) {
        const orgId = user.organization_id;
        const studentsRes = await pool.query("SELECT COUNT(*) FROM users WHERE organization_id = $1 AND role = 'LEARNER'", [orgId]);
        const instructorsRes = await pool.query("SELECT COUNT(*) FROM users WHERE organization_id = $1 AND role = 'INSTRUCTOR'", [orgId]);
        const coursesRes = await pool.query(`
            SELECT COUNT(*) 
            FROM courses c 
            JOIN users u ON c.instructor_id = u.id 
            WHERE u.organization_id = $1
        `, [orgId]);
        
        const orgInstructorsQuery = `
            SELECT u.id, u.full_name, u.email,
                   (SELECT COUNT(*) FROM courses c WHERE c.instructor_id = u.id) as published_courses
            FROM users u
            WHERE u.organization_id = $1 AND u.role = 'INSTRUCTOR'
            ORDER BY published_courses DESC
        `;
        const orgInstructorsRes = await pool.query(orgInstructorsQuery, [orgId]);
        
        orgStats = {
            totalStudents: parseInt(studentsRes.rows[0].count, 10),
            totalInstructors: parseInt(instructorsRes.rows[0].count, 10),
            totalCourses: parseInt(coursesRes.rows[0].count, 10),
            instructorsList: orgInstructorsRes.rows
        };
    }

    res.json({
      user,
      enrollments: enrollmentsRes.rows,
      publishedCourses,
      orgStats
    });
  } catch (error) {
    console.error('Error fetching user profile for reports:', error);
    res.status(500).json({ error: 'Server error fetching user profile report' });
  }
});

// 10. Fetch all real payments for Super Admin
router.get('/payments', async (req, res) => {
  try {
    const paymentsQuery = `
      SELECT p.id, p.transaction_id, p.amount, p.status, p.created_at, COALESCE(u.full_name, o.name) as user_name
      FROM payments p
      LEFT JOIN users u ON p.user_id = u.id
      LEFT JOIN organizations o ON p.organization_id = o.id
      ORDER BY p.created_at DESC
    `;
    const paymentsRes = await pool.query(paymentsQuery);
    res.json(paymentsRes.rows);
  } catch (error) {
    console.error('Error fetching payments:', error);
    res.status(500).json({ error: 'Server error fetching payments' });
  }
});

module.exports = (authMiddleware) => {
  const adminRouter = express.Router();
  adminRouter.use('/', authMiddleware(['ADMIN']), router);
  return adminRouter;
};
