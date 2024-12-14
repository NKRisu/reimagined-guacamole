
// this moved to top of page as it had some bugs
document.getElementById('back-button').addEventListener('click', () => {
    window.location.href = '/';
});

document.addEventListener('DOMContentLoaded', async () => {
    const weatherContainer = document.getElementById('weather-container');
    const backButton = document.getElementById('back-button');
    const dailyCanvas = document.getElementById('dailyWeatherChart');
    const hourlyCanvas = document.getElementById('hourlyWeatherChart');
    const municipalityNameElement = document.getElementById('municipality-name');
    const municipalityInfoElement = document.getElementById('municipality-info');

    function capitalizeFirstLetter(string) {
        return string.charAt(0).toUpperCase() + string.slice(1);
    }

    async function fetchMunicipalityInfo(municipality) {
        const response = await fetch('https://api.edenai.run/v2/text/generation', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer USE_KEY_HERE_FOR_THIS_TO_WORK` // Replace with new EDEN AI key 
            },
            body: JSON.stringify({
                providers: 'google', // Specify the provider to use, if changed, you must change the pathing below
                text: `Tell me about the municipality of ${municipality}. Keep the message within 55 words`, 
                // also to avoid weirdly chopped messages 
                // you should explicitly tell about half of token amount as max word count
                max_tokens: 100  // adjust the lenght of message here
            })
        });
    
        if (!response.ok) {
            const errorData = await response.json();
            console.error('Error fetching AI-generated info:', errorData);
            throw new Error('Failed to fetch AI-generated info');
        }
    
        const data = await response.json();
        console.log('Eden AI response:', data); // Log the response to inspect its structure
    
        // pathing to the generated text 
        if (data['google'] && data['google'].status === 'success') 
            { const cleanedText = data['google'].generated_text 
                .replace(/\*\*/g, '') // Remove double asterisks 
                .replace(/\*/g, ''); // Remove single asterisks 
                return cleanedText;
            } 
            else if (data['google'] && data['google'].status === 'fail') 
                { console.error('Error in AI response:', data['google'].error.message); 
                    return 'No information available at the moment. Please try again later.'; 
                } 
                else
                { console.error('Unexpected response structure:', data); 
                    return 'No information available at the moment. Please try again later.';
                }
    }
    

    if (dailyCanvas && hourlyCanvas) {
        const dailyCtx = dailyCanvas.getContext('2d');
        const hourlyCtx = hourlyCanvas.getContext('2d');

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

        const urlParams = new URLSearchParams(window.location.search);
        const municipality = urlParams.get('municipality');
        const capitalizedMunicipality = capitalizeFirstLetter(municipality);
        municipalityNameElement.textContent = capitalizedMunicipality;

        fetchWeatherData(municipality);

        const info = await fetchMunicipalityInfo(municipality);
        municipalityInfoElement.textContent = info;

    } else {
        console.error('Canvas elements not found');
    }
});
