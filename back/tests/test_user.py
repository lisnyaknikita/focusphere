from fastapi.testclient import TestClient

from main import app

client = TestClient(app)


def test_get_user():
    response = client.get('/users/1')
    assert response.status_code == 200
    assert response.json() == {'id': 1, 'username': 'lll', 'email': 'user@development.com', 'avatar_url': None}
    
    response = client.get('/users/2')
    assert response.status_code == 404
    assert response.json() == {'detail': 'User not found'}
    
def test_create_user():
    response = client.post('/users/', data={'username': 'test', 'password': 'test', 'email': 'test@development.com'})
    assert response.status_code == 201
    
    # user already exists
    response = client.post('/users/', data={'username': 'test', 'password': 'test', 'email': 'test@development.com'})
    assert response.status_code == 400
    assert response.json() == {'detail': 'User this username already exists'}
    
    # invalid email
    response = client.post('/users/', data={'username': 'test2', 'password': 'test', 'email': 'test@'})
    assert response.status_code == 422
    assert response.json() == {'detail': [
           {
               'ctx': {
                   'reason': 'There must be something after the @-sign.',
               },
               'input': 'test@',
               'loc': [
                   'body',
                   'email',
               ],
               'msg': 'value is not a valid email address: There must be something after '
               'the @-sign.',
               'type': 'value_error',
           },
       ],}
