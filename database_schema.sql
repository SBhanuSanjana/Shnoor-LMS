--
-- PostgreSQL database dump
--

\restrict zodgoZQ2k7ITPbU614ra081ngzvdd476ObjJjPemCAhTOaJCL5zjUZaY9ccQfz9

-- Dumped from database version 18.4
-- Dumped by pg_dump version 18.4

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: uuid-ossp; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA public;


--
-- Name: EXTENSION "uuid-ossp"; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON EXTENSION "uuid-ossp" IS 'generate universally unique identifiers (UUIDs)';


--
-- Name: certificate_status; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.certificate_status AS ENUM (
    'PENDING',
    'APPROVED',
    'REJECTED'
);


--
-- Name: content_type; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.content_type AS ENUM (
    'VIDEO',
    'AUDIO',
    'TEXT',
    'IMAGE',
    'DOCUMENT'
);


--
-- Name: conversation_type; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.conversation_type AS ENUM (
    'DIRECT',
    'GROUP',
    'ORGANIZATION',
    'COURSE',
    'ANNOUNCEMENT'
);


--
-- Name: exam_attempt_status; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.exam_attempt_status AS ENUM (
    'IN_PROGRESS',
    'SUBMITTED',
    'UNDER_REVIEW',
    'PASSED',
    'FAILED'
);


--
-- Name: exam_question_type; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.exam_question_type AS ENUM (
    'single_mcq',
    'multiple_mcq',
    'fill_blank',
    'descriptive',
    'coding'
);


--
-- Name: exam_status; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.exam_status AS ENUM (
    'DRAFT',
    'PUBLISHED'
);


--
-- Name: question_type; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.question_type AS ENUM (
    'SINGLE',
    'MULTIPLE'
);


--
-- Name: user_role; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.user_role AS ENUM (
    'LEARNER',
    'INSTRUCTOR',
    'ORGANIZATION_ADMIN',
    'ADMIN'
);


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: announcements; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.announcements (
    id integer NOT NULL,
    organization_id integer,
    title character varying(255) NOT NULL,
    content text NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    author_role character varying(50),
    author_id integer
);


--
-- Name: announcements_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.announcements_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: announcements_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.announcements_id_seq OWNED BY public.announcements.id;


--
-- Name: assessment_submissions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.assessment_submissions (
    id integer NOT NULL,
    enrollment_id integer NOT NULL,
    assessment_id integer NOT NULL,
    answers_text text NOT NULL,
    grade character varying(50),
    is_graded boolean DEFAULT false,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    submission_file character varying(255)
);


--
-- Name: assessment_submissions_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.assessment_submissions_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: assessment_submissions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.assessment_submissions_id_seq OWNED BY public.assessment_submissions.id;


