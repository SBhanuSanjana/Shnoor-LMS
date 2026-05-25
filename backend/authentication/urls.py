from django.urls import path
from .views import (
    RegisterView,
    LoginView,
    PendingUsersView,
    ApproveUserView,
    UsersListView,
    ManagersListView,
    InstructorsListView,
    DeleteUserView
)

urlpatterns=[
    path('register/',RegisterView.as_view()),
    path('login/',LoginView.as_view()),
    path('pending-users/',PendingUsersView.as_view()),
    path('users/',UsersListView.as_view()),
    path('managers/',ManagersListView.as_view()),
    path('instructors/',InstructorsListView.as_view()),
    path('approve/<int:id>/',ApproveUserView.as_view()),
    path('delete/<int:id>/',DeleteUserView.as_view()),
]