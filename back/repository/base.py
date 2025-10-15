from abc import ABC
from typing import Generic, TypeVar

from sqlalchemy import select, update
from sqlalchemy.ext.asyncio import AsyncSession

from db import Base

model_type = TypeVar('model_type', bound=Base)

class BaseRepository(ABC, Generic[model_type]):
    model: type[model_type]
    
    def __init__(self, session: AsyncSession):
        self.session = session
        
    async def get(self, id: int):
        return await self.session.scalar(select(self.model).where(self.model.id == id))

    async def get_by(self, **kwargs):
        filters = [getattr(self.model, key) == value for key, value in kwargs.items()]
        
        if filters:
            return await self.session.scalar(select(self.model).where(*filters))

    async def get_by_model(self, model):
        filters = [getattr(self.model, key) == value for key, value in model.__dict__.items()]

        if filters:
            return await self.session.scalar(select(self.model).where(*filters))
        
    async def get_all(self):
        return list(await self.session.scalars(select(self.model)))

    async def update(self, id: int, **fields):
        stmt = (
            update(self.model)
            .where(self.model.id == id)
            .values(**fields)
            .execution_options(synchronize_session='fetch')
        )

        await self.session.execute(stmt)
        await self.session.commit()

    async def delete(self, obj):
        await self.session.delete(obj)
        await self.session.commit()