from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .serializers import RegisterSerializer,LoginSerializer, UserSerializer
from rest_framework.generics import ListAPIView,DestroyAPIView
from rest_framework.permissions import IsAuthenticated
from .permissions import IsAdmin
from .models import User

class RegisterView(APIView):
    def post(self,request):
        serializer=RegisterSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response({
                'message':'Registration successful'
            },status=status.HTTP_201_CREATED)
        return Response(serializer.errors,status=status.HTTP_400_BAD_REQUEST)


class LoginView(APIView):
    def post(self,request):
        serializer=LoginSerializer(data=request.data)
        if serializer.is_valid():
            return Response(serializer.validated_data,status=status.HTTP_200_OK)
        return Response(serializer.errors,status=status.HTTP_400_BAD_REQUEST)
    
class PendingUsersView(APIView):
    permission_classes=[IsAuthenticated,IsAdmin]
    def get(self,request):
        users=User.objects.filter(
            role__in=['manager','instructor'],
            is_approved=False
        )
        serializer=UserSerializer(users,many=True)
        return Response(serializer.data,status=status.HTTP_200_OK)
    
class ApproveUserView(APIView):
    permission_classes=[IsAuthenticated,IsAdmin]
    def patch(self,request,id):
        try:
            user=User.objects.get(id=id)
            if user.role not in ['manager','instructor']:
                return Response({
                    'message':'Only manager or instructor can be approved'
                },status=status.HTTP_400_BAD_REQUEST)
            user.is_approved=True
            user.save()
            return Response({
                'message':'User approved successfully'
            },status=status.HTTP_200_OK)
        except User.DoesNotExist:
            return Response({
                'message':'User not found'
            },status=status.HTTP_404_NOT_FOUND)
        
class UsersListView(ListAPIView):
    permission_classes=[IsAuthenticated,IsAdmin]
    serializer_class=UserSerializer
    def get_queryset(self):
        return User.objects.filter(role='user')


class ManagersListView(ListAPIView):
    permission_classes=[IsAuthenticated,IsAdmin]
    serializer_class=UserSerializer
    def get_queryset(self):
        return User.objects.filter(role='manager')


class InstructorsListView(ListAPIView):
    permission_classes=[IsAuthenticated,IsAdmin]
    serializer_class=UserSerializer
    def get_queryset(self):
        return User.objects.filter(role='instructor')

class DeleteUserView(DestroyAPIView):
    permission_classes=[IsAuthenticated,IsAdmin]
    queryset=User.objects.all()
    serializer_class=UserSerializer
    lookup_field='id'