from .models import CustomUser
from rest_framework import serializers
from django.contrib.auth import authenticate
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework.response import Response

class AdminUserSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)
    id = serializers.IntegerField(read_only=True)

    class Meta:
        model = CustomUser
        fields = ['id', 'first_name', 'last_name', 'email', 'password', 'role', 'is_active']

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        # If instance exists, it's an update — make password optional
        if self.instance:
            self.fields['password'].required = False
            self.fields['password'].allow_null = True
            self.fields['password'].allow_blank = True

    def validate_email(self, value):
        user_id = getattr(self.instance, 'id', None)
        if not user_id and CustomUser.objects.filter(email=value).exists():
            raise serializers.ValidationError('A user with this email already exists')
        if user_id and CustomUser.objects.filter(email=value).exclude(id=user_id).exists():
            raise serializers.ValidationError('A user with this email already exists')
        return value

    def create(self, validated_data):
        validated_data['is_active'] = True
        return CustomUser.objects.create_user(**validated_data)

    def update(self, instance, validated_data):
        password = validated_data.pop('password', None)
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        if password:
            instance.set_password(password)
        instance.save()
        return instance

class registrationUserSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)
    

    class Meta:
        model  = CustomUser
        fields = ['first_name', 'last_name', 'email', 'password', 'role']

    def validate_email(self, value):
        if CustomUser.objects.filter(email=value).exists():
            print("Email already exists")
            return Response({"error": "Email already exists"}, status=400)
        return value

    def validate_role(self, value):
        allowed_roles = ('supplier', 'customer')   # ← spellings you accept
        if value not in allowed_roles:
            print("Invalid role")
            raise serializers.ValidationError(
                f'Invalid role. Allowed roles: {", ".join(allowed_roles)}.'
            )
        return value

    def create(self, validated_data):
        return CustomUser.objects.create_user(**validated_data)


class RegistrationAdminSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)

    class Meta:
        model = CustomUser
        fields = ['first_name', 'email', 'password', 'role']
        read_only_fields = ['role']

    def validate_email(self, value):
        if CustomUser.objects.filter(email=value).exists():
            raise serializers.ValidationError('User already exists')
        return value

    def create(self, validated_data):
        validated_data['role'] = 'admin'
        user = CustomUser.objects.create_user(**validated_data)
        return user
    
class OTPVerificationSerializer(serializers.Serializer):
    email = serializers.EmailField()
    otp = serializers.CharField(max_length=6)

    def validate(self, data):
        if not data.get('email'):
            print("Email is required")
            raise serializers.ValidationError({'email': 'Email is required'})
        if not data.get('otp'):
            print("OTP is required")
            raise serializers.ValidationError({'otp': 'OTP is required'})
        return data

class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    """
    • Checks e-mail + password even for inactive users.
    • If inactive → returns `requires_verification=True`.
    • Never sends e-mail itself.
    """
    username_field = 'email'

    def validate(self, attrs):
        email    = attrs.get('email')
        password = attrs.get('password')

        if not email or not password:
            print("Email and password are required")
            raise serializers.ValidationError('Must include "email" and "password".')

        try:
            user = CustomUser.objects.get(email=email)
            print("User found:", user.check_password('user'))  # Debugging line to check user retrieval
        except CustomUser.DoesNotExist:
            print("usr and password are required")
            raise serializers.ValidationError('Invalid email or password.')

        if not user.check_password(password):
            print("usr and password are required")
            raise serializers.ValidationError('Invalid email or password.')

        self.user = user                                    # save for the view

        # -------------- inactive branch ------------------
        if not user.is_active:
            return {
                'requires_verification': True,
                'email'   : email,
                'user_id' : user.id,                        # handy if the view needs it
                'role'    : user.role,
                'message' : (
                    'Account not activated. A verification code has been '
                    'sent to your e-mail. Please verify to continue.'
                ),
            }

        # -------------- active branch --------------------
        refresh = RefreshToken.for_user(user)
        return {
            'refresh': str(refresh),
            'access' : str(refresh.access_token),
            'user': {
                'id'        : user.id,
                'first_name': user.first_name,
                'email'     : user.email,
                'role'      : user.role,
            },
        }