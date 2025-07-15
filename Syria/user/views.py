from user.serializer import (
    registrationUserSerializer,
    CustomTokenObtainPairSerializer,
    RegistrationAdminSerializer,
    OTPVerificationSerializer,
    AdminUserSerializer,
)
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, viewsets, permissions
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from rest_framework.exceptions import AuthenticationFailed
from .models import CustomUser, PasswordResetOTP
from .permission import IsAdmin
from django.utils.encoding import force_bytes, force_str
from django.utils.http import urlsafe_base64_encode, urlsafe_base64_decode
from django.contrib.auth.tokens import default_token_generator
from django.core.mail import send_mail
from rest_framework_simplejwt.tokens import AccessToken
from rest_framework_simplejwt.exceptions import InvalidToken, TokenError

from django.conf import settings
import random
import os
from dotenv import load_dotenv

load_dotenv()

# Create your views here.


def send_activation_email(email):
    user = CustomUser.objects.get(email=email)
    code = f"{random.randint(100000, 999999)}"

    PasswordResetOTP.objects.create(user=user, code=code)

    try:
        send_mail(
            "Your OTP for Password Reset",
            f"Your OTP is: {code}",
            settings.DEFAULT_FROM_EMAIL,
            [email],
            fail_silently=False,
        )
    except Exception as e:
        print(f"Error sending email: {e}")
        return False
    return True


class resendOtpView(APIView):
    def post(self, request):
        email = request.data.get("email")
        try:
            bol = send_activation_email(email)
            if bol:
                return Response(
                    {"message": "user created succesfully, activation email sent"},
                    status=status.HTTP_200_OK,
                )
            else:
                return Response(
                    {"error": "Failed to send activation email"},
                    status=status.HTTP_500_INTERNAL_SERVER_ERROR,
                )
        except CustomUser.DoesNotExist:
            return Response({"error": "Email not found"}, status=404)


class RegisterUserView(APIView):
    permission_classes = [permissions.AllowAny]
    def post(self, request, *args, **kwargs):
        print("Request data:", request.data)  # Debugging line to check request data
        serializer_obj = registrationUserSerializer(data=request.data)
        if serializer_obj.is_valid():
            print('sn')
            if os.getenv("EMAIL_SEND") == "True":
                serializer_obj.save()
                bol = send_activation_email(serializer_obj.validated_data["email"])
                if bol:
                    return Response(
                        {"message": "user created succesfully, activation email sent"},
                        status=status.HTTP_200_OK,
                    )
                else:
                    CustomUser.objects.filter(
                        email=serializer_obj.validated_data["email"]
                    ).delete()
                    return Response(
                        {"error": "Failed to send activation email"},
                        status=status.HTTP_500_INTERNAL_SERVER_ERROR,
                    )
            if os.getenv("EMAIL_SEND") == "False":
                serializer_obj.data["is_active"] = True
                serializer_obj.save()
                return Response(
                    {"message": "user created succesfully"},
                    status=status.HTTP_201_CREATED,
                )

        return Response(serializer_obj.errors, status=status.HTTP_400_BAD_REQUEST)


class AdminUserViewSet(viewsets.ModelViewSet):
    queryset = CustomUser.objects.all()
    serializer_class = AdminUserSerializer
    permission_classes = [IsAdmin]


class registationAdminView(APIView):
    def post(self, req):
        serializer_obj = RegistrationAdminSerializer(data=req.data)
        if serializer_obj.is_valid():
            if os.getenv("EMAIL_SEND") == "True":
                bol = send_activation_email(serializer_obj.validated_data["email"])
                if bol:
                    return Response(
                        {"message": "user created succesfully, activation email sent"},
                        status=status.HTTP_200_OK,
                    )
                else:
                    return Response(
                        {"error": "Failed to send activation email"},
                        status=status.HTTP_500_INTERNAL_SERVER_ERROR,
                    )
            if os.getenv("EMAIL_SEND") == "False":
                serializer_obj.data["is_active"] = True
            serializer_obj.save()
            return Response(
                {"message": "user created succesfully"}, status=status.HTTP_201_CREATED
            )
        return Response(serializer_obj.errors, status=status.HTTP_400_BAD_REQUEST)


