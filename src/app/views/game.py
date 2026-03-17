"""Game views (routes).

Provides the /game HTML page and JSON API for game save management.
The page renders a React Island mount point for the Dig Dug game.
"""
from flask import Blueprint, render_template, jsonify, request, abort
from pydantic import ValidationError
from ..controllers.game_save import GameSaveController
from ..schemas.game_save import GameSaveCreate, GameSaveResponse

game_bp = Blueprint('game', __name__)


@game_bp.route('/game')
def index():  # type: ignore[no-untyped-def]
    """Render the Dig Dug game page with React island mount point."""
    return render_template('game/index.html')


@game_bp.route('/api/game/saves', methods=['GET'])
def api_list_saves():  # type: ignore[no-untyped-def]
    """Get all game saves as JSON."""
    saves = GameSaveController.get_all()
    return jsonify([GameSaveResponse.model_validate(s).model_dump() for s in saves])


@game_bp.route('/api/game/saves', methods=['POST'])
def api_upsert_save():  # type: ignore[no-untyped-def]
    """Create or update a game save.

    Returns:
        201: New save created
        200: Existing save updated
        400: Validation error
    """
    try:
        data = GameSaveCreate.model_validate(request.json)
    except ValidationError as e:
        return jsonify(error="Validation Error", details=e.errors(include_url=False, include_context=False)), 400

    save, was_created = GameSaveController.upsert(data)
    response = GameSaveResponse.model_validate(save).model_dump()
    return jsonify(response), 201 if was_created else 200


@game_bp.route('/api/game/saves/<int:slot_number>', methods=['DELETE'])
def api_delete_save(slot_number: int):  # type: ignore[no-untyped-def]
    """Delete a game save by slot number.

    Returns:
        204: Successfully deleted
        404: Not found
    """
    if GameSaveController.delete(slot_number):
        return '', 204
    abort(404)