--
-- Name: assessments; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.assessments (
    id integer NOT NULL,
    course_id integer NOT NULL,
    title character varying(255) NOT NULL,
    description text NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: assessments_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.assessments_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: assessments_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.assessments_id_seq OWNED BY public.assessments.id;


--
-- Name: certificate_requests; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.certificate_requests (
    id integer NOT NULL,
    enrollment_id integer NOT NULL,
    status public.certificate_status DEFAULT 'PENDING'::public.certificate_status,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: certificate_requests_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.certificate_requests_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: certificate_requests_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.certificate_requests_id_seq OWNED BY public.certificate_requests.id;


--
-- Name: coding_submissions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.coding_submissions (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    practice_submission_id uuid,
    coding_question_id uuid,
    submitted_code text,
    output text,
    passed_test_cases integer,
    total_test_cases integer,
    test_results jsonb
);


--
-- Name: contact_queries; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.contact_queries (
    id integer NOT NULL,
    name character varying(255) NOT NULL,
    email character varying(255) NOT NULL,
    message text NOT NULL,
    status character varying(50) DEFAULT 'PENDING'::character varying,
    reply_message text,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: contact_queries_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.contact_queries_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: contact_queries_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.contact_queries_id_seq OWNED BY public.contact_queries.id;


--
-- Name: conversation_members; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.conversation_members (
    id integer NOT NULL,
    conversation_id integer NOT NULL,
    user_id integer NOT NULL,
    role character varying(50) DEFAULT 'MEMBER'::character varying,
    is_archived boolean DEFAULT false,
    is_locked boolean DEFAULT false,
    history_cleared_at timestamp without time zone,
    joined_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: conversation_members_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.conversation_members_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: conversation_members_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.conversation_members_id_seq OWNED BY public.conversation_members.id;


--
-- Name: conversations; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.conversations (
    id integer NOT NULL,
    type public.conversation_type NOT NULL,
    name character varying(255),
    organization_id integer,
    course_id integer,
    created_by integer,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: conversations_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.conversations_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: conversations_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.conversations_id_seq OWNED BY public.conversations.id;


--
-- Name: course_exam_activity_logs; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.course_exam_activity_logs (
    id integer NOT NULL,
    exam_id integer,
    user_id integer NOT NULL,
    action character varying(255) NOT NULL,
    details jsonb,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: course_exam_activity_logs_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.course_exam_activity_logs_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: course_exam_activity_logs_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.course_exam_activity_logs_id_seq OWNED BY public.course_exam_activity_logs.id;


--
-- Name: course_exam_answers; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.course_exam_answers (
    id integer NOT NULL,
    attempt_id integer NOT NULL,
    question_id integer NOT NULL,
    answer_text text,
    submitted_code text,
    programming_language character varying(50),
    score numeric(10,2) DEFAULT 0.0,
    is_correct boolean DEFAULT false,
    review_status character varying(50) DEFAULT 'PENDING'::character varying
);


--
-- Name: course_exam_answers_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.course_exam_answers_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: course_exam_answers_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.course_exam_answers_id_seq OWNED BY public.course_exam_answers.id;


--
-- Name: course_exam_attempts; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.course_exam_attempts (
    id integer NOT NULL,
    exam_id integer NOT NULL,
    student_id integer NOT NULL,
    exam_version integer DEFAULT 1 NOT NULL,
    attempt_number integer NOT NULL,
    auto_score numeric(10,2) DEFAULT 0.0,
    manual_score numeric(10,2) DEFAULT 0.0,
    total_score numeric(10,2) DEFAULT 0.0,
    status public.exam_attempt_status DEFAULT 'IN_PROGRESS'::public.exam_attempt_status,
    started_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    submitted_at timestamp without time zone,
    evaluated_at timestamp without time zone
);


--
-- Name: course_exam_attempts_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.course_exam_attempts_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: course_exam_attempts_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.course_exam_attempts_id_seq OWNED BY public.course_exam_attempts.id;


--
-- Name: course_exam_coding_answers; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.course_exam_coding_answers (
    id integer NOT NULL,
    attempt_id integer,
    question_id integer,
    code text,
    language character varying(50),
    status character varying(20) DEFAULT 'PENDING'::character varying,
    score numeric(5,2) DEFAULT 0
);


--
-- Name: course_exam_coding_answers_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.course_exam_coding_answers_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: course_exam_coding_answers_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.course_exam_coding_answers_id_seq OWNED BY public.course_exam_coding_answers.id;


--
-- Name: course_exam_coding_details; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.course_exam_coding_details (
    id integer NOT NULL,
    question_id integer,
    language character varying(50) NOT NULL,
    starter_code text
);


--
-- Name: course_exam_coding_details_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.course_exam_coding_details_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: course_exam_coding_details_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.course_exam_coding_details_id_seq OWNED BY public.course_exam_coding_details.id;


--
-- Name: course_exam_coding_test_cases; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.course_exam_coding_test_cases (
    id integer NOT NULL,
    question_id integer,
    stdin text,
    expected_output text NOT NULL,
    is_hidden boolean DEFAULT false
);


--
-- Name: course_exam_coding_test_cases_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.course_exam_coding_test_cases_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: course_exam_coding_test_cases_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.course_exam_coding_test_cases_id_seq OWNED BY public.course_exam_coding_test_cases.id;


--
-- Name: course_exam_correct_answers; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.course_exam_correct_answers (
    id integer NOT NULL,
    question_id integer NOT NULL,
    accepted_answer text NOT NULL,
    is_case_sensitive boolean DEFAULT false
);


--
-- Name: course_exam_correct_answers_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.course_exam_correct_answers_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: course_exam_correct_answers_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.course_exam_correct_answers_id_seq OWNED BY public.course_exam_correct_answers.id;


--
-- Name: course_exam_options; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.course_exam_options (
    id integer NOT NULL,
    question_id integer NOT NULL,
    option_text text NOT NULL,
    is_correct boolean DEFAULT false
);


--
-- Name: course_exam_options_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.course_exam_options_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: course_exam_options_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.course_exam_options_id_seq OWNED BY public.course_exam_options.id;


--
-- Name: course_exam_question_bank; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.course_exam_question_bank (
    id integer NOT NULL,
    organization_id integer,
    course_id integer,
    question_text text NOT NULL,
    question_type public.exam_question_type NOT NULL,
    difficulty character varying(50) DEFAULT 'MEDIUM'::character varying,
    marks integer DEFAULT 1 NOT NULL,
    is_deleted boolean DEFAULT false,
    deleted_at timestamp without time zone,
    created_by integer NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: course_exam_question_bank_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.course_exam_question_bank_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: course_exam_question_bank_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.course_exam_question_bank_id_seq OWNED BY public.course_exam_question_bank.id;


--
-- Name: course_exam_questions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.course_exam_questions (
    id integer NOT NULL,
    section_id integer NOT NULL,
    question_bank_id integer,
    question_text text NOT NULL,
    question_type public.exam_question_type NOT NULL,
    marks integer DEFAULT 1 NOT NULL,
    required boolean DEFAULT true,
    sort_order integer DEFAULT 0,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    is_deleted boolean DEFAULT false,
    deleted_at timestamp without time zone
);


--
-- Name: course_exam_questions_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.course_exam_questions_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: course_exam_questions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.course_exam_questions_id_seq OWNED BY public.course_exam_questions.id;


--
-- Name: course_exam_sections; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.course_exam_sections (
    id integer NOT NULL,
    exam_id integer NOT NULL,
    title character varying(255) NOT NULL,
    description text,
    section_order integer DEFAULT 0,
    total_marks integer DEFAULT 0,
    is_deleted boolean DEFAULT false,
    deleted_at timestamp without time zone
);


--
-- Name: course_exam_sections_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.course_exam_sections_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: course_exam_sections_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.course_exam_sections_id_seq OWNED BY public.course_exam_sections.id;


--
-- Name: course_exam_settings; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.course_exam_settings (
    id integer NOT NULL,
    exam_id integer NOT NULL,
    shuffle_questions boolean DEFAULT false,
    shuffle_options boolean DEFAULT false,
    show_result_immediately boolean DEFAULT true,
    allow_review boolean DEFAULT true,
    require_manual_review boolean DEFAULT false,
    enable_negative_marking boolean DEFAULT false,
    allow_resume boolean DEFAULT false
);


--
-- Name: course_exam_settings_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.course_exam_settings_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: course_exam_settings_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.course_exam_settings_id_seq OWNED BY public.course_exam_settings.id;


--
-- Name: course_exams; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.course_exams (
    id integer NOT NULL,
    course_id integer NOT NULL,
    title character varying(255) NOT NULL,
    description text,
    duration_minutes integer NOT NULL,
    pass_percentage integer NOT NULL,
    attempt_limit integer DEFAULT 1,
    instructions text,
    status public.exam_status DEFAULT 'DRAFT'::public.exam_status,
    version_number integer DEFAULT 1,
    is_deleted boolean DEFAULT false,
    deleted_at timestamp without time zone,
    created_by integer NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: course_exams_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.course_exams_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: course_exams_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.course_exams_id_seq OWNED BY public.course_exams.id;


--
-- Name: course_prerequisites; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.course_prerequisites (
    id integer NOT NULL,
    course_id integer NOT NULL,
    prerequisite_id integer NOT NULL,
    is_required_completion boolean DEFAULT true,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    minimum_completion_percentage integer DEFAULT 0,
    minimum_quiz_score integer DEFAULT 0,
    certificate_required boolean DEFAULT false
);


--
-- Name: course_prerequisites_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.course_prerequisites_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: course_prerequisites_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.course_prerequisites_id_seq OWNED BY public.course_prerequisites.id;


--
-- Name: courses; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.courses (
    id integer NOT NULL,
    title character varying(255) NOT NULL,
    description text NOT NULL,
    thumbnail_url character varying(255),
    thumbnail_file character varying(255),
    rating double precision DEFAULT 0.0,
    instructor_id integer NOT NULL,
    is_approved boolean DEFAULT false,
    is_published boolean DEFAULT false,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    organization_id integer,
    estimated_duration character varying(100),
    learning_outcomes text,
    skills_gained text,
    difficulty_level character varying(50),
    prerequisites_enabled boolean DEFAULT false
);


--
-- Name: courses_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.courses_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: courses_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.courses_id_seq OWNED BY public.courses.id;


--
-- Name: enrollments; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.enrollments (
    id integer NOT NULL,
    student_id integer NOT NULL,
    course_id integer NOT NULL,
    completed_at timestamp without time zone,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: enrollments_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.enrollments_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: enrollments_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.enrollments_id_seq OWNED BY public.enrollments.id;


--
-- Name: lesson_progress; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.lesson_progress (
    id integer NOT NULL,
    enrollment_id integer NOT NULL,
    lesson_id integer NOT NULL,
    is_completed boolean DEFAULT false,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    started_at timestamp without time zone,
    active_time_spent integer DEFAULT 0
);


--
-- Name: lesson_progress_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.lesson_progress_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: lesson_progress_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.lesson_progress_id_seq OWNED BY public.lesson_progress.id;


--
-- Name: lessons; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.lessons (
    id integer NOT NULL,
    module_id integer NOT NULL,
    title character varying(255) NOT NULL,
    content_type public.content_type DEFAULT 'TEXT'::public.content_type,
    text_content text,
    video_url character varying(255),
    video_file character varying(255),
    audio_url character varying(255),
    audio_file character varying(255),
    image_url character varying(255),
    image_file character varying(255),
    "order" integer DEFAULT 0,
    required_duration integer DEFAULT 0,
    document_url text,
    document_file text,
    vtt_file text
);


--
-- Name: lessons_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.lessons_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: lessons_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.lessons_id_seq OWNED BY public.lessons.id;


--
-- Name: message_attachments; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.message_attachments (
    id integer NOT NULL,
    message_id integer NOT NULL,
    file_url character varying(255) NOT NULL,
    file_type character varying(100),
    file_name character varying(255),
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: message_attachments_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.message_attachments_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: message_attachments_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.message_attachments_id_seq OWNED BY public.message_attachments.id;


--
-- Name: message_deletions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.message_deletions (
    id integer NOT NULL,
    message_id integer NOT NULL,
    user_id integer NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: message_deletions_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.message_deletions_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: message_deletions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.message_deletions_id_seq OWNED BY public.message_deletions.id;


--
-- Name: messages; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.messages (
    id integer NOT NULL,
    conversation_id integer NOT NULL,
    sender_id integer NOT NULL,
    message text,
    message_type character varying(50) DEFAULT 'TEXT'::character varying,
    reply_to_id integer,
    is_deleted_for_everyone boolean DEFAULT false,
    is_edited boolean DEFAULT false,
    reactions jsonb DEFAULT '{}'::jsonb,
    is_read boolean DEFAULT false,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    is_forwarded boolean DEFAULT false
);


--
-- Name: messages_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.messages_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: messages_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.messages_id_seq OWNED BY public.messages.id;


--
-- Name: modules; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.modules (
    id integer NOT NULL,
    course_id integer NOT NULL,
    title character varying(255) NOT NULL,
    "order" integer DEFAULT 0
);


--
-- Name: modules_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.modules_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: modules_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.modules_id_seq OWNED BY public.modules.id;


--
-- Name: organizations; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.organizations (
    id integer NOT NULL,
    name character varying(255) NOT NULL,
    code character varying(50) NOT NULL,
    type character varying(50) DEFAULT 'company'::character varying,
    location character varying(255),
    website character varying(255),
    contact_email character varying(255),
    domain_url character varying(255),
    timezone character varying(50) DEFAULT 'UTC'::character varying,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: organizations_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.organizations_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: organizations_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.organizations_id_seq OWNED BY public.organizations.id;


--
-- Name: payments; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.payments (
    id integer NOT NULL,
    user_id integer NOT NULL,
    amount numeric(10,2) NOT NULL,
    currency character varying(10) DEFAULT 'USD'::character varying,
    status character varying(50) DEFAULT 'PENDING'::character varying,
    payment_method character varying(100),
    transaction_id character varying(255),
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: payments_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.payments_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: payments_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.payments_id_seq OWNED BY public.payments.id;


--
-- Name: plan_features; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.plan_features (
    id integer NOT NULL,
    plan_id integer,
    feature_name character varying(255) NOT NULL,
    feature_value character varying(255)
);


--
-- Name: plan_features_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.plan_features_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: plan_features_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.plan_features_id_seq OWNED BY public.plan_features.id;


--
-- Name: practice_arena_attempts; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.practice_arena_attempts (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    student_id integer,
    practice_arena_id uuid,
    total_score integer,
    time_taken_seconds integer,
    attempted_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: practice_arenas; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.practice_arenas (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    module_id integer,
    title character varying(255),
    description text,
    instructor_id integer,
    visibility character varying(50) DEFAULT 'GLOBAL'::character varying,
    target_course_id integer,
    is_mcq_enabled boolean DEFAULT false,
    is_coding_enabled boolean DEFAULT false,
    time_limit_minutes integer DEFAULT 60,
    difficulty character varying(50) DEFAULT 'Medium'::character varying,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: practice_coding_questions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.practice_coding_questions (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    practice_arena_id uuid,
    title character varying(255) NOT NULL,
    problem_statement text NOT NULL,
    difficulty character varying(50),
    language character varying(50),
    starter_code text,
    marks integer DEFAULT 10
);


--
-- Name: practice_mcq_questions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.practice_mcq_questions (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    practice_arena_id uuid,
    question text NOT NULL,
    option_a text NOT NULL,
    option_b text NOT NULL,
    option_c text,
    option_d text,
    correct_answer character varying(1) NOT NULL,
    marks integer DEFAULT 1,
    explanation text
);


--
-- Name: practice_submissions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.practice_submissions (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    student_id integer,
    practice_arena_id uuid,
    submission_type character varying(50),
    score integer,
    status character varying(50),
    submitted_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: practice_test_cases; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.practice_test_cases (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    coding_question_id uuid,
    input_data text,
    expected_output text NOT NULL,
    is_hidden boolean DEFAULT false
);


--
-- Name: questions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.questions (
    id integer NOT NULL,
    quiz_id integer NOT NULL,
    text text NOT NULL,
    question_type public.question_type DEFAULT 'SINGLE'::public.question_type,
    option_a character varying(255) NOT NULL,
    option_b character varying(255) NOT NULL,
    option_c character varying(255) NOT NULL,
    option_d character varying(255) NOT NULL,
    correct_answers character varying(255) NOT NULL
);


--
-- Name: questions_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.questions_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: questions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.questions_id_seq OWNED BY public.questions.id;


--
-- Name: quiz_attempts; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.quiz_attempts (
    id integer NOT NULL,
    enrollment_id integer NOT NULL,
    quiz_id integer NOT NULL,
    score integer NOT NULL,
    total_questions integer NOT NULL,
    passed boolean DEFAULT false,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: quiz_attempts_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.quiz_attempts_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: quiz_attempts_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.quiz_attempts_id_seq OWNED BY public.quiz_attempts.id;


--
-- Name: quizzes; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.quizzes (
    id integer NOT NULL,
    module_id integer NOT NULL,
    title character varying(255) NOT NULL,
    passing_score integer DEFAULT 60,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: quizzes_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.quizzes_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: quizzes_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.quizzes_id_seq OWNED BY public.quizzes.id;


--
-- Name: subscription_plans; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.subscription_plans (
    id integer NOT NULL,
    name character varying(255) NOT NULL,
    description text,
    price numeric(10,2) DEFAULT 0.00 NOT NULL,
    duration_months integer DEFAULT 1 NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    badge_text character varying(50),
    features text,
    billing_cycle character varying(50) DEFAULT 'monthly'::character varying,
    plan_type character varying(50) DEFAULT 'learner'::character varying NOT NULL
);


--
-- Name: subscription_plans_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.subscription_plans_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: subscription_plans_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.subscription_plans_id_seq OWNED BY public.subscription_plans.id;


--
-- Name: subscriptions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.subscriptions (
    id integer NOT NULL,
    user_id integer,
    organization_id integer,
    plan_id integer NOT NULL,
    start_date timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    end_date timestamp without time zone NOT NULL,
    status character varying(50) DEFAULT 'active'::character varying,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: subscriptions_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.subscriptions_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: subscriptions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.subscriptions_id_seq OWNED BY public.subscriptions.id;


--
-- Name: user_hidden_announcements; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.user_hidden_announcements (
    id integer NOT NULL,
    user_id integer,
    announcement_id integer,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: user_hidden_announcements_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.user_hidden_announcements_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: user_hidden_announcements_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.user_hidden_announcements_id_seq OWNED BY public.user_hidden_announcements.id;


--
-- Name: user_subscriptions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.user_subscriptions (
    id integer NOT NULL,
    user_id integer NOT NULL,
    plan_id integer NOT NULL,
    start_date timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    end_date timestamp without time zone NOT NULL,
    is_active boolean DEFAULT true,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: user_subscriptions_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.user_subscriptions_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: user_subscriptions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.user_subscriptions_id_seq OWNED BY public.user_subscriptions.id;


--
-- Name: users; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.users (
    id integer NOT NULL,
    email character varying(255) NOT NULL,
    password character varying(255) NOT NULL,
    full_name character varying(255) NOT NULL,
    role public.user_role DEFAULT 'LEARNER'::public.user_role,
    is_approved boolean DEFAULT false,
    is_active boolean DEFAULT true,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    phone_number character varying(50),
    organization_id integer,
    learner_type character varying(50) DEFAULT 'independent'::character varying,
    roll_number character varying(100),
    employee_id character varying(100),
    last_login_date date,
    streak_count integer DEFAULT 0,
    chat_pin character varying(255),
    profile_pic text
);


--
-- Name: users_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.users_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.users_id_seq OWNED BY public.users.id;


--
-- Name: announcements id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.announcements ALTER COLUMN id SET DEFAULT nextval('public.announcements_id_seq'::regclass);


--
-- Name: assessment_submissions id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.assessment_submissions ALTER COLUMN id SET DEFAULT nextval('public.assessment_submissions_id_seq'::regclass);


--
-- Name: assessments id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.assessments ALTER COLUMN id SET DEFAULT nextval('public.assessments_id_seq'::regclass);


--
-- Name: certificate_requests id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.certificate_requests ALTER COLUMN id SET DEFAULT nextval('public.certificate_requests_id_seq'::regclass);


--
-- Name: contact_queries id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.contact_queries ALTER COLUMN id SET DEFAULT nextval('public.contact_queries_id_seq'::regclass);


--
-- Name: conversation_members id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.conversation_members ALTER COLUMN id SET DEFAULT nextval('public.conversation_members_id_seq'::regclass);


--
-- Name: conversations id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.conversations ALTER COLUMN id SET DEFAULT nextval('public.conversations_id_seq'::regclass);


--
-- Name: course_exam_activity_logs id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.course_exam_activity_logs ALTER COLUMN id SET DEFAULT nextval('public.course_exam_activity_logs_id_seq'::regclass);


--
-- Name: course_exam_answers id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.course_exam_answers ALTER COLUMN id SET DEFAULT nextval('public.course_exam_answers_id_seq'::regclass);


--
-- Name: course_exam_attempts id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.course_exam_attempts ALTER COLUMN id SET DEFAULT nextval('public.course_exam_attempts_id_seq'::regclass);


--
-- Name: course_exam_coding_answers id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.course_exam_coding_answers ALTER COLUMN id SET DEFAULT nextval('public.course_exam_coding_answers_id_seq'::regclass);


--
-- Name: course_exam_coding_details id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.course_exam_coding_details ALTER COLUMN id SET DEFAULT nextval('public.course_exam_coding_details_id_seq'::regclass);


--
-- Name: course_exam_coding_test_cases id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.course_exam_coding_test_cases ALTER COLUMN id SET DEFAULT nextval('public.course_exam_coding_test_cases_id_seq'::regclass);


--
-- Name: course_exam_correct_answers id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.course_exam_correct_answers ALTER COLUMN id SET DEFAULT nextval('public.course_exam_correct_answers_id_seq'::regclass);


--
-- Name: course_exam_options id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.course_exam_options ALTER COLUMN id SET DEFAULT nextval('public.course_exam_options_id_seq'::regclass);


--
-- Name: course_exam_question_bank id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.course_exam_question_bank ALTER COLUMN id SET DEFAULT nextval('public.course_exam_question_bank_id_seq'::regclass);


--
-- Name: course_exam_questions id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.course_exam_questions ALTER COLUMN id SET DEFAULT nextval('public.course_exam_questions_id_seq'::regclass);


--
-- Name: course_exam_sections id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.course_exam_sections ALTER COLUMN id SET DEFAULT nextval('public.course_exam_sections_id_seq'::regclass);


--
-- Name: course_exam_settings id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.course_exam_settings ALTER COLUMN id SET DEFAULT nextval('public.course_exam_settings_id_seq'::regclass);


--
-- Name: course_exams id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.course_exams ALTER COLUMN id SET DEFAULT nextval('public.course_exams_id_seq'::regclass);


--
-- Name: course_prerequisites id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.course_prerequisites ALTER COLUMN id SET DEFAULT nextval('public.course_prerequisites_id_seq'::regclass);


--
-- Name: courses id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.courses ALTER COLUMN id SET DEFAULT nextval('public.courses_id_seq'::regclass);


--
-- Name: enrollments id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.enrollments ALTER COLUMN id SET DEFAULT nextval('public.enrollments_id_seq'::regclass);


--
-- Name: lesson_progress id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.lesson_progress ALTER COLUMN id SET DEFAULT nextval('public.lesson_progress_id_seq'::regclass);


--
-- Name: lessons id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.lessons ALTER COLUMN id SET DEFAULT nextval('public.lessons_id_seq'::regclass);


--
-- Name: message_attachments id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.message_attachments ALTER COLUMN id SET DEFAULT nextval('public.message_attachments_id_seq'::regclass);


--
-- Name: message_deletions id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.message_deletions ALTER COLUMN id SET DEFAULT nextval('public.message_deletions_id_seq'::regclass);


--
-- Name: messages id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.messages ALTER COLUMN id SET DEFAULT nextval('public.messages_id_seq'::regclass);


--
-- Name: modules id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.modules ALTER COLUMN id SET DEFAULT nextval('public.modules_id_seq'::regclass);


--
-- Name: organizations id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.organizations ALTER COLUMN id SET DEFAULT nextval('public.organizations_id_seq'::regclass);


--
-- Name: payments id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.payments ALTER COLUMN id SET DEFAULT nextval('public.payments_id_seq'::regclass);


--
-- Name: plan_features id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.plan_features ALTER COLUMN id SET DEFAULT nextval('public.plan_features_id_seq'::regclass);


--
-- Name: questions id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.questions ALTER COLUMN id SET DEFAULT nextval('public.questions_id_seq'::regclass);


--
-- Name: quiz_attempts id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.quiz_attempts ALTER COLUMN id SET DEFAULT nextval('public.quiz_attempts_id_seq'::regclass);


--
-- Name: quizzes id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.quizzes ALTER COLUMN id SET DEFAULT nextval('public.quizzes_id_seq'::regclass);


--
-- Name: subscription_plans id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.subscription_plans ALTER COLUMN id SET DEFAULT nextval('public.subscription_plans_id_seq'::regclass);


--
-- Name: subscriptions id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.subscriptions ALTER COLUMN id SET DEFAULT nextval('public.subscriptions_id_seq'::regclass);


--
-- Name: user_hidden_announcements id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_hidden_announcements ALTER COLUMN id SET DEFAULT nextval('public.user_hidden_announcements_id_seq'::regclass);


--
-- Name: user_subscriptions id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_subscriptions ALTER COLUMN id SET DEFAULT nextval('public.user_subscriptions_id_seq'::regclass);


--
-- Name: users id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);


--
-- Name: announcements announcements_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.announcements
    ADD CONSTRAINT announcements_pkey PRIMARY KEY (id);


--
-- Name: assessment_submissions assessment_submissions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.assessment_submissions
    ADD CONSTRAINT assessment_submissions_pkey PRIMARY KEY (id);


--
-- Name: assessments assessments_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.assessments
    ADD CONSTRAINT assessments_pkey PRIMARY KEY (id);


--
-- Name: certificate_requests certificate_requests_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.certificate_requests
    ADD CONSTRAINT certificate_requests_pkey PRIMARY KEY (id);


--
-- Name: coding_submissions coding_submissions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.coding_submissions
    ADD CONSTRAINT coding_submissions_pkey PRIMARY KEY (id);


--
-- Name: contact_queries contact_queries_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.contact_queries
    ADD CONSTRAINT contact_queries_pkey PRIMARY KEY (id);


--
-- Name: conversation_members conversation_members_conversation_id_user_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.conversation_members
    ADD CONSTRAINT conversation_members_conversation_id_user_id_key UNIQUE (conversation_id, user_id);


--
-- Name: conversation_members conversation_members_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.conversation_members
    ADD CONSTRAINT conversation_members_pkey PRIMARY KEY (id);


--
-- Name: conversations conversations_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.conversations
    ADD CONSTRAINT conversations_pkey PRIMARY KEY (id);


--
-- Name: course_exam_activity_logs course_exam_activity_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.course_exam_activity_logs
    ADD CONSTRAINT course_exam_activity_logs_pkey PRIMARY KEY (id);


--
-- Name: course_exam_answers course_exam_answers_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.course_exam_answers
    ADD CONSTRAINT course_exam_answers_pkey PRIMARY KEY (id);


--
-- Name: course_exam_attempts course_exam_attempts_exam_id_student_id_attempt_number_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.course_exam_attempts
    ADD CONSTRAINT course_exam_attempts_exam_id_student_id_attempt_number_key UNIQUE (exam_id, student_id, attempt_number);


--
-- Name: course_exam_attempts course_exam_attempts_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.course_exam_attempts
    ADD CONSTRAINT course_exam_attempts_pkey PRIMARY KEY (id);


--
-- Name: course_exam_coding_answers course_exam_coding_answers_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.course_exam_coding_answers
    ADD CONSTRAINT course_exam_coding_answers_pkey PRIMARY KEY (id);


--
-- Name: course_exam_coding_details course_exam_coding_details_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.course_exam_coding_details
    ADD CONSTRAINT course_exam_coding_details_pkey PRIMARY KEY (id);


--
-- Name: course_exam_coding_test_cases course_exam_coding_test_cases_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.course_exam_coding_test_cases
    ADD CONSTRAINT course_exam_coding_test_cases_pkey PRIMARY KEY (id);


--
-- Name: course_exam_correct_answers course_exam_correct_answers_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.course_exam_correct_answers
    ADD CONSTRAINT course_exam_correct_answers_pkey PRIMARY KEY (id);


--
-- Name: course_exam_options course_exam_options_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.course_exam_options
    ADD CONSTRAINT course_exam_options_pkey PRIMARY KEY (id);


--
-- Name: course_exam_question_bank course_exam_question_bank_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.course_exam_question_bank
    ADD CONSTRAINT course_exam_question_bank_pkey PRIMARY KEY (id);


--
-- Name: course_exam_questions course_exam_questions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.course_exam_questions
    ADD CONSTRAINT course_exam_questions_pkey PRIMARY KEY (id);


--
-- Name: course_exam_sections course_exam_sections_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.course_exam_sections
    ADD CONSTRAINT course_exam_sections_pkey PRIMARY KEY (id);


--
-- Name: course_exam_settings course_exam_settings_exam_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.course_exam_settings
    ADD CONSTRAINT course_exam_settings_exam_id_key UNIQUE (exam_id);


--
-- Name: course_exam_settings course_exam_settings_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.course_exam_settings
    ADD CONSTRAINT course_exam_settings_pkey PRIMARY KEY (id);


--
-- Name: course_exams course_exams_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.course_exams
    ADD CONSTRAINT course_exams_pkey PRIMARY KEY (id);


--
-- Name: course_prerequisites course_prerequisites_course_id_prerequisite_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.course_prerequisites
    ADD CONSTRAINT course_prerequisites_course_id_prerequisite_id_key UNIQUE (course_id, prerequisite_id);


--
-- Name: course_prerequisites course_prerequisites_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.course_prerequisites
    ADD CONSTRAINT course_prerequisites_pkey PRIMARY KEY (id);


--
-- Name: courses courses_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.courses
    ADD CONSTRAINT courses_pkey PRIMARY KEY (id);


--
-- Name: enrollments enrollments_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.enrollments
    ADD CONSTRAINT enrollments_pkey PRIMARY KEY (id);


--
-- Name: enrollments enrollments_student_id_course_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.enrollments
    ADD CONSTRAINT enrollments_student_id_course_id_key UNIQUE (student_id, course_id);


--
-- Name: lesson_progress lesson_progress_enrollment_id_lesson_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.lesson_progress
    ADD CONSTRAINT lesson_progress_enrollment_id_lesson_id_key UNIQUE (enrollment_id, lesson_id);


--
-- Name: lesson_progress lesson_progress_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.lesson_progress
    ADD CONSTRAINT lesson_progress_pkey PRIMARY KEY (id);


--
-- Name: lessons lessons_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.lessons
    ADD CONSTRAINT lessons_pkey PRIMARY KEY (id);


--
-- Name: message_attachments message_attachments_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.message_attachments
    ADD CONSTRAINT message_attachments_pkey PRIMARY KEY (id);


--
-- Name: message_deletions message_deletions_message_id_user_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.message_deletions
    ADD CONSTRAINT message_deletions_message_id_user_id_key UNIQUE (message_id, user_id);


--
-- Name: message_deletions message_deletions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.message_deletions
    ADD CONSTRAINT message_deletions_pkey PRIMARY KEY (id);


--
-- Name: messages messages_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.messages
    ADD CONSTRAINT messages_pkey PRIMARY KEY (id);


--
-- Name: modules modules_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.modules
    ADD CONSTRAINT modules_pkey PRIMARY KEY (id);


--
-- Name: organizations organizations_code_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.organizations
    ADD CONSTRAINT organizations_code_key UNIQUE (code);


--
-- Name: organizations organizations_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.organizations
    ADD CONSTRAINT organizations_pkey PRIMARY KEY (id);


--
-- Name: payments payments_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.payments
    ADD CONSTRAINT payments_pkey PRIMARY KEY (id);


--
-- Name: payments payments_transaction_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.payments
    ADD CONSTRAINT payments_transaction_id_key UNIQUE (transaction_id);


--
-- Name: plan_features plan_features_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.plan_features
    ADD CONSTRAINT plan_features_pkey PRIMARY KEY (id);


--
-- Name: practice_arena_attempts practice_arena_attempts_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.practice_arena_attempts
    ADD CONSTRAINT practice_arena_attempts_pkey PRIMARY KEY (id);


--
-- Name: practice_arenas practice_arenas_module_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.practice_arenas
    ADD CONSTRAINT practice_arenas_module_id_key UNIQUE (module_id);


--
-- Name: practice_arenas practice_arenas_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.practice_arenas
    ADD CONSTRAINT practice_arenas_pkey PRIMARY KEY (id);


--
-- Name: practice_coding_questions practice_coding_questions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.practice_coding_questions
    ADD CONSTRAINT practice_coding_questions_pkey PRIMARY KEY (id);


--
-- Name: practice_mcq_questions practice_mcq_questions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.practice_mcq_questions
    ADD CONSTRAINT practice_mcq_questions_pkey PRIMARY KEY (id);


--
-- Name: practice_submissions practice_submissions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.practice_submissions
    ADD CONSTRAINT practice_submissions_pkey PRIMARY KEY (id);


--
-- Name: practice_test_cases practice_test_cases_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.practice_test_cases
    ADD CONSTRAINT practice_test_cases_pkey PRIMARY KEY (id);


--
-- Name: questions questions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.questions
    ADD CONSTRAINT questions_pkey PRIMARY KEY (id);


--
-- Name: quiz_attempts quiz_attempts_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.quiz_attempts
    ADD CONSTRAINT quiz_attempts_pkey PRIMARY KEY (id);


--
-- Name: quizzes quizzes_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.quizzes
    ADD CONSTRAINT quizzes_pkey PRIMARY KEY (id);


--
-- Name: subscription_plans subscription_plans_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.subscription_plans
    ADD CONSTRAINT subscription_plans_pkey PRIMARY KEY (id);


--
-- Name: subscriptions subscriptions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.subscriptions
    ADD CONSTRAINT subscriptions_pkey PRIMARY KEY (id);


--
-- Name: user_hidden_announcements user_hidden_announcements_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_hidden_announcements
    ADD CONSTRAINT user_hidden_announcements_pkey PRIMARY KEY (id);


--
-- Name: user_hidden_announcements user_hidden_announcements_user_id_announcement_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_hidden_announcements
    ADD CONSTRAINT user_hidden_announcements_user_id_announcement_id_key UNIQUE (user_id, announcement_id);


--
-- Name: user_subscriptions user_subscriptions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_subscriptions
    ADD CONSTRAINT user_subscriptions_pkey PRIMARY KEY (id);


--
-- Name: users users_email_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key UNIQUE (email);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: idx_exam_activity_exam; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_exam_activity_exam ON public.course_exam_activity_logs USING btree (exam_id);


--
-- Name: idx_exam_activity_user; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_exam_activity_user ON public.course_exam_activity_logs USING btree (user_id);


--
-- Name: idx_exam_answers_attempt; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_exam_answers_attempt ON public.course_exam_answers USING btree (attempt_id);


--
-- Name: idx_exam_attempts_exam; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_exam_attempts_exam ON public.course_exam_attempts USING btree (exam_id);


--
-- Name: idx_exam_attempts_student; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_exam_attempts_student ON public.course_exam_attempts USING btree (student_id);


--
-- Name: idx_exam_qbank_org; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_exam_qbank_org ON public.course_exam_question_bank USING btree (organization_id);


--
-- Name: idx_exam_questions_section; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_exam_questions_section ON public.course_exam_questions USING btree (section_id);


--
-- Name: idx_single_in_progress_attempt; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX idx_single_in_progress_attempt ON public.course_exam_attempts USING btree (exam_id, student_id) WHERE (status = 'IN_PROGRESS'::public.exam_attempt_status);


--
-- Name: announcements announcements_organization_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.announcements
    ADD CONSTRAINT announcements_organization_id_fkey FOREIGN KEY (organization_id) REFERENCES public.organizations(id) ON DELETE CASCADE;


--
-- Name: assessment_submissions assessment_submissions_assessment_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.assessment_submissions
    ADD CONSTRAINT assessment_submissions_assessment_id_fkey FOREIGN KEY (assessment_id) REFERENCES public.assessments(id) ON DELETE CASCADE;


--
-- Name: assessment_submissions assessment_submissions_enrollment_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.assessment_submissions
    ADD CONSTRAINT assessment_submissions_enrollment_id_fkey FOREIGN KEY (enrollment_id) REFERENCES public.enrollments(id) ON DELETE CASCADE;


--
-- Name: assessments assessments_course_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.assessments
    ADD CONSTRAINT assessments_course_id_fkey FOREIGN KEY (course_id) REFERENCES public.courses(id) ON DELETE CASCADE;


--
-- Name: certificate_requests certificate_requests_enrollment_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.certificate_requests
    ADD CONSTRAINT certificate_requests_enrollment_id_fkey FOREIGN KEY (enrollment_id) REFERENCES public.enrollments(id) ON DELETE CASCADE;


--
-- Name: coding_submissions coding_submissions_coding_question_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.coding_submissions
    ADD CONSTRAINT coding_submissions_coding_question_id_fkey FOREIGN KEY (coding_question_id) REFERENCES public.practice_coding_questions(id) ON DELETE CASCADE;


--
-- Name: coding_submissions coding_submissions_practice_submission_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.coding_submissions
    ADD CONSTRAINT coding_submissions_practice_submission_id_fkey FOREIGN KEY (practice_submission_id) REFERENCES public.practice_submissions(id) ON DELETE CASCADE;


--
-- Name: conversation_members conversation_members_conversation_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.conversation_members
    ADD CONSTRAINT conversation_members_conversation_id_fkey FOREIGN KEY (conversation_id) REFERENCES public.conversations(id) ON DELETE CASCADE;


--
-- Name: conversation_members conversation_members_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.conversation_members
    ADD CONSTRAINT conversation_members_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: conversations conversations_course_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.conversations
    ADD CONSTRAINT conversations_course_id_fkey FOREIGN KEY (course_id) REFERENCES public.courses(id) ON DELETE CASCADE;


--
-- Name: conversations conversations_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.conversations
    ADD CONSTRAINT conversations_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: conversations conversations_organization_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.conversations
    ADD CONSTRAINT conversations_organization_id_fkey FOREIGN KEY (organization_id) REFERENCES public.organizations(id) ON DELETE CASCADE;


--
-- Name: course_exam_activity_logs course_exam_activity_logs_exam_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.course_exam_activity_logs
    ADD CONSTRAINT course_exam_activity_logs_exam_id_fkey FOREIGN KEY (exam_id) REFERENCES public.course_exams(id) ON DELETE CASCADE;


--
-- Name: course_exam_activity_logs course_exam_activity_logs_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.course_exam_activity_logs
    ADD CONSTRAINT course_exam_activity_logs_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: course_exam_answers course_exam_answers_attempt_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.course_exam_answers
    ADD CONSTRAINT course_exam_answers_attempt_id_fkey FOREIGN KEY (attempt_id) REFERENCES public.course_exam_attempts(id) ON DELETE CASCADE;


--
-- Name: course_exam_answers course_exam_answers_question_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.course_exam_answers
    ADD CONSTRAINT course_exam_answers_question_id_fkey FOREIGN KEY (question_id) REFERENCES public.course_exam_questions(id) ON DELETE CASCADE;


--
-- Name: course_exam_attempts course_exam_attempts_exam_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.course_exam_attempts
    ADD CONSTRAINT course_exam_attempts_exam_id_fkey FOREIGN KEY (exam_id) REFERENCES public.course_exams(id) ON DELETE CASCADE;


--
-- Name: course_exam_attempts course_exam_attempts_student_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.course_exam_attempts
    ADD CONSTRAINT course_exam_attempts_student_id_fkey FOREIGN KEY (student_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: course_exam_coding_answers course_exam_coding_answers_attempt_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.course_exam_coding_answers
    ADD CONSTRAINT course_exam_coding_answers_attempt_id_fkey FOREIGN KEY (attempt_id) REFERENCES public.course_exam_attempts(id) ON DELETE CASCADE;


--
-- Name: course_exam_coding_answers course_exam_coding_answers_question_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.course_exam_coding_answers
    ADD CONSTRAINT course_exam_coding_answers_question_id_fkey FOREIGN KEY (question_id) REFERENCES public.course_exam_questions(id) ON DELETE CASCADE;


--
-- Name: course_exam_coding_details course_exam_coding_details_question_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.course_exam_coding_details
    ADD CONSTRAINT course_exam_coding_details_question_id_fkey FOREIGN KEY (question_id) REFERENCES public.course_exam_questions(id) ON DELETE CASCADE;


--
-- Name: course_exam_coding_test_cases course_exam_coding_test_cases_question_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.course_exam_coding_test_cases
    ADD CONSTRAINT course_exam_coding_test_cases_question_id_fkey FOREIGN KEY (question_id) REFERENCES public.course_exam_questions(id) ON DELETE CASCADE;


--
-- Name: course_exam_correct_answers course_exam_correct_answers_question_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.course_exam_correct_answers
    ADD CONSTRAINT course_exam_correct_answers_question_id_fkey FOREIGN KEY (question_id) REFERENCES public.course_exam_questions(id) ON DELETE CASCADE;


--
-- Name: course_exam_options course_exam_options_question_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.course_exam_options
    ADD CONSTRAINT course_exam_options_question_id_fkey FOREIGN KEY (question_id) REFERENCES public.course_exam_questions(id) ON DELETE CASCADE;


--
-- Name: course_exam_question_bank course_exam_question_bank_course_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.course_exam_question_bank
    ADD CONSTRAINT course_exam_question_bank_course_id_fkey FOREIGN KEY (course_id) REFERENCES public.courses(id) ON DELETE CASCADE;


--
-- Name: course_exam_question_bank course_exam_question_bank_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.course_exam_question_bank
    ADD CONSTRAINT course_exam_question_bank_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: course_exam_question_bank course_exam_question_bank_organization_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.course_exam_question_bank
    ADD CONSTRAINT course_exam_question_bank_organization_id_fkey FOREIGN KEY (organization_id) REFERENCES public.organizations(id) ON DELETE CASCADE;


--
-- Name: course_exam_questions course_exam_questions_question_bank_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.course_exam_questions
    ADD CONSTRAINT course_exam_questions_question_bank_id_fkey FOREIGN KEY (question_bank_id) REFERENCES public.course_exam_question_bank(id) ON DELETE SET NULL;


--
-- Name: course_exam_questions course_exam_questions_section_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.course_exam_questions
    ADD CONSTRAINT course_exam_questions_section_id_fkey FOREIGN KEY (section_id) REFERENCES public.course_exam_sections(id) ON DELETE CASCADE;


--
-- Name: course_exam_sections course_exam_sections_exam_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.course_exam_sections
    ADD CONSTRAINT course_exam_sections_exam_id_fkey FOREIGN KEY (exam_id) REFERENCES public.course_exams(id) ON DELETE CASCADE;


--
-- Name: course_exam_settings course_exam_settings_exam_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.course_exam_settings
    ADD CONSTRAINT course_exam_settings_exam_id_fkey FOREIGN KEY (exam_id) REFERENCES public.course_exams(id) ON DELETE CASCADE;


--
-- Name: course_exams course_exams_course_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.course_exams
    ADD CONSTRAINT course_exams_course_id_fkey FOREIGN KEY (course_id) REFERENCES public.courses(id) ON DELETE CASCADE;


--
-- Name: course_exams course_exams_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.course_exams
    ADD CONSTRAINT course_exams_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: course_prerequisites course_prerequisites_course_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.course_prerequisites
    ADD CONSTRAINT course_prerequisites_course_id_fkey FOREIGN KEY (course_id) REFERENCES public.courses(id) ON DELETE CASCADE;


--
-- Name: course_prerequisites course_prerequisites_prerequisite_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.course_prerequisites
    ADD CONSTRAINT course_prerequisites_prerequisite_id_fkey FOREIGN KEY (prerequisite_id) REFERENCES public.courses(id) ON DELETE CASCADE;


--
-- Name: courses courses_instructor_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.courses
    ADD CONSTRAINT courses_instructor_id_fkey FOREIGN KEY (instructor_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: courses courses_organization_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.courses
    ADD CONSTRAINT courses_organization_id_fkey FOREIGN KEY (organization_id) REFERENCES public.organizations(id) ON DELETE CASCADE;


--
-- Name: enrollments enrollments_course_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.enrollments
    ADD CONSTRAINT enrollments_course_id_fkey FOREIGN KEY (course_id) REFERENCES public.courses(id) ON DELETE CASCADE;


--
-- Name: enrollments enrollments_student_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.enrollments
    ADD CONSTRAINT enrollments_student_id_fkey FOREIGN KEY (student_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: lesson_progress lesson_progress_enrollment_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.lesson_progress
    ADD CONSTRAINT lesson_progress_enrollment_id_fkey FOREIGN KEY (enrollment_id) REFERENCES public.enrollments(id) ON DELETE CASCADE;


--
-- Name: lesson_progress lesson_progress_lesson_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.lesson_progress
    ADD CONSTRAINT lesson_progress_lesson_id_fkey FOREIGN KEY (lesson_id) REFERENCES public.lessons(id) ON DELETE CASCADE;


--
-- Name: lessons lessons_module_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.lessons
    ADD CONSTRAINT lessons_module_id_fkey FOREIGN KEY (module_id) REFERENCES public.modules(id) ON DELETE CASCADE;


--
-- Name: message_attachments message_attachments_message_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.message_attachments
    ADD CONSTRAINT message_attachments_message_id_fkey FOREIGN KEY (message_id) REFERENCES public.messages(id) ON DELETE CASCADE;


--
-- Name: message_deletions message_deletions_message_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.message_deletions
    ADD CONSTRAINT message_deletions_message_id_fkey FOREIGN KEY (message_id) REFERENCES public.messages(id) ON DELETE CASCADE;


--
-- Name: message_deletions message_deletions_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.message_deletions
    ADD CONSTRAINT message_deletions_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: messages messages_conversation_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.messages
    ADD CONSTRAINT messages_conversation_id_fkey FOREIGN KEY (conversation_id) REFERENCES public.conversations(id) ON DELETE CASCADE;


--
-- Name: messages messages_reply_to_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.messages
    ADD CONSTRAINT messages_reply_to_id_fkey FOREIGN KEY (reply_to_id) REFERENCES public.messages(id);


--
-- Name: messages messages_sender_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.messages
    ADD CONSTRAINT messages_sender_id_fkey FOREIGN KEY (sender_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: modules modules_course_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.modules
    ADD CONSTRAINT modules_course_id_fkey FOREIGN KEY (course_id) REFERENCES public.courses(id) ON DELETE CASCADE;


--
-- Name: payments payments_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.payments
    ADD CONSTRAINT payments_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: plan_features plan_features_plan_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.plan_features
    ADD CONSTRAINT plan_features_plan_id_fkey FOREIGN KEY (plan_id) REFERENCES public.subscription_plans(id) ON DELETE CASCADE;


--
-- Name: practice_arena_attempts practice_arena_attempts_practice_arena_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.practice_arena_attempts
    ADD CONSTRAINT practice_arena_attempts_practice_arena_id_fkey FOREIGN KEY (practice_arena_id) REFERENCES public.practice_arenas(id) ON DELETE CASCADE;


--
-- Name: practice_arena_attempts practice_arena_attempts_student_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.practice_arena_attempts
    ADD CONSTRAINT practice_arena_attempts_student_id_fkey FOREIGN KEY (student_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: practice_arenas practice_arenas_instructor_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.practice_arenas
    ADD CONSTRAINT practice_arenas_instructor_id_fkey FOREIGN KEY (instructor_id) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: practice_arenas practice_arenas_module_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.practice_arenas
    ADD CONSTRAINT practice_arenas_module_id_fkey FOREIGN KEY (module_id) REFERENCES public.modules(id) ON DELETE CASCADE;


--
-- Name: practice_arenas practice_arenas_target_course_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.practice_arenas
    ADD CONSTRAINT practice_arenas_target_course_id_fkey FOREIGN KEY (target_course_id) REFERENCES public.courses(id) ON DELETE CASCADE;


--
-- Name: practice_coding_questions practice_coding_questions_practice_arena_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.practice_coding_questions
    ADD CONSTRAINT practice_coding_questions_practice_arena_id_fkey FOREIGN KEY (practice_arena_id) REFERENCES public.practice_arenas(id) ON DELETE CASCADE;


--
-- Name: practice_mcq_questions practice_mcq_questions_practice_arena_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.practice_mcq_questions
    ADD CONSTRAINT practice_mcq_questions_practice_arena_id_fkey FOREIGN KEY (practice_arena_id) REFERENCES public.practice_arenas(id) ON DELETE CASCADE;


--
-- Name: practice_submissions practice_submissions_practice_arena_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.practice_submissions
    ADD CONSTRAINT practice_submissions_practice_arena_id_fkey FOREIGN KEY (practice_arena_id) REFERENCES public.practice_arenas(id) ON DELETE CASCADE;


--
-- Name: practice_submissions practice_submissions_student_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.practice_submissions
    ADD CONSTRAINT practice_submissions_student_id_fkey FOREIGN KEY (student_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: practice_test_cases practice_test_cases_coding_question_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.practice_test_cases
    ADD CONSTRAINT practice_test_cases_coding_question_id_fkey FOREIGN KEY (coding_question_id) REFERENCES public.practice_coding_questions(id) ON DELETE CASCADE;


--
-- Name: questions questions_quiz_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.questions
    ADD CONSTRAINT questions_quiz_id_fkey FOREIGN KEY (quiz_id) REFERENCES public.quizzes(id) ON DELETE CASCADE;


--
-- Name: quiz_attempts quiz_attempts_enrollment_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.quiz_attempts
    ADD CONSTRAINT quiz_attempts_enrollment_id_fkey FOREIGN KEY (enrollment_id) REFERENCES public.enrollments(id) ON DELETE CASCADE;


--
-- Name: quiz_attempts quiz_attempts_quiz_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.quiz_attempts
    ADD CONSTRAINT quiz_attempts_quiz_id_fkey FOREIGN KEY (quiz_id) REFERENCES public.quizzes(id) ON DELETE CASCADE;


--
-- Name: quizzes quizzes_module_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.quizzes
    ADD CONSTRAINT quizzes_module_id_fkey FOREIGN KEY (module_id) REFERENCES public.modules(id) ON DELETE CASCADE;


--
-- Name: subscriptions subscriptions_organization_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.subscriptions
    ADD CONSTRAINT subscriptions_organization_id_fkey FOREIGN KEY (organization_id) REFERENCES public.organizations(id) ON DELETE CASCADE;


--
-- Name: subscriptions subscriptions_plan_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.subscriptions
    ADD CONSTRAINT subscriptions_plan_id_fkey FOREIGN KEY (plan_id) REFERENCES public.subscription_plans(id) ON DELETE RESTRICT;


--
-- Name: subscriptions subscriptions_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.subscriptions
    ADD CONSTRAINT subscriptions_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: user_hidden_announcements user_hidden_announcements_announcement_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_hidden_announcements
    ADD CONSTRAINT user_hidden_announcements_announcement_id_fkey FOREIGN KEY (announcement_id) REFERENCES public.announcements(id) ON DELETE CASCADE;


--
-- Name: user_hidden_announcements user_hidden_announcements_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_hidden_announcements
    ADD CONSTRAINT user_hidden_announcements_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: user_subscriptions user_subscriptions_plan_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_subscriptions
    ADD CONSTRAINT user_subscriptions_plan_id_fkey FOREIGN KEY (plan_id) REFERENCES public.subscription_plans(id) ON DELETE RESTRICT;


--
-- Name: user_subscriptions user_subscriptions_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_subscriptions
    ADD CONSTRAINT user_subscriptions_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: users users_organization_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_organization_id_fkey FOREIGN KEY (organization_id) REFERENCES public.organizations(id) ON DELETE SET NULL;


--
-- PostgreSQL database dump complete
--

\unrestrict zodgoZQ2k7ITPbU614ra081ngzvdd476ObjJjPemCAhTOaJCL5zjUZaY9ccQfz9

