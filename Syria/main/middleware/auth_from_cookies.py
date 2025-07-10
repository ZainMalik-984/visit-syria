from django.utils.deprecation import MiddlewareMixin

class AccessTokenCookieMiddleware(MiddlewareMixin):
    def process_request(self, request):
        token = request.COOKIES.get('access')
        if token and 'HTTP_AUTHORIZATION' not in request.META:
            request.META['HTTP_AUTHORIZATION'] = f'Bearer {token}'
