document.addEventListener('DOMContentLoaded', () => {
    const weatherContainer = document.getElementById('weather-container');
    const backButton = document.getElementById('back-button');
    const dailyCanvas = document.getElementById('dailyWeatherChart');
    const hourlyCanvas = document.getElementById('hourlyWeatherChart');
    const municipalityNameElement = document.getElementById('municipality-name');

    // Function to capitalize the first letter of municipality name in query, used later in title and header of the website, looks nicer this way.
    function capitalizeFirstLetter(string) {
        return string.charAt(0).toUpperCase() + string.slice(1);
    }
    // if the canvas exist, create daily and hourly canvas (graph)
    if (dailyCanvas && hourlyCanvas) {
        const dailyCtx = dailyCanvas.getContext('2d');
        const hourlyCtx = hourlyCanvas.getContext('2d');

        // Function to fetch weather data from the backend
        async function fetchWeatherData(municipality) {
            try {
                const response = await fetch(`http://127.0.0.1:5000/weather?municipality=${municipality}`);
                if (response.ok) {
                    const weatherData = await response.json();
                    displayDailyWeatherData(weatherData);
                    displayHourlyWeatherData(weatherData);
                } else {
                    weatherContainer.innerHTML = 'Error fetching weather data';
                }
            } catch (error) {
                weatherContainer.innerHTML = 'Error fetching weather data';
            }
        }

        // Function to display daily weather data on the web page
        function displayDailyWeatherData(data) {
            const labels = data.daily.time.map(date => {
                const d = new Date(date);
                return `${d.getDate()}/${d.getMonth() + 1}`;
            });
            const maxTemps = data.daily.temperature_2m_max;
            const minTemps = data.daily.temperature_2m_min;
            const precipitation = data.daily.precipitation_sum;

            new Chart(dailyCtx, {
                type: 'line',
                data: {
                    labels: labels,
                    datasets: [
                        {
                            label: 'Max Temp (°C)',
                            data: maxTemps,
                            borderColor: 'rgba(255, 99, 132, 1)',
                            backgroundColor: 'rgba(255, 99, 132, 0.2)',
                            fill: false,
                        },
                        {
                            label: 'Min Temp (°C)',
                            data: minTemps,
                            borderColor: 'rgba(54, 162, 235, 1)',
                            backgroundColor: 'rgba(54, 162, 235, 0.2)',
                            fill: false,
                        },
                        {
                            label: 'Precipitation (mm)',
                            data: precipitation,
                            borderColor: 'rgba(75, 192, 192, 1)',
                            backgroundColor: 'rgba(75, 192, 192, 0.2)',
                            fill: false,
                        },
                    ],
                },
                options: {
                    responsive: true,
                    scales: {
                        x: {
                            title: {
                                display: true,
                                text: 'Date',
                            },
                        },
                        y: {
                            title: {
                                display: true,
                                text: 'Temperature (°C)',
                            },
                        },
                    },
                },
            });
        }

        // Function to display hourly weather data on the web page
        function displayHourlyWeatherData(data) {
            const labels = data.hourly.time.map((time, index) => 
                { 
                const d = new Date(time); 
                const hour = d.getHours();
                if (hour == 0)      // showing dates at every midnight, easier readability for graph
                {
                  return `${d.getDate()}/${d.getMonth() + 1}`
                }
                else return `${hour}:00`
                });
            const temps = data.hourly.temperature_2m;

            new Chart(hourlyCtx, {
                type: 'line',
                data: {
                    labels: labels,
                    datasets: [
                        {
                            label: 'Temperature (°C)',
                            data: temps,
                            borderColor: 'rgba(75, 192, 192, 1)',
                            backgroundColor: 'rgba(75, 192, 192, 0.2)',
                            fill: false,
                        },
                    ],
                },
                options: {
                    responsive: true,
                    scales: {
                        x: {
                            title: {
                                display: true,
                                text: 'Hour',
                            },
                        },
                        y: {
                            title: {
                                display: true,
                                text: 'Temperature (°C)',
                            },
                        },
                    },
                },
            });
        }

        // Get municipality parameter from URL
        const urlParams = new URLSearchParams(window.location.search);
        const municipality = urlParams.get('municipality');

        // Capitalize the first letter of the municipality name
        const capitalizedMunicipality = capitalizeFirstLetter(municipality);

        // Set municipality name in the placeholder
        municipalityNameElement.textContent = capitalizedMunicipality;

        // Fetch and display weather data
        fetchWeatherData(municipality);

        // Back to home page
        backButton.addEventListener('click', () => {
            window.location.href = '/';
        });
    } else {
        console.error('Canvas elements not found');
    }
});
