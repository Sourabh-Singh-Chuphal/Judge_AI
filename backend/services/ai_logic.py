import os
import json
import re
from datetime import date, datetime, timedelta
from typing import Any, Dict, List

try:
    import google.generativeai as genai
except Exception:  # pragma: no cover - optional dependency at runtime
    genai = None

# Use environment variable for security
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
GEMINI_MODEL = os.getenv("GEMINI_MODEL", "gemini-1.5-flash")

DATE_PATTERNS = [
    (r"\b(\d{4})-(\d{2})-(\d{2})\b", "%Y-%m-%d"),
    (r"\b(\d{1,2})[/-](\d{1,2})[/-](\d{4})\b", "%d-%m-%Y"),
    (r"\b(\d{1,2})\s+(January|February|March|April|May|June|July|August|September|October|November|December)\s+(\d{4})\b", "%d %B %Y"),
]

LEGAL_KEYWORDS = (
    "directed", "ordered", "shall", "must", "within", "compliance",
    "allowed", "dismissed", "quashed", "set aside", "disposed"
)

def extract_judgment_data(text: str):
    """
    Main extraction logic. Uses Gemini for complex reasoning 
    and falls back to deterministic patterns for safety.
    """
    if GEMINI_API_KEY and genai:
        try:
            return _extract_with_gemini(text)
        except Exception as e:
            print(f"Gemini Error: {e}. Falling back to pattern matching.")
            return _extract_with_patterns(text)
    else:
        return _extract_with_patterns(text)

def _extract_with_gemini(text: str):
    genai.configure(api_key=GEMINI_API_KEY)
    model = genai.GenerativeModel(GEMINI_MODEL)
    
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
    {text[:8000]}
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
    normalized = normalize_text(text)
    case_match = re.search(
        r"\b((?:WRIT\s+PETITION|W\.?P\.?|CIVIL\s+APPEAL|CRIMINAL\s+APPEAL|O\.?A\.?|MFA|RSA|RFA)\s*(?:NO\.?|NUMBER)?\s*[:.-]?\s*[\w./-]+(?:\s+OF\s+\d{4})?)",
        normalized,
        re.I,
    )
    petitioner = first_match(normalized, [
        r"(?:Petitioner|Appellant|Applicant)\s*[:.-]\s*([^\n\r]+)",
        r"([A-Z][A-Za-z .,&-]{2,})\s+(?:\.\.\.\s*)?(?:Petitioner|Appellant|Applicant)",
    ])
    respondent = first_match(normalized, [
        r"Respondent\s*[:.-]\s*([^\n\r]+)",
        r"([A-Z][A-Za-z .,&-]{2,})\s+(?:\.\.\.\s*)?Respondent",
    ])
    judgment_date = find_judgment_date(normalized)
    directive = find_core_directive(normalized)

    return {
        "case_id": clean_value(case_match.group(1)) if case_match else "UNKNOWN",
        "petitioner": petitioner or "UNKNOWN",
        "respondent": respondent or "UNKNOWN",
        "judgment_date": judgment_date or "UNKNOWN",
        "core_directive": directive or "Manual review required: no clear final directive was detected."
    }

def normalize_text(text: str) -> str:
    text = text.replace("\x00", " ")
    text = re.sub(r"[ \t]+", " ", text)
    text = re.sub(r"\n{3,}", "\n\n", text)
    return text.strip()

def clean_value(value: str) -> str:
    return re.sub(r"\s+", " ", value).strip(" :-\n\t")

def first_match(text: str, patterns: List[str]) -> str:
    for pattern in patterns:
        match = re.search(pattern, text, re.I)
        if match:
            value = clean_value(match.group(1))
            if value:
                return value
    return ""

def find_judgment_date(text: str) -> str:
    focused = first_match(text, [
        r"(?:JUDGMENT\s+DATE|DATE\s+OF\s+JUDGMENT|DATED)\s*[:.-]?\s*([^\n\r]{6,40})",
        r"Pronounced\s+on\s*[:.-]?\s*([^\n\r]{6,40})",
    ])
    candidates = [focused, text[:4000]]
    for candidate in candidates:
        if not candidate:
            continue
        for pattern, fmt in DATE_PATTERNS:
            match = re.search(pattern, candidate, re.I)
            if not match:
                continue
            parsed = parse_date_match(match, fmt)
            if parsed:
                return parsed
    return ""

