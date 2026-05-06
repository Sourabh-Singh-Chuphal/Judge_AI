from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse, Response
import os
from .schemas.judgment import (
    JudgmentResponse,
    JudgmentExtractionSchema,
    ExtractedField,
    ActionPlan,
    ActionStep,
    ChatRequest,
    ChatResponse,
)
from .services.ingestion import extract_text_from_pdf
from .services.ai_logic import answer_question_from_text, build_action_plan, extract_judgment_data
from datetime import date
from typing import List
import uuid
import shutil
import tempfile

app = FastAPI(title="JudgeAI API", version="0.1.0")
DOCUMENT_STORE = {}
JUDGMENT_STORE = {}
PDF_STORE = {}
UPLOAD_DIR = os.path.join(os.path.dirname(__file__), "uploads")
os.makedirs(UPLOAD_DIR, exist_ok=True)

def pdf_path_for(judgment_id: str) -> str:
    return os.path.join(UPLOAD_DIR, f"{judgment_id}.pdf")

def text_path_for(judgment_id: str) -> str:
    return os.path.join(UPLOAD_DIR, f"{judgment_id}.txt")

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
    if not file.filename or not file.filename.lower().endswith('.pdf'):
        raise HTTPException(status_code=400, detail="Only PDF files are accepted")
    
    # Save file temporarily to process
    temp_dir = tempfile.gettempdir()
    temp_path = os.path.join(temp_dir, f"judgeai_{uuid.uuid4()}.pdf")
    with open(temp_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    
    try:
        # Extract text
        text = extract_text_from_pdf(temp_path)
        if not text.strip():
            raise HTTPException(status_code=422, detail="No selectable text found in the PDF. OCR support is not enabled for this file.")

        judgment_id = str(uuid.uuid4())
        extracted = extract_judgment_data(text)
        plan_data = build_action_plan(extracted, text)
        
        extraction = JudgmentExtractionSchema(
            case_id=ExtractedField(value=extracted.get("case_id", "UNKNOWN"), confidence=0.80 if extracted.get("case_id") != "UNKNOWN" else 0.35),
            petitioner=ExtractedField(value=extracted.get("petitioner", "UNKNOWN"), confidence=0.78 if extracted.get("petitioner") != "UNKNOWN" else 0.35),
            respondent=ExtractedField(value=extracted.get("respondent", "UNKNOWN"), confidence=0.78 if extracted.get("respondent") != "UNKNOWN" else 0.35),
            judgment_date=ExtractedField(value=extracted.get("judgment_date", "UNKNOWN"), confidence=0.88 if extracted.get("judgment_date") != "UNKNOWN" else 0.35),
            compliance_deadline=ExtractedField(value=plan_data["compliance_deadline"], confidence=0.72),
            responsible_department=ExtractedField(value=plan_data["responsible_department"], confidence=0.65),
            core_directive=ExtractedField(value=extracted.get("core_directive", "Manual review required."), confidence=0.70),
            action_path=plan_data["path"],
        )
        
        action_plan = ActionPlan(
            summary=plan_data["summary"],
            path=plan_data["path"],
            steps=[
                ActionStep(description=step["description"], deadline=step["deadline"])
                for step in plan_data["steps"]
            ],
            risks=plan_data["risks"],
        )

        response = JudgmentResponse(
            id=judgment_id,
            filename=file.filename,
            extraction=extraction,
            action_plan=action_plan,
            status="PENDING",
            created_at=date.today(),
            preview_text=text[:12000],
        )
        DOCUMENT_STORE[judgment_id] = text
        JUDGMENT_STORE[judgment_id] = response
        with open(temp_path, "rb") as pdf_file:
            PDF_STORE[judgment_id] = pdf_file.read()
        with open(pdf_path_for(judgment_id), "wb") as saved_pdf:
            saved_pdf.write(PDF_STORE[judgment_id])
        with open(text_path_for(judgment_id), "w", encoding="utf-8") as saved_text:
            saved_text.write(text)
        return response
    finally:
        if os.path.exists(temp_path):
            os.remove(temp_path)

@app.post("/chat", response_model=ChatResponse)
async def chat_with_judgment(request: ChatRequest):
    question = request.question.strip()
    if not question:
        raise HTTPException(status_code=400, detail="Question cannot be empty")

    text = DOCUMENT_STORE.get(request.judgment_id)
    if not text:
        text_path = text_path_for(request.judgment_id)
        if os.path.exists(text_path):
            with open(text_path, "r", encoding="utf-8") as saved_text:
                text = saved_text.read()
            DOCUMENT_STORE[request.judgment_id] = text
        else:
            raise HTTPException(status_code=404, detail="Judgment text is not available. Upload the PDF again before chatting.")

    return answer_question_from_text(text, question)

@app.get("/judgments", response_model=List[JudgmentResponse])
async def list_judgments():
    return list(JUDGMENT_STORE.values())

@app.get("/judgments/{judgment_id}/pdf")
async def get_judgment_pdf(judgment_id: str):
    pdf_bytes = PDF_STORE.get(judgment_id)
    if not pdf_bytes:
        saved_pdf_path = pdf_path_for(judgment_id)
        if os.path.exists(saved_pdf_path):
            with open(saved_pdf_path, "rb") as saved_pdf:
                pdf_bytes = saved_pdf.read()
            PDF_STORE[judgment_id] = pdf_bytes
    if not pdf_bytes:
        raise HTTPException(status_code=404, detail="PDF preview is not available. Upload the PDF again.")
    return Response(content=pdf_bytes, media_type="application/pdf")

@app.get("/judgments/{judgment_id}/text")
async def get_judgment_text(judgment_id: str):
    text = DOCUMENT_STORE.get(judgment_id)
    if not text:
        saved_text_path = text_path_for(judgment_id)
        if os.path.exists(saved_text_path):
            with open(saved_text_path, "r", encoding="utf-8") as saved_text:
                text = saved_text.read()
            DOCUMENT_STORE[judgment_id] = text
    if not text:
        raise HTTPException(status_code=404, detail="Text preview is not available. Upload the PDF again.")
    return {"text": text[:12000]}

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

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
