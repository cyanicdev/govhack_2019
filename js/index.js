function search() {
    // Clear table
    var table = document.getElementById('resultTable');
    clearTable(table);

    document.getElementById('results').innerHTML = 'loading ...';
    let location = $("#location").val();
    if(location.toLowerCase() == "moscow") {
        window.location.href = 'https://www.youtube.com/watch?v=hxyhulJYz5I';
    }
    let radius = $("#radius").val();
    getCoordinatesFromLocation(location, radius);
}

function checkDist() {
    thing = document.getElementById('radius');
    if (thing.value.length > 3) {
        thing.value = thing.value.slice(0,3); 
    }
    else if (thing.value < 1) {
        thing.value = ''; 
    }
}

function clearTable(table) {
    var rows = table.rows;
    var i = rows.length;
    while (--i) {
      rows[i].parentNode.removeChild(rows[i]);
    }
  }

$(document).keypress(function(e) {
    if (e.which == 13) { search(); }
});

function getCurrentLocation() {
    document.getElementById('results').innerText = 'loading ...';
    if (navigator.geolocation) {
        var table = document.getElementById('resultTable');
        clearTable(table);
        navigator.geolocation.getCurrentPosition(sendPosition);
    } else {
        alert('geolocation has failed');
    }
    function sendPosition(position) {
        let radius = $("#radius").val();
        getCoordinatesFromLocation([position.coords.latitude, position.coords.longitude], radius);
    }
}

let target = document.getElementById('severity-gauge');
gauge = new Gauge(target).setOptions(opts);
gauge.maxValue = 10;
gauge.setMinValue(0);
gauge.animationSpeed = 16;
gauge.set(0);