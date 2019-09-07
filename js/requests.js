const BING_API_KEY = 'AinDEB4J8D17T6kvzhjjSDNNuTmhobGmLwTJq2vOEHdCfB2tqJzFbqP15w2PgNWI';
const OPENCAGE_API_KEY = 'f6b2bd6db4644a57988456915902517b';

function getCoordinatesFromLocation(location, radius = 5) {
    if(typeof location == 'string')
    {
        let coordinate_url_template = `https://api.opencagedata.com/geocode/v1/json?q=${location}&key=${OPENCAGE_API_KEY}`;
    
        let request = new XMLHttpRequest();

        request.onreadystatechange = function(e) {
            if (request.readyState == 4 && request.status == 200) { 
                try {
                    let result = JSON.parse(request.responseText).results[0].bounds;
                    console.log("radius: " + radius);
                    let centre = [ (result.northeast.lat + result.southwest.lat) / 2 , (result.northeast.lng + result.southwest.lng) / 2 ];
                    console.log("location: " + centre);
                    radius /= 111;
                    result = [ centre[0] - radius, centre[1] - radius, centre[0] + radius, centre[1] + radius ];
                    getData(result, radius);                  
                } catch(err) {
                    document.getElementById('results').innerText = "Doesn't look there is any data for that location";
                }
                
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
        getData(result, radius);
    }
}


function getData(coordinates, radius) {
    radius *= 111;
    let traffic_url_template = `http://dev.virtualearth.net/REST/v1/Traffic/Incidents/${coordinates[0]},${coordinates[1]},${coordinates[2]},${coordinates[3]}?key=${BING_API_KEY}`;

    let request = new XMLHttpRequest();

    request.onreadystatechange = function(error) {
        if (request.readyState == 4 && request.status == 200) {
			let response = JSON.parse(request.responseText).resourceSets[0].resources;
            console.log(response);
            document.getElementById('results').innerText = '';
            var table = document.getElementById("resultTable");
            for (let i = 0; i < response.length; i++) {
                const element = response[i];

                var row = table.insertRow(i + 1);

                let hazard = row.insertCell(0);
                let severity = row.insertCell(1);
                let roadClosed = row.insertCell(2);

                hazard.innerText = element.description;
                severity.innerText = element.severity;

                if (element.roadClosed == true){
                    roadClosed.innerHTML = `<i style="color: green;" class="fas fa-check"></i>`;
                } else {
                    roadClosed.innerHTML = `<i style="color: red;" class="fas fa-times"></i>`;
                }
                
            }
            console.log("length: " + response.length + " radius: " + radius);
            let rating = parseFloat(calculateSeverity(response.length, radius));
            console.log(rating);
            $("#severity-rating").css('color', `rgb(${rating * 25.5}, ${255 - rating * 25.5}, 0)`);
            $('#severity-rating').text(rating);
            //document.getElementById('results').innerText = JSON.stringify(JSON.parse(request.responseText).resourceSets[0].resources, null, 4);
        }
    };

    request.open("GET", traffic_url_template, true);
    request.send();
}
