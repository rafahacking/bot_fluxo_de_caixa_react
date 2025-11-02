from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from rest_framework_simplejwt.tokens import RefreshToken

USERS_DB = {
    'rafael': {
        'id': 1,
        'username': 'rafael',
        'password': '12345',
        'name': 'Rafael Nunes'
    }
}

@api_view(['POST'])
@permission_classes([AllowAny])
def login(request):
    try:
        username = request.data.get('username')
        password = request.data.get('password')

        if not username or not password:
            return Response(
                {'message': 'Usuário e senha são obrigatórios'},
                status=status.HTTP_400_BAD_REQUEST
            )

        user_data = USERS_DB.get(username)

        if not user_data:
            return Response(
                {'message': 'Usuário ou senha inválidos'},
                status=status.HTTP_401_UNAUTHORIZED
            )

        if user_data['password'] != password:
            return Response(
                {'message': 'Usuário ou senha inválidos'},
                status=status.HTTP_401_UNAUTHORIZED
            )

        class UserObject:
            def __init__(self, user_id):
                self.id = user_id

        user_obj = UserObject(user_data['id'])
        refresh = RefreshToken.for_user(user_obj)
        
        refresh['username'] = user_data['username']
        refresh['name'] = user_data['name']

        return Response({
            'token': str(refresh.access_token),
            'user': {
                'id': user_data['id'],
                'username': user_data['username'],
                'name': user_data['name']
            }
        }, status=status.HTTP_200_OK)

    except Exception as e:
        return Response(
            {'message': f'Erro no servidor: {str(e)}'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def verify_token(request):
    return Response({
        'valid': True,
        'user': {
            'id': request.user.id if hasattr(request.user, 'id') else 1,
            'username': request.auth.get('username', 'rafael'),
            'name': request.auth.get('name', 'Rafael Nunes')
        }
    }, status=status.HTTP_200_OK)
