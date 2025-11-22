from typing import Annotated

from authlib.integrations.starlette_client import OAuth
from fastapi import APIRouter, Form, HTTPException, Request, Response

from config import config
from deps import user_repo_deps
from jwt import jwt_generator
from models import UserModel
from schemas import BaseResponse, UserCreateSchema, UserLoginSchema, UserSchema

auth_router = APIRouter(
    prefix='/auth',
    tags=['auth'],
)


oauth = OAuth()
oauth.register(
    name='google',
    client_id=config.GOOGLE_CLIENT_ID,
    client_secret=config.GOOGLE_CLIENT_SECRET,
    authorize_url='https://accounts.google.com/o/oauth2/auth',
    access_token_url='https://accounts.google.com/o/oauth2/token',
    authorize_state=config.SECRET_KEY,
    redirect_uri=config.REDIRECT_URL,
    jwks_uri='https://www.googleapis.com/oauth2/v3/certs',
    client_kwargs={'scope': 'openid profile email'},
)


async def set_auth_cookies(response, user: UserModel):
    response.set_cookie(
        key='token',
        value=jwt_generator.generate_access_token(user.id),
        httponly=True,
        samesite='none',
        secure=True,
    )

    response.set_cookie(
        key='username',
        value=user.username,
        httponly=True,
        samesite='none',
        secure=True,
    )


@auth_router.post('/register', status_code=201)
async def register(
    repo: user_repo_deps, response: Response, data: UserCreateSchema = Form()
) -> BaseResponse[UserSchema]:
    user = UserModel(**data.model_dump())

    if await repo.get_by(username=user.username):
        raise HTTPException(status_code=400, detail='User this username already exists')
    elif await repo.get_by(email=user.email):
        raise HTTPException(status_code=400, detail='User this email already exists')

    user = await repo.add(user)
    await set_auth_cookies(response, user)
    return BaseResponse(data=UserSchema.model_validate(user))


@auth_router.post('/login')
async def login(
    repo: user_repo_deps, response: Response, data: Annotated[UserLoginSchema, Form()]
) -> BaseResponse[UserSchema]:
    user = (
        await repo.get_by(username=data.username)
        if data.username
        else await repo.get_by(email=data.email)
    )

    if not user:
        raise HTTPException(status_code=400, detail='User not found')
    elif not user.check_password(data.password):
        raise HTTPException(status_code=400, detail='Not correct password')

    await set_auth_cookies(response, user)
    return BaseResponse(data=UserSchema.model_validate(user))


@auth_router.get('/google/url')
async def login_google(request: Request):
    return await oauth.google.authorize_redirect(request, redirect_uri=config.REDIRECT_URL)


@auth_router.get('/google/callback')
async def auth_google_callback(request: Request, repo: user_repo_deps, response: Response):
    try:
        token = await oauth.google.authorize_access_token(request)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f'OAuth error: {str(e)}')

    user_info = token.get('userinfo')
    if not user_info:
        raise HTTPException(status_code=400, detail='Failed to get user info')

    user = await repo.get_by(email=user_info['email'])
    if not user:
        return Response(status_code=302, headers={'Location': '/'})

    await set_auth_cookies(response, user)
    return BaseResponse(data=UserSchema.model_validate(user))
