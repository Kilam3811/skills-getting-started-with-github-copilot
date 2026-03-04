import copy
import pytest
from fastapi.testclient import TestClient
from src import app


@pytest.fixture
def client():
    """Provide TestClient for the FastAPI app."""
    return TestClient(app.app)


@pytest.fixture(autouse=True)
def reset_activities():
    """
    Auto-use fixture: snapshot and restore app.activities 
    before/after each test to ensure isolation.
    """
    original = copy.deepcopy(app.activities)
    yield
    app.activities.clear()
    app.activities.update(original)
