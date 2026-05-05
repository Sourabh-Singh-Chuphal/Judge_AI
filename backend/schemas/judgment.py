from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import date

class ExtractedField(BaseModel):
    value: str
    confidence: float = Field(..., ge=0.0, le=1.0)
    is_verified: bool = False

class JudgmentExtractionSchema(BaseModel):
    case_id: ExtractedField
    petitioner: ExtractedField
    respondent: ExtractedField
    judgment_date: ExtractedField
    compliance_deadline: ExtractedField
    responsible_department: ExtractedField
    core_directive: ExtractedField
    action_path: str = "COMPLY"  # Default
    
class ActionStep(BaseModel):
    description: str
    deadline: Optional[date] = None

class ActionPlan(BaseModel):
    summary: str
    steps: List[ActionStep]
    risks: List[str]
    path: str  # COMPLY or APPEAL

class JudgmentResponse(BaseModel):
    id: str
    filename: str
    extraction: JudgmentExtractionSchema
    action_plan: Optional[ActionPlan] = None
    status: str  # PENDING, APPROVED, REJECTED
    created_at: date
