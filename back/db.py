__all__ = ('engine', 'sm', 'Base')

from sqlalchemy.ext.asyncio import async_sessionmaker, create_async_engine
from sqlalchemy.orm import DeclarativeBase

from config import config

engine = create_async_engine(
    url=f'sqlite+aiosqlite:///{config.DB_PATH}',
    echo=False,
)

sm = async_sessionmaker(engine, expire_on_commit=False)


class Base(DeclarativeBase):
    pass


async def create_tables() -> None:
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
