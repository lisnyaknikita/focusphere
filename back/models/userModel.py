from typing import Optional

from sqlalchemy.orm import Mapped, mapped_column

from db import Base


class UserModel(Base):
    __tablename__ = 'users'
    
    username: Mapped[str] = mapped_column(unique=True, index=True)
    password: Mapped[str]
    email: Mapped[str] = mapped_column(unique=True)
    avatar: Mapped[Optional[bytes]]
