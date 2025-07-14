from pydantic import BaseModel, Field, EmailStr
from typing import Optional, List
from datetime import datetime
from enum import Enum

class SpecializationEnum(str, Enum):
    """České lékařské specializace"""
    PRAKTICKY_LEKAR = "prakticky_lekar"
    KARDIOLOG = "kardiolog"
    DERMATOLOG = "dermatolog"
    NEUROLOG = "neurolog"
    ORTOPED = "ortoped"
    GYNEKOLOG = "gynekolog"
    UROLOG = "urolog"
    PSYCHIATR = "psychiatr"
    OFTALMOLOG = "oftalmolog"
    ORL = "orl"

class Doctor(BaseModel):
    """Model pro lékaře v českém zdravotnictví"""
    id: int
    first_name: str = Field(..., min_length=2, max_length=50)
    last_name: str = Field(..., min_length=2, max_length=50)
    email: EmailStr
    phone: str = Field(..., regex=r"^\+420\d{9}$")
    
    # Profesní informace
    specialization: SpecializationEnum
    license_number: str = Field(..., description="Číslo licence ČLK")
    ico: Optional[str] = Field(None, regex=r"^\d{8}$")
    
    # Adresa ordinace
    street_address: str
    city: str
    postal_code: str = Field(..., regex=r"^\d{5}$")
    region: str = Field(..., description="Kraj ČR")
    
    # Provozní informace
    accepts_new_patients: bool = True
    has_online_booking: bool = False
    telemedicine_available: bool = False
    
    # Hodnocení
    rating: Optional[float] = Field(None, ge=1.0, le=5.0)
    review_count: int = 0
    
    # Metadata
    created_at: datetime
    updated_at: datetime
    is_verified: bool = False

    class Config:
        json_encoders = {
            datetime: lambda dt: dt.isoformat()
        }
