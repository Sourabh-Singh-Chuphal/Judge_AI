# 🏛️ JudgeAI: Redefining Decision Reviews with AI

JudgeAI is a sophisticated, audit-ready platform designed to streamline legal judgment processing and compliance monitoring. It leverages advanced AI to extract key directives from legal documents, generate actionable compliance plans, and provide a high-confidence review interface for legal professionals.

![Landing Page Preview](https://via.placeholder.com/1200x600/1a1a1a/ffffff?text=JudgeAI+Dashboard+Preview)

## 🌟 Key Features

- **📄 Smart Document Processing**: Automated extraction of case IDs, petitioners, respondents, and critical deadlines from PDF judgments.
- **⚖️ AI-Powered Directives**: Intelligent identification of core judicial directives and compliance requirements.
- **📋 Actionable Compliance Plans**: Automated generation of step-by-step action plans with risk assessment and deadlines.
- **🔍 Side-by-Side Auditor View**: A professional interface for manual verification with confidence scores for every AI-extracted field.
- **📑 Comprehensive Audit Logs**: Full traceability of all processed judgments and human interventions.

## 🛠️ Technology Stack

### Frontend
- **Framework**: [React 19](https://react.dev/)
- **Build Tool**: [Vite](https://vitejs.dev/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Routing**: [React Router 7](https://reactrouter.com/)

### Backend
- **Framework**: [FastAPI](https://fastapi.tiangolo.com/)
- **Language**: [Python 3.10+](https://www.python.org/)
- **Document Processing**: [PyMuPDF](https://pymupdf.readthedocs.io/), [pdfplumber](https://github.com/jsvine/pdfplumber)
- **OCR & NLP**: [Tesseract](https://github.com/tesseract-ocr/tesseract), [spaCy](https://spacy.io/)

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+)
- Python 3.10+
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/Sourabh-Singh-Chuhphal/Judge_AI.git
   cd Judge_AI
   ```

2. **Setup Frontend**
   ```bash
   npm install
   ```

3. **Setup Backend**
   ```bash
   pip install -r backend/requirements.txt
   ```

### Running Locally

1. **Start Backend Server**
   ```bash
   python -m backend.main
   ```
   The API will be available at `http://localhost:8000`.

2. **Start Frontend Dev Server**
   ```bash
   npm run dev
   ```
   The application will be available at `http://localhost:5173`.

## 🚢 Deployment

The project is structured to be easily deployed to **Google Cloud Run** (Backend) and **Vercel** or **Static Hosting** (Frontend).

### Google Cloud Run (Backend)
The backend is containerized and ready for deployment.
```bash
gcloud run deploy judge-ai-backend --source .
```

## 📄 License
Distributed under the MIT License. See `LICENSE` for more information.

---
Built with ❤️ for the Modern Legal Professional.
