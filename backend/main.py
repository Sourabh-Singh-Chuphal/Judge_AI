from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
import os
from .schemas.judgment import JudgmentResponse, JudgmentExtractionSchema, ExtractedField, ActionPlan, ActionStep
from .services.ingestion import extract_text_from_pdf
from datetime import date, datetime, timedelta
from typing import List
import uuid
import re
import shutil

app = FastAPI(title="JudgeAI API", version="0.1.0")

# Enable CORS for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Root route handled by frontend catch-all below

@app.post("/upload", response_model=JudgmentResponse)
async def upload_judgment(file: UploadFile = File(...)):
    if not file.filename.endswith('.pdf'):
        raise HTTPException(status_code=400, detail="Only PDF files are accepted")
    
    # Save file temporarily to process
    temp_path = f"temp_{file.filename}"
    with open(temp_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    
    try:
        # Extract text
        text = extract_text_from_pdf(temp_path)
        
        # Simple AI extraction logic (Simulated NLP)
        # In a real app, this would use spaCy or an LLM
        judgment_id = str(uuid.uuid4())
        
        # Extract Case ID (e.g., WP 123/2024 or CIVIL APPEAL 1/2024)
        case_match = re.search(r"(WRIT PETITION|CIVIL APPEAL|O\.A\.)\s+(?:NO\.\s+)?([\w/]+)", text, re.I)
        case_id = case_match.group(0) if case_match else "UNKNOWN-ID"
        
        # Extract Parties
        petitioner_match = re.search(r"Petitioner:\s*(.*)|Appellant:\s*(.*)|Applicant:\s*(.*)", text, re.I)
        petitioner = petitioner_match.group(1) or petitioner_match.group(2) or petitioner_match.group(3) or "Unknown Petitioner"
        petitioner = petitioner.split('\n')[0].strip()
        
        respondent_match = re.search(r"Respondent:\s*(.*)", text, re.I)
        respondent = respondent_match.group(1).split('\n')[0].strip() if respondent_match else "State Respondent"
        
        # Extract Dates
        date_match = re.search(r"JUDGMENT DATE:\s*(\d{4}-\d{2}-\d{2})", text, re.I)
        judgment_date = date_match.group(1) if date_match else str(date.today())
        
        # Compliance Logic
        deadline_match = re.search(r"within (\d+) days", text, re.I)
        days = int(deadline_match.group(1)) if deadline_match else 30
        
        dt_obj = datetime.strptime(judgment_date, "%Y-%m-%d")
        compliance_dt = (dt_obj + timedelta(days=days)).date()
        
        # Dynamic Action Plan
        risks = []
        if days < 30:
            risks.append("Urgent deadline: High risk of non-compliance if process not started immediately.")
        if "penalty" in text.lower():
            risks.append("Financial penalty involved: Ensure fund allocation is prioritized.")
        
        mock_extraction = JudgmentExtractionSchema(
            case_id=ExtractedField(value=case_id, confidence=0.95),
            petitioner=ExtractedField(value=petitioner, confidence=0.92),
            respondent=ExtractedField(value=respondent, confidence=0.89),
            judgment_date=ExtractedField(value=judgment_date, confidence=0.98),
            compliance_deadline=ExtractedField(value=str(compliance_dt), confidence=0.85),
            responsible_department=ExtractedField(value="Relevant Nodal Office", confidence=0.70),
            core_directive=ExtractedField(value=f"Compliance required within {days} days as per court order.", confidence=0.75)
        )
        
        mock_plan = ActionPlan(
            summary=f"The court directs {petitioner} and {respondent} to comply with the order by {compliance_dt}.",
            path="COMPLY",
            steps=[
                ActionStep(description="Initial case filing and departmental notification", deadline=(dt_obj + timedelta(days=7)).date()),
                ActionStep(description="Final compliance and report submission", deadline=compliance_dt)
            ],
            risks=risks if risks else ["No high-priority risks detected."]
        )
        
        return JudgmentResponse(
            id=judgment_id,
            filename=file.filename,
            extraction=mock_extraction,
            action_plan=mock_plan,
            status="PENDING",
            created_at=date.today()
        )
    finally:
        if os.path.exists(temp_path):
            os.remove(temp_path)

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
