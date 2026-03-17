"""GameSave model for Dig Dug save slots.

Stores game progress in up to 3 save slots. Each slot tracks
score, high score, level, and lives so players can resume across sessions.
"""
from datetime import datetime
from sqlalchemy import String, func
from sqlalchemy.orm import Mapped, mapped_column
from .base import Base


class GameSave(Base):
    """Game save slot for Dig Dug.

    Attributes:
        id: Primary key
        slot_number: Save slot (1-3), unique
        slot_name: Display name for the slot
        score: Current score
        high_score: Highest score achieved
        level: Current level (1-10)
        lives: Remaining lives
        created_at: When the save was first created
        updated_at: When the save was last modified
    """
    __tablename__ = 'game_saves'

    id: Mapped[int] = mapped_column(primary_key=True)
    slot_number: Mapped[int] = mapped_column(unique=True, nullable=False)
    slot_name: Mapped[str] = mapped_column(String(50), default="Save Slot")
    score: Mapped[int] = mapped_column(default=0)
    high_score: Mapped[int] = mapped_column(default=0)
    level: Mapped[int] = mapped_column(default=1)
    lives: Mapped[int] = mapped_column(default=3)
    created_at: Mapped[datetime] = mapped_column(default=func.now())
    updated_at: Mapped[datetime] = mapped_column(default=func.now(), onupdate=func.now())

    def __repr__(self) -> str:
        return f'<GameSave slot={self.slot_number} level={self.level} score={self.score}>'
