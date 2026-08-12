from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from app.models.booking import Booking
from app.models.room import Room
from app.models.user import User
from sqlalchemy.sql import func

import json
from app.core.redis_client import redis_client


# ============================
# ✅ CREATE BOOKING
# ============================
def create_booking_service(db: Session, data):

    room = db.query(Room).filter(Room.name.ilike(data.room_name.strip())).first()
    if not room:
        raise HTTPException(status_code=404, detail="Room not found")

    user = db.query(User).filter(User.username.ilike(data.user_name.strip())).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    if room.capacity < data.required_capacity:
        raise HTTPException(
            status_code=400,
            detail="Selected room does not meet capacity",
        )

    if data.end_time <= data.start_time:
        raise HTTPException(status_code=400, detail="Invalid time range")

    overlapping = (
        db.query(Booking)
        .filter(
            Booking.room_id == room.id,
            Booking.date == data.date,
            Booking.start_time < data.end_time,
            Booking.end_time > data.start_time,
        )
        .first()
    )

    if overlapping:
        raise HTTPException(status_code=400, detail="Room already booked")

    booking = Booking(
        user_id=user.id,
        user_name=user.username,
        room_id=room.id,
        required_capacity=data.required_capacity,
        date=data.date,
        start_time=data.start_time,
        end_time=data.end_time,
        reason=data.reason,
    )

    db.add(booking)
    db.commit()
    db.refresh(booking)

    for key in redis_client.scan_iter("bookings:*"):
        redis_client.delete(key)

    return {
        "id": booking.id,
        "user_name": booking.user_name,
        "room_name": room.name,
        "required_capacity": booking.required_capacity,
        "date": booking.date.strftime("%Y-%m-%d"),
        "start_time": booking.start_time.strftime("%H:%M"),
        "end_time": booking.end_time.strftime("%H:%M"),
        "reason": booking.reason,
    }


# ============================
# ✅ GET BOOKINGS ✅ FIXED
# ============================
from sqlalchemy.orm import Session
from app.models.booking import Booking
from app.models.room import Room


def get_bookings_service(
    db: Session,
    user_name: str = None,
    room_name: str = None,
    date: str = None,
    reason: str = None,
    limit: int = 10,
    offset: int = 0,
):
    query = db.query(Booking)

    if user_name:
        query = query.filter(Booking.user_name.ilike(f"%{user_name.strip()}%"))

    if room_name:
        room = db.query(Room).filter(Room.name.ilike(room_name.strip())).first()

        if room:
            query = query.filter(Booking.room_id == room.id)

    if reason:
        query = query.filter(Booking.reason == reason)

    if date:
        from datetime import datetime

        date_obj = datetime.strptime(date, "%Y-%m-%d").date()

        query = query.filter(Booking.date == date_obj)

    total = query.count()

    bookings = (
        query.order_by(
            Booking.date.desc(), Booking.start_time.desc(), Booking.id.desc()
        )
        .offset(offset)
        .limit(limit)
        .all()
    )
    result = [
        {
            "id": b.id,
            "user_name": b.user_name,
            "room_name": b.room.name if b.room else "Unknown Room",
            "required_capacity": b.required_capacity,
            "date": b.date.strftime("%Y-%m-%d") if b.date else None,
            "start_time": b.start_time.strftime("%H:%M") if b.start_time else None,
            "end_time": b.end_time.strftime("%H:%M") if b.end_time else None,
            "reason": b.reason,
        }
        for b in bookings
    ]

    return {
        "data": result,
        "total": total,
    }


# ============================
# ✅ DELETE BOOKING
# ============================
def delete_booking_service(
    db: Session,
    booking_id: int,
    current_user,
):

    booking = db.query(Booking).filter(Booking.id == booking_id).first()

    if not booking:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Booking not found",
        )

    # Admin can delete any booking
    if False:

        # Employee can delete only own bookings
        if booking.user_name != current_user.username:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You can delete only your own bookings",
            )

    db.delete(booking)
    db.commit()

    # ✅ clear cache
    for key in redis_client.scan_iter("bookings:*"):
        redis_client.delete(key)

    return {"message": "Booking deleted successfully"}


# ============================
# ✅ UPDATE BOOKING
# ============================
def update_booking_service(
    db: Session,
    booking_id: int,
    data,
    current_user,
):

    booking = db.query(Booking).filter(Booking.id == booking_id).first()

    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")
        # Admin can edit any booking

        # Employee can edit only own bookings
        if booking.user_name != current_user.username:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You can edit only your own bookings",
            )

    if data.user_name:
        user = (
            db.query(User).filter(User.username.ilike(data.user_name.strip())).first()
        )
        if not user:
            raise HTTPException(status_code=404, detail="User not found")

        booking.user_id = user.id
        booking.user_name = user.username

    if data.room_name:
        room = db.query(Room).filter(Room.name.ilike(data.room_name.strip())).first()
        if not room:
            raise HTTPException(status_code=404, detail="Room not found")

        booking.room_id = room.id

    if data.date:
        booking.date = data.date

    if data.start_time:
        booking.start_time = data.start_time

    if data.end_time:
        booking.end_time = data.end_time

    if data.reason is not None:
        booking.reason = data.reason

    if data.required_capacity:
        room = db.query(Room).filter(Room.id == booking.room_id).first()

        if data.required_capacity > room.capacity:
            raise HTTPException(
                status_code=400,
                detail="Selected room does not support required capacity",
            )

        booking.required_capacity = data.required_capacity

    # ✅ Validate time
    if booking.end_time <= booking.start_time:
        raise HTTPException(status_code=400, detail="Invalid time range")

    db.commit()
    db.refresh(booking)

    # ✅ clear cache
    for key in redis_client.scan_iter("bookings:*"):
        redis_client.delete(key)

    return {
        "id": booking.id,
        "user_name": booking.user_name,
        "room_name": booking.room.name if booking.room else "Unknown Room",
        "required_capacity": booking.required_capacity,
        "date": booking.date.strftime("%Y-%m-%d"),
        "start_time": booking.start_time.strftime("%H:%M"),
        "end_time": booking.end_time.strftime("%H:%M"),
        "reason": booking.reason,
    }
