# seed.py
from database import SessionLocal, engine, Base
import models

# ensures the tables exist
Base.metadata.create_all(bind=engine)

db = SessionLocal()

try:
    # if a test user already exists, don't insert duplicates
    existing = db.query(models.User).filter(models.User.username == "testuser").first()
    if existing:
        print("testuser already exists — skipping seed.")
    else:
        # demo accounts
        demo_accounts = [
            {"username": "testuser", "password": "12345"},
            {"username": "isagi", "password": "12345"},
            {"username": "Barou", "password": "12345"},
            {"username": "Kaiser", "password": "12345"},
        ]

        for account in demo_accounts:
            user = models.User(username=account["username"], password=account["password"])
            db.add(user)
        db.commit()

        # get testuser for the dummy post/comment
        user = db.query(models.User).filter(models.User.username == "testuser").first()

        # creates a dummy post 
        post = models.Post(
            title="My First Post",
            description="Hello world! This is my blog post.",
            user_id=user.id
        )
        db.add(post)
        db.commit()
        db.refresh(post)

        # creates a dummy comment on that post
        comment = models.Comment(content="Nice post!", post_id=post.id, user_id=user.id)
        db.add(comment)
        db.commit()
        db.refresh(comment)

        print("Dummy data inserted successfully!")
finally:
    db.close()
