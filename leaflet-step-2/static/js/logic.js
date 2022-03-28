// use the usgs geojson
var usgsURL = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson";
//taken from this repository: https://github.com/fraxen/tectonicplate
var platesPath = "https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_plates.json"
//color set from Color Brewer
//[#ffffb2,#fed976,#feb24c,#fd8d3c,#f03b20,#bd0026] lightest to darkest
//complimentary color for lines: "#b2b2ff"


//make the map
function createMap() {

  // Create the base layers 
  //used cartob's two free tile layers to make a simple light/dark mode map
  var lightMode = L.tileLayer('https://cartodb-basemaps-{s}.global.ssl.fastly.net/light_all/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://carto.com/basemaps/">CartoB</a> contributors'
  })

  var darkMode = L.tileLayer('https://cartodb-basemaps-{s}.global.ssl.fastly.net/dark_all/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://carto.com/basemaps/">CartoB</a> contributors'
  })


  // Create a baseMaps object.
  var baseMaps = {
    "Light Mode Map": lightMode,
    "Dark Mode Map": darkMode
  };

  //create layer groups here
  var earthquakes = new L.LayerGroup();
  var plateShapes = new L.LayerGroup();

  //build earthquake layer
  d3.json(usgsURL).then(function (data) {
    var earthquakeData = data.features
    L.geoJSON(earthquakeData, {
      pointToLayer: function(earthquakeData, latlng) {
      
        var magnitude = earthquakeData.properties.mag
  
        var color = ""
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
      onEachFeature: function (feature, layer) {
        layer.bindPopup(`<h3>${feature.properties.place}</h3><hr><p>${new Date(feature.properties.time)}</p>`);
      }
      //end of geojson
    }).addTo(earthquakes);
  //end of json
  });

  //build plate layer
  d3.json(platesPath).then(function (data) {
    var plateData = data.features
    console.log(plateData)
    L.geoJSON(plateData, {
      style: function (feature) {
        return {color: "#b2b2ff",fillOpacity:0};
      }
      //end of geojson
    }).addTo(plateShapes);
  //end of json
  });

  // Create an overlay object to hold our overlay.
  var overlayMaps = {
    Earthquakes: earthquakes,
    Tectonic_Plates: plateShapes
  };

  // Create our map, giving it the streetmap and earthquakes layers to display on load.
  var myMap = L.map("map", {
    center: [
      0,0
    ],
    zoom: 3.5,
    layers: [darkMode, earthquakes, plateShapes]
  });

  // Create a layer control.
  // Pass in baseMaps and overlayMaps.
  L.control.layers(baseMaps, overlayMaps, {
    collapsed: false
  }).addTo(myMap);

  //make legend
  colors = ['#ffffb2','#fed976','#feb24c','#fd8d3c','#f03b20','#bd0026'];
  legend = L.control({position: 'bottomright'});
  legend.onAdd = function () {
    div = L.DomUtil.create('div','info legend'),
      labels = ['<h3> Magnitude </h3>'],
      categories = ['<1','1 to <2', '2 to <3', '3 to <4', '4 to <6', '6+'];
  
    for (i = 0; i < categories.length; i++) {
      div.innerHTML +=
          labels.push('<i class = "square" style="background:' + colors[i] + '"></i> ' + categories[i] + '<br>');
    };
    div.innerHTML = labels.join('<hr>');
  return div

  };
  
  legend.addTo(myMap);
}
//call function to run it
createMap();