class VerifyOTPView(APIView):
    def post(self, request):
        print(request.data)
        serializer = OTPVerificationSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        email = serializer.validated_data["email"]
        otp = serializer.validated_data["otp"]

        try:
            user = CustomUser.objects.get(email=email)
            otp_obj = PasswordResetOTP.objects.get(user=user, code=otp)

            # Check if OTP type matches 'registration'
            if otp_obj.type != "registration":
                return Response(
                    {"error": "OTP is not for registration"},
                    status=status.HTTP_400_BAD_REQUEST,
                )

            # Check if OTP is still valid
            print(otp_obj.is_valid(), otp_obj.created_at)
            if not otp_obj.is_valid():
                print("OTP is not for registration")
                return Response(
                    {"error": "OTP expired"}, status=status.HTTP_400_BAD_REQUEST
                )

            # Activate user and delete OTP
            user.is_active = True
            user.save()
            otp_obj.delete()
            return Response(
                {"message": "OTP verified, user activated"}, status=status.HTTP_200_OK
            )

        except CustomUser.DoesNotExist:
            return Response(
                {"error": "User not found"}, status=status.HTTP_404_NOT_FOUND
            )
        except PasswordResetOTP.DoesNotExist:
            return Response(
                {"error": "Invalid OTP"}, status=status.HTTP_400_BAD_REQUEST
            )


class loginView(APIView):
    authentication_classes = []      # public
    permission_classes     = []

    def post(self, request):
        ser = CustomTokenObtainPairSerializer(data=request.data, context={'request': request})
        if not ser.is_valid():
            return Response({'success': False, 'errors': ser.errors},
                            status=status.HTTP_400_BAD_REQUEST)

        data = ser.validated_data

        # user needs e‑mail verification
        if data.get('requires_verification'):
            send_activation_email(data['email'])
            return Response({'success': False, 'requires_verification': True,
                            'message': data['message'], 'email': data['email']},
                            status=status.HTTP_200_OK)

        # login success → set cookies
        access  : RefreshToken = data['access']
        refresh : RefreshToken = data['refresh']

        resp = Response({'success': True, 'message': 'Login successful', 'user': data['user']},
                        status=status.HTTP_200_OK)

        resp.set_cookie(
            key     = 'access_token',
            value   = str(access),
            max_age =  5,  # 5 minutes
            httponly= True,
            secure  = True,  # Set to True if using HTTPSs
            samesite= 'None',  # Adjust based on your needs
        )
        resp.set_cookie(
            key     = 'refresh_token',
            value   = str(refresh),
            max_age = 60 * 60 * 24,  # 24 hours
            httponly= True,
            secure  = True,
            samesite= 'None',  # Adjust based on your needs
        )
        return resp

