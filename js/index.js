function search() {
    document.getElementById('results').innerText = 'loading ...';
    let city = $("#location").val();
    getCoordinatesFromLocation(city);
}

$(document).keypress(function(e) {
    if (e.which == 13) { search(); }
});

function getCurrentLocation() {
    document.getElementById('results').innerText = 'loading ...';
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(sendPosition);
    } else {
        alert('geolocation has failed');
    }
    function sendPosition(position) {
        getCoordinatesFromLocation([position.coords.latitude, position.coords.longitude]);
    }
}