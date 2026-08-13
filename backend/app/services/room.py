from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from fastapi import HTTPException, status

from app.models.room import Room
from app.models.booking import Booking


def get_rooms_service(db: Session):
    rooms = db.query(Room).all()

    return [
        {"id": room.id, "name": room.name, "capacity": room.capacity} for room in rooms
    ]


def get_room_availability_service(db: Session, start_time, end_time):
    rooms = db.query(Room).all()

    result = []

    for room in rooms:
        overlapping_bookings = (
            db.query(Booking)
            .filter(
                Booking.room_id == room.id,
                Booking.start_time < end_time,
                Booking.end_time > start_time,
            )
            .all()
        )

        booking_list = []

        for booking in overlapping_bookings:
            booking_list.append(
                {
                    "user_name": booking.user_name,
                    "start_time": booking.start_time.strftime("%I:%M %p"),
                    "end_time": booking.end_time.strftime("%I:%M %p"),
                }
            )

        result.append(
            {
                "room_name": room.name,
                "is_available": len(overlapping_bookings) == 0,
                "bookings": booking_list,
            }
        )

    return result