def parse_date_match(match: re.Match, fmt: str) -> str:
    if fmt == "%Y-%m-%d":
        raw = match.group(0)
    elif fmt == "%d-%m-%Y":
        raw = "-".join(match.groups())
    else:
        raw = " ".join(match.groups())
    try:
        parsed = datetime.strptime(raw.replace("/", "-"), fmt)
        return parsed.date().isoformat()
    except ValueError:
        return ""

def find_deadline_days(text: str) -> int:
    match = re.search(r"\bwithin\s+(\d{1,3})\s+days\b", text, re.I)
    if match:
        return int(match.group(1))
    match = re.search(r"\bwithin\s+(\d{1,2})\s+(?:week|weeks)\b", text, re.I)
    if match:
        return int(match.group(1)) * 7
    match = re.search(r"\bwithin\s+(\d{1,2})\s+(?:month|months)\b", text, re.I)
    if match:
        return int(match.group(1)) * 30
    return 30

def find_compliance_deadline(text: str) -> str:
    focused = first_match(text, [
        r"Compliance\s+Deadline\s*[:.-]\s*([^\n\r]{6,40})",
        r"(?:on\s+or\s+before|by)\s+(\d{4}-\d{2}-\d{2})",
    ])
    for candidate in [focused]:
        if not candidate:
            continue
        for pattern, fmt in DATE_PATTERNS:
            match = re.search(pattern, candidate, re.I)
            if not match:
                continue
            parsed = parse_date_match(match, fmt)
            if parsed:
                return parsed
    return ""

def find_core_directive(text: str) -> str:
    sentences = split_sentences(text)
    for sentence in reversed(sentences[-80:]):
        lowered = sentence.lower()
        if any(keyword in lowered for keyword in LEGAL_KEYWORDS) and len(sentence) > 25:
            return clean_value(sentence)[:650]
    return ""

def split_sentences(text: str) -> List[str]:
    compact = re.sub(r"\s+", " ", text)
    return [s.strip() for s in re.split(r"(?<=[.!?])\s+", compact) if s.strip()]

