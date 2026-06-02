const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const pool = require('./db');

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

// MIDDLEWARE

const authMiddleware = (roles = []) => {
  return (req, res, next) => {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Authorization token required' });
      }

      const token = authHeader.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_secret_key');
      req.user = decoded;

      // Check roles if provided
      if (roles.length > 0 && !roles.includes(decoded.role)) {
        return res.status(403).json({ error: 'Forbidden: Insufficient privileges' });
      }

      next();
    } catch (err) {
      return res.status(401).json({ error: 'Invalid or expired token' });
    }
  };
};


// Auth Controller
const registerUser = async (req, res) => {
  try {
    const { email, password, full_name, fullName, role } = req.body;
    const name = fullName || full_name;
    const userRole = (role || 'LEARNER').toUpperCase();

    // Check if user exists
    const existingUserQuery = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (existingUserQuery.rows.length > 0) {
      return res.status(400).json({ error: 'Email already exists' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Insert new user
    const insertQuery = `
      INSERT INTO users (email, password, full_name, role) 
      VALUES ($1, $2, $3, $4) 
      RETURNING id, email, full_name, role
    `;
    const newUserQuery = await pool.query(insertQuery, [email, hashedPassword, name, userRole]);
    const user = newUserQuery.rows[0];

    res.status(201).json({ message: 'User registered successfully', userId: user.id });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user
    const userQuery = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (userQuery.rows.length === 0) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }
    const user = userQuery.rows[0];

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    if (!user.is_active) {
      return res.status(403).json({ error: 'Account is deactivated' });
    }

    if (!user.is_approved) {
      return res.status(403).json({ error: 'Account is pending admin approval. You will be able to login once approved.' });
    }

    // Generate token
    const payload = {
      userId: user.id,
      email: user.email,
      role: user.role,
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET || 'your_secret_key', { expiresIn: '1d' });

    res.status(200).json({
      token,
      user: {
        id: user.id,
        email: user.email,
        fullName: user.full_name,
        role: user.role,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Admin Controller 
const getPendingCourses = async (req, res) => {
  if (req.user.role !== 'ORGANIZATION_ADMIN' && req.user.role !== 'ADMIN') return res.status(403).json({ error: 'Access denied' });

  try {
    const query = `
      SELECT 
        c.*,
        json_build_object(
          'id', u.id,
          'full_name', u.full_name,
          'email', u.email
        ) AS instructor
      FROM courses c
      LEFT JOIN users u ON c.instructor_id = u.id
      WHERE c.is_approved = false AND c.is_published = true
    `;
    const result = await pool.query(query);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};

const reviewCourse = async (req, res) => {
  if (req.user.role !== 'ORGANIZATION_ADMIN' && req.user.role !== 'ADMIN') return res.status(403).json({ error: 'Access denied' });

  const { courseId } = req.params;
  const { action } = req.body;

  try {
    if (action === 'approve') {
      await pool.query('UPDATE courses SET is_approved = true WHERE id = $1', [courseId]);
      res.json({ message: 'Course approved successfully' });
    } else if (action === 'reject') {
      await pool.query('DELETE FROM courses WHERE id = $1', [courseId]);
      res.json({ message: 'Course rejected and deleted' });
    } else {
      res.status(400).json({ error: 'Invalid action' });
    }
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};

const getPendingCertificates = async (req, res) => {
  if (req.user.role !== 'ORGANIZATION_ADMIN' && req.user.role !== 'ADMIN') return res.status(403).json({ error: 'Access denied' });

  try {
    const result = await pool.query("SELECT * FROM certificate_requests WHERE status = 'PENDING'");
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};

const reviewCertificate = async (req, res) => {
  if (req.user.role !== 'ORGANIZATION_ADMIN' && req.user.role !== 'ADMIN') return res.status(403).json({ error: 'Access denied' });

  const { requestId } = req.params;
  const { action } = req.body;

  try {
    if (action === 'approve') {
      await pool.query("UPDATE certificate_requests SET status = 'APPROVED' WHERE id = $1", [requestId]);
      res.json({ message: 'Certificate approved' });
    } else if (action === 'reject') {
      await pool.query("UPDATE certificate_requests SET status = 'REJECTED' WHERE id = $1", [requestId]);
      res.json({ message: 'Certificate rejected' });
    } else {
      res.status(400).json({ error: 'Invalid action' });
    }
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};

// Assessment Controller
const createAssessment = async (req, res) => {
  if (req.user.role !== 'INSTRUCTOR') return res.status(403).json({ error: 'Access denied' });

  const { courseId } = req.params;
  const { title, description } = req.body;

  try {
    const courseCheck = await pool.query('SELECT * FROM courses WHERE id = $1 AND instructor_id = $2', [courseId, req.user.userId]);
    if (courseCheck.rows.length === 0) return res.status(403).json({ error: 'Access denied' });

    const insertResult = await pool.query(
      'INSERT INTO assessments (course_id, title, description) VALUES ($1, $2, $3) RETURNING *',
      [courseId, title, description]
    );
    res.status(201).json(insertResult.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};

const submitAssessment = async (req, res) => {
  const { assessmentId } = req.params;
  const { answersText } = req.body;
  const studentId = req.user.userId;

  try {
    const assessmentRes = await pool.query('SELECT course_id FROM assessments WHERE id = $1', [assessmentId]);
    if (assessmentRes.rows.length === 0) return res.status(404).json({ error: 'Not found' });

    const enrollCheck = await pool.query('SELECT id FROM enrollments WHERE student_id = $1 AND course_id = $2', [studentId, assessmentRes.rows[0].course_id]);
    if (enrollCheck.rows.length === 0) return res.status(403).json({ error: 'Not enrolled' });

    const insertResult = await pool.query(
      'INSERT INTO assessment_submissions (enrollment_id, assessment_id, answers_text) VALUES ($1, $2, $3) RETURNING *',
      [enrollCheck.rows[0].id, assessmentId, answersText]
    );
    res.status(201).json(insertResult.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};

const getInstructorSubmissions = async (req, res) => {
  if (req.user.role !== 'INSTRUCTOR') return res.status(403).json({ error: 'Access denied' });

  try {
    const query = `
      SELECT sub.*, a.title as assessment_title, u.email as student_email 
      FROM assessment_submissions sub
      JOIN assessments a ON sub.assessment_id = a.id
      JOIN courses c ON a.course_id = c.id
      JOIN enrollments e ON sub.enrollment_id = e.id
      JOIN users u ON e.student_id = u.id
      WHERE c.instructor_id = $1
    `;
    const result = await pool.query(query, [req.user.userId]);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};

const gradeSubmission = async (req, res) => {
  if (req.user.role !== 'INSTRUCTOR') return res.status(403).json({ error: 'Access denied' });

  const { submissionId } = req.params;
  const { grade } = req.body;

  try {
    const result = await pool.query(
      'UPDATE assessment_submissions SET grade = $1, is_graded = true WHERE id = $2 RETURNING *',
      [grade, submissionId]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};

// --- Certificate Controller ---
const getCertificateRequests = async (req, res) => {
  try {
    const query = `
      SELECT cr.*, c.title as course_title 
      FROM certificate_requests cr
      JOIN enrollments e ON cr.enrollment_id = e.id
      JOIN courses c ON e.course_id = c.id
      WHERE e.student_id = $1
    `;
    const result = await pool.query(query, [req.user.userId]);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};

const requestCertificate = async (req, res) => {
  const { courseId } = req.params;
  const studentId = req.user.userId;

  try {
    const enrollRes = await pool.query('SELECT id FROM enrollments WHERE student_id = $1 AND course_id = $2', [studentId, courseId]);
    if (enrollRes.rows.length === 0) return res.status(403).json({ error: 'Not enrolled in this course' });
    const enrollmentId = enrollRes.rows[0].id;

    const reqCheck = await pool.query('SELECT * FROM certificate_requests WHERE enrollment_id = $1', [enrollmentId]);
    if (reqCheck.rows.length > 0) return res.json(reqCheck.rows[0]);

    const insertResult = await pool.query(
      'INSERT INTO certificate_requests (enrollment_id) VALUES ($1) RETURNING *',
      [enrollmentId]
    );
    res.status(201).json(insertResult.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};

// Course Controller
const getApprovedCourses = async (req, res) => {
  try {
    const query = `
      SELECT 
        c.*,
        json_build_object(
          'id', u.id,
          'full_name', u.full_name,
          'email', u.email
        ) AS instructor,
        (SELECT COUNT(*) FROM enrollments e WHERE e.course_id = c.id) AS enrollments_count
      FROM courses c
      LEFT JOIN users u ON c.instructor_id = u.id
      WHERE c.is_approved = $1
    `;
    const result = await pool.query(query, [true]);
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error fetching courses' });
  }
};

const createCourse = async (req, res) => {
  if (req.user.role !== 'INSTRUCTOR') {
    return res.status(403).json({ error: 'Only instructors can create courses' });
  }

  const { title, description, thumbnailUrl, thumbnailFile } = req.body;
  const instructorId = req.user.userId;

  try {
    const query = `
      INSERT INTO courses (title, description, thumbnail_url, thumbnail_file, instructor_id)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `;
    const result = await pool.query(query, [title, description, thumbnailUrl, thumbnailFile, instructorId]);
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error creating course' });
  }
};

const getInstructorCourses = async (req, res) => {
  if (req.user.role !== 'INSTRUCTOR') {
    return res.status(403).json({ error: 'Access denied' });
  }

  try {
    const query = `
      SELECT 
        c.*,
        (SELECT COUNT(*) FROM enrollments e WHERE e.course_id = c.id) AS enrollments_count,
        (
          SELECT COUNT(*) 
          FROM certificate_requests cr 
          JOIN enrollments e ON cr.enrollment_id = e.id 
          WHERE e.course_id = c.id AND cr.status = 'APPROVED'
        ) AS completions_count
      FROM courses c
      WHERE c.instructor_id = $1
    `;
    const result = await pool.query(query, [req.user.userId]);
    const courses = result.rows;

    if (courses.length > 0) {
      const courseIds = courses.map(c => c.id);

      const modulesResult = await pool.query('SELECT * FROM modules WHERE course_id = ANY($1) ORDER BY "order" ASC, id ASC', [courseIds]);
      const modules = modulesResult.rows;

      if (modules.length > 0) {
        const moduleIds = modules.map(m => m.id);

        const quizzesResult = await pool.query('SELECT * FROM quizzes WHERE module_id = ANY($1) ORDER BY id ASC', [moduleIds]);
        const quizzes = quizzesResult.rows;

        if (quizzes.length > 0) {
          const quizIds = quizzes.map(q => q.id);
          const questionsResult = await pool.query('SELECT * FROM questions WHERE quiz_id = ANY($1) ORDER BY id ASC', [quizIds]);

          quizzes.forEach(quiz => {
            quiz.questions = questionsResult.rows.filter(q => q.quiz_id === quiz.id);
          });
        }

        modules.forEach(module => {
          module.quizzes = quizzes.filter(q => q.module_id === module.id);
        });
      }

      courses.forEach(course => {
        course.modules = modules.filter(m => m.course_id === course.id);
      });
    }

    res.json(courses);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
};

const getInstructorStudents = async (req, res) => {
  if (req.user.role !== 'INSTRUCTOR') {
    return res.status(403).json({ error: 'Access denied' });
  }

  try {
    const enrollmentsRes = await pool.query(`
      SELECT e.*, 
             c.title as course_title,
             u.full_name as student_name, u.email as student_email
      FROM enrollments e
      JOIN courses c ON e.course_id = c.id
      JOIN users u ON e.student_id = u.id
      WHERE c.instructor_id = $1
    `, [req.user.userId]);

    const enrollments = enrollmentsRes.rows;

    if (enrollments.length > 0) {
      const enrollmentIds = enrollments.map(e => e.id);
      const courseIds = [...new Set(enrollments.map(e => e.course_id))];

      const progressRes = await pool.query('SELECT enrollment_id, lesson_id, is_completed FROM lesson_progress WHERE enrollment_id = ANY($1)', [enrollmentIds]);
      const quizAttRes = await pool.query('SELECT enrollment_id, quiz_id, passed, score, total_questions FROM quiz_attempts WHERE enrollment_id = ANY($1)', [enrollmentIds]);
      const modulesRes = await pool.query('SELECT id, course_id FROM modules WHERE course_id = ANY($1)', [courseIds]);

      const moduleIds = modulesRes.rows.map(m => m.id);
      let lessons = [];
      if (moduleIds.length > 0) {
        const lessonsRes = await pool.query('SELECT id, module_id FROM lessons WHERE module_id = ANY($1)', [moduleIds]);
        lessons = lessonsRes.rows;
      }

      for (let e of enrollments) {
        e.student = { id: e.student_id, full_name: e.student_name, email: e.student_email };
        e.course = { id: e.course_id, title: e.course_title };

        e.lesson_progress = progressRes.rows.filter(p => p.enrollment_id === e.id);
        e.quiz_attempts = quizAttRes.rows.filter(q => q.enrollment_id === e.id);

        const eModules = modulesRes.rows.filter(m => m.course_id === e.course_id).map(m => {
          return { ...m, lessons: lessons.filter(l => l.module_id === m.id) };
        });
        e.course.modules = eModules;
      }
    }

    res.json(enrollments);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error fetching students' });
  }
};

const getCourseById = async (req, res) => {
  try {
    const { id } = req.params;
    const courseResult = await pool.query('SELECT * FROM courses WHERE id = $1', [id]);

    if (courseResult.rows.length === 0) {
      return res.status(404).json({ error: 'Course not found' });
    }

    const course = courseResult.rows[0];

    // Fetch modules
    const modulesResult = await pool.query('SELECT * FROM modules WHERE course_id = $1 ORDER BY "order" ASC, id ASC', [id]);
    const modules = modulesResult.rows;

    if (modules.length > 0) {
      const moduleIds = modules.map(m => m.id);

      const lessonsResult = await pool.query(`SELECT * FROM lessons WHERE module_id = ANY($1) ORDER BY "order" ASC, id ASC`, [moduleIds]);
      const quizzesResult = await pool.query(`SELECT * FROM quizzes WHERE module_id = ANY($1) ORDER BY id ASC`, [moduleIds]);

      const quizzes = quizzesResult.rows;
      if (quizzes.length > 0) {
        const quizIds = quizzes.map(q => q.id);
        const questionsResult = await pool.query(`SELECT * FROM questions WHERE quiz_id = ANY($1) ORDER BY id ASC`, [quizIds]);

        quizzes.forEach(quiz => {
          quiz.questions = questionsResult.rows.filter(q => q.quiz_id === quiz.id);
        });
      }

      modules.forEach(module => {
        module.lessons = lessonsResult.rows.filter(l => l.module_id === module.id);
        module.quizzes = quizzes.filter(q => q.module_id === module.id);
      });
    }

    course.modules = modules;

    res.json(course);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Enrollment Controller
const enrollCourse = async (req, res) => {
  const { courseId } = req.params;
  const studentId = req.user.userId;

  try {
    const courseResult = await pool.query('SELECT * FROM courses WHERE id = $1 AND is_approved = true', [courseId]);
    if (courseResult.rows.length === 0) {
      return res.status(400).json({ error: 'Cannot enroll in an unapproved or non-existent course' });
    }

    const enrollCheck = await pool.query('SELECT * FROM enrollments WHERE student_id = $1 AND course_id = $2', [studentId, courseId]);
    if (enrollCheck.rows.length > 0) {
      return res.status(200).json(enrollCheck.rows[0]);
    }

    const insertResult = await pool.query(
      'INSERT INTO enrollments (student_id, course_id) VALUES ($1, $2) RETURNING *',
      [studentId, courseId]
    );

    res.status(201).json(insertResult.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error enrolling in course' });
  }
};

// Lesson Controller 
const createLesson = async (req, res) => {
  if (req.user.role !== 'INSTRUCTOR') {
    return res.status(403).json({ error: 'Only instructors can create lessons' });
  }

  const { moduleId } = req.params;
  const { title, contentType, textContent, videoUrl, videoFile, audioUrl, audioFile, imageUrl, imageFile, order } = req.body;

  try {
    const checkQuery = `
      SELECT c.instructor_id, c.id as course_id
      FROM modules m
      JOIN courses c ON m.course_id = c.id
      WHERE m.id = $1
    `;
    const checkResult = await pool.query(checkQuery, [moduleId]);

    if (checkResult.rows.length === 0) {
      return res.status(404).json({ error: 'Module not found' });
    }

    if (checkResult.rows[0].instructor_id !== req.user.userId) {
      return res.status(403).json({ error: 'Access denied to this module' });
    }

    const insertQuery = `
      INSERT INTO lessons (module_id, title, content_type, text_content, video_url, video_file, audio_url, audio_file, image_url, image_file, "order")
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      RETURNING *
    `;
    const insertResult = await pool.query(insertQuery, [
      moduleId, title, contentType || 'TEXT', textContent, videoUrl, videoFile, audioUrl, audioFile, imageUrl, imageFile, order || 0
    ]);

    await pool.query('UPDATE courses SET is_approved = false, is_published = false WHERE id = $1', [checkResult.rows[0].course_id]);

    res.status(201).json(insertResult.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error creating lesson' });
  }
};

// Module Controller
const createModule = async (req, res) => {
  if (req.user.role !== 'INSTRUCTOR') {
    return res.status(403).json({ error: 'Only instructors can create modules' });
  }

  const { courseId } = req.params;
  const { title, order } = req.body;

  try {
    const courseCheck = await pool.query('SELECT * FROM courses WHERE id = $1 AND instructor_id = $2', [courseId, req.user.userId]);
    if (courseCheck.rows.length === 0) {
      return res.status(403).json({ error: 'Access denied to this course' });
    }

    const query = `
      INSERT INTO modules (course_id, title, "order")
      VALUES ($1, $2, $3)
      RETURNING *
    `;
    const result = await pool.query(query, [courseId, title, order || 0]);

    await pool.query('UPDATE courses SET is_approved = false, is_published = false WHERE id = $1', [courseId]);

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error creating module' });
  }
};

const reorderModules = async (req, res) => {
  if (req.user.role !== 'INSTRUCTOR') {
    return res.status(403).json({ error: 'Access denied' });
  }

  const { courseId } = req.params;
  const { modules } = req.body;

  try {
    const courseCheck = await pool.query('SELECT * FROM courses WHERE id = $1 AND instructor_id = $2', [courseId, req.user.userId]);
    if (courseCheck.rows.length === 0) {
      return res.status(403).json({ error: 'Access denied' });
    }

    for (const m of modules) {
      if (m.id !== undefined && m.order !== undefined) {
        await pool.query('UPDATE modules SET "order" = $1 WHERE id = $2 AND course_id = $3', [m.order, m.id, courseId]);
      }
    }

    res.json({ message: 'Modules reordered successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error reordering modules' });
  }
};

// Quiz Controller
const createQuiz = async (req, res) => {
  if (req.user.role !== 'INSTRUCTOR') {
    return res.status(403).json({ error: 'Only instructors can create quizzes' });
  }

  const { moduleId } = req.params;
  const { title, passingScore } = req.body;

  try {
    const checkQuery = `
      SELECT c.instructor_id, c.id as course_id
      FROM modules m
      JOIN courses c ON m.course_id = c.id
      WHERE m.id = $1
    `;
    const checkResult = await pool.query(checkQuery, [moduleId]);

    if (checkResult.rows.length === 0) return res.status(404).json({ error: 'Module not found' });
    if (checkResult.rows[0].instructor_id !== req.user.userId) return res.status(403).json({ error: 'Access denied' });

    const insertQuery = `
      INSERT INTO quizzes (module_id, title, passing_score)
      VALUES ($1, $2, $3)
      RETURNING *
    `;
    const insertResult = await pool.query(insertQuery, [moduleId, title, passingScore || 60]);

    await pool.query('UPDATE courses SET is_approved = false, is_published = false WHERE id = $1', [checkResult.rows[0].course_id]);

    res.status(201).json(insertResult.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error creating quiz' });
  }
};

const submitQuiz = async (req, res) => {
  const { quizId } = req.params;
  const { answers } = req.body;
  const studentId = req.user.userId;

  try {
    const quizResult = await pool.query('SELECT q.*, m.course_id FROM quizzes q JOIN modules m ON q.module_id = m.id WHERE q.id = $1', [quizId]);
    if (quizResult.rows.length === 0) return res.status(404).json({ error: 'Quiz not found' });
    const quiz = quizResult.rows[0];

    const enrollCheck = await pool.query('SELECT id FROM enrollments WHERE student_id = $1 AND course_id = $2', [studentId, quiz.course_id]);
    if (enrollCheck.rows.length === 0) return res.status(403).json({ error: 'You are not enrolled in this course' });
    const enrollmentId = enrollCheck.rows[0].id;

    const questionsResult = await pool.query('SELECT * FROM questions WHERE quiz_id = $1', [quizId]);
    const questions = questionsResult.rows;

    let correctCount = 0;
    const totalQuestions = questions.length;

    for (const q of questions) {
      const userAns = answers[q.id];
      if (userAns) {
        if (Array.isArray(userAns)) {
          const sortedUserAns = userAns.map(a => a.trim().toUpperCase()).sort().join(',');
          const correctAns = q.correct_answers.split(',').map(a => a.trim().toUpperCase()).sort().join(',');
          if (sortedUserAns === correctAns) correctCount++;
        } else {
          if (userAns.trim().toUpperCase() === q.correct_answers.trim().toUpperCase()) correctCount++;
        }
      }
    }

    let passed = false;
    if (totalQuestions > 0) {
      const passingPct = quiz.passing_score / 100.0;
      passed = (correctCount / totalQuestions) >= passingPct;
    }

    const attemptQuery = `
      INSERT INTO quiz_attempts (enrollment_id, quiz_id, score, total_questions, passed)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `;
    const attemptResult = await pool.query(attemptQuery, [enrollmentId, quizId, correctCount, totalQuestions, passed]);

    res.json(attemptResult.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error grading quiz' });
  }
};


// ROUTES


// Auth Routes (/api/accounts)
app.post('/api/accounts/register', registerUser);
app.post('/api/accounts/login', loginUser);
app.get('/api/accounts/profile', authMiddleware(), (req, res) => {
  res.json({ message: 'Profile data', user: req.user });
});

// Super Admin User Controllers
const getAllUsers = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM users ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error fetching users' });
  }
};

const approveUser = async (req, res) => {
  const { userId } = req.params;
  try {
    await pool.query('UPDATE users SET is_approved = true WHERE id = $1', [userId]);
    res.json({ message: 'User approved' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error approving user' });
  }
};

const deleteUser = async (req, res) => {
  const { userId } = req.params;
  try {
    await pool.query('DELETE FROM users WHERE id = $1', [userId]);
    res.json({ message: 'User deleted' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error deleting user' });
  }
};

// Auth Admin Routes (/api/auth/admin)
app.get('/api/auth/admin/users', authMiddleware(), getAllUsers);
app.post('/api/auth/admin/users/:userId/approve', authMiddleware(), approveUser);
app.delete('/api/auth/admin/users/:userId/delete', authMiddleware(), deleteUser);

// Admin Routes (/api/admin)
app.get('/api/admin/pending-courses', authMiddleware(['ORGANIZATION_ADMIN', 'ADMIN']), getPendingCourses);
app.post('/api/admin/courses/:courseId/review', authMiddleware(['ORGANIZATION_ADMIN', 'ADMIN']), reviewCourse);
app.get('/api/admin/pending-certificates', authMiddleware(['ORGANIZATION_ADMIN', 'ADMIN']), getPendingCertificates);
app.post('/api/admin/certificates/:requestId/review', authMiddleware(['ORGANIZATION_ADMIN', 'ADMIN']), reviewCertificate);

// Course Routes (/api/courses)
const multer = require('multer');
const fs = require('fs');
if (!fs.existsSync('uploads')) {
  fs.mkdirSync('uploads');
}
const upload = multer({ dest: 'uploads/' });

app.use('/uploads', express.static('uploads'));

// Public/Learner routes
app.get('/api/courses/', authMiddleware(), getApprovedCourses);

// Enrollments (must be before any :id/:courseId routes)
app.get('/api/courses/enrollments', authMiddleware(), async (req, res) => {
  try {
    const studentId = req.user.userId;
    const enrollmentsRes = await pool.query(`
      SELECT e.*, 
             c.title as course_title, c.thumbnail_url, c.thumbnail_file, 
             u.full_name as instructor_name
      FROM enrollments e
      JOIN courses c ON e.course_id = c.id
      LEFT JOIN users u ON c.instructor_id = u.id
      WHERE e.student_id = $1
    `, [studentId]);

    const enrollments = enrollmentsRes.rows;
    for (let e of enrollments) {
      e.course = {
        id: e.course_id, title: e.course_title,
        thumbnail_url: e.thumbnail_url, thumbnail_file: e.thumbnail_file,
        instructor: { full_name: e.instructor_name }
      };

      // fetch modules
      const modulesRes = await pool.query('SELECT * FROM modules WHERE course_id = $1 ORDER BY "order" ASC', [e.course_id]);
      e.course.modules = modulesRes.rows;

      if (e.course.modules.length > 0) {
        const moduleIds = e.course.modules.map(m => m.id);
        const lessonsRes = await pool.query(`SELECT * FROM lessons WHERE module_id = ANY($1) ORDER BY "order" ASC`, [moduleIds]);
        const quizzesRes = await pool.query(`SELECT * FROM quizzes WHERE module_id = ANY($1)`, [moduleIds]);

        // Fetch questions for each quiz
        for (let quiz of quizzesRes.rows) {
          const questionsRes = await pool.query('SELECT * FROM questions WHERE quiz_id = $1', [quiz.id]);
          quiz.questions = questionsRes.rows;
        }

        e.course.modules.forEach(m => {
          m.lessons = lessonsRes.rows.filter(l => l.module_id === m.id);
          m.quizzes = quizzesRes.rows.filter(q => q.module_id === m.id);
        });
      }

      // fetch progress
      const progressRes = await pool.query('SELECT lesson_id as lesson, is_completed FROM lesson_progress WHERE enrollment_id = $1', [e.id]);
      e.lesson_progress = progressRes.rows;

      // fetch quiz attempts
      const quizAttRes = await pool.query('SELECT quiz_id as quiz, passed, score, total_questions FROM quiz_attempts WHERE enrollment_id = $1', [e.id]);
      e.quiz_attempts = quizAttRes.rows;
    }
    res.json(enrollments);
  } catch (err) {
    console.error('ENROLLMENTS ERROR:', err.message, err.stack);
    res.status(500).json({ error: 'Server error', detail: err.message });
  }
});

// Certificates (must be before :courseId routes)
app.get('/api/courses/certificates', authMiddleware(), getCertificateRequests);
app.get('/api/courses/instructor/my-courses', authMiddleware(['INSTRUCTOR']), getInstructorCourses);
app.get('/api/courses/instructor/students', authMiddleware(['INSTRUCTOR']), getInstructorStudents);
app.get('/api/courses/instructor/submissions', authMiddleware(['INSTRUCTOR']), getInstructorSubmissions);

// Instructor routes
app.post('/api/courses/', authMiddleware(['INSTRUCTOR']), upload.single('thumbnail_file'), async (req, res) => {
  const { title, description, thumbnail_url } = req.body;
  const instructorId = req.user.userId;
  const thumbnailFile = req.file ? req.file.path : null;

  try {
    const query = `
      INSERT INTO courses (title, description, thumbnail_url, thumbnail_file, instructor_id)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `;
    const result = await pool.query(query, [title, description, thumbnail_url, thumbnailFile, instructorId]);
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error creating course' });
  }
});

app.post('/api/courses/lessons/:lessonId/complete', authMiddleware(), async (req, res) => {
  const { lessonId } = req.params;
  const studentId = req.user.userId;

  try {
    // Get course ID for this lesson
    const courseRes = await pool.query(`
      SELECT c.id as course_id 
      FROM lessons l 
      JOIN modules m ON l.module_id = m.id 
      JOIN courses c ON m.course_id = c.id 
      WHERE l.id = $1
    `, [lessonId]);

    if (courseRes.rows.length === 0) return res.status(404).json({ error: 'Lesson not found' });
    const courseId = courseRes.rows[0].course_id;

    // Check enrollment
    const enrollRes = await pool.query('SELECT id FROM enrollments WHERE student_id = $1 AND course_id = $2', [studentId, courseId]);
    if (enrollRes.rows.length === 0) return res.status(403).json({ error: 'Not enrolled' });
    const enrollmentId = enrollRes.rows[0].id;

    // Insert or update lesson_progress
    const upsertQuery = `
      INSERT INTO lesson_progress (enrollment_id, lesson_id, is_completed)
      VALUES ($1, $2, true)
      ON CONFLICT (enrollment_id, lesson_id) 
      DO UPDATE SET is_completed = true, updated_at = CURRENT_TIMESTAMP
      RETURNING *
    `;
    const result = await pool.query(upsertQuery, [enrollmentId, lessonId]);
    res.json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

app.get('/api/courses/:courseId/progress', authMiddleware(), async (req, res) => {
  const { courseId } = req.params;
  const studentId = req.user.userId;

  try {
    const enrollRes = await pool.query('SELECT id FROM enrollments WHERE student_id = $1 AND course_id = $2', [studentId, courseId]);
    if (enrollRes.rows.length === 0) return res.json({ completedLessons: 0, totalLessons: 0, progress: 0 });
    const enrollmentId = enrollRes.rows[0].id;

    const totalRes = await pool.query(`
      SELECT count(l.id) as total 
      FROM lessons l 
      JOIN modules m ON l.module_id = m.id 
      WHERE m.course_id = $1
    `, [courseId]);
    const totalLessons = parseInt(totalRes.rows[0].total) || 0;

    const completedRes = await pool.query(`
      SELECT count(lp.id) as completed 
      FROM lesson_progress lp
      JOIN lessons l ON lp.lesson_id = l.id
      JOIN modules m ON l.module_id = m.id
      WHERE lp.enrollment_id = $1 AND lp.is_completed = true AND m.course_id = $2
    `, [enrollmentId, courseId]);
    const completedLessons = parseInt(completedRes.rows[0].completed) || 0;

    const progress = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;

    // Also fetch the specific completed lesson IDs so frontend can highlight them
    const completedIdsRes = await pool.query(`
      SELECT lesson_id FROM lesson_progress WHERE enrollment_id = $1 AND is_completed = true
    `, [enrollmentId]);
    const completedLessonIds = completedIdsRes.rows.map(r => r.lesson_id);

    res.json({ completedLessons, totalLessons, progress, completedLessonIds });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

app.put('/api/courses/:id', authMiddleware(['INSTRUCTOR']), upload.single('thumbnail_file'), async (req, res) => {
  const { id } = req.params;
  const { title, description, thumbnail_url, is_published } = req.body;
  const instructorId = req.user.userId;
  const thumbnailFile = req.file ? req.file.path : undefined;

  try {
    const courseCheck = await pool.query('SELECT * FROM courses WHERE id = $1 AND instructor_id = $2', [id, instructorId]);
    if (courseCheck.rows.length === 0) return res.status(403).json({ error: 'Access denied' });

    let updateFields = [];
    let values = [];
    let counter = 1;

    if (title !== undefined) { updateFields.push(`title = $${counter++}`); values.push(title); }
    if (description !== undefined) { updateFields.push(`description = $${counter++}`); values.push(description); }
    if (thumbnail_url !== undefined) { updateFields.push(`thumbnail_url = $${counter++}`); values.push(thumbnail_url); }
    if (thumbnailFile !== undefined) { updateFields.push(`thumbnail_file = $${counter++}`); values.push(thumbnailFile); }
    if (is_published !== undefined) {
      // If we are passing string "true" / "false" in FormData or json bool
      const pub = (is_published === 'true' || is_published === true);
      updateFields.push(`is_published = $${counter++}`); values.push(pub);
    }

    if (updateFields.length === 0) return res.json(courseCheck.rows[0]);

    const query = `
      UPDATE courses 
      SET ${updateFields.join(', ')}
      WHERE id = $${counter}
      RETURNING *
    `;
    values.push(id);

    const result = await pool.query(query, values);
    res.json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error updating course' });
  }
});

// Module routes
app.post('/api/courses/:courseId/modules', authMiddleware(['INSTRUCTOR']), createModule);
app.put('/api/courses/:courseId/modules/reorder', authMiddleware(['INSTRUCTOR']), reorderModules);

// Lesson routes
app.post('/api/courses/modules/:moduleId/lessons', authMiddleware(['INSTRUCTOR']), upload.any(), async (req, res) => {
  const { moduleId } = req.params;
  const { title, content_type, text_content, video_url, audio_url, image_url, order } = req.body;

  let video_file = null;
  let audio_file = null;
  let image_file = null;

  if (req.files) {
    req.files.forEach(f => {
      if (f.fieldname === 'video_file') video_file = f.path;
      if (f.fieldname === 'audio_file') audio_file = f.path;
      if (f.fieldname === 'image_file') image_file = f.path;
    });
  }

  try {
    const checkQuery = `
      SELECT c.instructor_id, c.id as course_id
      FROM modules m
      JOIN courses c ON m.course_id = c.id
      WHERE m.id = $1
    `;
    const checkResult = await pool.query(checkQuery, [moduleId]);

    if (checkResult.rows.length === 0) return res.status(404).json({ error: 'Module not found' });
    if (checkResult.rows[0].instructor_id !== req.user.userId) return res.status(403).json({ error: 'Access denied' });

    const insertQuery = `
      INSERT INTO lessons (module_id, title, content_type, text_content, video_url, video_file, audio_url, audio_file, image_url, image_file, "order")
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      RETURNING *
    `;
    const insertResult = await pool.query(insertQuery, [
      moduleId, title, (content_type || 'TEXT').toUpperCase(), text_content, video_url, video_file, audio_url, audio_file, image_url, image_file, order || 0
    ]);

    await pool.query('UPDATE courses SET is_approved = false, is_published = false WHERE id = $1', [checkResult.rows[0].course_id]);

    res.status(201).json(insertResult.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error creating lesson' });
  }
});

// Quiz routes
app.post('/api/courses/modules/:moduleId/quizzes', authMiddleware(['INSTRUCTOR']), createQuiz);
app.post('/api/courses/quizzes/:quizId/submit', authMiddleware(), submitQuiz);

// Questions
app.post('/api/courses/quizzes/:quizId/questions', authMiddleware(['INSTRUCTOR']), async (req, res) => {
  const { quizId } = req.params;
  const { text, question_type, option_a, option_b, option_c, option_d, correct_answers } = req.body;

  try {
    const insertQuery = `
      INSERT INTO questions (quiz_id, text, question_type, option_a, option_b, option_c, option_d, correct_answers)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *
    `;
    const result = await pool.query(insertQuery, [quizId, text, (question_type || 'SINGLE').toUpperCase(), option_a, option_b, option_c, option_d, correct_answers]);
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error creating question' });
  }
});

// Enrollment routes
app.post('/api/courses/:courseId/enroll', authMiddleware(), enrollCourse);

// Assessment routes
app.post('/api/courses/:courseId/assessments', authMiddleware(['INSTRUCTOR']), createAssessment);
app.post('/api/courses/assessments/:assessmentId/submit', authMiddleware(), submitAssessment);
app.post('/api/courses/assessments/submissions/:submissionId/grade', authMiddleware(['INSTRUCTOR']), gradeSubmission);

// Certificate routes
app.post('/api/courses/:courseId/certificate', authMiddleware(), requestCertificate);

// Generic course ID route (Must be defined last to avoid shadowing other /api/courses/* routes)
app.get('/api/courses/:id', authMiddleware(), getCourseById);



// SERVER LISTEN

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
