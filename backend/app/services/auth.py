from fastapi import HTTPException
from sqlalchemy.exc import SQLAlchemyError

from app.db.database import SessionLocal
from app.models.user import User
from app.core.security import (
    hash_password,
    verify_password,
)
from app.models.role import Role


def register_user(data):
    db = SessionLocal()

    try:
        existing_email = db.query(User).filter(User.email == data.email).first()

        if existing_email:
            raise HTTPException(status_code=400, detail="Email already registered")

        existing_username = (
            db.query(User).filter(User.username == data.username).first()
        )

        if existing_username:
            raise HTTPException(status_code=400, detail="Username already exists")

        new_user = User(
            username=data.username.strip(),
            email=data.email.strip().lower(),
            password=hash_password(data.password),
        )

        db.add(new_user)
        db.commit()
        db.refresh(new_user)

        # Assign Viewer role automatically
        viewer_role = db.query(Role).filter(Role.name == "Viewer").first()

        if viewer_role:
            new_user.roles.append(viewer_role)

        db.commit()
        db.refresh(new_user)

        return new_user

    except HTTPException:
        raise

    except SQLAlchemyError:
        db.rollback()

        raise HTTPException(status_code=500, detail="Database error")

    finally:
        db.close()


def login_user(data):
    db = SessionLocal()

    try:
        user = db.query(User).filter(User.email == data.email).first()

        if not user:
            raise HTTPException(status_code=404, detail="Account not found")

        if not verify_password(data.password, user.password):
            raise HTTPException(status_code=400, detail="Invalid password")

        return user

    except HTTPException:
        raise

    except SQLAlchemyError:
        raise HTTPException(status_code=500, detail="Database error")

    finally:
        db.close()
