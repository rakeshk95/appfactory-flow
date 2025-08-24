"""
FastAPI Implementation for Performance Review System
This is a basic structure to get you started with the backend implementation.
"""

from fastapi import FastAPI, HTTPException, Depends, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, EmailStr
from typing import List, Optional
from datetime import datetime, date
import jwt
from passlib.context import CryptContext
from sqlalchemy import create_engine, Column, Integer, String, DateTime, Boolean, Text, ForeignKey
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# FastAPI app initialization
app = FastAPI(
    title="Performance Review System API",
    description="API for managing performance reviews, reviewer selections, and feedback",
    version="1.0.0"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:8080"],  # Your frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Security
security = HTTPBearer()
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# Database setup
DATABASE_URL = os.getenv("DATABASE_URL", "mssql+pyodbc://username:password@server/database?driver=ODBC+Driver+17+for+SQL+Server")
engine = create_engine(DATABASE_URL, echo=True)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# Database Models
class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True)
    name = Column(String)
    role = Column(String)  # Employee, Mentor, HR Lead, System Administrator, People Committee
    department = Column(String)
    position = Column(String)
    password_hash = Column(String)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class PerformanceCycle(Base):
    __tablename__ = "performance_cycles"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String)
    start_date = Column(DateTime)
    end_date = Column(DateTime)
    status = Column(String)  # active, inactive, completed
    description = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class ReviewerSelection(Base):
    __tablename__ = "reviewer_selections"
    
    id = Column(Integer, primary_key=True, index=True)
    performance_cycle_id = Column(Integer, ForeignKey("performance_cycles.id"))
    mentee_id = Column(Integer, ForeignKey("users.id"))
    status = Column(String)  # pending, approved, sent_back
    submitted_at = Column(DateTime)
    mentor_feedback = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class ReviewerSelectionDetail(Base):
    __tablename__ = "reviewer_selection_details"
    
    id = Column(Integer, primary_key=True, index=True)
    selection_id = Column(Integer, ForeignKey("reviewer_selections.id"))
    reviewer_id = Column(Integer, ForeignKey("users.id"))
    created_at = Column(DateTime, default=datetime.utcnow)

class FeedbackForm(Base):
    __tablename__ = "feedback_forms"
    
    id = Column(Integer, primary_key=True, index=True)
    employee_id = Column(Integer, ForeignKey("users.id"))
    reviewer_id = Column(Integer, ForeignKey("users.id"))
    performance_cycle_id = Column(Integer, ForeignKey("performance_cycles.id"))
    strengths = Column(Text)
    improvements = Column(Text)
    overall_rating = Column(String)  # tracking_below, tracking_expected, tracking_above
    status = Column(String)  # draft, submitted
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

# Create tables (commented out for SQL Server - use migrations instead)
# Base.metadata.create_all(bind=engine)

# Pydantic Models
class UserBase(BaseModel):
    email: EmailStr
    name: str
    role: str
    department: str
    position: str

class UserCreate(UserBase):
    password: str

class User(UserBase):
    id: int
    is_active: bool
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True

class PerformanceCycleBase(BaseModel):
    name: str
    start_date: date
    end_date: date
    description: str

class PerformanceCycle(PerformanceCycleBase):
    id: int
    status: str
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True

class ReviewerSelectionBase(BaseModel):
    performance_cycle_id: int
    selected_reviewers: List[int]
    comments: Optional[str] = None

class ReviewerSelection(ReviewerSelectionBase):
    id: int
    mentee_id: int
    status: str
    submitted_at: Optional[datetime]
    mentor_feedback: Optional[str]
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True

class FeedbackFormBase(BaseModel):
    employee_id: int
    performance_cycle_id: int
    strengths: str
    improvements: str
    overall_rating: str
    status: str

class FeedbackForm(FeedbackFormBase):
    id: int
    reviewer_id: int
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True

class LoginRequest(BaseModel):
    email: EmailStr
    password: str

