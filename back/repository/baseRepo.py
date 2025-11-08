from abc import ABC
from typing import Generic, TypeVar

from sqlalchemy import select, update
from sqlalchemy.ext.asyncio import AsyncSession

from db import Base

model_type = TypeVar('model_type', bound=Base)


class BaseRepository(ABC, Generic[model_type]):
    def __init__(self, session: AsyncSession, model: type[model_type]):
        self.session = session
        self.model = model

    async def add(self, model: model_type) -> model_type:
        self.session.add(model)
        await self.session.commit()
        await self.session.refresh(model)
        return model

    async def get(self, id: int) -> model_type | None:
        return await self.session.scalar(select(self.model).where(self.model.id == id))

    async def get_by(self, **kwargs) -> model_type | None:
        filters = [getattr(self.model, key) == value for key, value in kwargs.items()]

        if filters:
            return await self.session.scalar(select(self.model).where(*filters))

    async def get_by_model(self, model: model_type) -> model_type | None:
        filters = [getattr(self.model, key) == value for key, value in model.__dict__.items()]

        if filters:
            return await self.session.scalar(select(self.model).where(*filters))

    async def get_all(self) -> list[model_type]:
        return list(await self.session.scalars(select(self.model)))

    async def update(self, id: int, fields) -> model_type:
        stmt = (
            update(self.model)
            .where(self.model.id == id)
            .values(**fields)
            .execution_options(synchronize_session='fetch')
        )

        await self.session.execute(stmt)
        await self.session.commit()
        return await self.session.get(self.model, id) # type: ignore

    async def delete(self, model: model_type) -> None:
        await self.session.delete(model)
        await self.session.commit()
