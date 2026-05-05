import google.generativeai as genai
import os
import json
import re

# Use environment variable for security
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

def extract_judgment_data(text: str):
    """
    Main extraction logic. Uses Gemini for complex reasoning 
    and falls back to deterministic patterns for safety.
    """
    if GEMINI_API_KEY:
        try:
            return _extract_with_gemini(text)
        except Exception as e:
            print(f"Gemini Error: {e}. Falling back to pattern matching.")
            return _extract_with_patterns(text)
    else:
        return _extract_with_patterns(text)

def _extract_with_gemini(text: str):
    genai.configure(api_key=GEMINI_API_KEY)
    model = genai.GenerativeModel('gemini-1.5-flash')
    
    prompt = f"""
    You are a professional legal auditor. Extract the following data from the court judgment text provided below.
    
    RULES:
    1. Only use information present in the text.
    2. If a value is missing, return "NOT FOUND".
    3. Return valid JSON only.
    
    FIELDS TO EXTRACT:
    - case_id
    - petitioner
    - respondent
    - judgment_date (YYYY-MM-DD)
    - compliance_deadline (YYYY-MM-DD)
    - core_directive (The main order given by the court)
    
    TEXT:
    {text[:8000]}  # Limit text to avoid token issues
    """
    
    response = model.generate_content(prompt)
    # Extract JSON from response
    json_match = re.search(r'\{.*\}', response.text, re.DOTALL)
    if json_match:
        return json.loads(json_match.group(0))
    raise ValueError("Invalid AI Response")

def _extract_with_patterns(text: str):
    """
    Fallback deterministic logic (Safe, No Hallucinations)
    """
    case_match = re.search(r"(WRIT PETITION|CIVIL APPEAL|O\.A\.)\s+(?:NO\.\s+)?([\w/]+)", text, re.I)
    petitioner_match = re.search(r"Petitioner:\s*(.*)|Appellant:\s*(.*)|Applicant:\s*(.*)", text, re.I)
    respondent_match = re.search(r"Respondent:\s*(.*)", text, re.I)
    date_match = re.search(r"JUDGMENT DATE:\s*(\d{4}-\d{2}-\d{2})", text, re.I)
    
    return {
        "case_id": case_match.group(0) if case_match else "UNKNOWN",
        "petitioner": (petitioner_match.group(1) or petitioner_match.group(2) or petitioner_match.group(3) or "UNKNOWN").strip(),
        "respondent": respondent_match.group(1).strip() if respondent_match else "UNKNOWN",
        "judgment_date": date_match.group(1) if date_match else "UNKNOWN",
        "core_directive": "Manual review required: AI used pattern matching."
    }
