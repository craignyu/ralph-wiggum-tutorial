"""GameSave controller with business logic.

Manages save slot CRUD operations. Uses upsert pattern for
creating or updating saves by slot number.
"""
from sqlalchemy import select
from ..models import GameSave, db
from ..schemas.game_save import GameSaveCreate


class GameSaveController:
    """Controller for GameSave resource operations."""

    @staticmethod
    def get_all() -> list[GameSave]:
        """Retrieve all game saves ordered by slot number."""
        stmt = select(GameSave).order_by(GameSave.slot_number)
        return list(db.session.execute(stmt).scalars())

    @staticmethod
    def get_by_slot(slot_number: int) -> GameSave | None:
        """Retrieve a game save by slot number."""
        stmt = select(GameSave).where(GameSave.slot_number == slot_number)
        return db.session.execute(stmt).scalar_one_or_none()

    @staticmethod
    def upsert(data: GameSaveCreate) -> tuple[GameSave, bool]:
        """Insert or update a game save by slot number.

        Returns:
            Tuple of (GameSave instance, was_created: bool)
        """
        existing = GameSaveController.get_by_slot(data.slot_number)
        if existing:
            existing.slot_name = data.slot_name
            existing.score = data.score
            existing.high_score = data.high_score
            existing.level = data.level
            existing.lives = data.lives
            db.session.commit()
            return existing, False
        else:
            save = GameSave(
                slot_number=data.slot_number,
                slot_name=data.slot_name,
                score=data.score,
                high_score=data.high_score,
                level=data.level,
                lives=data.lives,
            )
            db.session.add(save)
            db.session.commit()
            return save, True

    @staticmethod
    def delete(slot_number: int) -> bool:
        """Delete a game save by slot number.

        Returns:
            True if the save existed and was deleted.
        """
        save = GameSaveController.get_by_slot(slot_number)
        if save:
            db.session.delete(save)
            db.session.commit()
            return True
        return False
