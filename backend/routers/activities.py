from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import and_
from typing import List, Optional
from datetime import date
from database import get_db
from models import Activity, Trip
from schemas import ActivityCreate, ActivityUpdate, Activity as ActivitySchema

router = APIRouter()

@router.post("/", response_model=ActivitySchema, status_code=status.HTTP_201_CREATED)
def create_activity(activity: ActivityCreate, db: Session = Depends(get_db)):
    """Thêm hoạt động mới vào chuyến đi"""
    # Kiểm tra chuyến đi có tồn tại không
    trip = db.query(Trip).filter(Trip.id == activity.trip_id).first()
    if not trip:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Không tìm thấy chuyến đi"
        )
    
    db_activity = Activity(**activity.dict())
    db.add(db_activity)
    db.commit()
    db.refresh(db_activity)
    return db_activity

@router.get("/trip/{trip_id}", response_model=List[ActivitySchema])
def get_activities_by_trip(
    trip_id: int, 
    activity_date: Optional[date] = None,
    db: Session = Depends(get_db)
):
    """Lấy danh sách hoạt động của một chuyến đi, có thể lọc theo ngày"""
    # Kiểm tra chuyến đi có tồn tại không
    trip = db.query(Trip).filter(Trip.id == trip_id).first()
    if not trip:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Không tìm thấy chuyến đi"
        )
    
    query = db.query(Activity).filter(Activity.trip_id == trip_id)
    
    # Lọc theo ngày nếu có
    if activity_date:
        query = query.filter(
            and_(
                Activity.start_time >= activity_date,
                Activity.start_time < activity_date.replace(day=activity_date.day + 1)
            )
        )
    
    activities = query.order_by(Activity.start_time.asc()).all()
    return activities

@router.get("/{activity_id}", response_model=ActivitySchema)
def get_activity(activity_id: int, db: Session = Depends(get_db)):
    """Lấy thông tin chi tiết một hoạt động"""
    activity = db.query(Activity).filter(Activity.id == activity_id).first()
    if not activity:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Không tìm thấy hoạt động"
        )
    return activity

@router.put("/{activity_id}", response_model=ActivitySchema)
def update_activity(activity_id: int, activity_update: ActivityUpdate, db: Session = Depends(get_db)):
    """Cập nhật thông tin hoạt động"""
    activity = db.query(Activity).filter(Activity.id == activity_id).first()
    if not activity:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Không tìm thấy hoạt động"
        )
    
    update_data = activity_update.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(activity, field, value)
    
    db.commit()
    db.refresh(activity)
    return activity

@router.delete("/{activity_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_activity(activity_id: int, db: Session = Depends(get_db)):
    """Xóa hoạt động"""
    activity = db.query(Activity).filter(Activity.id == activity_id).first()
    if not activity:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Không tìm thấy hoạt động"
        )
    
    db.delete(activity)
    db.commit()
    return None
