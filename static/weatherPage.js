
// this moved to top of page as it had some bugs
// return to home screen
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
    
    // capitalize user input, user input is directly used for title and header fields, looks nicer with big letter
    function capitalizeFirstLetter(string) {
        return string.charAt(0).toUpperCase() + string.slice(1);
    }
    // the AI description function
    async function fetchMunicipalityInfo(municipality) {
        const response = await fetch('https://api.edenai.run/v2/text/generation', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer USE_KEY_HERE_FOR_THIS_TO_WORK` // Replace with new EDEN AI key 
            },
            body: JSON.stringify({
                // Specify the provider to use, if changed, you must change the pathing below!!!! recommended to not change unless you know what you are doing
                providers: 'google',
                text: `Tell me about the municipality of ${municipality}. Keep the message within 55 words`, 
                // explicitly tell word limit to avoid weirdly chopped messages 
                // word limit is about half of token amount
                // adjust the lenght of message here, explicit limit so it WILL cut messages at the Nth character/word 
                max_tokens: 100  
            })
        });
    
        if (!response.ok) {
            const errorData = await response.json();
            console.error('Error fetching AI-generated info:', errorData);
            throw new Error('Failed to fetch AI-generated info');
        }
    
        const data = await response.json();
        console.log('Eden AI response:', data); // Log the response to inspect its structure, debugging tool
    
        // pathing to the generated text, do not touch these unless you know what you want to change
        // not always simple query word swap
        if (data['google'] && data['google'].status === 'success') 
            { const cleanedText = data['google'].generated_text 
                .replace(/\*\*/g, '') // Remove double asterisks 
                .replace(/\*/g, ''); // Remove single asterisks 
                return cleanedText;
            } 
            else if (data['google'] && data['google'].status === 'fail') 
                { console.error('Error in AI response:', data['google'].error.message); 
                    return 'No information available at the moment. Please try again later.'; // debugging
                } 
                else
                { console.error('Unexpected response structure:', data); 
                    return 'Response structure unknown, check the structure in inspect element';    // debugging
                }
    }
    
    // graph creation
    if (dailyCanvas && hourlyCanvas) {
        const dailyCtx = dailyCanvas.getContext('2d');
        const hourlyCtx = hourlyCanvas.getContext('2d');

        async function fetchWeatherData(municipality) {
            try {
                const response = await fetch(`http://127.0.0.1:5000/weather?municipality=${municipality}`);    // fetching the weather
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
        // daily data's chart, modify the labels and colours to fit what you want
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
        // hourly weather charts
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
        // bit awkward way to get the municipality user has input, but it works okay
        const urlParams = new URLSearchParams(window.location.search);
        const municipality = urlParams.get('municipality');
        const capitalizedMunicipality = capitalizeFirstLetter(municipality);
        // set it to capitalized one
        municipalityNameElement.textContent = capitalizedMunicipality;
        // fetch the weather data
        // this being all the way down here results in no weather data being shown if anything above does not work properly or is stuck waiting
        // kind of by design, kind of not- at least its clear indication somethings broken
        fetchWeatherData(municipality);
        
        // populate the AI-generated info 
        const info = await fetchMunicipalityInfo(municipality);
        municipalityInfoElement.textContent = info;

    } else {
        console.error('Canvas elements not found');
    }
});
