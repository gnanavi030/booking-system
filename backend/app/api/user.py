from fastapi import APIRouter, Depends
from app.db.database import SessionLocal
from app.models.user import User
from app.models.role import Role
from app.schemas.user import AssignRoleRequest
from fastapi import HTTPException
from app.core.dependencies import get_current_user

from app.core.rbac import require_permission

router = APIRouter(prefix="/users", tags=["Users"])
from app.schemas.user import (
    ResetPasswordRequest,
)

from app.services.user import (
    reset_password_service,
)
from app.schemas.user import UserUpdate, UserResponse

from app.services.user import (
    update_user_service,
)
from app.schemas.user import (
    ResetPasswordRequest,
    UserUpdate,
    UserResponse,
)

from app.services.user import (
    reset_password_service,
    update_user_service,
)

# ✅ GET ALL USERS (from DB)
from typing import List
from app.schemas.user import UserResponse


@router.get("/", response_model=list[UserResponse])
def get_users(
    current_user=Depends(require_permission("user:view")),
):
    db = SessionLocal()

    try:
        users = db.query(User).all()

        return [
            {
                "id": user.id,
                "username": user.username,
                "email": user.email,
                "roles": [role.name for role in user.roles],
            }
            for user in users
        ]
    finally:
        db.close()


# ✅ GET REGISTERED USERS (same as all users here)
@router.get("/registers", response_model=dict[str, List[UserResponse]])
def get_registered_users(
    current_user=Depends(require_permission("user:view")),
):
    db = SessionLocal()
    users = db.query(User).all()
    db.close()

    return {"registered_users": users}


# ✅ GET LOGIN LOGS (if stored separately later)
@router.get("/logins")
def get_login_logs(
    current_user=Depends(require_permission("user:admin")),
):
    return {"logins": "Implement login logs later ✅"}


# ✅ DELETE USER
@router.delete("/{user_id}")
def delete_user(user_id: int):
    return {"message": "User deletion has moved to /auth/me"}


@router.post("/{user_id}/reset-password")
def reset_password(
    user_id: int,
    payload: ResetPasswordRequest,
    current_user=Depends(require_permission("user:view")),
):
    db = SessionLocal()

    try:
        return reset_password_service(
            db,
            user_id,
            payload.new_password,
        )
    finally:
        db.close()


@router.put("/{user_id}")
def update_user(user_id: int):
    return {"message": "User updates have moved to /auth/me"}


@router.put("/{user_id}/role")
def assign_role(
    user_id: int,
    payload: AssignRoleRequest,
    current_user=Depends(get_current_user),
):
    # Only Admin can change roles
    if "admin" not in [role.name.lower() for role in current_user.roles]:
        raise HTTPException(
            status_code=403,
            detail="Only Admin can change roles",
        )

    db = SessionLocal()

    try:
        user = db.query(User).filter(User.id == user_id).first()

        if not user:
            raise HTTPException(
                status_code=404,
                detail="User not found",
            )
        role = db.query(Role).filter(Role.name.ilike(payload.role)).first()

        if not role:
            raise HTTPException(
                status_code=404,
                detail="Role not found",
            )

        user.roles = [role]

        db.commit()

        return {
            "message": "Role updated successfully ✅",
            "user_id": user.id,
            "role": role.name,
        }

    finally:
        db.close()
