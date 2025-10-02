from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime
from enum import Enum

class CurrencyEnum(str, Enum):
    VND = "VND"
    USD = "USD"
    EUR = "EUR"
    JPY = "JPY"

class ExpenseCategoryEnum(str, Enum):
    FOOD = "food"
    TRANSPORT = "transport"
    ACCOMMODATION = "accommodation"
    ENTERTAINMENT = "entertainment"
    SHOPPING = "shopping"
    OTHER = "other"

# Trip schemas
class TripBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=255)
    destination: str = Field(..., min_length=1, max_length=255)
    departure_location: Optional[str] = None
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None
    currency: CurrencyEnum = CurrencyEnum.VND
    child_factor: float = Field(default=0.5, ge=0, le=1)
    rounding_rule: int = Field(default=1000, ge=1)

class TripCreate(TripBase):
    pass

class TripUpdate(BaseModel):
    name: Optional[str] = None
    destination: Optional[str] = None
    departure_location: Optional[str] = None
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None
    currency: Optional[CurrencyEnum] = None
    child_factor: Optional[float] = None
    rounding_rule: Optional[int] = None

class Trip(TripBase):
    id: int
    invite_code: str
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True

# Member schemas
class MemberBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=255)
    factor: float = Field(default=1.0, ge=0)
    is_child: bool = False

class MemberCreate(MemberBase):
    trip_id: int

class MemberUpdate(BaseModel):
    name: Optional[str] = None
    factor: Optional[float] = None
    is_child: Optional[bool] = None

class Member(MemberBase):
    id: int
    trip_id: int
    created_at: datetime
    
    class Config:
        from_attributes = True

# Activity schemas
class ActivityBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=255)
    description: Optional[str] = None
    location: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    start_time: Optional[datetime] = None
    end_time: Optional[datetime] = None

class ActivityCreate(ActivityBase):
    trip_id: int

class ActivityUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    location: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    start_time: Optional[datetime] = None
    end_time: Optional[datetime] = None

class Activity(ActivityBase):
    id: int
    trip_id: int
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True

# Expense schemas
class ExpenseBase(BaseModel):
    description: str = Field(..., min_length=1, max_length=255)
    amount: float = Field(..., gt=0)
    currency: CurrencyEnum = CurrencyEnum.VND
    exchange_rate: float = Field(default=1.0, gt=0)
    category: ExpenseCategoryEnum = ExpenseCategoryEnum.OTHER
    is_shared: bool = True
    expense_date: Optional[datetime] = None

class ExpenseCreate(ExpenseBase):
    trip_id: int
    paid_by: int
    activity_id: Optional[int] = None

class ExpenseUpdate(BaseModel):
    description: Optional[str] = None
    amount: Optional[float] = None
    currency: Optional[CurrencyEnum] = None
    exchange_rate: Optional[float] = None
    category: Optional[ExpenseCategoryEnum] = None
    is_shared: Optional[bool] = None
    expense_date: Optional[datetime] = None
    paid_by: Optional[int] = None
    activity_id: Optional[int] = None

class Expense(ExpenseBase):
    id: int
    trip_id: int
    paid_by: int
    activity_id: Optional[int] = None
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True

# Settlement schemas
class MemberBalance(BaseModel):
    member_id: int
    member_name: str
    total_paid: float
    total_owed: float
    balance: float  # positive = should receive, negative = should pay

class SettlementTransaction(BaseModel):
    from_member_id: int
    from_member_name: str
    to_member_id: int
    to_member_name: str
    amount: float

class SettlementReport(BaseModel):
    trip_id: int
    trip_name: str
    currency: str
    total_expenses: float
    total_shared_expenses: float
    member_balances: List[MemberBalance]
    settlement_transactions: List[SettlementTransaction]

# Statistics schemas
class ExpenseByCategory(BaseModel):
    category: str
    amount: float
    percentage: float

class ExpenseByDay(BaseModel):
    date: str
    amount: float

class ExpenseByMember(BaseModel):
    member_name: str
    amount: float

class TripStatistics(BaseModel):
    trip_id: int
    expenses_by_category: List[ExpenseByCategory]
    expenses_by_day: List[ExpenseByDay]
    expenses_by_member: List[ExpenseByMember]
