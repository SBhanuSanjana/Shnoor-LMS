from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import Course,Module,Lesson,Quiz,Question,Assessment,Enrollment,LessonProgress,QuizAttempt,AssessmentSubmission,CertificateRequest
from learners.models import LearnerProfile

User=get_user_model()

class UserMiniSerializer(serializers.ModelSerializer):
    class Meta:
        model=User
        fields=['id','email','full_name']

class QuestionSerializer(serializers.ModelSerializer):
    class Meta:
        model=Question
        fields=['id','text','question_type','option_a','option_b','option_c','option_d','correct_answers']

class QuizSerializer(serializers.ModelSerializer):
    questions=QuestionSerializer(many=True,read_only=True)
    class Meta:
        model=Quiz
        fields=['id','module','title','passing_score','questions']
        read_only_fields=['module']

class LessonSerializer(serializers.ModelSerializer):
    class Meta:
        model=Lesson
        fields=['id','module','title','content_type','text_content','video_url','video_file','audio_url','audio_file','image_url','image_file','order']
        read_only_fields=['module']

class ModuleSerializer(serializers.ModelSerializer):
    lessons=LessonSerializer(many=True,read_only=True)
    quizzes=QuizSerializer(many=True,read_only=True)
    class Meta:
        model=Module
        fields=['id','course','title','lessons','quizzes','order']
        read_only_fields=['course']

class AssessmentSerializer(serializers.ModelSerializer):
    class Meta:
        model=Assessment
        fields=['id','course','title','description']
        read_only_fields=['course']

class CourseSerializer(serializers.ModelSerializer):
    modules=ModuleSerializer(many=True,read_only=True)
    assessments=AssessmentSerializer(many=True,read_only=True)
    instructor=UserMiniSerializer(read_only=True)
    enrollments_count=serializers.IntegerField(source='enrollments.count',read_only=True)
    class Meta:
        model=Course
        fields=['id','title','description','thumbnail_url','thumbnail_file','rating','instructor','is_approved','is_published','modules','assessments','enrollments_count','created_at']

class LessonProgressSerializer(serializers.ModelSerializer):
    class Meta:
        model=LessonProgress
        fields=['id','lesson','is_completed','updated_at']

class QuizAttemptSerializer(serializers.ModelSerializer):
    quiz_title=serializers.CharField(source='quiz.title',read_only=True)
    class Meta:
        model=QuizAttempt
        fields=['id','quiz','quiz_title','score','total_questions','passed','created_at']

class AssessmentSubmissionSerializer(serializers.ModelSerializer):
    assessment_title=serializers.CharField(source='assessment.title',read_only=True)
    student_email=serializers.CharField(source='enrollment.student.email',read_only=True)
    student_name=serializers.CharField(source='enrollment.student.full_name',read_only=True)
    course_title=serializers.CharField(source='enrollment.course.title',read_only=True)
    class Meta:
        model=AssessmentSubmission
        fields=['id','enrollment','assessment','assessment_title','student_email','student_name','course_title','answers_text','grade','is_graded','created_at']

class EnrollmentSerializer(serializers.ModelSerializer):
    student=UserMiniSerializer(read_only=True)
    course=CourseSerializer(read_only=True)
    lesson_progress=LessonProgressSerializer(many=True,read_only=True)
    quiz_attempts=QuizAttemptSerializer(many=True,read_only=True)
    assessment_submissions=AssessmentSubmissionSerializer(many=True,read_only=True)
    class Meta:
        model=Enrollment
        fields=['id','student','course','lesson_progress','quiz_attempts','assessment_submissions','completed_at','created_at']

class CertificateRequestSerializer(serializers.ModelSerializer):
    student_email=serializers.CharField(source='enrollment.student.email',read_only=True)
    student_name=serializers.CharField(source='enrollment.student.full_name',read_only=True)
    course_title=serializers.CharField(source='enrollment.course.title',read_only=True)
    class Meta:
        model=CertificateRequest
        fields=['id','enrollment','status','student_email','student_name','course_title','created_at','updated_at']

class LearnerProfileSerializer(serializers.ModelSerializer):
    email=serializers.EmailField(source='user.email',read_only=True)
    full_name=serializers.CharField(source='user.full_name')
    class Meta:
        model=LearnerProfile
        fields=['id','email','full_name','learner_type','roll_number','employee_id','phone','bio','skills']

    def update(self,instance,validated_data):
        user_data=validated_data.pop('user',{})
        full_name=user_data.get('full_name')
        if full_name:
            instance.user.full_name=full_name
            instance.user.save()
        for attr,value in validated_data.items():
            setattr(instance,attr,value)
        instance.save()
        return instance
