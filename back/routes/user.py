from fastapi import APIRouter, HTTPException, UploadFile, status

from deps import user_deps, user_repo_deps
from exception import AvatarDeleteException, BaseException, UserNotFoundException
from models import UserModel
from schemas import BaseResponse, UserSchema, UserUpdateSchema

user_router = APIRouter(
    prefix='/users',
    tags=['user'],
)


@user_router.post('/avatar')
async def set_avatar(
    repo: user_repo_deps, avatar: UploadFile, user: user_deps
) -> BaseResponse[None]:
    await repo.update(user.id, {'avatar': await avatar.read()})
    return BaseResponse()


@user_router.delete(
    '/avatar',
    responses={status.HTTP_404_NOT_FOUND: {'model': AvatarDeleteException}},
)
async def delete_avatar(repo: user_repo_deps, user: user_deps) -> BaseResponse[None]:
    if user.avatar is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail='Avatar is empty or already deleted'
        )
    await repo.update(user.id, {'avatar': None})
    return BaseResponse()


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
async def patch_user(repo: user_repo_deps, user_id: int, data: UserUpdateSchema) -> UserModel:
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
