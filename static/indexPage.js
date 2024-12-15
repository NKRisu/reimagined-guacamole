
document.addEventListener('DOMContentLoaded', () => {
    const fetchWeatherButton = document.getElementById('fetch-weather');
    const municipalityInput = document.getElementById('municipality');

    // Redirect to weather page with municipality parameter
    function fetchWeather() {
        const municipality = municipalityInput.value;
        window.location.href = `/weather?municipality=${municipality}`;
    }

    // Add event listener for button click
    fetchWeatherButton.addEventListener('click', fetchWeather);

    // Add event listener for Enter key press for ease of use
    municipalityInput.addEventListener('keypress', (event) => {
        if (event.key === 'Enter') {
            fetchWeather();
        }
    });
});
