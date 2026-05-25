from django.db import models
from django.contrib.auth.models import AbstractUser

class User(AbstractUser):
    email=models.EmailField(unique=True)
    ROLE_CHOICES=(
        ('admin','Admin'),
        ('manager','Manager'),
        ('instructor','Instructor'),
        ('user','User'),
    )
    role=models.CharField(
        max_length=20,
        choices=ROLE_CHOICES,
        default='user'
    )
    is_approved=models.BooleanField(default=False)
    created_at=models.DateTimeField(auto_now_add=True)
    USERNAME_FIELD='email'
    REQUIRED_FIELDS=['username']

    def save(self,*args,**kwargs):
        if self.role=='user':
            self.is_approved=True
        super().save(*args,**kwargs)

    def __str__(self):
        return self.email