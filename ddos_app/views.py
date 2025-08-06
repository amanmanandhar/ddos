from rest_framework.views import APIView
from drf_yasg import openapi
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate
from django.utils import timezone
from datetime import timedelta
from rest_framework import status
from drf_yasg.utils import swagger_auto_schema
from .models import TrafficLog, BlockedIP
from .serializers import RegisterSerializer, LoginSerializer, LogRequestSerializer


THRESHOLD = 10  # max requests per minute


class RegisterView(APIView):
    permission_classes = [AllowAny]

    @swagger_auto_schema(request_body=RegisterSerializer)
    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response({"message": "User created successfully"})
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class LoginView(APIView):
    permission_classes = [AllowAny]

    @swagger_auto_schema(request_body=LoginSerializer)
    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        username = serializer.validated_data.get("username")
        password = serializer.validated_data.get("password")

        user = authenticate(username=username, password=password)
        if user is None:
            return Response({"error": "Invalid credentials"}, status=status.HTTP_401_UNAUTHORIZED)

        refresh = RefreshToken.for_user(user)
        return Response({
            "refresh": str(refresh),
            "access": str(refresh.access_token),
            "username": user.username
        })


class LogRequestView(APIView):
    @swagger_auto_schema(request_body=LogRequestSerializer)
    def post(self, request):
        ip = self.get_client_ip(request)
        if not ip:
            return Response({"error": "Could not detect IP"}, status=status.HTTP_400_BAD_REQUEST)

        # Add this block to stop counting if IP is already blocked
        if BlockedIP.objects.filter(ip_address=ip).exists():
            return Response({"status": "blocked", "ip": ip})

        log, created = TrafficLog.objects.get_or_create(
            ip_address=ip,
            defaults={'timestamp': timezone.now(), 'requests': 0}
        )

        # Reset count if timestamp older than 1 minute
        if not created and timezone.now() - log.timestamp > timedelta(minutes=1):
            log.requests = 0
            log.timestamp = timezone.now()

        log.requests += 1
        log.timestamp = timezone.now()
        log.save()

        one_min_ago = timezone.now() - timedelta(minutes=1)
        recent_logs = TrafficLog.objects.filter(ip_address=ip, timestamp__gte=one_min_ago)
        total_requests = sum(l.requests for l in recent_logs)

        if total_requests > THRESHOLD:
            BlockedIP.objects.get_or_create(
                ip_address=ip,
                defaults={'blocked_at': timezone.now()}
            )
            return Response({"status": "blocked", "ip": ip})

        return Response({"status": "ok", "ip": ip})

    def get_client_ip(self, request):
        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            ip = x_forwarded_for.split(',')[0].strip()
        else:
            ip = request.META.get('REMOTE_ADDR')
        return ip



class TrafficStatsView(APIView):

    @swagger_auto_schema(
        operation_description="Retrieve all traffic logs",
        responses={
            200: openapi.Response(
                description="List of traffic logs",
                examples={
                    "application/json": [
                        {"ip_address": "192.168.1.10", "requests": 5, "timestamp": "2025-08-05T06:55:22Z"},
                        {"ip_address": "192.168.1.11", "requests": 3, "timestamp": "2025-08-05T06:56:10Z"}
                    ]
                }
            )
        }
    )
    def get(self, request):
        logs = TrafficLog.objects.all().values("ip_address", "requests", "timestamp")
        return Response(list(logs))

class BlockedIPsView(APIView):

    @swagger_auto_schema()
    def get(self, request):
        blocked = BlockedIP.objects.all().values("ip_address", "blocked_at")
        return Response(list(blocked))
