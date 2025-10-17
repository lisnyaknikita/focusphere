__all__ = ("user_router",)

from fastapi import APIRouter

from .user import user_router

all_routers: list[APIRouter] = [user_router]
