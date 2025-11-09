from typing import Annotated

from fastapi import APIRouter, Form, HTTPException, Response

from deps import user_repo_deps
from jwt import jwt_generator
from models import UserModel
from schemas import BaseResponse, UserCreateSchema, UserLoginSchema, UserSchema

auth_router = APIRouter(
    prefix='/auth',
    tags=['auth'],
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
