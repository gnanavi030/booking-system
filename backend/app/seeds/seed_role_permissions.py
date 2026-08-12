from sqlalchemy.orm import Session

from app.models.role import Role
from app.models.permission import Permission
from app.models.role_permission import RolePermission


def seed_role_permissions(db: Session):

    role_permission_mapping = {
        "Admin": [
            "booking:view",
            "booking:create",
            "booking:update",
            "booking:delete",
            "room:view",
            "user:view",
            "user:delete",
            "user:update",
        ],
        "Employee": [
            "booking:view",
            "booking:create",
            "booking:update",
            "room:view",
            "booking:delete",
        ],
        "Viewer": [
            "booking:view",
            "room:view",
        ],
    }

    for role_name, permissions in role_permission_mapping.items():

        role = db.query(Role).filter(Role.name == role_name).first()

        if not role:
            continue

        for permission_name in permissions:

            permission = (
                db.query(Permission).filter(Permission.name == permission_name).first()
            )

            if not permission:
                continue

            existing = (
                db.query(RolePermission)
                .filter(
                    RolePermission.role_id == role.id,
                    RolePermission.permission_id == permission.id,
                )
                .first()
            )

            if not existing:
                db.add(
                    RolePermission(
                        role_id=role.id,
                        permission_id=permission.id,
                    )
                )

    db.commit()