def build_action_plan(extraction: Dict[str, Any], text: str) -> Dict[str, Any]:
    normalized = normalize_text(text)
    judgment_date = extraction.get("judgment_date") or "UNKNOWN"
    days = find_deadline_days(normalized)
    explicit_deadline = find_compliance_deadline(normalized)
    try:
        start = datetime.strptime(judgment_date, "%Y-%m-%d").date()
    except ValueError:
        start = date.today()
    try:
        compliance_deadline = datetime.strptime(explicit_deadline, "%Y-%m-%d").date()
    except ValueError:
        compliance_deadline = start + timedelta(days=days)

    directive = extraction.get("core_directive") or "Review the judgment text and identify the operative direction."
    lower = normalized.lower()
    path = "APPEAL" if any(word in lower for word in ("appeal allowed", "impugned order", "set aside", "quashed")) else "COMPLY"
    risks: List[str] = []
    if days <= 15:
        risks.append(f"Short compliance window detected: {days} days from the judgment date.")
    if any(word in lower for word in ("contempt", "costs", "penalty", "fine", "interest")):
        risks.append("Financial or adverse-action language appears in the judgment; verify exposure before approval.")
    if extraction.get("case_id") == "UNKNOWN":
        risks.append("Case number was not confidently extracted and needs manual verification.")
    if not risks:
        risks.append("No high-priority risk phrase was detected by the local analyzer.")

    return {
        "path": path,
        "summary": directive,
        "compliance_deadline": compliance_deadline.isoformat(),
        "responsible_department": infer_department(normalized),
        "steps": [
            {"description": "Verify extracted parties, case number, operative order, and limitation dates against the PDF.", "deadline": start + timedelta(days=min(3, days))},
            {"description": "Assign the matter to the responsible department and request the first compliance note.", "deadline": start + timedelta(days=max(5, min(days // 2, days)))},
            {"description": "File compliance report or obtain approval for appeal/escalation before the deadline.", "deadline": compliance_deadline},
        ],
        "risks": risks,
    }

def infer_department(text: str) -> str:
    lowered = text.lower()
    mappings = [
        (("land", "revenue", "mutation", "survey"), "Revenue Department"),
        (("service", "appointment", "salary", "pension", "promotion"), "Personnel / Service Department"),
        (("environment", "pollution", "forest"), "Environment Department"),
        (("tax", "gst", "assessment"), "Finance / Tax Department"),
        (("police", "fir", "criminal"), "Home Department"),
    ]
    for keywords, department in mappings:
        if any(keyword in lowered for keyword in keywords):
            return department
    return "Relevant Nodal Office"

def retrieve_relevant_snippets(text: str, question: str, limit: int = 4) -> List[str]:
    sentences = split_sentences(text)
    terms = {t.lower() for t in re.findall(r"[A-Za-z][A-Za-z0-9]{2,}", question)}
    scored = []
    for sentence in sentences:
        lowered = sentence.lower()
        score = sum(1 for term in terms if term in lowered)
        if any(keyword in lowered for keyword in LEGAL_KEYWORDS):
            score += 1
        if score:
            scored.append((score, len(sentence), sentence))
    scored.sort(key=lambda item: (-item[0], item[1]))
    return [clean_value(item[2])[:700] for item in scored[:limit]]

def answer_question_from_text(text: str, question: str) -> Dict[str, Any]:
    normalized = normalize_text(text)
    targeted = answer_targeted_question(normalized, question)
    if targeted:
        return targeted

    snippets = retrieve_relevant_snippets(normalized, question)
    if not snippets:
        return {
            "answer": "I could not find support for that in the uploaded judgment. Please verify the PDF manually or ask about parties, dates, deadlines, directives, risks, or compliance steps.",
            "sources": [],
            "used_model": "local-grounded",
        }

    if GEMINI_API_KEY and genai:
        try:
            answer = _answer_with_gemini(question, snippets)
            return {"answer": answer, "sources": snippets, "used_model": GEMINI_MODEL}
        except Exception as e:
            print(f"Gemini chat error: {e}. Falling back to grounded snippets.")

    joined = " ".join(snippets[:2])
    return {
        "answer": f"Based on the uploaded judgment, {joined}",
        "sources": snippets,
        "used_model": "local-grounded",
    }

def answer_targeted_question(text: str, question: str) -> Dict[str, Any]:
    lower = question.lower()
    extracted = _extract_with_patterns(text)
    deadline = find_compliance_deadline(text) or build_action_plan(extracted, text)["compliance_deadline"]

    if any(term in lower for term in ("case number", "case no", "case id", "petition number", "appeal number")):
        value = extracted.get("case_id") or "UNKNOWN"
        if value != "UNKNOWN":
            return {
                "answer": f"The case number appears to be {value}.",
                "sources": retrieve_relevant_snippets(text, value, limit=2) or [value],
                "used_model": "local-grounded",
            }

    if any(term in lower for term in ("petitioner", "appellant", "applicant")):
        value = extracted.get("petitioner") or "UNKNOWN"
        if value != "UNKNOWN":
            return {
                "answer": f"The petitioner/applicant/appellant appears to be {value}.",
                "sources": retrieve_relevant_snippets(text, value, limit=2) or [value],
                "used_model": "local-grounded",
            }

    if any(term in lower for term in ("parties", "party", "between whom")):
        petitioner = extracted.get("petitioner") or "UNKNOWN"
        respondent = extracted.get("respondent") or "UNKNOWN"
        if petitioner != "UNKNOWN" or respondent != "UNKNOWN":
            sources = []
            if petitioner != "UNKNOWN":
                sources.extend(retrieve_relevant_snippets(text, petitioner, limit=1) or [petitioner])
            if respondent != "UNKNOWN":
                sources.extend(retrieve_relevant_snippets(text, respondent, limit=1) or [respondent])
            return {
                "answer": f"The parties appear to be {petitioner} versus {respondent}.",
                "sources": sources,
                "used_model": "local-grounded",
            }

    if "respondent" in lower:
        value = extracted.get("respondent") or "UNKNOWN"
        if value != "UNKNOWN":
            return {
                "answer": f"The respondent appears to be {value}.",
                "sources": retrieve_relevant_snippets(text, value, limit=2) or [value],
                "used_model": "local-grounded",
            }

    if any(term in lower for term in ("deadline", "due date", "compliance date", "within how many")):
        snippets = retrieve_relevant_snippets(text, "Compliance Deadline within days deadline", limit=3)
        return {
            "answer": f"The compliance deadline appears to be {deadline}. Please verify it against the source excerpt before approval.",
            "sources": snippets,
            "used_model": "local-grounded",
        }

    return {}

def _answer_with_gemini(question: str, snippets: List[str]) -> str:
    model = genai.GenerativeModel(GEMINI_MODEL)
    prompt = f"""
You are JudgeAI's legal review assistant. Answer only from the provided judgment excerpts.
If the excerpts do not support the answer, say that the judgment text does not provide enough information.
Keep the answer concise and mention any date, party, deadline, or directive exactly as supported.

QUESTION:
{question}

JUDGMENT EXCERPTS:
{json.dumps(snippets, ensure_ascii=False)}
"""
    response = model.generate_content(prompt)
    return response.text.strip()
