from typing import Annotated

from fastapi import APIRouter, Form, HTTPException

from deps import user_repo_deps
from exception import UserAlreadyExistsException, UserNotFoundException
from models import UserModel
from schemas import UserCreateSchema, UserSchema

user_router = APIRouter(
    prefix='/users',
    tags=['user'],
)


@user_router.post('/', response_model=UserSchema, status_code=201, responses={400: {'model': UserAlreadyExistsException}})
async def create_user(repo: user_repo_deps, data: Annotated[UserCreateSchema, Form()]) -> UserModel:
    user_db = await repo.get_by(username=data.username)
    if user_db:
        raise HTTPException(status_code=400, detail="User this username already exists")
    return await repo.add(UserModel(**data.model_dump()))


@user_router.get(
    '/{user_id}', response_model=UserSchema, responses={404: {'model': UserNotFoundException}}
)
async def get_user(repo: user_repo_deps, user_id: int) -> UserModel:
    user_db = await repo.get(user_id)
    if not user_db: 
        raise HTTPException(status_code=404, detail="User not found")
    return user_db
