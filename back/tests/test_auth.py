from unittest.mock import AsyncMock, Mock

from fastapi.testclient import TestClient
from pytest import fixture

from deps import get_user_repository
from main import app

client = TestClient(app)


class TestAuthRegister:
    @fixture(autouse=True)
    def setup(self):
        self.mock_repo = AsyncMock()
        self.mock_user = AsyncMock()
        self.mock_user.configure_mock(
            id=1,
            username='test123',
            email='test@development.com',
            avatar_url=None,
        )

        app.dependency_overrides.clear()
        app.dependency_overrides[get_user_repository] = lambda: self.mock_repo

    def test_register_success(self):
        mock_user = AsyncMock()
        mock_user.configure_mock(
            id=1,
            username='test123',
            email='test@development.com',
            avatar_url=None,
        )

        self.mock_repo.get_by.return_value = None
        self.mock_repo.add.return_value = mock_user

        response = client.post(
            '/auth/register',
            data={
                'username': 'test123',
                'email': 'test@development.com',
                'password': 'test',
            },
        )

        assert response.status_code == 201
        assert response.json()['data'] == {
            'id': 1,
            'username': 'test123',
            'email': 'test@development.com',
            'avatar_url': None,
        }

        self.mock_repo.get_by.assert_any_call(username='test123')
        self.mock_repo.get_by.assert_any_call(email='test@development.com')
        self.mock_repo.add.assert_called_once()

    def test_register_email_not_provided(self):
        response = client.post(
            '/auth/register',
            data={'username': 'test2', 'password': 'test2'},
        )

        assert response.status_code == 422
        self.mock_repo.get_by.assert_not_called()
        self.mock_repo.add.assert_not_called()

    def test_register_invalid_email(self):
        response = client.post(
            '/auth/register',
            data={'username': 'test2', 'email': 'test@', 'password': 'test2'},
        )

        assert response.status_code == 422
        self.mock_repo.get_by.assert_not_called()
        self.mock_repo.add.assert_not_called()

    def test_register_username_already_exists(self):
        self.mock_repo.get_by.return_value = self.mock_user

        response = client.post(
            '/auth/register',
            data={'username': 'test123', 'email': 'test2@development.com', 'password': 'test2'},
        )

        assert response.status_code == 400
        assert response.json()['detail'] == 'User this username already exists'

        self.mock_repo.get_by.assert_called_once_with(username='test123')
        self.mock_repo.add.assert_not_called()

    def test_register_email_already_exists(self):
        self.mock_user.email = 'existing@development.com'
        self.mock_repo.get_by.side_effect = [None, self.mock_user]

        response = client.post(
            '/auth/register',
            data={
                'username': 'newuser',
                'email': 'existing@development.com',
                'password': 'test',
            },
        )

        assert response.status_code == 400
        assert response.json()['detail'] == 'User this email already exists'

        assert self.mock_repo.get_by.call_count == 2
        self.mock_repo.get_by.assert_any_call(username='newuser')
        self.mock_repo.get_by.assert_any_call(email='existing@development.com')
        self.mock_repo.add.assert_not_called()


class TestAuthLogin:
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

    def test_login_with_username_success(self):
        response = client.post(
            '/auth/login',
            data={'username': 'test123', 'password': 'test'},
        )
        assert response.status_code == 200
        assert response.json() == {
            'success': True,
            'msg': 'Success',
            'data': {
                'id': 1,
                'username': 'test123',
                'email': 'test@development.com',
                'avatar_url': None,
            },
        }
        self.mock_repo.get_by.assert_called_once_with(username='test123')

    def test_login_with_email_success(self):
        response = client.post(
            '/auth/login',
            data={'email': 'test@development.com', 'password': 'test'},
        )

        assert response.status_code == 200
        assert response.json() == {
            'success': True,
            'msg': 'Success',
            'data': {
                'id': 1,
                'username': 'test123',
                'email': 'test@development.com',
                'avatar_url': None,
            },
        }
        self.mock_repo.get_by.assert_called_once_with(email='test@development.com')

    def test_login_invalid_password(self):
        self.mock_user.check_password.return_value = False

        response = client.post(
            '/auth/login',
            data={'username': 'test123', 'password': 'test2'},
        )

        assert response.status_code == 400
        assert response.json()['detail'] == 'Not correct password'

        self.mock_repo.get_by.assert_called_once_with(username='test123')
        self.mock_user.check_password.assert_called_once_with('test2')

    def test_login_user_not_exists(self):
        self.mock_repo.get_by.return_value = None

        response = client.post(
            '/auth/login',
            data={'username': 'test2', 'password': 'test2'},
        )

        assert response.status_code == 400
        assert response.json()['detail'] == 'User not found'
        self.mock_repo.get_by.assert_called_once_with(username='test2')

    def test_login_no_credentials_provided(self):
        response = client.post(
            '/auth/login',
            data={'password': 'test'},
        )

        assert response.status_code == 422
        assert response.json()['detail'] == 'Either email or password must be provided'
        self.mock_repo.get_by.assert_not_called()
