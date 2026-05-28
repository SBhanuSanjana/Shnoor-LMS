from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from django.shortcuts import get_object_or_404
from .models import Course,Module,Lesson,Quiz,Question,Assessment,Enrollment,LessonProgress,QuizAttempt,AssessmentSubmission,CertificateRequest
from .serializers import CourseSerializer,ModuleSerializer,LessonSerializer,QuizSerializer,QuestionSerializer,AssessmentSerializer,EnrollmentSerializer,QuizAttemptSerializer,AssessmentSubmissionSerializer,CertificateRequestSerializer,LearnerProfileSerializer
from learners.models import LearnerProfile

class CourseListCreateView(APIView):
    permission_classes=[IsAuthenticated]

    def get(self,request):
        courses=Course.objects.filter(is_approved=True)
        serializer=CourseSerializer(courses,many=True)
        return Response(serializer.data)

    def post(self,request):
        if request.user.role!='instructor':
            return Response({"error":"Only instructors can create courses"},status=status.HTTP_403_FORBIDDEN)
        serializer=CourseSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(instructor=request.user)
            return Response(serializer.data,status=status.HTTP_201_CREATED)
        return Response(serializer.errors,status=status.HTTP_400_BAD_REQUEST)

class InstructorCoursesView(APIView):
    permission_classes=[IsAuthenticated]

    def get(self,request):
        if request.user.role!='instructor':
            return Response({"error":"Access denied"},status=status.HTTP_403_FORBIDDEN)
        courses=Course.objects.filter(instructor=request.user)
        serializer=CourseSerializer(courses,many=True)
        return Response(serializer.data)

class CourseDetailView(APIView):
    permission_classes=[IsAuthenticated]

    def get(self,request,pk):
        course=get_object_or_404(Course,pk=pk)
        serializer=CourseSerializer(course)
        return Response(serializer.data)

    def delete(self,request,pk):
        course=get_object_or_404(Course,pk=pk)
        if course.instructor!=request.user:
            return Response({"error":"Access denied"},status=status.HTTP_403_FORBIDDEN)
        course.delete()
        return Response({"message":"Course deleted successfully"})

    def put(self,request,pk):
        course=get_object_or_404(Course,pk=pk)
        if course.instructor!=request.user:
            return Response({"error":"Access denied"},status=status.HTTP_403_FORBIDDEN)
        serializer=CourseSerializer(course,data=request.data,partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors,status=status.HTTP_400_BAD_REQUEST)

class ModuleCreateView(APIView):
    permission_classes=[IsAuthenticated]

    def post(self,request,course_id):
        course=get_object_or_404(Course,pk=course_id)
        if course.instructor!=request.user:
            return Response({"error":"Only the course instructor can manage modules"},status=status.HTTP_403_FORBIDDEN)
        serializer=ModuleSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(course=course)
            return Response(serializer.data,status=status.HTTP_201_CREATED)
        return Response(serializer.errors,status=status.HTTP_400_BAD_REQUEST)

    def put(self,request,course_id):
        course=get_object_or_404(Course,pk=course_id)
        if course.instructor!=request.user:
            return Response({"error":"Access denied"},status=status.HTTP_403_FORBIDDEN)
        modules_data=request.data.get('modules',[])
        for m_data in modules_data:
            module_id=m_data.get('id')
            order=m_data.get('order')
            if module_id is not None and order is not None:
                Module.objects.filter(pk=module_id,course=course).update(order=order)
        return Response({"message":"Modules reordered successfully"})

class LessonCreateView(APIView):
    permission_classes=[IsAuthenticated]

    def post(self,request,module_id):
        module=get_object_or_404(Module,pk=module_id)
        if module.course.instructor!=request.user:
            return Response({"error":"Only the course instructor can manage lessons"},status=status.HTTP_403_FORBIDDEN)
        serializer=LessonSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(module=module)
            return Response(serializer.data,status=status.HTTP_201_CREATED)
        return Response(serializer.errors,status=status.HTTP_400_BAD_REQUEST)

class QuizCreateView(APIView):
    permission_classes=[IsAuthenticated]

    def post(self,request,module_id):
        module=get_object_or_404(Module,pk=module_id)
        if module.course.instructor!=request.user:
            return Response({"error":"Only the course instructor can manage quizzes"},status=status.HTTP_403_FORBIDDEN)
        serializer=QuizSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(module=module)
            return Response(serializer.data,status=status.HTTP_201_CREATED)
        return Response(serializer.errors,status=status.HTTP_400_BAD_REQUEST)

class QuizDetailView(APIView):
    permission_classes=[IsAuthenticated]

    def put(self,request,pk):
        quiz=get_object_or_404(Quiz,pk=pk)
        if quiz.module.course.instructor!=request.user:
            return Response({"error":"Access denied"},status=status.HTTP_403_FORBIDDEN)
        serializer=QuizSerializer(quiz,data=request.data,partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors,status=status.HTTP_400_BAD_REQUEST)

    def delete(self,request,pk):
        quiz=get_object_or_404(Quiz,pk=pk)
        if quiz.module.course.instructor!=request.user:
            return Response({"error":"Access denied"},status=status.HTTP_403_FORBIDDEN)
        quiz.delete()
        return Response({"message":"Quiz deleted successfully"})

