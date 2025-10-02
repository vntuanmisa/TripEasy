from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List, Dict
from database import get_db
from models import Trip, Member, Expense
from schemas import SettlementReport, MemberBalance, SettlementTransaction
import math

router = APIRouter()

def calculate_settlement(trip_id: int, db: Session) -> SettlementReport:
    """Tính toán thuật toán chia tiền thông minh"""
    
    # Lấy thông tin chuyến đi
    trip = db.query(Trip).filter(Trip.id == trip_id).first()
    if not trip:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Không tìm thấy chuyến đi"
        )
    
    # Lấy danh sách thành viên
    members = db.query(Member).filter(Member.trip_id == trip_id).all()
    if not members:
        return SettlementReport(
            trip_id=trip_id,
            trip_name=trip.name,
            currency=trip.currency.value,
            total_expenses=0,
            total_shared_expenses=0,
            member_balances=[],
            settlement_transactions=[]
        )
    
    # Tính tổng chi phí chung (đã quy đổi về tiền tệ chính)
    total_shared_expenses = db.query(
        func.sum(Expense.amount * Expense.exchange_rate)
    ).filter(
        Expense.trip_id == trip_id,
        Expense.is_shared == True
    ).scalar() or 0
    
    # Tính tổng chi phí (bao gồm cả chi phí riêng)
    total_expenses = db.query(
        func.sum(Expense.amount * Expense.exchange_rate)
    ).filter(
        Expense.trip_id == trip_id
    ).scalar() or 0
    
    # Tính tổng hệ số của tất cả thành viên
    total_factor = sum([member.factor for member in members])
    
    # Tính chi phí trên một đơn vị hệ số
    cost_per_factor = total_shared_expenses / total_factor if total_factor > 0 else 0
    
    # Tính số tiền mỗi thành viên đã trả
    member_paid = {}
    paid_stats = db.query(
        Expense.paid_by,
        func.sum(Expense.amount * Expense.exchange_rate).label('total_paid')
    ).filter(
        Expense.trip_id == trip_id,
        Expense.is_shared == True
    ).group_by(Expense.paid_by).all()
    
    for stat in paid_stats:
        member_paid[stat.paid_by] = stat.total_paid
    
    # Tính balance cho từng thành viên
    member_balances = []
    balances = {}  # Để tính toán settlement transactions
    
    for member in members:
        total_paid = member_paid.get(member.id, 0)
        total_owed = cost_per_factor * member.factor
        balance = total_paid - total_owed
        
        # Áp dụng quy tắc làm tròn
        balance = math.floor(balance / trip.rounding_rule) * trip.rounding_rule
        
        member_balances.append(MemberBalance(
            member_id=member.id,
            member_name=member.name,
            total_paid=total_paid,
            total_owed=total_owed,
            balance=balance
        ))
        
        balances[member.id] = {
            'name': member.name,
            'balance': balance
        }
    
    # Tính toán settlement transactions (ai nợ ai bao nhiều)
    settlement_transactions = []
    
    # Tách thành 2 nhóm: người nợ (âm) và người được nợ (dương)
    debtors = [(mid, data) for mid, data in balances.items() if data['balance'] < 0]
    creditors = [(mid, data) for mid, data in balances.items() if data['balance'] > 0]
    
    # Sắp xếp theo thứ tự tuyệt đối của balance
    debtors.sort(key=lambda x: x[1]['balance'])  # Từ âm nhất đến ít âm nhất
    creditors.sort(key=lambda x: x[1]['balance'], reverse=True)  # Từ dương nhất đến ít dương nhất
    
    # Thuật toán greedy để minimize số lượng giao dịch
    i, j = 0, 0
    while i < len(debtors) and j < len(creditors):
        debtor_id, debtor_data = debtors[i]
        creditor_id, creditor_data = creditors[j]
        
        debt_amount = abs(debtor_data['balance'])
        credit_amount = creditor_data['balance']
        
        # Số tiền giao dịch = min(nợ, có)
        transaction_amount = min(debt_amount, credit_amount)
        
        if transaction_amount > 0:
            settlement_transactions.append(SettlementTransaction(
                from_member_id=debtor_id,
                from_member_name=debtor_data['name'],
                to_member_id=creditor_id,
                to_member_name=creditor_data['name'],
                amount=transaction_amount
            ))
            
            # Cập nhật balance
            debtors[i][1]['balance'] += transaction_amount
            creditors[j][1]['balance'] -= transaction_amount
        
        # Di chuyển pointer
        if abs(debtors[i][1]['balance']) < 0.01:  # Đã trả hết nợ
            i += 1
        if abs(creditors[j][1]['balance']) < 0.01:  # Đã nhận đủ tiền
            j += 1
    
    return SettlementReport(
        trip_id=trip_id,
        trip_name=trip.name,
        currency=trip.currency.value,
        total_expenses=total_expenses,
        total_shared_expenses=total_shared_expenses,
        member_balances=member_balances,
        settlement_transactions=settlement_transactions
    )

@router.get("/trip/{trip_id}", response_model=SettlementReport)
def get_settlement_report(trip_id: int, db: Session = Depends(get_db)):
    """Lấy báo cáo chia tiền cho chuyến đi"""
    return calculate_settlement(trip_id, db)
