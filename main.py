from flask import Flask, jsonify, request
from flask_cors import CORS
import requests

app = Flask(__name__)
CORS(app)


def get_coordinates(municipality_name, api_key):
    # using opencagedata to convert municipality name to coordinate
    # 2500 requests/day limit on free one, should be enough
    base_url = 'https://api.opencagedata.com/geocode/v1/json'
    params = {
        'q': municipality_name,
        'key': api_key
    }

    response = requests.get(base_url, params=params)

    if response.status_code == 200:
        data = response.json()
        if data['results']:
            coordinates = data['results'][0]['geometry']
            return coordinates['lat'], coordinates['lng']
        else:
            return None, None
    else:
        print('Error:', response.status_code)
        return None, None


# sets what the url will be in JS app
@app.route('/weather', methods=['GET'])
def get_weather():
    # Get the municipality name from the query parameters, 'Helsinki' is just stand in for testing
    municipality_name = request.args.get('municipality', 'Helsinki')

    # Replace this with a new key if needed (after 2500 uses per account...)
    api_key = '33f31170dd9e494d8906b1a2555e75c9'

    latitude, longitude = get_coordinates(municipality_name, api_key)

    if latitude and longitude:
        # Base URL for Open-Meteo API
        base_url = 'https://api.open-meteo.com/v1/forecast'

        # Parameters for the API request for daily data
        params = {
            'latitude': latitude,
            'longitude': longitude,
            'daily': 'temperature_2m_max,temperature_2m_min,precipitation_sum'
        }
        # Parameters for the API request for hourly data
        params2 = {
            'latitude': latitude,
            'longitude': longitude,
            'hourly': 'temperature_2m'
        }

        # Make the request to Open-Meteo API, first daily, second hourly
        response = requests.get(base_url, params=params)
        response2 = requests.get(base_url, params=params2)

        if response.status_code == 200 and response2.status_code == 200:
            # Parse the JSON responses
            daily_data = response.json()
            hourly_data = response2.json()

            # Extract 6-hour intervals from hourly data
            hourly_data_6hr = {
                'time': hourly_data['hourly']['time'][::6],
                'temperature_2m': hourly_data['hourly']['temperature_2m'][::6]
            }

            # Combine the data into a single response
            weather_data = {
                'daily': daily_data['daily'],
                'hourly': hourly_data_6hr
            }

            return jsonify(weather_data)
        else:
            return jsonify({'error': 'Error fetching weather data'}), 500
    else:
        return jsonify({'error': 'Could not get coordinates for the specified municipality'}), 400


if __name__ == '__main__':
    app.run(debug=True)
