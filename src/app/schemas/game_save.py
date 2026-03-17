"""Pydantic schemas for GameSave model.

Validates save slot data and serializes responses for the game save API.
"""
from datetime import datetime
from pydantic import BaseModel, Field, ConfigDict, field_validator


class GameSaveCreate(BaseModel):
    """Schema for creating/updating a game save.

    Validates slot_number is between 1 and 3.
    """
    slot_number: int = Field(..., description="Save slot number (1-3)")
    slot_name: str = Field(default="Save Slot", max_length=50, description="Display name")
    score: int = Field(default=0, ge=0, description="Current score")
    high_score: int = Field(default=0, ge=0, description="Highest score achieved")
    level: int = Field(default=1, ge=1, le=10, description="Current level")
    lives: int = Field(default=3, ge=0, description="Remaining lives")

    @field_validator('slot_number')
    @classmethod
    def validate_slot_number(cls, v: int) -> int:
        if v < 1 or v > 3:
            raise ValueError('slot_number must be between 1 and 3')
        return v


class GameSaveResponse(BaseModel):
    """Schema for game save API responses."""
    id: int
    slot_number: int
    slot_name: str
    score: int
    high_score: int
    level: int
    lives: int
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)
