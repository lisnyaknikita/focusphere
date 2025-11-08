from sqlalchemy.ext.asyncio import AsyncSession

from models.userModel import UserModel

from .baseRepo import BaseRepository


class UserRepository(BaseRepository[UserModel]):
    def __init__(self, session: AsyncSession):
        super().__init__(session, UserModel)
