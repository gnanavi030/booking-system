from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.db.base import Base
from app.db.database import engine, SessionLocal

from app.models.user import User
from app.models.booking import Booking
from app.models.room import Room

from app.api import room as room_api
from app.api import booking as booking_api

from app.api.user import router as user_router
from app.api import auth

from fastapi_jwt_auth import AuthJWT
from pydantic import BaseModel

from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse

from sqlalchemy import text
from app.db.database import SessionLocal


class Settings(BaseModel):
    authjwt_secret_key: str = "secret123"


@AuthJWT.load_config
def get_config():
    return Settings()


Base.metadata.create_all(bind=engine)

app = FastAPI()


from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def seed_rooms():
    db = SessionLocal()

    rooms = [
        {"name": "Ganga", "capacity": 5},
        {"name": "Yamuna", "capacity": 10},
        {"name": "Kaveri", "capacity": 15},
        {"name": "Narmada", "capacity": 20},
        {"name": "Saraswathi", "capacity": 25},
        {"name": "Brahmaputra", "capacity": 30},
        {"name": "Godavari", "capacity": 35},
        {"name": "Krishna", "capacity": 80},
        {"name": "Mahanadi", "capacity": 40},
        {"name": "Sabarmati", "capacity": 50},
        {"name": "Tapti", "capacity": 60},
        {"name": "Indus", "capacity": 70},
    ]

    for r in rooms:
        existing = db.query(Room).filter(Room.name == r["name"]).first()

        if not existing:
            db.add(Room(name=r["name"], capacity=r["capacity"]))

    db.commit()
    db.close()


@app.on_event("startup")
def startup_event():
    seed_rooms()


@app.get("/")
def root():
    return {"message": "Meeting Room Booking API running "}


# ROUTERS
API_PREFIX = "/api/v1"

app.include_router(auth.router, prefix=API_PREFIX)

app.include_router(booking_api.router, prefix=API_PREFIX)

app.include_router(room_api.router, prefix=API_PREFIX)

app.include_router(user_router, prefix=API_PREFIX)


# Redis test
from app.core.redis_client import redis_client


@app.get("/test-redis")
def test_redis():
    try:
        redis_client.set("ping", "pong")
        return {"redis": redis_client.get("ping")}
    except Exception as e:
        return {"error": str(e)}


@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request, exc):
    error = exc.errors()[0]

    return JSONResponse(status_code=422, content={"detail": error["msg"]})


@app.on_event("startup")
def startup_event():
    seed_rooms()

    db = SessionLocal()

    try:
        db.execute(text("""
                SELECT setval(
                    'bookings_id_seq',
                    (SELECT COALESCE(MAX(id), 1) FROM bookings),
                    true
                );
            """))
        db.commit()

    finally:
        db.close()
