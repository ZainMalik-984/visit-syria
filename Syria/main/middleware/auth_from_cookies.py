from django.utils.deprecation import MiddlewareMixin

class AccessTokenCookieMiddleware(MiddlewareMixin):
    def process_request(self, request):
        print("Processing request for access token in cookies")  # Debugging line
        token = request.COOKIES.get('access_token')
        if token and 'HTTP_AUTHORIZATION' not in request.META:
            request.META['HTTP_AUTHORIZATION'] = f'Bearer {token}'
