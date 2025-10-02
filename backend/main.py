from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import os
from dotenv import load_dotenv
from database import engine, Base
from routers import trips, members, activities, expenses, settlement
import uvicorn

# Load environment variables
load_dotenv()

# Create FastAPI app
app = FastAPI(
    title="TripEasy API",
    description="API for TripEasy - Travel Management Application",
    version="1.0.0"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify your frontend domain
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Create database tables
@app.on_event("startup")
async def startup_event():
    Base.metadata.create_all(bind=engine)

# Health check endpoint
@app.get("/api/health")
async def health_check():
    return {"status": "healthy", "message": "TripEasy API is running"}

# Include routers
app.include_router(trips.router, prefix="/api/trips", tags=["trips"])
app.include_router(members.router, prefix="/api/members", tags=["members"])
app.include_router(activities.router, prefix="/api/activities", tags=["activities"])
app.include_router(expenses.router, prefix="/api/expenses", tags=["expenses"])
app.include_router(settlement.router, prefix="/api/settlement", tags=["settlement"])

# Global exception handler
@app.exception_handler(Exception)
async def global_exception_handler(request, exc):
    return JSONResponse(
        status_code=500,
        content={"detail": f"Internal server error: {str(exc)}"}
    )

if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=int(os.getenv("PORT", 8000)),
        reload=True
    )
