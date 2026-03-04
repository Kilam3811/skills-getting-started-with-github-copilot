from src import app


class TestActivitiesEndpoint:
    """Tests for GET /activities endpoint."""

    def test_get_activities_returns_dict(self, client):
        # Arrange
        # (no setup needed, using real data)

        # Act
        response = client.get("/activities")

        # Assert
        assert response.status_code == 200
        assert isinstance(response.json(), dict)
        assert "Chess Club" in response.json()


class TestSignupEndpoint:
    """Tests for POST /signup endpoint."""

    def test_signup_success(self, client):
        # Arrange
        activity = "Chess Club"
        email = "newstudent@mergington.edu"

        # Act
        response = client.post(
            f"/activities/{activity}/signup", params={"email": email}
        )

        # Assert
        assert response.status_code == 200
        assert email in app.activities[activity]["participants"]
        assert "Signed up" in response.json()["message"]

    def test_signup_duplicate_email(self, client):
        # Arrange
        activity = "Chess Club"
        email = app.activities[activity]["participants"][0]

        # Act
        response = client.post(
            f"/activities/{activity}/signup", params={"email": email}
        )

        # Assert
        assert response.status_code == 400
        assert "already signed up" in response.json()["detail"]

    def test_signup_nonexistent_activity(self, client):
        # Arrange
        activity = "NonExistent Activity"
        email = "test@mergington.edu"

        # Act
        response = client.post(
            f"/activities/{activity}/signup", params={"email": email}
        )

        # Assert
        assert response.status_code == 404
        assert "not found" in response.json()["detail"]


class TestRemoveParticipantEndpoint:
    """Tests for DELETE /activities/{activity}/participants endpoint."""

    def test_remove_participant_success(self, client):
        # Arrange
        activity = "Chess Club"
        email = app.activities[activity]["participants"][0]

        # Act
        response = client.delete(
            f"/activities/{activity}/participants", params={"email": email}
        )

        # Assert
        assert response.status_code == 200
        assert email not in app.activities[activity]["participants"]
        assert "Removed" in response.json()["message"]

    def test_remove_nonexistent_participant(self, client):
        # Arrange
        activity = "Chess Club"
        email = "missing@mergington.edu"

        # Act
        response = client.delete(
            f"/activities/{activity}/participants", params={"email": email}
        )

        # Assert
        assert response.status_code == 404
        assert "not found" in response.json()["detail"]

    def test_remove_from_nonexistent_activity(self, client):
        # Arrange
        activity = "NonExistent"
        email = "test@mergington.edu"

        # Act
        response = client.delete(
            f"/activities/{activity}/participants", params={"email": email}
        )

        # Assert
        assert response.status_code == 404
        assert "not found" in response.json()["detail"]
