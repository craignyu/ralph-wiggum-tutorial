"""Tests for Dig Dug game save routes and functionality.

Tests the game page rendering and save slot API endpoints,
ensuring the full MVC pattern works correctly for game persistence.
"""
import json
from typing import Any


class TestGamePage:
    """Tests for the /game HTML page."""

    def test_game_page_returns_html(self, client: Any) -> None:
        """GET /game should return HTML page."""
        response = client.get('/game')
        assert response.status_code == 200
        assert b'Dig Dug' in response.data

    def test_game_page_contains_island_mount(self, client: Any) -> None:
        """Game page should contain React island mount point."""
        response = client.get('/game')
        assert b'data-island="digdug"' in response.data


class TestGameSaveAPI:
    """Tests for the game save JSON API."""

    def test_list_saves_empty(self, client: Any) -> None:
        """GET /api/game/saves should return empty list initially."""
        response = client.get('/api/game/saves')
        assert response.status_code == 200
        data = json.loads(response.data)
        assert data == []

    def test_create_save(self, client: Any) -> None:
        """POST /api/game/saves should create a new save."""
        response = client.post(
            '/api/game/saves',
            json={
                'slot_number': 1,
                'slot_name': 'My Save',
                'score': 1000,
                'high_score': 5000,
                'level': 3,
                'lives': 2,
            },
            content_type='application/json'
        )
        assert response.status_code == 201
        data = json.loads(response.data)
        assert data['slot_number'] == 1
        assert data['score'] == 1000
        assert data['level'] == 3
        assert 'id' in data
        assert 'created_at' in data
        assert 'updated_at' in data

    def test_update_save_same_slot(self, client: Any) -> None:
        """POST to same slot should update (200) instead of create (201)."""
        # Create
        client.post(
            '/api/game/saves',
            json={'slot_number': 1, 'score': 100, 'level': 1, 'lives': 3},
            content_type='application/json'
        )
        # Update same slot
        response = client.post(
            '/api/game/saves',
            json={'slot_number': 1, 'score': 500, 'level': 2, 'lives': 2},
            content_type='application/json'
        )
        assert response.status_code == 200
        data = json.loads(response.data)
        assert data['score'] == 500
        assert data['level'] == 2

    def test_invalid_slot_zero(self, client: Any) -> None:
        """POST with slot_number 0 should return 400."""
        response = client.post(
            '/api/game/saves',
            json={'slot_number': 0},
            content_type='application/json'
        )
        assert response.status_code == 400

    def test_invalid_slot_four(self, client: Any) -> None:
        """POST with slot_number 4 should return 400."""
        response = client.post(
            '/api/game/saves',
            json={'slot_number': 4},
            content_type='application/json'
        )
        assert response.status_code == 400

    def test_delete_save(self, client: Any) -> None:
        """DELETE /api/game/saves/1 should return 204."""
        client.post(
            '/api/game/saves',
            json={'slot_number': 1, 'score': 100},
            content_type='application/json'
        )
        response = client.delete('/api/game/saves/1')
        assert response.status_code == 204

    def test_delete_nonexistent_save(self, client: Any) -> None:
        """DELETE nonexistent save should return 404."""
        response = client.delete('/api/game/saves/1')
        assert response.status_code == 404

    def test_saves_ordered_by_slot_number(self, client: Any) -> None:
        """Saves should be returned ordered by slot_number."""
        # Create in reverse order
        client.post(
            '/api/game/saves',
            json={'slot_number': 3, 'score': 300},
            content_type='application/json'
        )
        client.post(
            '/api/game/saves',
            json={'slot_number': 1, 'score': 100},
            content_type='application/json'
        )
        client.post(
            '/api/game/saves',
            json={'slot_number': 2, 'score': 200},
            content_type='application/json'
        )

        response = client.get('/api/game/saves')
        data = json.loads(response.data)
        assert len(data) == 3
        assert data[0]['slot_number'] == 1
        assert data[1]['slot_number'] == 2
        assert data[2]['slot_number'] == 3

    def test_delete_then_verify_gone(self, client: Any) -> None:
        """After deleting, save should not appear in list."""
        client.post(
            '/api/game/saves',
            json={'slot_number': 1, 'score': 100},
            content_type='application/json'
        )
        client.delete('/api/game/saves/1')
        response = client.get('/api/game/saves')
        data = json.loads(response.data)
        assert data == []
