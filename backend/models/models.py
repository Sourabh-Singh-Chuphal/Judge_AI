from sqlalchemy import Column, String, Float, Boolean, DateTime, JSON, ForeignKey
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship
import datetime
import hashlib

Base = declarative_base()

class JudgmentModel(Base):
    __tablename__ = "judgments"
    
    id = Column(String, primary_key=True, index=True)
    filename = Column(String)
    extraction_data = Column(JSON)  # Stores the JSON extraction
    status = Column(String, default="PENDING")  # PENDING, APPROVED, REJECTED
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    verified_at = Column(DateTime, nullable=True)
    verified_by = Column(String, nullable=True)

class AuditLogModel(Base):
    __tablename__ = "audit_log"
    
    id = Column(String, primary_key=True, index=True)
    action = Column(String)
    actor = Column(String)
    case_id = Column(String, ForeignKey("judgments.id"))
    timestamp = Column(DateTime, default=datetime.datetime.utcnow)
    prev_hash = Column(String)
    current_hash = Column(String)
    
    def calculate_hash(self):
        data = f"{self.id}{self.action}{self.actor}{self.case_id}{self.timestamp}{self.prev_hash}"
        return hashlib.sha256(data.encode()).hexdigest()
