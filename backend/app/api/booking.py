from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.rbac import require_permission

from app.db.database import get_db
from app.schemas.booking import (
    BookingCreate,
    BookingResponse,
    BookingUpdate,
    PaginatedBookings,
)
from fastapi_jwt_auth import AuthJWT
from fastapi import Depends


from app.services.booking import (
    create_booking_service,
    get_bookings_service,
    delete_booking_service,
    update_booking_service,
)

router = APIRouter(prefix="/bookings", tags=["Bookings"])


# ✅ CREATE BOOKING


@router.post("/", response_model=BookingResponse)
def create_booking(
    data: BookingCreate,
    db: Session = Depends(get_db),
    current_user=Depends(require_permission("booking:create")),
):

    try:
        return create_booking_service(db, data)

    except HTTPException as e:
        raise e

    except Exception as e:
        print("❌ CREATE ERROR:", e)

        raise HTTPException(status_code=500, detail=str(e))


# ✅ GET BOOKINGS
@router.get("/", response_model=PaginatedBookings)
def get_bookings(
    user_name: str = None,
    room_name: str = None,
    date: str = None,
    reason: str = None,
    limit: int = 10,
    offset: int = 0,
    db: Session = Depends(get_db),
    current_user=Depends(require_permission("booking:view")),
):

    try:
        return get_bookings_service(
            db,
            user_name=user_name,
            room_name=room_name,
            date=date,
            reason=reason,
            limit=limit,
            offset=offset,
        )

    except HTTPException as e:
        raise e

    except Exception as e:
        print("❌ GET ERROR:", e)
        raise HTTPException(status_code=500, detail="Unexpected error occurred")


# ✅ DELETE BOOKING
@router.delete("/{booking_id}", response_model=dict)
def delete_booking(
    booking_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(require_permission("booking:delete")),
):
    try:
        return delete_booking_service(
            db,
            booking_id,
        )

    except HTTPException as e:
        raise e

    except Exception as e:
        print("❌ DELETE ERROR:", e)

        raise HTTPException(
            status_code=500,
            detail="Unexpected error occurred",
        )


# ✅ UPDATE BOOKING


@router.patch("/{booking_id}")
def update_booking(
    booking_id: int,
    data: BookingUpdate,
    db: Session = Depends(get_db),
    current_user=Depends(require_permission("booking:update")),
):

    try:
        return update_booking_service(db, booking_id, data)

    except HTTPException as e:
        raise e

    except Exception as e:
        print("❌ UPDATE ERROR:", e)
        raise HTTPException(status_code=500, detail="Unexpected error occurred")
