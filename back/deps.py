from typing import Annotated, AsyncGenerator

from fastapi import Depends

from db import get_session
from models.userModel import UserModel
from repository import UserRepository


async def get_user_repository() -> AsyncGenerator[UserRepository]:
    session = await get_session()
    try:
        yield UserRepository(session)
    finally:
        await session.close()


user_repo_deps = Annotated[UserRepository, Depends(get_user_repository)]

# Avoid circular dependency with jwt.py
from jwt import JWTBearer


async def get_current_user(request, _=Depends(JWTBearer)) -> UserModel:
    return request.state.user


user_deps = Annotated[UserModel, Depends(get_current_user)]
