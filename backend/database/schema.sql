-- schema.sql
-- Run this script in your PostgreSQL database to create the necessary tables

-- Enums
CREATE TYPE user_role AS ENUM ('LEARNER', 'INSTRUCTOR', 'ORGANIZATION_ADMIN');
CREATE TYPE content_type AS ENUM ('VIDEO', 'AUDIO', 'TEXT', 'IMAGE');
CREATE TYPE question_type AS ENUM ('SINGLE', 'MULTIPLE');
CREATE TYPE certificate_status AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- Users Table
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    role user_role DEFAULT 'LEARNER',
    is_approved BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Courses Table
CREATE TABLE courses (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    thumbnail_url VARCHAR(255),
    thumbnail_file VARCHAR(255),
    rating FLOAT DEFAULT 0.0,
    instructor_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    is_approved BOOLEAN DEFAULT FALSE,
    is_published BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Modules Table
CREATE TABLE modules (
    id SERIAL PRIMARY KEY,
    course_id INTEGER NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    "order" INTEGER DEFAULT 0
);

-- Lessons Table
CREATE TABLE lessons (
    id SERIAL PRIMARY KEY,
    module_id INTEGER NOT NULL REFERENCES modules(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    content_type content_type DEFAULT 'TEXT',
    text_content TEXT,
    video_url VARCHAR(255),
    video_file VARCHAR(255),
    audio_url VARCHAR(255),
    audio_file VARCHAR(255),
    image_url VARCHAR(255),
    image_file VARCHAR(255),
    "order" INTEGER DEFAULT 0
);

-- Quizzes Table
CREATE TABLE quizzes (
    id SERIAL PRIMARY KEY,
    module_id INTEGER NOT NULL REFERENCES modules(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    passing_score INTEGER DEFAULT 60,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Questions Table
CREATE TABLE questions (
    id SERIAL PRIMARY KEY,
    quiz_id INTEGER NOT NULL REFERENCES quizzes(id) ON DELETE CASCADE,
    text TEXT NOT NULL,
    question_type question_type DEFAULT 'SINGLE',
    option_a VARCHAR(255) NOT NULL,
    option_b VARCHAR(255) NOT NULL,
    option_c VARCHAR(255) NOT NULL,
    option_d VARCHAR(255) NOT NULL,
    correct_answers VARCHAR(255) NOT NULL
);

-- Assessments Table
CREATE TABLE assessments (
    id SERIAL PRIMARY KEY,
    course_id INTEGER NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Enrollments Table
CREATE TABLE enrollments (
    id SERIAL PRIMARY KEY,
    student_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    course_id INTEGER NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    completed_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(student_id, course_id)
);

-- Lesson Progress Table
CREATE TABLE lesson_progress (
    id SERIAL PRIMARY KEY,
    enrollment_id INTEGER NOT NULL REFERENCES enrollments(id) ON DELETE CASCADE,
    lesson_id INTEGER NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
    is_completed BOOLEAN DEFAULT FALSE,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(enrollment_id, lesson_id)
);

-- Quiz Attempts Table
CREATE TABLE quiz_attempts (
    id SERIAL PRIMARY KEY,
    enrollment_id INTEGER NOT NULL REFERENCES enrollments(id) ON DELETE CASCADE,
    quiz_id INTEGER NOT NULL REFERENCES quizzes(id) ON DELETE CASCADE,
    score INTEGER NOT NULL,
    total_questions INTEGER NOT NULL,
    passed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Assessment Submissions Table
CREATE TABLE assessment_submissions (
    id SERIAL PRIMARY KEY,
    enrollment_id INTEGER NOT NULL REFERENCES enrollments(id) ON DELETE CASCADE,
    assessment_id INTEGER NOT NULL REFERENCES assessments(id) ON DELETE CASCADE,
    answers_text TEXT NOT NULL,
    grade VARCHAR(50),
    is_graded BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Certificate Requests Table
CREATE TABLE certificate_requests (
    id SERIAL PRIMARY KEY,
    enrollment_id INTEGER NOT NULL REFERENCES enrollments(id) ON DELETE CASCADE,
    status certificate_status DEFAULT 'PENDING',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
