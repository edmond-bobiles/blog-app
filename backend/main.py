# main.py (beginner friendly - simple error returns, no HTTPException/status codes)
from fastapi import FastAPI, Depends, Body
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session

import models, schemas
from database import SessionLocal, engine, Base

# Create tables if they don't exist
Base.metadata.create_all(bind=engine)

app = FastAPI(title="Blog App API (simple mode)")

# Allow local frontend to call this API during development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# DB session dependency
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# --------------------------
# Users (signup & login)
# --------------------------

@app.post("/users/")
def create_user(user: schemas.UserCreate, db: Session = Depends(get_db)):
    # check if username already exists
    existing = db.query(models.User).filter(models.User.username == user.username).first()
    if existing:
        return {"error": "Username already taken"}
    # store password as plain text for this simple demo (NOT secure)
    new_user = models.User(username=user.username, password=user.password)
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return {"id": new_user.id, "username": new_user.username}

@app.post("/login/")
def login(user: schemas.UserCreate, db: Session = Depends(get_db)):
    db_user = db.query(models.User).filter(models.User.username == user.username).first()
    if not db_user or db_user.password != user.password:
        return {"error": "Invalid credentials"}
    return {"id": db_user.id, "username": db_user.username}

# --------------------------
# Posts
# --------------------------

@app.post("/posts/")
def create_post(payload: schemas.PostCreate, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.id == payload.user_id).first()
    if not user:
        return {"error": "User not found"}
    new_post = models.Post(title=payload.title, description=payload.description, user_id=payload.user_id)
    db.add(new_post)
    db.commit()
    db.refresh(new_post)
    # return a simple dict with empty comments list
    return {
        "id": new_post.id,
        "title": new_post.title,
        "description": new_post.description,
        "user_id": new_post.user_id,
        "comments": []
    }

@app.get("/posts/")
def get_posts(db: Session = Depends(get_db)):
    posts = db.query(models.Post).all()
    result = []
    for p in posts:
        # collect simple comment dicts for each post
        comments = [{"id": c.id, "content": c.content, "user_id": c.user_id} for c in p.comments]
        result.append({
            "id": p.id,
            "title": p.title,
            "description": p.description,
            "user_id": p.user_id,
            "comments": comments
        })
    return result

@app.get("/posts/{post_id}")
def get_post(post_id: int, db: Session = Depends(get_db)):
    p = db.query(models.Post).filter(models.Post.id == post_id).first()
    if not p:
        return {"error": "Post not found"}
    comments = [{"id": c.id, "content": c.content, "user_id": c.user_id} for c in p.comments]
    return {
        "id": p.id,
        "title": p.title,
        "description": p.description,
        "user_id": p.user_id,
        "comments": comments
    }

# --------------------------
# Comments
# --------------------------

@app.post("/posts/{post_id}/comments")
def add_comment(post_id: int, payload: schemas.CommentCreate, db: Session = Depends(get_db)):
    p = db.query(models.Post).filter(models.Post.id == post_id).first()
    if not p:
        return {"error": "Post not found"}
    u = db.query(models.User).filter(models.User.id == payload.user_id).first()
    if not u:
        return {"error": "User not found"}
    new_comment = models.Comment(content=payload.content, post_id=post_id, user_id=payload.user_id)
    db.add(new_comment)
    db.commit()
    db.refresh(new_comment)
    return {"id": new_comment.id, "content": new_comment.content, "post_id": new_comment.post_id, "user_id": new_comment.user_id}

@app.delete("/comments/{comment_id}")
def delete_comment(comment_id: int, owner_user_id: int = Body(..., embed=True), db: Session = Depends(get_db)):
    comment = db.query(models.Comment).filter(models.Comment.id == comment_id).first()
    if not comment:
        return {"error": "Comment not found"}
    post = db.query(models.Post).filter(models.Post.id == comment.post_id).first()
    if not post:
        return {"error": "Related post not found"}
    if post.user_id != owner_user_id:
        return {"error": "Only the owner of the post can delete comments on that post"}
    db.delete(comment)
    db.commit()
    return {"detail": "Comment deleted"}
