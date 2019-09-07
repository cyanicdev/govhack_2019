const BING_API_KEY = 'AinDEB4J8D17T6kvzhjjSDNNuTmhobGmLwTJq2vOEHdCfB2tqJzFbqP15w2PgNWI';
const OPENCAGE_API_KEY = 'f6b2bd6db4644a57988456915902517b';

let city = window.prompt("City");
let radius = window.prompt("Rectangular radius in km");

getCoordinatesFromLocation(city, radius);

function getCoordinatesFromLocation(location, radius) {
    let thing = location;
    let coordinate_url_template = `https://api.opencagedata.com/geocode/v1/json?q=${thing}&key=${OPENCAGE_API_KEY}`;
    
    let request = new XMLHttpRequest();

    request.onreadystatechange = function(error) {
        if (request.readyState == 4 && request.status == 200) { 
            let result = JSON.parse(request.responseText).results[0].bounds;
            let centre = [ (result.northeast.lat + result.southwest.lat) / 2 , (result.northeast.lng + result.southwest.lng) / 2 ];
            getData(centre, 2);
        }
    };

    request.open("GET", coordinate_url_template, true);
    request.send();
}

function getData(centre, rectRadius) {
    console.log("Centre: " + centre);
    console.log("Rectangular radius: " + rectRadius + "km, " + rectRadius / 111 + "degrees");

    rectRadius /= 111;
    console.log(rectRadius);
    let traffic_url_template = `http://dev.virtualearth.net/REST/v1/Traffic/Incidents/${centre[0] - rectRadius},${centre[1] - rectRadius},${centre[0] + rectRadius},${centre[1] + rectRadius}/?key=${BING_API_KEY}`;

    let request = new XMLHttpRequest();

    request.onreadystatechange = function(error) {
        if (request.readyState == 4 && request.status == 200) { 
            console.log(JSON.parse(request.responseText));
            document.getElementById('results').innerText = JSON.stringify(JSON.parse(request.responseText).resourceSets[0].resources, null, 4);
        }
    };

    request.open("GET", traffic_url_template, true);
    request.send();
}
