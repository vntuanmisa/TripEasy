from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from database import get_db
from models import Member, Trip
from schemas import MemberCreate, MemberUpdate, Member as MemberSchema

router = APIRouter()

@router.post("/", response_model=MemberSchema, status_code=status.HTTP_201_CREATED)
def create_member(member: MemberCreate, db: Session = Depends(get_db)):
    """Thêm thành viên mới vào chuyến đi"""
    # Kiểm tra chuyến đi có tồn tại không
    trip = db.query(Trip).filter(Trip.id == member.trip_id).first()
    if not trip:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Không tìm thấy chuyến đi"
        )
    
    # Tự động điều chỉnh factor cho trẻ em
    member_data = member.dict()
    if member_data.get("is_child", False):
        member_data["factor"] = trip.child_factor
    
    db_member = Member(**member_data)
    db.add(db_member)
    db.commit()
    db.refresh(db_member)
    return db_member

@router.get("/trip/{trip_id}", response_model=List[MemberSchema])
def get_members_by_trip(trip_id: int, db: Session = Depends(get_db)):
    """Lấy danh sách thành viên của một chuyến đi"""
    # Kiểm tra chuyến đi có tồn tại không
    trip = db.query(Trip).filter(Trip.id == trip_id).first()
    if not trip:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Không tìm thấy chuyến đi"
        )
    
    members = db.query(Member).filter(Member.trip_id == trip_id).all()
    return members

@router.get("/{member_id}", response_model=MemberSchema)
def get_member(member_id: int, db: Session = Depends(get_db)):
    """Lấy thông tin chi tiết một thành viên"""
    member = db.query(Member).filter(Member.id == member_id).first()
    if not member:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Không tìm thấy thành viên"
        )
    return member

@router.put("/{member_id}", response_model=MemberSchema)
def update_member(member_id: int, member_update: MemberUpdate, db: Session = Depends(get_db)):
    """Cập nhật thông tin thành viên"""
    member = db.query(Member).filter(Member.id == member_id).first()
    if not member:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Không tìm thấy thành viên"
        )
    
    update_data = member_update.dict(exclude_unset=True)
    
    # Tự động điều chỉnh factor nếu thay đổi trạng thái trẻ em
    if "is_child" in update_data:
        trip = db.query(Trip).filter(Trip.id == member.trip_id).first()
        if update_data["is_child"]:
            update_data["factor"] = trip.child_factor
        else:
            update_data["factor"] = 1.0
    
    for field, value in update_data.items():
        setattr(member, field, value)
    
    db.commit()
    db.refresh(member)
    return member

@router.delete("/{member_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_member(member_id: int, db: Session = Depends(get_db)):
    """Xóa thành viên khỏi chuyến đi"""
    member = db.query(Member).filter(Member.id == member_id).first()
    if not member:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Không tìm thấy thành viên"
        )
    
    db.delete(member)
    db.commit()
    return None