class QuestionCreateView(APIView):
    permission_classes=[IsAuthenticated]

    def post(self,request,quiz_id):
        quiz=get_object_or_404(Quiz,pk=quiz_id)
        if quiz.module.course.instructor!=request.user:
            return Response({"error":"Only the course instructor can manage questions"},status=status.HTTP_403_FORBIDDEN)
        serializer=QuestionSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(quiz=quiz)
            return Response(serializer.data,status=status.HTTP_201_CREATED)
        return Response(serializer.errors,status=status.HTTP_400_BAD_REQUEST)

class AssessmentCreateView(APIView):
    permission_classes=[IsAuthenticated]

    def post(self,request,course_id):
        course=get_object_or_404(Course,pk=course_id)
        if course.instructor!=request.user:
            return Response({"error":"Only the course instructor can manage assessments"},status=status.HTTP_403_FORBIDDEN)
        serializer=AssessmentSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(course=course)
            return Response(serializer.data,status=status.HTTP_201_CREATED)
        return Response(serializer.errors,status=status.HTTP_400_BAD_REQUEST)

class CourseEnrollView(APIView):
    permission_classes=[IsAuthenticated]

    def post(self,request,course_id):
        course=get_object_or_404(Course,pk=course_id)
        if not course.is_approved:
            return Response({"error":"Cannot enroll in an unapproved course"},status=status.HTTP_400_BAD_REQUEST)
        enrollment,created=Enrollment.objects.get_or_create(student=request.user,course=course)
        serializer=EnrollmentSerializer(enrollment)
        return Response(serializer.data,status=status.HTTP_200_OK if not created else status.HTTP_201_CREATED)

class StudentEnrollmentsView(APIView):
    permission_classes=[IsAuthenticated]

    def get(self,request):
        enrollments=Enrollment.objects.filter(student=request.user)
        serializer=EnrollmentSerializer(enrollments,many=True)
        return Response(serializer.data)

class LessonCompleteView(APIView):
    permission_classes=[IsAuthenticated]

    def post(self,request,lesson_id):
        lesson=get_object_or_404(Lesson,pk=lesson_id)
        enrollment=get_object_or_404(Enrollment,student=request.user,course=lesson.module.course)
        progress,created=LessonProgress.objects.get_or_create(enrollment=enrollment,lesson=lesson)
        progress.is_completed=True
        progress.save()
        return Response({"message":"Lesson completed successfully"})

class QuizSubmitView(APIView):
    permission_classes=[IsAuthenticated]

    def post(self,request,quiz_id):
        quiz=get_object_or_404(Quiz,pk=quiz_id)
        enrollment=get_object_or_404(Enrollment,student=request.user,course=quiz.module.course)
        answers=request.data.get('answers',{})
        questions=quiz.questions.all()
        correct_count=0
        for q in questions:
            user_ans=answers.get(str(q.id))
            if user_ans:
                if isinstance(user_ans,list):
                    user_ans=sorted([a.strip().upper() for a in user_ans])
                    correct_ans=sorted([a.strip().upper() for a in q.correct_answers.split(',')])
                    if user_ans==correct_ans:
                        correct_count+=1
                else:
                    if user_ans.strip().upper()==q.correct_answers.strip().upper():
                        correct_count+=1
        total_questions=len(questions)
        passed=False
        if total_questions>0:
            passing_pct=quiz.passing_score/100.0
            passed=(correct_count/total_questions)>=passing_pct
        attempt=QuizAttempt.objects.create(
            enrollment=enrollment,
            quiz=quiz,
            score=correct_count,
            total_questions=total_questions,
            passed=passed
        )
        return Response({
            "score":correct_count,
            "total":total_questions,
            "passed":passed,
            "attempt_id":attempt.id
        })

class AssessmentSubmitView(APIView):
    permission_classes=[IsAuthenticated]

    def post(self,request,assessment_id):
        assessment=get_object_or_404(Assessment,pk=assessment_id)
        enrollment=get_object_or_404(Enrollment,student=request.user,course=assessment.course)
        answers_text=request.data.get('answers_text')
        if not answers_text:
            return Response({"error":"Answers text is required"},status=status.HTTP_400_BAD_REQUEST)
        submission=AssessmentSubmission.objects.create(
            enrollment=enrollment,
            assessment=assessment,
            answers_text=answers_text
        )
        serializer=AssessmentSubmissionSerializer(submission)
        return Response(serializer.data,status=status.HTTP_201_CREATED)

