from django.db import models
from django.conf import settings

class Course(models.Model):
    title=models.CharField(max_length=255)
    description=models.TextField()
    thumbnail_url=models.URLField(blank=True,null=True)
    thumbnail_file=models.FileField(upload_to='courses/thumbnails/',blank=True,null=True)
    rating=models.FloatField(default=0.0)
    instructor=models.ForeignKey(settings.AUTH_USER_MODEL,on_delete=models.CASCADE,related_name='created_courses')
    is_approved=models.BooleanField(default=False)
    is_published=models.BooleanField(default=False)
    created_at=models.DateTimeField(auto_now_add=True)
    updated_at=models.DateTimeField(auto_now=True)

    def reset_approval(self):
        if self.is_approved or self.is_published:
            self.is_approved=False
            self.is_published=False
            self.save()

    def __str__(self):
        return self.title

class Module(models.Model):
    course=models.ForeignKey(Course,on_delete=models.CASCADE,related_name='modules')
    title=models.CharField(max_length=255)
    order=models.IntegerField(default=0)

    class Meta:
        ordering=['order']

    def save(self,*args,**kwargs):
        super().save(*args,**kwargs)
        self.course.reset_approval()

    def delete(self,*args,**kwargs):
        course=self.course
        super().delete(*args,**kwargs)
        course.reset_approval()

    def __str__(self):
        return f"{self.course.title} - {self.title}"

class Lesson(models.Model):
    CONTENT_TYPES=(
        ('video','Video'),
        ('audio','Audio'),
        ('text','Text'),
        ('image','Image'),
    )
    module=models.ForeignKey(Module,on_delete=models.CASCADE,related_name='lessons')
    title=models.CharField(max_length=255)
    content_type=models.CharField(max_length=10,choices=CONTENT_TYPES,default='text')
    text_content=models.TextField(blank=True,null=True)
    video_url=models.URLField(blank=True,null=True)
    video_file=models.FileField(upload_to='lessons/videos/',blank=True,null=True)
    audio_url=models.URLField(blank=True,null=True)
    audio_file=models.FileField(upload_to='lessons/audios/',blank=True,null=True)
    image_url=models.URLField(blank=True,null=True)
    image_file=models.FileField(upload_to='lessons/images/',blank=True,null=True)
    order=models.IntegerField(default=0)

    class Meta:
        ordering=['order']

    def save(self,*args,**kwargs):
        super().save(*args,**kwargs)
        self.module.course.reset_approval()

    def delete(self,*args,**kwargs):
        course=self.module.course
        super().delete(*args,**kwargs)
        course.reset_approval()

    def __str__(self):
        return f"{self.module.title} - {self.title}"

class Quiz(models.Model):
    module=models.ForeignKey(Module,on_delete=models.CASCADE,related_name='quizzes')
    title=models.CharField(max_length=255)
    passing_score=models.IntegerField(default=60)
    created_at=models.DateTimeField(auto_now_add=True)

    def save(self,*args,**kwargs):
        super().save(*args,**kwargs)
        self.module.course.reset_approval()

    def delete(self,*args,**kwargs):
        course=self.module.course
        super().delete(*args,**kwargs)
        course.reset_approval()

    def __str__(self):
        return self.title

class Question(models.Model):
    QUESTION_TYPES=(
        ('single','Single Choice'),
        ('multiple','Multiple Choice'),
    )
    quiz=models.ForeignKey(Quiz,on_delete=models.CASCADE,related_name='questions')
    text=models.TextField()
    question_type=models.CharField(max_length=10,choices=QUESTION_TYPES,default='single')
    option_a=models.CharField(max_length=255)
    option_b=models.CharField(max_length=255)
    option_c=models.CharField(max_length=255)
    option_d=models.CharField(max_length=255)
    correct_answers=models.CharField(max_length=50)

    def save(self,*args,**kwargs):
        super().save(*args,**kwargs)
        self.quiz.module.course.reset_approval()

    def delete(self,*args,**kwargs):
        course=self.quiz.module.course
        super().delete(*args,**kwargs)
        course.reset_approval()

    def __str__(self):
        return self.text

class Assessment(models.Model):
    course=models.ForeignKey(Course,on_delete=models.CASCADE,related_name='assessments')
    title=models.CharField(max_length=255)
    description=models.TextField()
    created_at=models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.title

class Enrollment(models.Model):
    student=models.ForeignKey(settings.AUTH_USER_MODEL,on_delete=models.CASCADE,related_name='enrollments')
    course=models.ForeignKey(Course,on_delete=models.CASCADE,related_name='enrollments')
    completed_at=models.DateTimeField(blank=True,null=True)
    created_at=models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together=('student','course')

    def __str__(self):
        return f"{self.student.email} - {self.course.title}"

class LessonProgress(models.Model):
    enrollment=models.ForeignKey(Enrollment,on_delete=models.CASCADE,related_name='lesson_progress')
    lesson=models.ForeignKey(Lesson,on_delete=models.CASCADE)
    is_completed=models.BooleanField(default=False)
    updated_at=models.DateTimeField(auto_now=True)

    class Meta:
        unique_together=('enrollment','lesson')

class QuizAttempt(models.Model):
    enrollment=models.ForeignKey(Enrollment,on_delete=models.CASCADE,related_name='quiz_attempts')
    quiz=models.ForeignKey(Quiz,on_delete=models.CASCADE)
    score=models.IntegerField()
    total_questions=models.IntegerField()
    passed=models.BooleanField(default=False)
    created_at=models.DateTimeField(auto_now_add=True)

class AssessmentSubmission(models.Model):
    enrollment=models.ForeignKey(Enrollment,on_delete=models.CASCADE,related_name='assessment_submissions')
    assessment=models.ForeignKey(Assessment,on_delete=models.CASCADE)
    answers_text=models.TextField()
    grade=models.CharField(max_length=10,blank=True,null=True)
    is_graded=models.BooleanField(default=False)
    created_at=models.DateTimeField(auto_now_add=True)

class CertificateRequest(models.Model):
    STATUS_CHOICES=(
        ('pending','Pending'),
        ('approved','Approved'),
        ('rejected','Rejected'),
    )
    enrollment=models.ForeignKey(Enrollment,on_delete=models.CASCADE,related_name='certificate_requests')
    status=models.CharField(max_length=15,choices=STATUS_CHOICES,default='pending')
    created_at=models.DateTimeField(auto_now_add=True)
    updated_at=models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.enrollment.student.email} - {self.enrollment.course.title} - {self.status}"
