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
        # test user
        user = models.User(username="testuser", password="12345")
        db.add(user)
        db.commit()
        db.refresh(user)

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
