const { Pool } = require('pg'); 
const axios = require('axios'); 
const jwt = require('jsonwebtoken'); 
const pool = new Pool({ connectionString: 'postgresql://postgres:admin123@localhost:5432/lms_node' }); 
pool.query('SELECT instructor_id FROM courses WHERE id = 12').then(res => { 
  const instructorId = res.rows[0].instructor_id; 
  const token = jwt.sign({ userId: instructorId, role: 'INSTRUCTOR' }, 'lms_secret_key'); 
  axios.post('http://localhost:5000/api/courses/12/prerequisites', { 
    prerequisites: [{ id: "10", minimum_completion_percentage: 0, minimum_quiz_score: 0, certificate_required: false }] 
  }, { headers: { Authorization: 'Bearer ' + token }})
    .then(res => console.log("Prerequisites OK", res.data))
    .catch(err => console.error("Prerequisites ERROR:", err.response ? err.response.data : err.message))
    .finally(() => process.exit(0)); 
});
