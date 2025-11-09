from pydantic import BaseModel


class BaseException(BaseModel):
    detail: str


class UserAlreadyExistsException(BaseException):
    detail: str = 'User this username already exists'


class NotFoundException(BaseException):
    detail: str = 'Not found'


class UserNotFoundException(NotFoundException):
    detail: str = 'User not found'


class ProjectNotFoundException(NotFoundException):
    detail: str = 'Project not found'


class AvatarDeleteException(NotFoundException):
    detail: str = 'Avatar is empty or already deleted'
