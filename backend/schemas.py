# schemas.py
from pydantic import BaseModel

class UserCreate(BaseModel):
    username: str
    password: str

class UserOut(BaseModel):
    id: int
    username: str
    class Config:
        orm_mode = True

class PostCreate(BaseModel):
    title: str
    description: str
    user_id: int

class CommentCreate(BaseModel):
    content: str
    user_id: int

class CommentOut(BaseModel):
    id: int
    content: str
    user_id: int
    class Config:
        orm_mode = True

class PostOut(BaseModel):
    id: int
    title: str
    description: str
    user_id: int
    comments: list[CommentOut] = []
    class Config:
        orm_mode = True