class VerifyTokenView(APIView):
    def post(self, request):
        # Extract token from Authorization header
        auth_header = request.META.get("HTTP_AUTHORIZATION")

        if not auth_header:
            return Response(
                {"valid": False, "error": "Access token is missing"},
                status=status.HTTP_200_OK,
            )

        if not auth_header.startswith("Bearer "):
            return Response(
                {"error": "Invalid authorization header format. Use: Bearer <token>"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Extract token from "Bearer <token>"
        token = auth_header.split(" ")[1]

        try:
            # Verify and decode the JWT token
            access_token = AccessToken(token)
            user_id = access_token["user_id"]

            # Get user from database
            user = CustomUser.objects.get(id=user_id, is_active=True)

            return Response(
                {
                    "valid": True,
                    "message": "Token is valid",
                    "data": {
                        "id": user.id,
                        "email": user.email,
                        "first_name": user.first_name,
                        "last_name": user.last_name,
                        "role": user.role,
                        "is_active": user.is_active,
                    },
                },
                status=status.HTTP_200_OK,
            )

        except (InvalidToken, TokenError):
            return Response(
                {"valid": False, "error": "Invalid or expired token"},
                status=status.HTTP_200_OK,
            )
        except CustomUser.DoesNotExist:
            return Response(
                {"valid": False, "error": "User not found or inactive"},
                status=status.HTTP_404_NOT_FOUND,
            )
        except IndexError:
            return Response(
                {"error": "Invalid authorization header format"},
                status=status.HTTP_400_BAD_REQUEST,
            )


class CookieTokenRefreshView(TokenRefreshView):
    def post(self, request, *args, **kwargs):
        refresh_token = request.COOKIES.get("refresh_token")
        print("Refresh token from cookies:", refresh_token)  # Debugging line

        if not refresh_token:
            raise AuthenticationFailed("No refresh token provided")

        serializer = self.get_serializer(data={"refresh": refresh_token})
        try:
            serializer.is_valid(raise_exception=True)
        except Exception:
            print("Invalid refresh token")  # Debugging line
            raise AuthenticationFailed("Invalid refresh token")

        access = serializer.validated_data.get("access")
        refresh = serializer.validated_data.get("refresh")
        print("Access token after refresh:", access)

        response = Response({"detail": "Tokens refreshed"}, status=status.HTTP_200_OK)

        response.set_cookie(
            key="access_token",
            value=access,
            httponly=True,
            secure=True,
            samesite="None",
            max_age=600 * 5,
        )

        if refresh:
            response.set_cookie(
                key="refresh_token",
                value=refresh,
                httponly=True,
                secure=True,
                samesite="None",
                max_age=60 * 60 * 24,
            )

        return response


class logoutView(APIView):
    def post(self, req, *args, **kwargs):
        res = Response({"message": "Login successful"}, status=status.HTTP_200_OK)
        print(req.COOKIES.get("access_token"))
        res.delete_cookie("access_token", samesite="None")
        res.delete_cookie("refresh_token", samesite="None")
        return res


class PasswordResetRequestView(APIView):
    def post(self, request):
        email = request.data.get("email")
        try:
            user = CustomUser.objects.get(email=email)
            uid = urlsafe_base64_encode(force_bytes(user.pk))
            token = default_token_generator.make_token(user)
            reset_link = f"http://localhost:3000/forgot-password-link/verify/{uid}/{token}/"  # Your React frontend route

            send_mail(
                "Password Reset",
                f"Click to reset your password: {reset_link}",
                settings.DEFAULT_FROM_EMAIL,
                [email],
                fail_silently=False,
            )
            return Response(
                {"message": "Reset link sent to email"}, status=status.HTTP_200_OK
            )
        except CustomUser.DoesNotExist:
            return Response(
                {"error": "No user with this email"}, status=status.HTTP_404_NOT_FOUND
            )


class PasswordResetConfirmView(APIView):
    def post(self, request):
        uidb64  = request.data.get("uid")
        token   = request.data.get("token")
        new_pwd = request.data.get("password")

        if not (uidb64 and token and new_pwd):
            return Response({"error": "Bad request"}, status=status.HTTP_400_BAD_REQUEST)

        try:
            uid  = force_str(urlsafe_base64_decode(uidb64))
            user = CustomUser.objects.get(pk=uid)
        except (CustomUser.DoesNotExist, ValueError, TypeError):
            return Response({"error": "Invalid link"}, status=status.HTTP_400_BAD_REQUEST)

        if not default_token_generator.check_token(user, token):
            return Response({"error": "Invalid or expired token"}, status=status.HTTP_400_BAD_REQUEST)

        user.set_password(new_pwd)
        user.save()

        return Response({"message": "Password reset successful"}, status=status.HTTP_200_OK)

class SendOTPResetView(APIView):
    def post(self, request):
        email = request.data.get("email")
        try:
            user = CustomUser.objects.get(email=email)
            code = f"{random.randint(100000, 999999)}"

            PasswordResetOTP.objects.create(
                user=user, code=code, type="password_reset"
            )

            send_mail(
                "Your OTP for Password Reset",
                f"Your OTP is: {code}",
                settings.DEFAULT_FROM_EMAIL,
                [email],
                fail_silently=False,
            )

            return Response({"message": "OTP sent to email"}, status=200)
        except CustomUser.DoesNotExist:
            return Response({"error": "Email not found"}, status=404)


class ResetPasswordWithOTPView(APIView):
    def post(self, request):
        email = request.data.get("email")
        otp = request.data.get("otp")
        password = request.data.get("password")

        try:
            user = CustomUser.objects.get(email=email)
            record = PasswordResetOTP.objects.get(user=user, code=otp)
            
            if record.type != "password_reset":
                return Response({"error": "OTP is not for password reset"}, status=400)

            if not record.is_valid():
                return Response({"error": "OTP expired"}, status=400)

            user.set_password(password)
            user.save()
            record.delete()

            return Response({"message": "Password reset successful"}, status=200)

        except (CustomUser.DoesNotExist, PasswordResetOTP.DoesNotExist):
            return Response({"error": "Invalid OTP or email"}, status=400)
