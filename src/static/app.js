document.addEventListener("DOMContentLoaded", () => {
  const activitiesList = document.getElementById("activities-list");
  const activitySelect = document.getElementById("activity");
  const signupForm = document.getElementById("signup-form");
  const messageDiv = document.getElementById("message");

  // Function to fetch activities from API
  async function fetchActivities() {
    try {
      const response = await fetch("/activities");
      const activities = await response.json();

      // Clear loading message
      activitiesList.innerHTML = "";

      // Populate activities list
      Object.entries(activities).forEach(([name, details]) => {
        const activityCard = document.createElement("div");
        activityCard.className = "activity-card";

        const spotsLeft = details.max_participants - details.participants.length;

        activityCard.innerHTML = `
          <h4>${name}</h4>
          <p>${details.description}</p>
          <p><strong>Schedule:</strong> ${details.schedule}</p>
          <p><strong>Availability:</strong> ${spotsLeft} spots left</p>

          <div class="participants">
            <p><strong>Participants:</strong></p>
            <ul class="participants-list">
              ${details.participants && details.participants.length
                ? details.participants
                    .map(
                      (p) =>
                        `<li data-activity="${name}" data-email="${p}">
                           ${p} <span class="delete-participant" title="Remove">&times;</span>
                         </li>`
                    )
                    .join("")
                : '<li class="no-participants">No participants yet</li>'}
            </ul>
          </div>
        `;

        activitiesList.appendChild(activityCard);

        // Add option to select dropdown
        const option = document.createElement("option");
        option.value = name;
        option.textContent = name;
        activitySelect.appendChild(option);
      });
    } catch (error) {
      activitiesList.innerHTML = "<p>Failed to load activities. Please try again later.</p>";
      console.error("Error fetching activities:", error);
    }
  }

  // Handle form submission
  signupForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const email = document.getElementById("email").value;
    const activity = document.getElementById("activity").value;

    try {
      const response = await fetch(
        `/activities/${encodeURIComponent(activity)}/signup?email=${encodeURIComponent(email)}`,
        {
          method: "POST",
        }
      );

      const result = await response.json();

      if (response.ok) {
        messageDiv.textContent = result.message;
        messageDiv.className = "success";
        signupForm.reset();
        // refresh activities list so new participant shows up
        fetchActivities();
      } else {
        messageDiv.textContent = result.detail || "An error occurred";
        messageDiv.className = "error";
      }

      messageDiv.classList.remove("hidden");

      // Hide message after 5 seconds
      setTimeout(() => {
        messageDiv.classList.add("hidden");
      }, 5000);
    } catch (error) {
      messageDiv.textContent = "Failed to sign up. Please try again.";
      messageDiv.className = "error";
      messageDiv.classList.remove("hidden");
      console.error("Error signing up:", error);
    }
  });

  // Handle participant deletion via event delegation
  activitiesList.addEventListener("click", async (event) => {
    if (event.target.classList.contains("delete-participant")) {
      const li = event.target.closest("li");
      const activity = li.getAttribute("data-activity");
      const email = li.getAttribute("data-email");

      try {
        const response = await fetch(
          `/activities/${encodeURIComponent(activity)}/participants?email=${encodeURIComponent(email)}`,
          { method: "DELETE" }
        );
        const result = await response.json();
        if (response.ok) {
          // Reload activities to refresh list
          fetchActivities();
          messageDiv.textContent = result.message;
          messageDiv.className = "success";
          messageDiv.classList.remove("hidden");
          setTimeout(() => {
            messageDiv.classList.add("hidden");
          }, 3000);
        } else {
          messageDiv.textContent = result.detail || "Failed to remove participant";
          messageDiv.className = "error";
          messageDiv.classList.remove("hidden");
        }
      } catch (err) {
        console.error("Error removing participant:", err);
      }
    }
  });

  // Initialize app
  fetchActivities();
});
