__all__ = ('engine', 'sm', 'Base', 'create_tables', 'get_session')

from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column

from config import config

engine = create_async_engine(
    url=f'sqlite+aiosqlite:///{config.DB_PATH}',
    echo=False,
)

sm = async_sessionmaker(engine, expire_on_commit=False)


async def create_tables() -> None:
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)


async def get_session() -> AsyncSession:
    return sm()


class Base(DeclarativeBase):
    id: Mapped[int] = mapped_column(primary_key=True)
