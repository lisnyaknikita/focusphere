from typing import Annotated, AsyncGenerator

from fastapi import Depends

from db import get_session
from repository import UserRepository


async def get_user_repository() -> AsyncGenerator[UserRepository]:
    session = await get_session()
    try:
        yield UserRepository(session)
    finally:
        await session.close()


user_repo_deps = Annotated[UserRepository, Depends(get_user_repository)]
