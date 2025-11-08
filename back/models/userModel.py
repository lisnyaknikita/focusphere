from typing import Optional

from passlib.hash import bcrypt
from sqlalchemy.orm import Mapped, mapped_column

from db import Base


class UserModel(Base):
    __tablename__ = 'users'

    username: Mapped[str] = mapped_column(unique=True, index=True)
    _password: Mapped[str] = mapped_column('password')
    email: Mapped[str] = mapped_column(unique=True)
    avatar: Mapped[Optional[bytes]]

    @property
    def password(self):
        raise AttributeError('Password is not readable')

    @password.setter
    def password(self, password: str):
        self._password = bcrypt.hash(password)

    def check_password(self, plain_password: str) -> bool:
        return bcrypt.verify(plain_password, self._password)
