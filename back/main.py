from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from db import create_tables
from routes import all_routers

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=['http://localhost:5050'],
    allow_credentials=True,
    allow_methods=['*'],
    allow_headers=['*'],
)


@asynccontextmanager
async def lifespan(app: FastAPI):
    await create_tables()
    yield


@app.get('/', name='Test endpoint')
async def test() -> dict[str, str]:
    return {'msg': 'hello from backend!'}


for router in all_routers:
    app.include_router(router)


if __name__ == '__main__':
    import uvicorn

    uvicorn.run('main:app', host='0.0.0.0', port=8000, reload=True)
