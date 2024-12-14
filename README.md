# reimagined-guacamole

## Actual readme-file on what the heck is this program

Simple weatherapp, User is asked for municipality they want weather forecast for. This municipality is converted to coordinates which are used to find the location and weather data. Data is parsed and stuffed into two charts, one for daily and one for hourly chart. Both are for a week.
If user wants to change the hourly functionality this can be changed in the python code. From hourly to every X hours (currently set to every 6 hours).

AI functionality can be changed in the weatherPages.js file, there is option to change token amount, word amount by explicitly telling AI that in query and option to change the AI provider. List of providers for Eden are here: https://www.edenai.co/providers 











<details>
<summary>WeatherApp development chatter</summary>
### WeatherApp development chatter

So this is my weather app, created in a day. It takes user input for a city/municipality/town etc. Turns this information into coordinates, longitude, latitude with opencagedata.com and then uses that data to fetch weather information from the open-meteo's API.

Some minor tweaks were made to capitalize the first letter of user input as this input is used directly in some places on the website. Some neat logic to clear the graph a little bit to make it easier to read, such as showing the date change at midnight and only showing the day and month and not whole time information. Basic stuff to make everything look little bit more fine tuned. Editing the CSS style-file was easy to do with help of Figma which can give me the CSS files needed and allows creation of nice colour palettes. Quick bit of testing and everything seems fine.

Getting the project to point where data from weather API and opencagedata's coordinate API's data was shown correctly.
Parsing the data and adding it on graph and figuring out how to format, grid and squish the graph tightly around the datapoints took a little bit time and fiddling with google and chatbots. 

Adding AI-generated descriptions from the municipalities was not too difficult in the actual implementation of adding the municipality in question into the query for AI. The issues came from finding a free open-source AI with API that was not paid and actually worked as supposed. 
After hassling with dozens of APIs and creating multiple accounts to different websites i found Eden AI which had multiple options, so i just went through a list to test one by one which actually gives me a response. Once response was found it was time to parse the response, set token limits and explicitly tell the AI to not exceed the word limit in order to make the AI-generated text not be cut out oddly.

Last batch of quick testing and doing ZAP testing on the website and it came clean so I suppose cybersecurity course i had bit ago made me make semi-basic secure websites. 
</details>


### Used languages and libraries etc

JavaScript, Python, CSS, HTML, Deno, chart.js, flask, flask_cors, requests, Eden AI for the AI functionality, google's AI api which costs money apparently
