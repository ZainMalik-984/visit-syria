from . import views
from django.urls import path, include
from rest_framework.routers import DefaultRouter

router = DefaultRouter()
router.register(r'register', views.AdminUserViewSet, basename='register')

registrationRoutes = router.urls

urlpatterns = [
    path('', include(registrationRoutes) ),
    path('registeration/', view = views.RegisterUserView.as_view() ),
    path('registeration/admin/', view = views.registationAdminView.as_view() ),
    path('resend-otp/', view= views.resendOtpView.as_view(), name='resend-otp'),
    path('verify-otp/', view= views.VerifyOTPView.as_view(), name='otp-verify'),
    path('login/', view= views.loginView.as_view(), name='token_obtain_pair'),
    path('token/verify/', view= views.VerifyTokenView.as_view(), name='token_verify'),
    path('token/refresh/', view= views.CookieTokenRefreshView.as_view(), name='token_refresh'),
    path('logout/', view= views.logoutView.as_view() ),
    path('password-reset/', views.PasswordResetRequestView.as_view(), name='password-reset'),
    path('password-reset-confirm/', views.PasswordResetConfirmView.as_view(), name='password-reset-confirm'),
    path('password-reset-code/', views.SendOTPResetView.as_view(), name='send-otp'),
    path('password-reset-verify/', views.ResetPasswordWithOTPView.as_view(), name='verify-otp'),
]
