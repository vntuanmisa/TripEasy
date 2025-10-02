from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
import secrets
import string
from database import get_db
from models import Trip
from schemas import TripCreate, TripUpdate, Trip as TripSchema

router = APIRouter()

def generate_invite_code(length: int = 8) -> str:
    """Generate a random invite code"""
    characters = string.ascii_uppercase + string.digits
    return ''.join(secrets.choice(characters) for _ in range(length))

@router.post("/", response_model=TripSchema, status_code=status.HTTP_201_CREATED)
def create_trip(trip: TripCreate, db: Session = Depends(get_db)):
    """Tạo chuyến đi mới"""
    # Generate unique invite code
    while True:
        invite_code = generate_invite_code()
        existing_trip = db.query(Trip).filter(Trip.invite_code == invite_code).first()
        if not existing_trip:
            break
    
    db_trip = Trip(**trip.dict(), invite_code=invite_code)
    db.add(db_trip)
    db.commit()
    db.refresh(db_trip)
    return db_trip

@router.get("/", response_model=List[TripSchema])
def get_trips(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    """Lấy danh sách tất cả chuyến đi"""
    trips = db.query(Trip).offset(skip).limit(limit).all()
    return trips

@router.get("/{trip_id}", response_model=TripSchema)
def get_trip(trip_id: int, db: Session = Depends(get_db)):
    """Lấy thông tin chi tiết một chuyến đi"""
    trip = db.query(Trip).filter(Trip.id == trip_id).first()
    if not trip:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Không tìm thấy chuyến đi"
        )
    return trip

@router.get("/invite/{invite_code}", response_model=TripSchema)
def get_trip_by_invite_code(invite_code: str, db: Session = Depends(get_db)):
    """Lấy thông tin chuyến đi bằng mã mời"""
    trip = db.query(Trip).filter(Trip.invite_code == invite_code).first()
    if not trip:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Mã mời không hợp lệ"
        )
    return trip

@router.put("/{trip_id}", response_model=TripSchema)
def update_trip(trip_id: int, trip_update: TripUpdate, db: Session = Depends(get_db)):
    """Cập nhật thông tin chuyến đi"""
    trip = db.query(Trip).filter(Trip.id == trip_id).first()
    if not trip:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Không tìm thấy chuyến đi"
        )
    
    update_data = trip_update.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(trip, field, value)
    
    db.commit()
    db.refresh(trip)
    return trip

@router.delete("/{trip_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_trip(trip_id: int, db: Session = Depends(get_db)):
    """Xóa chuyến đi"""
    trip = db.query(Trip).filter(Trip.id == trip_id).first()
    if not trip:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Không tìm thấy chuyến đi"
        )
    
    db.delete(trip)
    db.commit()
    return None
