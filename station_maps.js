
    var latitude = 20.389;
    var longitude = -157.52275766141424;

    // Initialize the map
    var map = L.map('map', {
        center: [latitude, longitude],
        zoom: 7
    });

    // Add the basemap
    var basemap = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}', {
        attribution: 'Tiles &copy; Esri &mdash; Esri, DeLorme, NAVTEQ, TomTom, Intermap, iPC, USGS, FAO, NPS, NRCAN, GeoBase, Kadaster NL, Ordnance Survey, Esri Japan, METI, Esri China (Hong Kong), and the GIS User Community',
        minZoom: 0,
        maxZoom: 18
    });
    basemap.addTo(map);

    $.get('https://raw.githubusercontent.com/HCDP/loggernet_station_data/refs/heads/main/csv_data/metadata/metadata.csv', function(csvString) {

        // Use PapaParse to convert string to array of objects
        var data = Papa.parse(csvString, {header: true, dynamicTyping: true}).data;

        // For each row in data, create a marker and add it to the map
        // For each row, columns `Latitude`, `Longitude`, and `Title` are required
        for (var i in data) {
          var row = data[i];

          var marker = L.marker([row.lat, row.lng], {
            opacity: 1
          }).bindPopup(row.Title);
      
          marker.addTo(map);
        }

      });

    map.attributionControl.setPrefix(
        'View <a href="https://github.com/HandsOnDataViz/leaflet-map-csv" target="_blank">code on GitHub</a>'
    );

    var islands = L.geoJSON(coastline, {
        color:'none',
    }
    );
    
    selectbox = document.getElementById('zoombox');

    var featuremap = {};
    
    
    
    for (var i = 0; i < coastline['features'].length; i++) {
        feature = coastline['features'][i];
        featuremap[feature['properties']['isle']] = feature['properties'];
    
    }
    
    function zoomToIsl() {
        key = selectbox.value;
        obj = featuremap[key];
        isl = obj[Object.keys(obj)[0]];
        if (isl == 'Hawaii') {
            map.setView([obj['lat'], obj['lon']], 9);
        } else if (isl == 'Lanai') {
            map.setView([obj['lat'], obj['lon']], 11);
        } else {
            map.setView([obj['lat'], obj['lon']], 10);
        }
                
    }