class LoginResponse(BaseModel):
    access_token: str
    token_type: str
    user: User

# Database dependency
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Authentication dependency
async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security), db: Session = Depends(get_db)):
    try:
        payload = jwt.decode(credentials.credentials, os.getenv("SECRET_KEY", "your-secret-key"), algorithms=["HS256"])
        user_id: int = payload.get("sub")
        if user_id is None:
            raise HTTPException(status_code=401, detail="Invalid token")
    except jwt.PyJWTError:
        raise HTTPException(status_code=401, detail="Invalid token")
    
    user = db.query(User).filter(User.id == user_id).first()
    if user is None:
        raise HTTPException(status_code=401, detail="User not found")
    return user

# Authentication endpoints
@app.post("/api/v1/auth/login", response_model=LoginResponse)
async def login(login_data: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == login_data.email).first()
    if not user or not pwd_context.verify(login_data.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    # Create JWT token
    access_token = jwt.encode(
        {"sub": user.id, "email": user.email, "role": user.role},
        os.getenv("SECRET_KEY", "your-secret-key"),
        algorithm="HS256"
    )
    
    return LoginResponse(
        access_token=access_token,
        token_type="bearer",
        user=user
    )

@app.get("/api/v1/users/profile", response_model=User)
async def get_profile(current_user: User = Depends(get_current_user)):
    return current_user

# Performance Cycle endpoints
@app.get("/api/v1/performance-cycles/active", response_model=PerformanceCycle)
async def get_active_performance_cycle(db: Session = Depends(get_db)):
    cycle = db.query(PerformanceCycle).filter(PerformanceCycle.status == "active").first()
    if not cycle:
        raise HTTPException(status_code=404, detail="No active performance cycle found")
    return cycle

@app.get("/api/v1/performance-cycles", response_model=List[PerformanceCycle])
async def get_performance_cycles(
    status: Optional[str] = None,
    page: int = 1,
    limit: int = 10,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.role not in ["System Administrator", "HR Lead"]:
        raise HTTPException(status_code=403, detail="Access denied")
    
    query = db.query(PerformanceCycle)
    if status:
        query = query.filter(PerformanceCycle.status == status)
    
    offset = (page - 1) * limit
    cycles = query.offset(offset).limit(limit).all()
    return cycles

# User Management endpoints
@app.get("/api/v1/users/reviewers", response_model=List[User])
async def get_available_reviewers(
    exclude_current_user: bool = True,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    query = db.query(User).filter(User.is_active == True)
    if exclude_current_user:
        query = query.filter(User.id != current_user.id)
    
    reviewers = query.all()
    return reviewers

# Reviewer Selection endpoints
@app.post("/api/v1/reviewer-selections", response_model=ReviewerSelection)
async def submit_reviewer_selection(
    selection_data: ReviewerSelectionBase,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.role != "Employee":
        raise HTTPException(status_code=403, detail="Only employees can submit reviewer selections")
    
    # Check if user already has a selection for this cycle
    existing_selection = db.query(ReviewerSelection).filter(
        ReviewerSelection.mentee_id == current_user.id,
        ReviewerSelection.performance_cycle_id == selection_data.performance_cycle_id
    ).first()
    
    if existing_selection:
        raise HTTPException(status_code=400, detail="Reviewer selection already exists for this cycle")
    
    # Create reviewer selection
    selection = ReviewerSelection(
        performance_cycle_id=selection_data.performance_cycle_id,
        mentee_id=current_user.id,
        status="pending",
        submitted_at=datetime.utcnow()
    )
    db.add(selection)
    db.commit()
    db.refresh(selection)
    
    # Add reviewer details
    for reviewer_id in selection_data.selected_reviewers:
        detail = ReviewerSelectionDetail(
            selection_id=selection.id,
            reviewer_id=reviewer_id
        )
        db.add(detail)
    
    db.commit()
    return selection

@app.get("/api/v1/reviewer-selections/my-selection", response_model=ReviewerSelection)
async def get_my_reviewer_selection(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.role != "Employee":
        raise HTTPException(status_code=403, detail="Only employees can view their reviewer selections")
    
    selection = db.query(ReviewerSelection).filter(
        ReviewerSelection.mentee_id == current_user.id
    ).first()
    
    if not selection:
        raise HTTPException(status_code=404, detail="No reviewer selection found")
    
    return selection

# Mentor Approval endpoints
@app.get("/api/v1/mentor/approvals/pending")
async def get_pending_approvals(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.role != "Mentor":
        raise HTTPException(status_code=403, detail="Only mentors can view pending approvals")
    
    # This would need to be implemented based on your mentor-mentee relationship logic
    # For now, returning empty list
    return []

@app.post("/api/v1/mentor/approvals/{selection_id}/approve")
async def approve_reviewer_selection(
    selection_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.role != "Mentor":
        raise HTTPException(status_code=403, detail="Only mentors can approve selections")
    
    selection = db.query(ReviewerSelection).filter(ReviewerSelection.id == selection_id).first()
    if not selection:
        raise HTTPException(status_code=404, detail="Selection not found")
    
    selection.status = "approved"
    selection.updated_at = datetime.utcnow()
    db.commit()
    
    return {"message": "Selection approved successfully"}

# Feedback Management endpoints
@app.get("/api/v1/reviewer/assignments")
async def get_assigned_employees(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.role not in ["People Committee", "Mentor"]:
        raise HTTPException(status_code=403, detail="Access denied")
    
    # This would need to be implemented based on your assignment logic
    # For now, returning empty list
    return []

@app.post("/api/v1/reviewer/feedback-forms", response_model=FeedbackForm)
async def create_feedback_form(
    form_data: FeedbackFormBase,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.role not in ["People Committee", "Mentor"]:
        raise HTTPException(status_code=403, detail="Access denied")
    
    feedback_form = FeedbackForm(
        employee_id=form_data.employee_id,
        reviewer_id=current_user.id,
        performance_cycle_id=form_data.performance_cycle_id,
        strengths=form_data.strengths,
        improvements=form_data.improvements,
        overall_rating=form_data.overall_rating,
        status=form_data.status
    )
    
    db.add(feedback_form)
    db.commit()
    db.refresh(feedback_form)
    
    return feedback_form

# Dashboard endpoints
@app.get("/api/v1/dashboard/stats")
async def get_dashboard_stats(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Role-based dashboard statistics
    if current_user.role == "Employee":
        # Get user's reviewer selection status
        selection = db.query(ReviewerSelection).filter(
            ReviewerSelection.mentee_id == current_user.id
        ).first()
        
        return {
            "reviewers_selected": len(selection.selected_reviewers) if selection else 0,
            "submission_status": selection.status if selection else "not_submitted",
            "performance_cycle": db.query(PerformanceCycle).filter(
                PerformanceCycle.status == "active"
            ).first()
        }
    
    elif current_user.role == "Mentor":
        # Get mentor's pending approvals
        return {
            "pending_approvals": 0,  # Implement based on mentor-mentee relationship
            "approved_today": 0,
            "total_mentees": 0,
            "performance_cycle": db.query(PerformanceCycle).filter(
                PerformanceCycle.status == "active"
            ).first()
        }
    
    elif current_user.role == "People Committee":
        # Get reviewer's assignments
        return {
            "pending_reviews": 0,  # Implement based on assignments
            "completed_reviews": 0,
            "draft_reviews": 0,
            "performance_cycle": db.query(PerformanceCycle).filter(
                PerformanceCycle.status == "active"
            ).first()
        }
    
    else:
        raise HTTPException(status_code=403, detail="Access denied")

# Health check endpoint
@app.get("/api/v1/health")
async def health_check():
    return {"status": "healthy", "timestamp": datetime.utcnow()}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
