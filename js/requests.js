const BING_API_KEY = 'AinDEB4J8D17T6kvzhjjSDNNuTmhobGmLwTJq2vOEHdCfB2tqJzFbqP15w2PgNWI';
const OPENCAGE_API_KEY = 'f6b2bd6db4644a57988456915902517b';

let gauge;

let opts = {
    angle: 0, // The span of the gauge arc
    lineWidth: 0.3, // The line thickness
    radiusScale: 1, // Relative radius
    pointer: {
      length: 0.6, // // Relative to gauge radius
      strokeWidth: 0.062, // The thickness
      color: '#000000' // Fill color
    },
    limitMax: false,     // If false, max value increases automatically if value > maxValue
    limitMin: false,     // If true, the min value of the gauge will be fixed
    colorStart: 'rgb(0,255,0)',   // Colors
    colorStop: 'rgb(255,0,0)',    // just experiment with them
    strokeColor: '#E0E0E0',  // to see which ones work best for you
    generateGradient: true,
    highDpiSupport: true,     // High resolution support 
};

function getCoordinatesFromLocation(location, radius) {
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
                    getIncidents(result, radius);                  
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
        getIncidents(result, radius);
    }
}


function getIncidents(coordinates, radius) {
    radius *= 111;
    let traffic_url_template = `https://dev.virtualearth.net/REST/v1/Traffic/Incidents/${coordinates}?key=${BING_API_KEY}`;

    let request = new XMLHttpRequest();

    request.onreadystatechange = function(error) {
        if (request.readyState == 4 && request.status == 200) {
            let response = JSON.parse(request.responseText).resourceSets[0].resources;
            if(response.length == 0) {
                document.getElementById('results').innerText = "Doesn't look there is any data for that location";
                $("#severity-rating").css('color', `rgb(0, 255, 0)`);
                $('#severity-rating').text('');
                gauge.set(0);
                return;
            }
            document.getElementById('results').innerText = '';
            var table = document.getElementById("resultTable");
            for (let i = 0; i < response.length; i++) {
                const element = response[i];

                var row = table.insertRow(i + 1);

                let hazard = row.insertCell(0);
                let severity = row.insertCell(1);
                let roadClosed = row.insertCell(2);

                severity.style.textAlign = "center";
                roadClosed.style.textAlign = "center";

                hazard.innerText = element.description;
                switch(element.severity)
                {
                    case 1:
                        severity.innerText = 'Low Impact';
                        break;
                    case 2:
                        severity.innerText = 'Minor';
                        break;
                    case 3:
                        severity.innerText = 'Moderate';
                        break;
                    case 4:
                        severity.innerText = "Serious";
                        break;
                }

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
            gauge.set(rating);
            opts.colorStop = `rgb(${rating * 25.5}, ${255 - rating * 25.5}, 0)`;
            gauge.setOptions(opts);
            displayMap(coordinates);
        }
    };

    request.open("GET", traffic_url_template, true);
    request.send();
}

function displayMap(coordinates) {
    console.log(coordinates);
    let map_url_template = `https://dev.virtualearth.net/REST/v1/Imagery/Map/CanvasLight?mapArea=${coordinates}&mapSize=${window.innerWidth},${window.innerHeight}&mapLayer=TrafficFlow&key=${BING_API_KEY}`;

    fetch(map_url_template).then(res => {return res.blob()}).then(blob => {
        let img = URL.createObjectURL(blob);
        let back = document.getElementById('background');
        back.style.backgroundImage = `url(${img})`;
    })
    displayRoutesInArea(coordinates);
}

function displayRoutesInArea(coordinates) {    
    let result = JSON.parse('url(res/shapes.json)');
    let shapes = [];

    for(let i = 0; i < result.length; i++) {
        if(result[i].shape_pt_lat <= coordinates[0] && result[i].shape_pt_lat >= coordinates[2] && result[i].shape_pt_lng <= coordinates[1] && result[i].shape_pt_lng >= coordinates[3]) {
            shapes.push(result[i]);
        }
    }

    for(let i = 0; i < 3; i++) {
        let curShape = shapes[i];
        shapes.splice(i);
        let route = [];
        route.push(curShape);
        let correct = [];
        for(let j = 0; j < shapes.length; j++) {
            if(shapes[j].shape_id == curShape.shape_id) {
                route.push(shapes[j]);
                correct.push(j);
            }
        }
        for(let j = 0; j < correct.length; j++) {
            shapes.splice(correct[j]);
        }
    }

    console.log(shapes);

    let route_url_template = `https://dev.virtualearth.net/REST/v1/Imagery/Map/Road/Routes?wp.0=${coordinates[0]};64;1&wp.1=${coordinates[1]};66;2&key=${BING_API_KEY}`;

    fetch(route_url_template).then(res => {return res.blob()}).then(blob => {
        let img = URL.createObjectURL(blob);
        let image = document.createElement('img');
        image.src = img;
        document.body.appendChild(image);
    })
}