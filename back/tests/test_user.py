from unittest.mock import AsyncMock, Mock

from fastapi.testclient import TestClient
from pytest import fixture

from deps import get_current_user, get_user_repository
from main import app

client = TestClient(app)


class TestUser:
    @fixture(autouse=True)
    def setup(self):
        self.mock_repo = AsyncMock()
        self.mock_user = Mock()
        self.mock_user.configure_mock(
            id=1,
            username='test123',
            email='test@development.com',
            avatar_url=None,
        )

        self.mock_repo.get_by.return_value = self.mock_user
        self.mock_user.check_password.return_value = True

        app.dependency_overrides.clear()
        app.dependency_overrides[get_user_repository] = lambda: self.mock_repo
        app.dependency_overrides[get_current_user] = lambda: self.mock_user

    def test_get_user_success(self):
        self.mock_repo.get.return_value = self.mock_user

        response = client.get('/users/1')
        assert response.status_code == 200
        assert response.json() == {
            'id': 1,
            'username': 'test123',
            'email': 'test@development.com',
            'avatar_url': None,
        }

        self.mock_repo.get.assert_called_once_with(1)

    def test_get_user_not_found(self):
        self.mock_repo.get.return_value = None

        response = client.get('/users/2')
        assert response.status_code == 404
        assert response.json() == {'detail': 'User not found'}

        self.mock_repo.get.assert_called_once_with(2)

    def test_delete_user(self):
        self.mock_repo.get.return_value = self.mock_user

        response = client.delete('/users/1')
        assert response.status_code == 200

        self.mock_repo.delete.assert_called_once_with(self.mock_user)

    def test_delete_user_not_found(self):
        self.mock_repo.get.return_value = None

        response = client.delete('/users/2')
        assert response.status_code == 404
        assert response.json() == {'detail': 'User not found'}

        self.mock_repo.delete.assert_not_called()

    def test_set_avatar_success(self):
        response = client.post(
            '/users/avatar',
            files={
                'avatar': (
                    'avatar.png',
                    b'\x89PNG\r\n\x1a\n\x00\x00\x00\rIHDR\x00\x00\x00\x01\x00\x00\x00\x01\x08\x06\x00\x00\x00\x1f\x15\xc4\x89\x00\x00\x00\rIDATx\x9cc\xf8\x0f\x00\x00\x01\x01\x00\x05\x00\x00\x00\x00IEND\xaeB`\x82',
                    'image/png',
                )
            },
        )
        assert response.status_code == 200

    def test_set_avatar_no_image(self):
        response = client.post('/users/avatar')
        assert response.status_code == 422
