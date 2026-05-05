from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
import os
from .schemas.judgment import JudgmentResponse, JudgmentExtractionSchema, ExtractedField, ActionPlan, ActionStep
from datetime import date
from typing import List
import uuid

app = FastAPI(title="JudgeAI API", version="0.1.0")

# Enable CORS for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    return {"message": "Welcome to JudgeAI API"}

@app.post("/upload", response_model=JudgmentResponse)
async def upload_judgment(file: UploadFile = File(...)):
    if not file.filename.endswith('.pdf'):
        raise HTTPException(status_code=400, detail="Only PDF files are accepted")
    
    # Mock processing
    judgment_id = str(uuid.uuid4())
    
    # Placeholder for actual extraction logic
    mock_extraction = JudgmentExtractionSchema(
        case_id=ExtractedField(value="WP/12345/2024", confidence=0.97),
        petitioner=ExtractedField(value="Sri Ramesh Kumar", confidence=0.91),
        respondent=ExtractedField(value="State of Karnataka, Revenue Dept.", confidence=0.88),
        judgment_date=ExtractedField(value="2024-03-15", confidence=0.95),
        compliance_deadline=ExtractedField(value="2024-06-15", confidence=0.64),
        responsible_department=ExtractedField(value="Revenue & Disaster Mgmt.", confidence=0.72),
        core_directive=ExtractedField(value="Issue caste certificate within 30 days of application receipt per Rule 7(2).", confidence=0.43)
    )
    
    mock_plan = ActionPlan(
        summary="The judgment directs the Revenue Department to issue a caste certificate within 30 days.",
        path="COMPLY",
        steps=[
            ActionStep(description="Assign case to Revenue Dept. nodal officer", deadline=date(2024, 3, 22)),
            ActionStep(description="Issue certificate within 30 days", deadline=date(2024, 6, 15))
        ],
        risks=["Certificate issuance pending verification — sub-30-day risk if records are incomplete."]
    )
    
    return JudgmentResponse(
        id=judgment_id,
        filename=file.filename,
        extraction=mock_extraction,
        action_plan=mock_plan,
        status="PENDING",
        created_at=date.today()
    )

# Serve static files from the 'dist' directory
if os.path.exists("dist"):
    app.mount("/assets", StaticFiles(directory="dist/assets"), name="assets")

    @app.get("/{full_path:path}")
    async def serve_frontend(full_path: str):
        # Exclude API routes from the catch-all
        if full_path.startswith("upload") or full_path.startswith("judgments"):
            raise HTTPException(status_code=404)
        
        # Check if file exists in dist
        file_path = os.path.join("dist", full_path)
        if os.path.isfile(file_path):
            return FileResponse(file_path)
        
        # Default to index.html for SPA routing
        return FileResponse("dist/index.html")

@app.get("/judgments", response_model=List[JudgmentResponse])
async def list_judgments():
    # Placeholder for database query
    return []

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
