from typing import Annotated

from fastapi import APIRouter, Form, HTTPException, status

from deps import user_repo_deps
from exception import BaseException, UserAlreadyExistsException, UserNotFoundException
from models import UserModel
from schemas import UserCreateSchema, UserSchema, UserUpdateSchema

user_router = APIRouter(
    prefix='/users',
    tags=['user'],
)


@user_router.post(
    '/',
    response_model=UserSchema,
    status_code=status.HTTP_201_CREATED,
    responses={status.HTTP_400_BAD_REQUEST: {'model': UserAlreadyExistsException}},
)
async def create_user(repo: user_repo_deps, data: Annotated[UserCreateSchema, Form()]) -> UserModel:
    user_db = await repo.get_by(username=data.username)
    if user_db:
        raise HTTPException(status_code=400, detail='User this username already exists')
    return await repo.add(UserModel(**data.model_dump()))


@user_router.get(
    '/{user_id}',
    response_model=UserSchema,
    responses={status.HTTP_404_NOT_FOUND: {'model': UserNotFoundException}},
)
async def get_user(repo: user_repo_deps, user_id: int) -> UserModel:
    user_db = await repo.get(user_id)
    if not user_db:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail='User not found')
    return user_db


@user_router.patch(
    '/{user_id}',
    response_model=UserSchema,
    responses={
        status.HTTP_400_BAD_REQUEST: {'model': BaseException},
        status.HTTP_404_NOT_FOUND: {'model': UserNotFoundException},
    },
)
async def patch_user(
    repo: user_repo_deps, user_id: int, data: UserUpdateSchema
) -> UserModel:
    if not any(data.model_dump().values()):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail='At least one field is required'
        )
    user_db = await repo.get(user_id)
    if not user_db:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail='User not found')

    fields = {attr: value for attr, value in data.model_dump().items() if value is not None}

    return await repo.update(user_db.id, fields)


@user_router.delete(
    '/{user_id}', responses={status.HTTP_404_NOT_FOUND: {'model': UserNotFoundException}}
)
async def delete_user(repo: user_repo_deps, user_id: int) -> None:
    user_db = await repo.get(user_id)
    if not user_db:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail='User not found')
    await repo.delete(user_db)
