__all__ = ('jwt_generator', 'JWTBearer')

import datetime
from typing import Optional

from fastapi import HTTPException, Request
from fastapi.security import HTTPBearer
from jose import JWTError, jwt

from config import config
from deps import user_repo_deps


class JWTGenerator:
    def _generate_jwt_token(
        self,
        *,
        subject: str,
        jwt_data: Optional[dict[str, str]] = None,
        expires_delta: datetime.timedelta | None = None,
    ) -> str:
        if expires_delta:
            expire = datetime.datetime.now(datetime.timezone.utc) + expires_delta

        else:
            expire = datetime.datetime.now(datetime.timezone.utc) + datetime.timedelta(
                minutes=config.JWT_MIN
            )

        to_encode = {'sub': subject, 'exp': expire} | (jwt_data or {})
        return jwt.encode(to_encode, key=config.JWT_SECRET_KEY, algorithm=config.JWT_ALGORITHM)

    def generate_access_token(self, userid: int) -> str:
        return self._generate_jwt_token(
            subject=str(userid),
            expires_delta=datetime.timedelta(minutes=config.JWT_ACCESS_TOKEN_EXPIRATION_TIME),
        )

    # В класс JWTGenerator добавим:
    def generate_google_token(self, google_id: str, email: str) -> str:
        return self._generate_jwt_token(
            subject=google_id,
            jwt_data={'email': email, 'auth_type': 'google'},
            expires_delta=datetime.timedelta(minutes=config.JWT_ACCESS_TOKEN_EXPIRATION_TIME),
        )

    def _decode_jwt(self, token: str) -> dict | None:
        try:
            decoded_token = jwt.decode(
                token, config.JWT_SECRET_KEY, algorithms=[config.JWT_ALGORITHM]
            )
            return (
                decoded_token
                if decoded_token['exp'] >= datetime.datetime.now(datetime.timezone.utc).timestamp()
                else None
            )
        except JWTError:
            return {}


jwt_generator = JWTGenerator()


class JWTBearer(HTTPBearer):
    def __init__(self, auto_error: bool = False):
        super(JWTBearer, self).__init__(auto_error=auto_error)

    async def _get_token(self, request: Request) -> str | None:
        if header_auth := request.headers.get('Authorization'):
            return header_auth.split(' ')[1]
        elif cookie_auth := request.cookies.get('token'):
            return cookie_auth
        return None

    async def __call__(self, request: Request, repo: user_repo_deps):  # pyright: ignore[reportIncompatibleMethodOverride]
        await super(JWTBearer, self).__call__(request)
        token = await self._get_token(request)
        if token:
            jwt_data = jwt_generator._decode_jwt(token)
            if not jwt_data:
                raise HTTPException(status_code=401, detail='Invalid token or expired token')
            username = request.cookies.get('username')
            if not username:
                raise HTTPException(status_code=404, detail='Not authorized')
            if not (user := await repo.get_by(username=username)):
                raise HTTPException(status_code=401, detail="User does'nt exist in the database")
            request.state.user = user
        else:
            raise HTTPException(status_code=401, detail='Not authenticated')
