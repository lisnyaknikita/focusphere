__all__ = ('all_routers',)

from fastapi import APIRouter

from .auth import auth_router
from .user import user_router

all_routers: tuple[APIRouter, ...] = (user_router, auth_router)
