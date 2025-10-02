from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from sqlalchemy import and_, func
from typing import List, Optional
from datetime import date
from database import get_db
from models import Expense, Trip, Member, Activity
from schemas import ExpenseCreate, ExpenseUpdate, Expense as ExpenseSchema, ExpenseCategoryEnum, TripStatistics, ExpenseByCategory, ExpenseByDay, ExpenseByMember

router = APIRouter()

@router.post("/", response_model=ExpenseSchema, status_code=status.HTTP_201_CREATED)
def create_expense(expense: ExpenseCreate, db: Session = Depends(get_db)):
    """Thêm chi phí mới"""
    # Kiểm tra chuyến đi có tồn tại không
    trip = db.query(Trip).filter(Trip.id == expense.trip_id).first()
    if not trip:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Không tìm thấy chuyến đi"
        )
    
    # Kiểm tra thành viên có tồn tại không
    member = db.query(Member).filter(Member.id == expense.paid_by).first()
    if not member:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Không tìm thấy thành viên"
        )
    
    # Kiểm tra hoạt động có tồn tại không (nếu có)
    if expense.activity_id:
        activity = db.query(Activity).filter(Activity.id == expense.activity_id).first()
        if not activity:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Không tìm thấy hoạt động"
            )
    
    db_expense = Expense(**expense.dict())
    db.add(db_expense)
    db.commit()
    db.refresh(db_expense)
    return db_expense

@router.get("/trip/{trip_id}", response_model=List[ExpenseSchema])
def get_expenses_by_trip(
    trip_id: int,
    category: Optional[ExpenseCategoryEnum] = None,
    paid_by: Optional[int] = None,
    expense_date: Optional[date] = None,
    is_shared: Optional[bool] = None,
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    """Lấy danh sách chi phí của một chuyến đi với các bộ lọc"""
    # Kiểm tra chuyến đi có tồn tại không
    trip = db.query(Trip).filter(Trip.id == trip_id).first()
    if not trip:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Không tìm thấy chuyến đi"
        )
    
    query = db.query(Expense).filter(Expense.trip_id == trip_id)
    
    # Áp dụng các bộ lọc
    if category:
        query = query.filter(Expense.category == category)
    
    if paid_by:
        query = query.filter(Expense.paid_by == paid_by)
    
    if expense_date:
        query = query.filter(
            and_(
                Expense.expense_date >= expense_date,
                Expense.expense_date < expense_date.replace(day=expense_date.day + 1)
            )
        )
    
    if is_shared is not None:
        query = query.filter(Expense.is_shared == is_shared)
    
    expenses = query.order_by(Expense.expense_date.desc()).offset(skip).limit(limit).all()
    return expenses

@router.get("/{expense_id}", response_model=ExpenseSchema)
def get_expense(expense_id: int, db: Session = Depends(get_db)):
    """Lấy thông tin chi tiết một chi phí"""
    expense = db.query(Expense).filter(Expense.id == expense_id).first()
    if not expense:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Không tìm thấy chi phí"
        )
    return expense

@router.put("/{expense_id}", response_model=ExpenseSchema)
def update_expense(expense_id: int, expense_update: ExpenseUpdate, db: Session = Depends(get_db)):
    """Cập nhật thông tin chi phí"""
    expense = db.query(Expense).filter(Expense.id == expense_id).first()
    if not expense:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Không tìm thấy chi phí"
        )
    
    update_data = expense_update.dict(exclude_unset=True)
    
    # Kiểm tra thành viên mới nếu có thay đổi
    if "paid_by" in update_data:
        member = db.query(Member).filter(Member.id == update_data["paid_by"]).first()
        if not member:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Không tìm thấy thành viên"
            )
    
    # Kiểm tra hoạt động mới nếu có thay đổi
    if "activity_id" in update_data and update_data["activity_id"]:
        activity = db.query(Activity).filter(Activity.id == update_data["activity_id"]).first()
        if not activity:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Không tìm thấy hoạt động"
            )
    
    for field, value in update_data.items():
        setattr(expense, field, value)
    
    db.commit()
    db.refresh(expense)
    return expense

@router.delete("/{expense_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_expense(expense_id: int, db: Session = Depends(get_db)):
    """Xóa chi phí"""
    expense = db.query(Expense).filter(Expense.id == expense_id).first()
    if not expense:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Không tìm thấy chi phí"
        )
    
    db.delete(expense)
    db.commit()
    return None

@router.get("/trip/{trip_id}/statistics", response_model=TripStatistics)
def get_trip_statistics(trip_id: int, db: Session = Depends(get_db)):
    """Lấy thống kê chi phí của chuyến đi"""
    # Kiểm tra chuyến đi có tồn tại không
    trip = db.query(Trip).filter(Trip.id == trip_id).first()
    if not trip:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Không tìm thấy chuyến đi"
        )
    
    # Thống kê theo danh mục
    category_stats = db.query(
        Expense.category,
        func.sum(Expense.amount * Expense.exchange_rate).label('total_amount')
    ).filter(
        Expense.trip_id == trip_id,
        Expense.is_shared == True
    ).group_by(Expense.category).all()
    
    total_shared = sum([stat.total_amount for stat in category_stats])
    
    expenses_by_category = [
        ExpenseByCategory(
            category=stat.category.value,
            amount=stat.total_amount,
            percentage=round((stat.total_amount / total_shared * 100) if total_shared > 0 else 0, 2)
        )
        for stat in category_stats
    ]
    
    # Thống kê theo ngày
    day_stats = db.query(
        func.date(Expense.expense_date).label('expense_date'),
        func.sum(Expense.amount * Expense.exchange_rate).label('total_amount')
    ).filter(
        Expense.trip_id == trip_id,
        Expense.is_shared == True
    ).group_by(func.date(Expense.expense_date)).order_by('expense_date').all()
    
    expenses_by_day = [
        ExpenseByDay(
            date=str(stat.expense_date),
            amount=stat.total_amount
        )
        for stat in day_stats
    ]
    
    # Thống kê theo thành viên
    member_stats = db.query(
        Member.name,
        func.sum(Expense.amount * Expense.exchange_rate).label('total_amount')
    ).join(
        Expense, Member.id == Expense.paid_by
    ).filter(
        Expense.trip_id == trip_id,
        Expense.is_shared == True
    ).group_by(Member.id, Member.name).all()
    
    expenses_by_member = [
        ExpenseByMember(
            member_name=stat.name,
            amount=stat.total_amount
        )
        for stat in member_stats
    ]
    
    return TripStatistics(
        trip_id=trip_id,
        expenses_by_category=expenses_by_category,
        expenses_by_day=expenses_by_day,
        expenses_by_member=expenses_by_member
    )
