// url for past 7 Days of earthquakes
earthquake7url = 'https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson';
// url for past 30 days of Earthquakes
earthquake30url = 'https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_month.geojson';


function createMap(earthquakes, magnitude) {

    // Create the tile layer that will be the background of our map
    var lightmap = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
        attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
        tileSize: 512,
        zoomOffset: -1,
        maxZoom: 18,
        id: "light-v10",
        accessToken: API_KEY
    });
    var darkmap = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
        attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
        tileSize: 512,
        zoomOffset: -1,
        maxZoom: 18,
        id: "dark-v10",
        accessToken: API_KEY
    });
    var streetmap = L.tileLayer("https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
        attribution: "© <a href='https://www.mapbox.com/about/maps/'>Mapbox</a> © <a href='http://www.openstreetmap.org/copyright'>OpenStreetMap</a> <strong><a href='https://www.mapbox.com/map-feedback/' target='_blank'>Improve this map</a></strong>",
        tileSize: 512,
        maxZoom: 18,
        zoomOffset: -1,
        id: "mapbox/streets-v11",
        accessToken: API_KEY
    });
    /*
    var outdoormap = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
        attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
        maxZoom: 18,
        id: "outdoors-v10",
        accessToken: API_KEY
    });*/


    // Create a baseMaps object to hold the lightmap layer
    var baseMaps = {
        "Light Map": lightmap,
        "Dark Map": darkmap,
        "Street Map": streetmap
    };

    // Create an overlayMaps object to hold the bikeStations layer
    var overlayMaps = {
        "Magnitude & Depth": magnitude,
        "Earthquake Markers": earthquakes
    };
    // // Trouble shooting.. checking values
    // console.log(earthquakes);
    // console.log(magnitude);


    // Create the map object with options
    var map = L.map("map-id", {
        center: [15.62, -12.42],
        zoom: 3,
        layers: [lightmap, magnitude]
    });

    // Create a layer control, pass in the baseMaps and overlayMaps. Add the layer control to the map
    L.control.layers(baseMaps, overlayMaps, {
        collapsed: false
    }).addTo(map);


    // Create Legend variable
    var legend = L.control({ position: "bottomright" });

    // Legend div creation
    legend.onAdd = function() {
        var div = L.DomUtil.create("div", "legend");
        var labels = ["-10 km","10-30 km","30-50 km","50-70 km","70-90 km","90+ km"];
        //var categories = ['<strong>Depth of Earthquake</strong>'];
        var grades = [0, 11, 31, 51, 71, 91];
      
        div.innerHTML ='<div><b>Earthquake Depth</b></div';
      
        for(var i=0; i <grades.length; i++){
            div.innerHTML +='<i style="background:'+chooseColor(grades[i])+ '">&nbsp;</i>&nbsp;&nbsp;'+labels[i]+'<br/>';
        }
    return div;
    }; legend.addTo(map);

}


function chooseColor(earthquakeDepth) {
    switch (true) {
        case earthquakeDepth > 90:
            return "#ff0D0D";
        case earthquakeDepth > 70:
            return "#FF4E11";
        case earthquakeDepth > 50:
            return "#FF8E15";
        case earthquakeDepth > 30:
            return "#FaB733";
        case earthquakeDepth > 10:
            return "#ACB334";
        default:
            return "#69B34C";
    };
}


// set radiuss from magnitude
function radiusHelper(magnitudeValue) {
    if (magnitudeValue <= 1) {
        return 1;
    // } else if (magnitudeValue >= 30) {
    //     return magnitudeValue;
    } else {
        return magnitudeValue*6;
    }
}


function createMarkers(response) {

    // Pull the "Quakes" property off of response.data(features)
    var quakeFeatures = response.features;

    // Initialize an array to hold earthquake markers
    var earthquakeMarkers = [];
    var magnitude = [];

    // Loop through the stations array
    for (var index = 0; index < quakeFeatures.length; index++) {
        var features = quakeFeatures[index];
        // To pull list of coordinates from coord list
        var coordList = features.geometry.coordinates;

        /////// Earthquakes Layer ///////
        // For each latitude and longitude, create a marker and bind a popup with the data
        var earthquakeMark = L.marker(coordList.slice(0, 2).reverse())
            .bindPopup("<h3>" + features.properties.place + "</h3><h3>Magnitude: " + features.properties.mag + "</h3><h3>Depth: "+ coordList.slice(2, 3) + "</h3>");
        // Add earthquarkmark to preset list
        earthquakeMarkers.push(earthquakeMark);

        ////// Magnitude Layer ///////
        // Add magnitude color to visiulation
        var depthOfQuake = coordList.slice(2, 3)
        var magnitudeList = L.circleMarker(coordList.slice(0, 2).reverse(), {
            color: "white",
            fillColor: chooseColor(depthOfQuake),
            fillOpacity: 0.4,
            weight: 1.5,
            radius: radiusHelper(features.properties.mag)
        })
            .bindPopup("<h3>" + features.properties.place + "<h3><h3>Magnitude: " + features.properties.mag + "</h3><h3>Depth: "+ coordList.slice(2, 3) + "</h3>");
        ;

        //  Add magnitude to list for map 
        magnitude.push(magnitudeList);

        //console.log(coordList.slice(2, 3));
    };
    // // Troubleshooting checking values
    // console.log(coordList.slice(2, 3));
    // console.log(magnitude);

    // Create a layer group made from the bike markers array, pass it into the createMap function
    createMap(L.layerGroup(earthquakeMarkers), L.layerGroup(magnitude));
};


// Perform an API call to the EarthQuake API to get information. Call createMarkers when complete
d3.json(earthquake7url, createMarkers);





/*
////////////////////////////////////////
//BSC helper suggested this style code...... Need to research more

    // GeoJSON layer
    L.geoJson(data, {
        // Maken cricles
        pointToLayer: function(feature, latlng) {
          return L.circleMarker(latlng);
        },
        // cirecle style
        style: styleInfo,
        // popup for each marker
        onEachFeature: function(feature, layer) {
          layer.bindPopup("Magnitude: " + feature.properties.mag + "<br>Location: " + feature.properties.place);
        }
      }).addTo(myMap);
*/