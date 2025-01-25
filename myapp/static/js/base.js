const csrftoken = document.querySelector('meta[name="csrf-token"]').getAttribute('content');

/**
 * Displays a Bootstrap alert with the given message and type.
 *
 * @param {string} message - The message to display in the alert.
 */
function showAlert(message) {
    // Create the alert element
    const alert = document.createElement('div');
    alert.className = `alert alert-danger alert-dismissible fade show`;
    alert.role = 'alert';
    alert.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
    `;

    const alertsContainer = document.getElementById('alerts-container');
    alertsContainer.appendChild(alert);

    // Removes the alert after 5 seconds
    setTimeout(() => {
        alert.classList.remove('show');
        alert.classList.add('fade');
        setTimeout(() => alert.remove(), 150);
    }, 5000);
}