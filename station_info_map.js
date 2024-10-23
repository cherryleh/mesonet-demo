document.addEventListener("DOMContentLoaded", function () {
    //var id = '0502';
    var map = L.map('map', {
        center: [20.389, -157.52275766141424],
        zoom: 7
    });

    // Add the basemap
    var basemap = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}', {
        attribution: 'Tiles &copy; Esri &mdash; Esri, DeLorme, NAVTEQ, TomTom, Intermap, iPC, USGS, FAO, NPS, NRCAN, GeoBase, Kadaster NL, Ordnance Survey, Esri Japan, METI, Esri China (Hong Kong), and the GIS User Community',
        minZoom: 0,
        maxZoom: 18
    });
    basemap.addTo(map);

    function addCircleMarker(lat, lon, name) {
        var circleMarkerOptions = {
            color: "white",
            fillColor: "red",
            fillOpacity: 0.5,
            radius: 8
        };
        L.circleMarker([lat, lon], circleMarkerOptions).bindPopup(name).addTo(map);
    }

    var greenIcon = new L.Icon({
        iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41]
      });
  
      

    function addMarker(lat, lon, name) {
        L.marker([lat,lon], {icon: greenIcon}).bindPopup(name).addTo(map);
    }

    $.get('/data/station_metadata.csv', function (csvString) {

        // Use PapaParse to convert string to array of objects
        var data = Papa.parse(csvString, { header: true, dynamicTyping: false }).data;

        for (var i in data) {
            var row = data[i];
            var lat = row.lat;
            var lon = row.lng;
            var name = row.name;
            var site_id = row.id;
            //var color = (site_id === id) ? 'blue' : 'red';  // Change color for specific point

            if (site_id === id) {
                map.setView([lat, lon], 14);
                addMarker(lat,lon,name)
            } else{
                addCircleMarker(lat,lon,name)
            }

            
        }

    });

    // IntersectionObserver to detect when the map becomes visible
    var mapObserver = new IntersectionObserver(function(entries) {
        entries.forEach(function(entry) {
            if (entry.isIntersecting) {
                setTimeout(function() {
                    map.invalidateSize();  // Force map to resize when it becomes visible
                }, 100);  // Delay to allow the DOM to render fully
            }
        });
    });

    // Start observing the map container
    var mapElement = document.getElementById('map');  // Ensure the 'map' ID matches your Leaflet map container
    mapObserver.observe(mapElement);

    // Update map attribution
    map.attributionControl.setPrefix(
        'View <a href="https://github.com/HandsOnDataViz/leaflet-map-csv" target="_blank">code on GitHub</a>'
    );
});
