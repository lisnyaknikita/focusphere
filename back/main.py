from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from starlette.middleware.sessions import SessionMiddleware

from config import config
from db import create_tables
from routes import all_routers
from schemas import BaseResponse


@asynccontextmanager
async def lifespan(*args, **kwargs):
    await create_tables()
    yield


app = FastAPI(lifespan=lifespan, title='Focusphere API', version='0.1.0')

app.add_middleware(
    CORSMiddleware,
    allow_origins=['*'],
    allow_credentials=True,
    allow_methods=['*'],
    allow_headers=['*'],
)

app.add_middleware(SessionMiddleware, secret_key=config.SECRET_KEY)


@app.get(
    '/', name='Test endpoint', description='You can use this endpoint to check if all works fine.'
)
async def test() -> BaseResponse:
    return BaseResponse[None](msg='Hello from backend!')


for router in all_routers:
    app.include_router(router)


if __name__ == '__main__':
    import uvicorn

    uvicorn.run('main:app', host='127.0.0.1', port=8000, reload=True)
