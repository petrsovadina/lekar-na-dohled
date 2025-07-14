from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime
from enum import Enum

class AppointmentStatusEnum(str, Enum):
    SCHEDULED = "scheduled"    # Naplánováno
    CONFIRMED = "confirmed"    # Potvrzeno
    IN_PROGRESS = "in_progress"  # Probíhá
    COMPLETED = "completed"    # Dokončeno
    CANCELLED = "cancelled"    # Zrušeno
    NO_SHOW = "no_show"       # Nedostavil se

class AppointmentTypeEnum(str, Enum):
    IN_PERSON = "in_person"    # Osobně
    TELEMEDICINE = "telemedicine"  # Telemedicína
    PHONE_CALL = "phone_call"  # Telefonicky

class Appointment(BaseModel):
    """Model pro lékařské schůzky"""
    id: int
    patient_id: int = Field(..., description="ID pacienta")
    doctor_id: int = Field(..., description="ID lékaře")
    
    # Časové informace
    scheduled_datetime: datetime = Field(..., description="Naplánovaný čas")
    duration_minutes: int = Field(30, ge=15, le=120, description="Délka v minutách")
    
    # Typ a stav
    appointment_type: AppointmentTypeEnum = AppointmentTypeEnum.IN_PERSON
    status: AppointmentStatusEnum = AppointmentStatusEnum.SCHEDULED
    
    # Detaily schůzky
    reason: str = Field(..., min_length=10, max_length=500, description="Důvod návštěvy")
    notes: Optional[str] = Field(None, max_length=1000, description="Poznámky lékaře")
    
    # Telemedicína
    video_call_url: Optional[str] = Field(None, description="Link na videohovor")
    
    # Platba
    price_czk: Optional[float] = Field(None, ge=0, description="Cena v Kč")
    is_covered_by_insurance: bool = True
    
    # Metadata
    created_at: datetime
    updated_at: datetime
    reminder_sent: bool = False
    
    # Hodnocení po návštěvě
    patient_rating: Optional[int] = Field(None, ge=1, le=5)
    patient_feedback: Optional[str] = Field(None, max_length=500)
    
    class Config:
        json_encoders = {
            datetime: lambda dt: dt.isoformat()
        }

class AppointmentCreate(BaseModel):
    """Model pro vytvoření nové schůzky"""
    doctor_id: int
    scheduled_datetime: datetime
    appointment_type: AppointmentTypeEnum
    reason: str = Field(..., min_length=10, max_length=500)
    duration_minutes: int = 30
