function search() {
    let city = $("#location").val();
    getCoordinatesFromLocation(city, 2);
}

$(document).keypress(function(e) {
    if (e.which == 13) { search(); }
});

function getCurrentLocation() {
    
}