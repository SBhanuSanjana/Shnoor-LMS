const express = require('express');
const db = require('./db');

module.exports = () => {
  const router = express.Router();

  router.get('/', async (req, res) => {
    try {
      const { q } = req.query;
      const userRole = (req.user && req.user.role ? req.user.role : 'LEARNER').toLowerCase();
      const userId = req.user ? req.user.userId : null;

      const responseTemplate = {
        courses: [],
        modules: [],
        lessons: [],
        quizzes: [],
        assignments: [],
        users: [],
        certificates: [],
        announcements: [],
        chat_messages: []
      };

      if (!q || q.length < 2) {
        return res.json(responseTemplate);
      }

      const searchParam = `%${q}%`;
      const exactParam = q;
      const startsWithParam = `${q}%`;

      // 1. Search Courses
      const coursesQuery = `
        SELECT id, title, description, 'course' as type 
        FROM courses 
        WHERE title ILIKE $1 OR description ILIKE $1
        LIMIT 5
      `;
      const coursesRes = await db.query(coursesQuery, [searchParam]);
      responseTemplate.courses = coursesRes.rows.map(row => ({
        id: row.id,
        title: row.title,
        subtitle: row.description,
        type: row.type
      }));

      // 2. Search Modules
      const modulesQuery = `
        SELECT m.id, m.title, 'module' as type, m.course_id 
        FROM modules m
        WHERE m.title ILIKE $1 
        LIMIT 5
      `;
      const modulesRes = await db.query(modulesQuery, [searchParam]);
      responseTemplate.modules = modulesRes.rows.map(row => ({
        id: row.id,
        course_id: row.course_id,
        title: row.title,
        subtitle: 'Module',
        type: row.type
      }));

      // 3. Search Lessons
      const lessonsQuery = `
        SELECT l.id, l.title, 'lesson' as type, m.course_id 
        FROM lessons l
        JOIN modules m ON l.module_id = m.id
        WHERE l.title ILIKE $1 
        LIMIT 5
      `;
      const lessonsRes = await db.query(lessonsQuery, [searchParam]);
      responseTemplate.lessons = lessonsRes.rows.map(row => ({
        id: row.id,
        course_id: row.course_id,
        title: row.title,
        subtitle: 'Lesson',
        type: row.type
      }));

      // 4. Search Quizzes
      const quizzesQuery = `
        SELECT q.id, q.title, 'quiz' as type, m.course_id 
        FROM quizzes q
        JOIN modules m ON q.module_id = m.id
        WHERE q.title ILIKE $1 
        LIMIT 5
      `;
      const quizzesRes = await db.query(quizzesQuery, [searchParam]);
      responseTemplate.quizzes = quizzesRes.rows.map(row => ({
        id: row.id,
        course_id: row.course_id,
        title: row.title,
        subtitle: 'Quiz',
        type: row.type
      }));

      // 5. Search Assessments (Assignments)
      const assessmentsQuery = `
        SELECT id, title, description, 'assignment' as type, course_id 
        FROM assessments 
        WHERE title ILIKE $1 OR description ILIKE $1
        LIMIT 5
      `;
      const assessmentsRes = await db.query(assessmentsQuery, [searchParam]);
      responseTemplate.assignments = assessmentsRes.rows.map(row => ({
        id: row.id,
        course_id: row.course_id,
        title: row.title,
        subtitle: row.description || 'Assignment',
        type: row.type
      }));

      // 6. Search Users
      const usersQuery = `
        SELECT id, full_name, email, role, 'user' as type 
        FROM users 
        WHERE full_name ILIKE $1 OR email ILIKE $1
        LIMIT 5
      `;
      const usersRes = await db.query(usersQuery, [searchParam]);
      responseTemplate.users = usersRes.rows.map(row => ({
        id: row.id,
        title: row.full_name,
        subtitle: `${row.email} - ${row.role}`,
        type: row.type
      }));

      // 7. Search Chat Messages
      const chatQuery = `
        SELECT m.id, m.message, m.conversation_id, u.full_name, 'chat_message' as type
        FROM messages m
        JOIN users u ON m.sender_id = u.id
        WHERE m.message ILIKE $1 AND m.message_type != 'SYSTEM'
        LIMIT 5
      `;
      const chatRes = await db.query(chatQuery, [searchParam]);
      responseTemplate.chat_messages = chatRes.rows.map(row => ({
        id: row.conversation_id, // We use conversation_id so clicking takes them to that chat
        title: row.message,
        subtitle: `From: ${row.full_name}`,
        type: row.type
      }));

      res.json(responseTemplate);
    } catch (error) {
      console.error('Search API Error:', error);
      res.status(500).json({ error: 'Search error' });
    }
  });

  return router;
};
