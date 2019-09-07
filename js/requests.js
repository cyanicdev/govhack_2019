const BING_API_KEY = 'AinDEB4J8D17T6kvzhjjSDNNuTmhobGmLwTJq2vOEHdCfB2tqJzFbqP15w2PgNWI';
const OPENCAGE_API_KEY = 'f6b2bd6db4644a57988456915902517b';

function getCoordinatesFromLocation(location, radius = 5) {
    if(typeof location == 'string')
    {
        let coordinate_url_template = `https://api.opencagedata.com/geocode/v1/json?q=${location}&key=${OPENCAGE_API_KEY}`;
    
        let request = new XMLHttpRequest();

        request.onreadystatechange = function(error) {
            if (request.readyState == 4 && request.status == 200) { 
                let result = JSON.parse(request.responseText).results[0].bounds;
                console.log("radius: " + radius);
                let centre = [ (result.northeast.lat + result.southwest.lat) / 2 , (result.northeast.lng + result.southwest.lng) / 2 ];
                console.log("location: " + centre);
                radius /= 111;
                result = [ centre[0] - radius, centre[1] - radius, centre[0] + radius, centre[1] + radius ];
                getData(result);
            }
        };

        request.open("GET", coordinate_url_template, true);
        request.send();
    }
    else
    {
        console.log("radius: " + radius);
        console.log("location: " + location);
        radius /= 111;
        result = [ location[0] - radius, location[1] - radius, location[0] + radius, location[1] + radius ]
        getData(result);
    }
}

function getData(coordinates) {
    
    let traffic_url_template = `http://dev.virtualearth.net/REST/v1/Traffic/Incidents/${coordinates[0]},${coordinates[1]},${coordinates[2]},${coordinates[3]}/?key=${BING_API_KEY}`;

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
