from datetime import datetime
from typing import Any, Generic, Literal, Optional, TypeVar

from fastapi import HTTPException, UploadFile
from pydantic import BaseModel, ConfigDict, EmailStr, Field, model_validator

T = TypeVar('T')


class BaseModelFromAttributes(BaseModel):
    model_config = ConfigDict(from_attributes=True)


class BaseResponse(BaseModelFromAttributes, Generic[T]):
    success: bool = True
    msg: str = 'Success'
    data: Optional[T] | Any = None


class UserLoginSchema(BaseModel):
    username: Optional[str] = None
    email: Optional[EmailStr] = None
    password: str

    @model_validator(mode='after')
    def check_one_of(self):
        if not self.username and not self.email:
            raise HTTPException(status_code=422, detail='Either email or password must be provided')
        return self


class UserCreateSchema(BaseModelFromAttributes):
    username: str
    email: EmailStr
    password: str
    avatar: Optional[UploadFile] = None


class UserUpdateSchema(BaseModelFromAttributes):
    username: Optional[str] = None
    email: Optional[EmailStr] = None
    avatar: Optional[UploadFile] = None
    password: Optional[str] = None


class UserSchema(BaseModelFromAttributes):
    id: int
    username: str
    email: EmailStr
    avatar_url: Optional[str] = None


class CalendarEventCreateSchema(BaseModelFromAttributes):
    title: str
    description: Optional[str] = None
    start_time: datetime
    end_time: datetime
    color: Optional[str]


class CalendarEventSchema(CalendarEventCreateSchema):
    id: int


class TimeBlockCreateSchema(BaseModelFromAttributes):
    title: str
    start_time: datetime
    end_time: datetime
    color: Optional[str]


class TimeBlockSchema(TimeBlockCreateSchema):
    id: int


class WeeklyGoalCreateSchema(BaseModelFromAttributes):
    title: str
    user_id: int


class WeeklyGoalSchema(WeeklyGoalCreateSchema):
    id: int
    is_completed: bool


class DailyTaskCreateSchema(BaseModelFromAttributes):
    title: str
    user_id: int
    date: datetime


class DailyTaskSchema(DailyTaskCreateSchema):
    id: int
    is_completed: bool


class ProjectCreateSchema(BaseModelFromAttributes):
    title: str
    description: Optional[str]
    type: Literal['solo', 'team']
    logo: Optional[UploadFile] = None
    owner_id: int
    members: list[int] = Field(default_factory=list, description='List of user ids')


class ProjectSchema(ProjectCreateSchema):
    id: int


class ColumnCreateSchema(BaseModelFromAttributes):
    title: str
    order: int
    project_id: int


class ColumnSchema(ColumnCreateSchema):
    id: int


class TaskCreateSchema(BaseModelFromAttributes):
    title: str
    description: Optional[str]
    assignee_id: Optional[int]
    priority: Optional[Literal['low', 'medium', 'high']]
    due_date: Optional[datetime]
    project_id: int
    column_id: int


class TaskSchema(TaskCreateSchema):
    id: int
    created_at: datetime
    updated_at: datetime


class NoteCreateSchema(BaseModelFromAttributes):
    title: str
    content: str
    user_id: int
    project_id: Optional[int]
    tags: Optional[list[str]]


class NoteSchema(NoteCreateSchema):
    id: int
    created_at: datetime
