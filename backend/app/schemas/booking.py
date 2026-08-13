from pydantic import BaseModel, validator, Field

from typing import Optional
from datetime import time, date as Datetype
from typing import List


# ============================
# CREATE SCHEMA
# ============================
class BookingCreate(BaseModel):
    user_name: str
    room_name: str
    required_capacity: int

    date: Datetype

    start_time: time = Field(..., example="14:30", description="Time in HH:MM format")
    end_time: time = Field(..., example="15:30", description="Time in HH:MM format")

    reason: Optional[str] = None


# ============================
# RESPONSE SCHEMA
# ============================
class BookingResponse(BaseModel):
    id: int
    user_name: Optional[str] = None
    room_name: Optional[str] = None
    required_capacity: Optional[int] = None

    date: Optional[str] = None
    start_time: Optional[str] = None
    end_time: Optional[str] = None
    reason: Optional[str] = None


# ============================
#  UPDATE SCHEMA
# ============================
class BookingUpdate(BaseModel):
    user_name: Optional[str] = None

    room_name: Optional[str] = None
    required_capacity: Optional[int] = None

    date: Optional[Datetype] = None
    start_time: Optional[time] = None
    end_time: Optional[time] = None
    reason: Optional[str] = None

    class Config:
        from_attributes = True


class PaginatedBookings(BaseModel):
    data: List[BookingResponse]
    total: int
