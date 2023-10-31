var map = L.map('map').setView([21.54238, 39.19797], 8);
let circle; // Circle for now it will be change to
let fileHandle;
let radius = 1000;// 1 km radius


L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap'
}).addTo(map);

document.getElementById('locateBtn').addEventListener('click', function() {
    map.locate({setView: true, maxZoom: 16});
});


map.on('locationfound', onLocationFound);

    
//Function Parts
// 
function onLocationFound(e) {
    if (circle) {
        circle.remove();
    }
    circle = L.circle(e.latlng, radius).addTo(map); 

    L.marker(e.latlng).addTo(map)
        .bindPopup("You are within " + radius + " meters from this point").openPopup();
    
    document.querySelector('#locateBtn i.fa-thin').classList.remove('fa-bounce');
    document.getElementById('longitude').textContent = e.latlng.lng.toFixed(4);
    document.getElementById('latitude').textContent = e.latlng.lat.toFixed(4);
    console.log(document.getElementById('latitude').textContent)

    getProvinceName(document.getElementById('latitude').textContent ,document.getElementById('longitude').textContent , function(province) {
        if (province) {
            document.getElementById('region').textContent = province;
        } else {
            console.log("Could not get province name.");
        }}
    );
}

//Using Nominatim to get the province name : to round down the area search based on the province || for future use :-)

function getProvinceName(lat, lng, callback) {
    const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`;

    fetch(url)
        .then(response => response.json())
        .then(data => {
            if (data && data.address && data.address.state) {
                callback(data.address.state);
            } else {
                callback(null);
            }
        })
        .catch(error => {
            console.error("Error fetching location data: ", error);
            callback(null);
        });
}
document.getElementById('saveData').addEventListener('click',async function () {
    const longitude = document.getElementById('longitude').textContent;
    const latitude = document.getElementById('latitude').textContent;
    const region = document.getElementById('region').textContent;

    const data = {
        longitude: longitude,
        latitude: latitude,
        region: region,
        timestamp: Date()
    };

    if (!fileHandle) {
        fileHandle = await window.showSaveFilePicker({
            suggestedName: 'data.json',
            types: [{
                description: 'JSON files',
                accept: {
                    'application/json': ['.json']
                }
            }]
        });
    }

    const writable = await fileHandle.createWritable();
    await writable.write(JSON.stringify(data, null, 2));
    await writable.close();
});
