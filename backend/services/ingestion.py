import fitz  # PyMuPDF
import pdfplumber
import cv2
import numpy as np

def extract_text_from_pdf(file_path: str):
    """
    Extracts text from digital PDFs. PyMuPDF is fast, but some generated PDFs
    expose incomplete text there, so keep pdfplumber as a quality fallback.
    """
    pymupdf_text = ""
    doc = fitz.open(file_path)
    for page in doc:
        pymupdf_text += page.get_text()

    try:
        with pdfplumber.open(file_path) as pdf:
            pdfplumber_text = "\n".join(page.extract_text() or "" for page in pdf.pages)
    except Exception:
        pdfplumber_text = ""

    return pdfplumber_text if len(pdfplumber_text.strip()) > len(pymupdf_text.strip()) else pymupdf_text

def extract_tables_from_pdf(file_path: str):
    """
    Extracts tables using pdfplumber.
    """
    with pdfplumber.open(file_path) as pdf:
        tables = []
        for page in pdf.pages:
            tables.extend(page.extract_tables())
    return tables

def preprocess_image_for_ocr(image_path: str):
    """
    Uses OpenCV to deskew and denoise image for Tesseract OCR.
    """
    img = cv2.imread(image_path)
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    
    # Denoise
    denoised = cv2.fastNlMeansDenoising(gray, None, 10, 7, 21)
    
    # Threshold
    _, thresh = cv2.threshold(denoised, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)
    
    return thresh
