
// API functionality
import config from './config.json' assert { type: 'json' };


async function fetch_current_weather_api_data(query, air_quality_data) {
    // query Pass US Zipcode, UK Postcode, Canada Postalcode, IP address, Latitude/Longitude (decimal degree) or city name. Visit request parameter section to learn more.
    // https://www.weatherapi.com/api-explorer.aspx
    const API_KEY = config.weather_api_key;
    let response
    try {
        response =  await fetch(`http://api.weatherapi.com/v1/current.json?key=${API_KEY}&q=${query}&aqi=${air_quality_data}`, {mode: 'cors'});
    } catch {
        // 200 is success 400 and  1006 is location not found
        if (response.status !== 200 && response.status != 400 && response.status != 1006
            && response.status != 1003) {
            throw new Error("api.weatherapi.com failed with the response code: " + response.status)    
        }
    }

    return response


}
async function get_current_weather_json(query, air_quality_data) {

    let response = await fetch_current_weather_api_data(query,air_quality_data);
    return response.json();
}

function clear_all_children(element) {
    while (element.lastChild) {
        element.removeChild(element.lastChild);
    }
}



async function weatherApp() {
    // TODO split data and inject dependence on weather api.
    // TODO inject renderer too - split all out to sep js files.
    // TODO grid view for render so it looks decent.

    let weather_data = {};

    let weather_search = document.getElementById("weather_search");
    let location_data_container = document.getElementById("location_data");
    let weather_data_container = document.getElementById("weather_data");
    let error_data_container = document.getElementById("error_data");
    error_data_container.style.color = "red";

    let data_style = `
        width: 600px;
        margin: 0 auto;
    `;

    location_data_container.style = data_style;
    weather_data_container.style = data_style;

    let timer;
    const wait_time = 500;

    weather_search.addEventListener('keyup', event => {
        clearTimeout(timer);
      
        timer = setTimeout(async () => {
            await updateWeatherData(event.target.value);
        }, wait_time);
    });


    function createData(name, value, img_src) {
        let data = document.createElement("div");
        let name_element = document.createElement("b");
        name_element.innerText = name + ": ";
        let value_element = document.createElement("span");
        value_element.innerText = value;

        data.appendChild(name_element);
        data.appendChild(value_element);

        data.style = `
            display: flex;
            flex-direction: row;
            align-items: center;
            justify-content: flex-start;
            gap: 0.5rem;
        
        `

        if (img_src) {

            let img = document.createElement("img");
            img.src = img_src;
            img.style.width = "40px";
            img.style.display = "inline-block";
            data.appendChild(img);

        }

        return data
    }

    function createCondition(condition) {
        let condition_element = document.createElement("div");
        // gives us a link to weather api cdn

        condition_element.appendChild(createData("condition", condition.text, condition.icon))
  
        return condition_element;
    }

    function renderLocationData(location_data) {
        let title  = document.createElement("h3");
        title.innerText = "Location:";
        location_data_container.appendChild(title);

        // just show all the data for now
        for (let [key, value] of Object.entries(location_data)) {
            location_data_container.appendChild(createData(key, value))
        }

    }

    function renderCurrentWeatherData(current_data) {
        let title  = document.createElement("h3");
        title.innerText = "Current Weather:";
        location_data_container.appendChild(title);

        for (let [key, value] of Object.entries(current_data)) {

            if (key === "condition") {
                // special case for condition
                weather_data_container.appendChild(createCondition(value));
            } else {
                weather_data_container.appendChild(createData(key, value))

            }

        }
    }

    function renderWeatherData() {
        // remove elements
        clear_all_children(location_data_container);
        clear_all_children(weather_data_container);
        clear_all_children(error_data_container);

        // redraw with new data
        if (weather_data.error && weather_data.error.code !== 1003 ) {
            error_data_container.innerText = weather_data.error.code + " : " + weather_data.error.message;
        } else if (weather_data.error && weather_data.error.code === 1003 ) {
            // do nothing here, 1003 means no param was entered ie theyre not searching. 
            return
        }else {
            renderLocationData(weather_data.location);
            renderCurrentWeatherData(weather_data.current)
        }


    }

    async function updateWeatherData(location_query){
        weather_data =  await get_current_weather_json(location_query, "no");
        renderWeatherData();
        console.log(weather_data);
    }
    
  

}


weatherApp();