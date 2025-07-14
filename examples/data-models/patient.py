from pydantic import BaseModel, Field, EmailStr
from typing import Optional, List
from datetime import datetime, date
from enum import Enum

class GenderEnum(str, Enum):
    MALE = "male"
    FEMALE = "female"
    OTHER = "other"

class InsuranceCompanyEnum(str, Enum):
    """České zdravotní pojišťovny"""
    VZP = "111"  # Všeobecná zdravotní pojišťovna
    VOZP = "201"  # Vojenská zdravotní pojišťovna
    CPZP = "205"  # Česká průmyslová zdravotní pojišťovna
    OZP = "207"  # Oborová zdravotní pojišťovna
    ZPSKoda = "209"  # Zdravotní pojišťovna Škoda
    ZPMV = "211"  # Zdravotní pojišťovna ministerstva vnitra
    RBP = "213"  # Revírní bratrská pokladna

class Patient(BaseModel):
    """Model pro pacienty"""
    id: int
    first_name: str = Field(..., min_length=2, max_length=50)
    last_name: str = Field(..., min_length=2, max_length=50)
    email: EmailStr
    phone: Optional[str] = Field(None, regex=r"^\+420\d{9}$")
    
    # Osobní informace
    date_of_birth: date
    gender: GenderEnum
    birth_number: str = Field(..., regex=r"^\d{6}\/\d{4}$", description="Rodné číslo")
    
    # Zdravotní pojištění
    insurance_company: InsuranceCompanyEnum
    insurance_number: str = Field(..., description="Číslo pojištěnce")
    
    # Adresa
    street_address: Optional[str] = None
    city: Optional[str] = None
    postal_code: Optional[str] = Field(None, regex=r"^\d{5}$")
    
    # Zdravotní informace
    allergies: List[str] = []
    chronic_conditions: List[str] = []
    current_medications: List[str] = []
    emergency_contact: Optional[str] = None
    
    # Metadata
    created_at: datetime
    updated_at: datetime
    gdpr_consent: bool = Field(..., description="Souhlas se zpracováním osobních údajů")
    
    class Config:
        json_encoders = {
            datetime: lambda dt: dt.isoformat(),
            date: lambda d: d.isoformat()
        }
