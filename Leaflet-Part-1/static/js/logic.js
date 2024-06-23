// Create map
let map = L.map('map', {
    center: [36, -110],
    zoom: 4
  });
  
// Add a tile layer to the map
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
  }).addTo(map);

// Assign geoJSON URL
let url = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson";

// Color based on depth of earthquake gradient green -> red
function getColor(depth) {
    if (depth > 90) 
        return '#FF0000';
    if (depth > 70) 
        return '#FF4500';
    if (depth > 50) 
        return '#FFA500';
    if (depth > 30) 
        return '#FFFF00';
    if (depth > 10) 
        return '#ADFF2F';
    return '#00FF00';
  }

// Adjust circle sizes based on magnitude
function getRadius(magnitude) {
    if (magnitude) 
        return magnitude * 4;
    return 1;
    }

// Earthquake marker params
function style(feature) {
    return {
      radius: getRadius(feature.properties.mag),
      fillColor: getColor(feature.geometry.coordinates[2]),
      color: "#000",
      weight: 1,
      fillOpacity: 0.9
    };
  }
// https://gis.stackexchange.com/questions/243831/how-to-use-oneachfeature-in-leaflet-js-map
// On click - present data
function onEachFeature(feature, layer) {
    layer.bindPopup(
        `<h3>${feature.properties.place}</h3>
        <hr>
        <p>${new Date(feature.properties.time)}</p>
        <p>Magnitude: ${feature.properties.mag}</p>
        <p>Depth: ${feature.geometry.coordinates[2]}</p>`
    );
}

// Fetch the earthquake data and add it to the map
d3.json(url).then(data => {  
    // Create GeoJSON layer with the fetched data
    L.geoJSON(data, {
      pointToLayer: function (feature, latlng) {
        return L.circleMarker(latlng);
      },
      style: style,
      onEachFeature: onEachFeature
    }).addTo(map);
  });
  

// Create legend
let legend = L.control({ 
    position: 'bottomright' 
});

// https://gis.stackexchange.com/questions/245974/how-to-pass-a-parameter-into-control-onadd-in-leaflet
// legend params
legend.onAdd = function () {
    let div = L.DomUtil.create('div', 'info legend');
    let depths = [0, 10, 30, 50, 70, 90];

    div.innerHTML += "<h3>Depth (km)</h3>";
    // Set legends colors
    depths.forEach((depth, index) => {
        let nextDepth = depths[index + 1];
        
        // Could not get the colors to line up with the legend when I tried to add additional formatting in here and the .css file.
        let label = '<legend style="background:' + getColor(depth + 1) + '"></legend> ' + depth;
        
        if (nextDepth) {
          label += '-' + nextDepth + '<br>';
        } else {
          label += '+';
        }
        
        div.innerHTML += label;
      });

    return div;
    };

legend.addTo(map);