class InstructorSubmissionsView(APIView):
    permission_classes=[IsAuthenticated]

    def get(self,request):
        if request.user.role!='instructor':
            return Response({"error":"Access denied"},status=status.HTTP_403_FORBIDDEN)
        submissions=AssessmentSubmission.objects.filter(assessment__course__instructor=request.user)
        serializer=AssessmentSubmissionSerializer(submissions,many=True)
        return Response(serializer.data)

    def post(self,request,pk):
        if request.user.role!='instructor':
            return Response({"error":"Access denied"},status=status.HTTP_403_FORBIDDEN)
        submission=get_object_or_404(AssessmentSubmission,pk=pk)
        if submission.assessment.course.instructor!=request.user:
            return Response({"error":"Access denied"},status=status.HTTP_403_FORBIDDEN)
        grade=request.data.get('grade')
        if not grade:
            return Response({"error":"Grade is required"},status=status.HTTP_400_BAD_REQUEST)
        submission.grade=grade
        submission.is_graded=True
        submission.save()
        return Response({"message":"Submission graded successfully"})

class InstructorEnrollmentsView(APIView):
    permission_classes=[IsAuthenticated]

    def get(self,request):
        if request.user.role!='instructor':
            return Response({"error":"Access denied"},status=status.HTTP_403_FORBIDDEN)
        enrollments=Enrollment.objects.filter(course__instructor=request.user)
        serializer=EnrollmentSerializer(enrollments,many=True)
        return Response(serializer.data)

class CertificateRequestView(APIView):
    permission_classes=[IsAuthenticated]

    def get(self,request):
        requests=CertificateRequest.objects.filter(enrollment__student=request.user)
        serializer=CertificateRequestSerializer(requests,many=True)
        return Response(serializer.data)

    def post(self,request,enrollment_id):
        enrollment=get_object_or_404(Enrollment,pk=enrollment_id,student=request.user)
        total_lessons=Lesson.objects.filter(module__course=enrollment.course).count()
        completed_lessons=LessonProgress.objects.filter(enrollment=enrollment,is_completed=True).count()
        if completed_lessons<total_lessons:
            return Response({"error":"Complete all lessons first"},status=status.HTTP_400_BAD_REQUEST)
        quizzes=Quiz.objects.filter(module__course=enrollment.course)
        for q in quizzes:
            if not QuizAttempt.objects.filter(enrollment=enrollment,quiz=q,passed=True).exists():
                return Response({"error":"Pass all quizzes first"},status=status.HTTP_400_BAD_REQUEST)
        req,created=CertificateRequest.objects.get_or_create(enrollment=enrollment)
        serializer=CertificateRequestSerializer(req)
        return Response(serializer.data,status=status.HTTP_201_CREATED if created else status.HTTP_200_OK)

class AdminPendingCoursesView(APIView):
    permission_classes=[IsAuthenticated]

    def get(self,request):
        if not request.user.is_staff and not request.user.is_superuser:
            return Response({"error":"Access denied"},status=status.HTTP_403_FORBIDDEN)
        courses=Course.objects.filter(is_approved=False,is_published=True)
        serializer=CourseSerializer(courses,many=True)
        return Response(serializer.data)

    def post(self,request,pk):
        if not request.user.is_staff and not request.user.is_superuser:
            return Response({"error":"Access denied"},status=status.HTTP_403_FORBIDDEN)
        course=get_object_or_404(Course,pk=pk)
        action=request.data.get('action')
        if action=='approve':
            course.is_approved=True
            course.save()
            return Response({"message":"Course approved successfully"})
        elif action=='reject':
            course.delete()
            return Response({"message":"Course rejected and deleted"})
        return Response({"error":"Invalid action"},status=status.HTTP_400_BAD_REQUEST)

class AdminPendingCertificatesView(APIView):
    permission_classes=[IsAuthenticated]

    def get(self,request):
        if not request.user.is_staff and not request.user.is_superuser:
            return Response({"error":"Access denied"},status=status.HTTP_403_FORBIDDEN)
        requests=CertificateRequest.objects.filter(status='pending')
        serializer=CertificateRequestSerializer(requests,many=True)
        return Response(serializer.data)

    def post(self,request,pk):
        if not request.user.is_staff and not request.user.is_superuser:
            return Response({"error":"Access denied"},status=status.HTTP_403_FORBIDDEN)
        cert_req=get_object_or_404(CertificateRequest,pk=pk)
        action=request.data.get('action')
        if action=='approve':
            cert_req.status='approved'
            cert_req.save()
            return Response({"message":"Certificate approved successfully"})
        elif action=='reject':
            cert_req.status='rejected'
            cert_req.save()
            return Response({"message":"Certificate rejected"})
        return Response({"error":"Invalid action"},status=status.HTTP_400_BAD_REQUEST)

class LearnerProfileView(APIView):
    permission_classes=[IsAuthenticated]

    def get(self,request):
        profile,created=LearnerProfile.objects.get_or_create(user=request.user)
        serializer=LearnerProfileSerializer(profile)
        return Response(serializer.data)

    def put(self,request):
        profile,created=LearnerProfile.objects.get_or_create(user=request.user)
        serializer=LearnerProfileSerializer(profile,data=request.data,partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors,status=status.HTTP_400_BAD_REQUEST)
