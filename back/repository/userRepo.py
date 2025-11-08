from back.models.userModel import UserModel
from sqlalchemy.ext.asyncio import AsyncSession

from .baseRepo import BaseRepository


class UserRepository(BaseRepository[UserModel]):
    def __init__(self, session: AsyncSession):
        super().__init__(session, UserModel)
