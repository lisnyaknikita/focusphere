from sqlalchemy.ext.asyncio import AsyncSession

from models.user import UserModel

from .base import BaseRepository


class UserRepository(BaseRepository[UserModel]):
    def __init__(self, session: AsyncSession):
        super().__init__(session, UserModel)
