// use the usgs geojson
var usgsURL = "https://earthquake.usgs.gov/fdsnws/event/1/query?format=geojson&starttime=2021-01-01&endtime=2021-01-02&maxlongitude=-69.52148437&minlongitude=-123.83789062&maxlatitude=48.74894534&minlatitude=25.16517337";

// get function
d3.json(usgsURL).then(function (data) {
  //call create features to the overlay layers
  createFeatures(data.features);
});

//color set from Color Brewer
//[#ffffb2,#fed976,#feb24c,#fd8d3c,#f03b20,#bd0026] lightest to darkest

//creates overlay layers
function createFeatures(earthquakeData) {

  // Define a function that we want to run once for each feature in the features array.
  // Give each feature a popup that describes the place and time of the earthquake.
  function onEachFeature(feature, layer) {
    layer.bindPopup(`<h3>${feature.properties.place}</h3><hr><p>${new Date(feature.properties.time)}</p>`);
  }


  // Create a GeoJSON layer that contains the features array on the earthquakeData object.
  // Run the onEachFeature function once for each piece of data in the array.
  var earthquakes = L.geoJSON(earthquakeData, {
    pointToLayer: function(earthquakeData, latlng) {
      
      magnitude = earthquakeData.properties.mag
      //console.log(magnitude)

      color = ""
      if (magnitude < 1) {
        color = "#ffffb2"
      }
      else if (magnitude < 2) {
        color = "#fed976"
      }
      else if (magnitude < 3) {
        color = "#feb24c"
      }
      else if (magnitude < 4) {
        color = "#fd8d3c"
      }
      else if (magnitude <= 6) {
        color = "#f03b20"
      }
      else if (magnitude >= 6) {
        color = "#bd0026"
      }
      else {
        color = "black"
      }

      return new L.CircleMarker(latlng, {
        radius: 4*magnitude,
        color: color, 
        weight: 2,
        fillOpacity: 0.8
      });
    },
    onEachFeature: onEachFeature
    
  });

  // Send our earthquakes layer to the createMap function
  createMap(earthquakes);
}

//generates the map
function createMap(earthquakes) {

  // Create the base layers.
  var lightMode = L.tileLayer('https://cartodb-basemaps-{s}.global.ssl.fastly.net/light_all/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://carto.com/basemaps/">CartoB</a> contributors'
  })

  //watercolor view
  var darkMode = L.tileLayer('https://cartodb-basemaps-{s}.global.ssl.fastly.net/dark_all/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://carto.com/basemaps/">CartoB</a> contributors'
  })

  var topo = L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
    attribution: 'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)'
  });

  // Create a baseMaps object.
  var baseMaps = {
    "Light Mode Map": lightMode,
    "Dark Mode Map": darkMode,
    "Topographic Map": topo
  };

  // Create an overlay object to hold our overlay.
  var overlayMaps = {
    Earthquakes: earthquakes
  };

  // Create our map, giving it the streetmap and earthquakes layers to display on load.
  var myMap = L.map("map", {
    center: [
      37.09, -95.71
    ],
    zoom: 5,
    layers: [lightMode, earthquakes]
  });

  // Create a layer control.
  // Pass it our baseMaps and overlayMaps.
  L.control.layers(baseMaps, overlayMaps, {
    collapsed: false
  }).addTo(myMap);

  //make legend
  colors = ["#ffffb2","#fed976","#feb24c","#fd8d3c","#f03b20","#bd0026"];
  legend = L.control({position: 'bottomright'});
  console.log(colors)
  legend.onAdd = function () {
    div = L.DomUtil.create('div','info legend'),
      categories = ['<1','1 to <2', '2 to <3', '3 to <4', '4 to <6', '6+'],
      labels = [];
  
    div.innerHTML += '<h3> Magnitude </h3>'

    for (i = 0; i < categories.length; i++) {
      console.log(colors[i])
      div.innerHTML +=
          `<em style="background:${colors[i]}"></em>${categories[i]}<br>`;
    };
    
  console.log(div);
  return div

  };
  
  legend.addTo(myMap);
}