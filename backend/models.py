from sqlalchemy import Column, Integer, String, Float, DateTime, Boolean, Text, ForeignKey, Enum
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import enum
from database import Base

class CurrencyEnum(enum.Enum):
    VND = "VND"
    USD = "USD"
    EUR = "EUR"
    JPY = "JPY"

class ExpenseCategoryEnum(enum.Enum):
    FOOD = "food"
    TRANSPORT = "transport"
    ACCOMMODATION = "accommodation"
    ENTERTAINMENT = "entertainment"
    SHOPPING = "shopping"
    OTHER = "other"

class Trip(Base):
    __tablename__ = "trips"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    destination = Column(String(255), nullable=False)
    departure_location = Column(String(255))
    start_date = Column(DateTime)
    end_date = Column(DateTime)
    currency = Column(Enum(CurrencyEnum), default=CurrencyEnum.VND)
    child_factor = Column(Float, default=0.5)  # Hệ số chi tiêu cho trẻ em
    rounding_rule = Column(Integer, default=1000)  # Làm tròn đến hàng nghìn
    invite_code = Column(String(50), unique=True, index=True)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())
    
    # Relationships
    members = relationship("Member", back_populates="trip", cascade="all, delete-orphan")
    activities = relationship("Activity", back_populates="trip", cascade="all, delete-orphan")
    expenses = relationship("Expense", back_populates="trip", cascade="all, delete-orphan")

class Member(Base):
    __tablename__ = "members"
    
    id = Column(Integer, primary_key=True, index=True)
    trip_id = Column(Integer, ForeignKey("trips.id"), nullable=False)
    name = Column(String(255), nullable=False)
    factor = Column(Float, default=1.0)  # Hệ số chia tiền (1.0 cho người lớn)
    is_child = Column(Boolean, default=False)
    created_at = Column(DateTime, server_default=func.now())
    
    # Relationships
    trip = relationship("Trip", back_populates="members")
    expenses_paid = relationship("Expense", back_populates="paid_by_member")

class Activity(Base):
    __tablename__ = "activities"
    
    id = Column(Integer, primary_key=True, index=True)
    trip_id = Column(Integer, ForeignKey("trips.id"), nullable=False)
    name = Column(String(255), nullable=False)
    description = Column(Text)
    location = Column(String(255))
    latitude = Column(Float)
    longitude = Column(Float)
    start_time = Column(DateTime)
    end_time = Column(DateTime)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())
    
    # Relationships
    trip = relationship("Trip", back_populates="activities")
    expenses = relationship("Expense", back_populates="activity")

class Expense(Base):
    __tablename__ = "expenses"
    
    id = Column(Integer, primary_key=True, index=True)
    trip_id = Column(Integer, ForeignKey("trips.id"), nullable=False)
    activity_id = Column(Integer, ForeignKey("activities.id"), nullable=True)
    paid_by = Column(Integer, ForeignKey("members.id"), nullable=False)
    description = Column(String(255), nullable=False)
    amount = Column(Float, nullable=False)
    currency = Column(Enum(CurrencyEnum), default=CurrencyEnum.VND)
    exchange_rate = Column(Float, default=1.0)  # Tỷ giá quy đổi về tiền tệ chính
    category = Column(Enum(ExpenseCategoryEnum), default=ExpenseCategoryEnum.OTHER)
    is_shared = Column(Boolean, default=True)  # Chi phí chung hay riêng
    expense_date = Column(DateTime, server_default=func.now())
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())
    
    # Relationships
    trip = relationship("Trip", back_populates="expenses")
    activity = relationship("Activity", back_populates="expenses")
    paid_by_member = relationship("Member", back_populates="expenses_paid")
