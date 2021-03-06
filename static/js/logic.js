var myMap = L.map("map", {
  center: [39.8283, -98.5795],
  zoom: 4
});

// Adding tile layer
L.tileLayer("https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
  attribution: "© <a href='https://www.mapbox.com/about/maps/'>Mapbox</a> © <a href='http://www.openstreetmap.org/copyright'>OpenStreetMap</a> <strong><a href='https://www.mapbox.com/map-feedback/' target='_blank'>Improve this map</a></strong>",
  tileSize: 512,
  maxZoom: 18,
  zoomOffset: -1,
  id: "mapbox/streets-v11",
  accessToken: API_KEY
}).addTo(myMap);

var cityIcon = L.icon({
  iconUrl: 'static/images/city.png',
  shadowUrl: 'static/images/city.png',

  iconSize:     [60, 60], // size of the icon
  shadowSize:   [0, 0], // size of the shadow
  iconAnchor:   [30,30], // point of the icon which will correspond to marker's location
  shadowAnchor: [0, 0],  // the same for the shadow
  popupAnchor:  [-85,20] // point from which the popup should open relative to the iconAnchor
});

var trailIcon = L.icon({
  iconUrl: 'static/images/trail.png',
  shadowUrl: 'static/images/trail.png',

  iconSize:     [40, 40], // size of the icon
  shadowSize:   [0, 0], // size of the shadow
  iconAnchor:   [0, 0], // point of the icon which will correspond to marker's location
  shadowAnchor: [0, 0],  // the same for the shadow
  popupAnchor:  [-55, 20] // point from which the popup should open relative to the iconAnchor
});

var routeIcon = L.icon({
  iconUrl: 'static/images/rock.png',
  shadowUrl: 'static/images/rock.png',

  iconSize:     [40, 40], // size of the icon
  shadowSize:   [0, 0], // size of the shadow
  iconAnchor:   [0, 0], // point of the icon which will correspond to marker's location
  shadowAnchor: [0, 0],  // the same for the shadow
  popupAnchor:  [-55,20] // point from which the popup should open relative to the iconAnchor
});

var dispIcon = L.icon({
  iconUrl: 'static/images/green.png',
  shadowUrl: 'static/images/green.png',

  iconSize:     [40,40], // size of the icon
  shadowSize:   [0, 0], // size of the shadow
  iconAnchor:   [0,0], // point of the icon which will correspond to marker's location
  shadowAnchor: [0, 0],  // the same for the shadow
  popupAnchor:  [-55,20] // point from which the popup should open relative to the iconAnchor
});

// bring in city data
d3.csv("static/js/latlong_list.csv", function(response) {

  // Create a new marker cluster group
  var cityLayer = L.layerGroup()
  var cityMarkers = L.markerClusterGroup();

  // Loop through data
  for (var i = 0; i < response.length; i++) {

    // Set the data location property to a variable
    var city = response[i];
    // Add a new marker to the cluster group, bind a pop-up, and add on click event
    cityMarkers.addLayer(L.marker([city['latitude'], city['longitude']],{icon: cityIcon}).bindPopup(response[i].names))
      .on('click', click);
  };
  //add markers to layer
  cityMarkers.addTo(cityLayer);
  //add layer to myMap
  myMap.addLayer(cityLayer);  
});


//bring in activity data when clicking a city
function click(e) {
  // Variable for name of selected area
  var selectedArea = e.layer._popup._content;
  var lat = e.layer._latlng.lat;
  var lon = e.layer._latlng.lng;
  // Create a new marker cluster group
  var trailLayer = L.layerGroup()
  var trailMarkers = L.markerClusterGroup();

  // Create a new marker cluster group
  var routeLayer = L.layerGroup()
  var routeMarkers = L.markerClusterGroup();

  // Create a new marker cluster group
  var dispLayer = L.layerGroup()
  var dispMarkers = L.markerClusterGroup();
  
  // Bring in Trails data 
  d3.json(`/trails/${selectedArea}`).then(d => {

    //List of trial difficulty categories
    var trailDiffs = [
      {difficulty: "blueBlack", count: 0},
      {difficulty: "greenBlue", count: 0},
      {difficulty: "green", count: 0},
      {difficulty: "blue", count: 0},
      {difficulty: "dblack", count: 0},
      {difficulty: "black", count: 0}
    ];
    
    //empty array to collect trail difficulty ratings from selection
    var trailDiffCounts = []
    
    // Loop through the trail data
    d.forEach(function (tr) {
      // Push each difficulty to array
      trailDiffCounts.push(tr.difficulty)
      // Create a trailMarker for each trail and bind popup
      trailMarkers.addLayer(L.marker([tr['lat'], tr['lon']],{icon: trailIcon})
      .bindPopup(
        `<strong>${tr['trail']}</strong><br>
        <a href=${tr['url']} target="_blank"><img src=${tr['image_url']}></a><br>
        ${tr['summary']}<br>
        Length: ${tr['length']}<br>
        Difficulty: ${tr['difficulty']}<br>
        Stars: ${tr['stars']}
      `));
    });

    // add trail markers to trail layer
    trailMarkers.addTo(trailLayer);
    // add trail layer to my map
    myMap.addLayer(trailLayer);

    //Get count of each difficulty type
    trailDiffCounts.forEach(function (c){
       trailDiffs.forEach(function (f) {
        if (c==f['difficulty']) {
          var thisCount = f['count'];
          f['count'] = thisCount+1
        }
      });
    });
    //empty arrays for x and y
    x = []
    y = []

    //populate x and y arrays
    trailDiffs.forEach(function (z) {
      x.push(z['difficulty'])
      y.push(z['count'])
    });

    //create trace
    var trace1 = {
      x: x,
      y: y,
      type: "bar"
    };
    // create data array for the plot
    var data = [trace1];

    //Define plot layout
    var layout = {
      title: `Trail Difficulty Counts for ${selectedArea}`,
      xaxis: {title: "Difficulty"},
      yaxis: {title: "Number of Trails"}
    };

    //Difficulty bar plot
    Plotly.newPlot("trails-plot", data, layout)
  });

  // Bring in Routes data 
  d3.json(`/routes/${e.layer._popup._content}`).then(d => {    
    //List of route rating categories
    var routeRating = [
      {rating: "5.5", count: 0},
      {rating: "5.6", count: 0},
      {rating: "5.7", count: 0},
      {rating: "5.8", count: 0},
      {rating: "5.9", count: 0},
      {rating: "5.10", count: 0},
    ];

    var routeType = [
      {type: "Sport", count: 0},
      {type: "Trad", count: 0},
      {type: "TR", count: 0}
    ];

    // Empty arrays to collect chart data from selection
    var routeRatingCounts = []
    var routeTypeCounts = []

    // Loop through the trail data
    d.forEach(function (tr) {
      // Push each rating to array
      routeRatingCounts.push(tr.rating);
      // Push each type to array
      routeTypeCounts.push(tr.type);

      // Create a routeMarker for each route and bind popup
      routeMarkers.addLayer(L.marker([tr['lat'], tr['lon']],{icon: routeIcon})
      .bindPopup(
        `<strong>${tr['route']}</strong><br>
        <a href=${tr['url']} target="_blank"><img src=${tr['image_url']}></a><br>
        Type: ${tr['type']}<br>
        Rating: ${tr['rating']}<br>
        Pitches: ${tr['pitches']}<br>
        Stars: ${tr['stars']}
      `))
    });
    // add route markers to route layer
    routeMarkers.addTo(routeLayer);
    // add route layer to my map
    myMap.addLayer(routeLayer);

    //Bar Chart with Ratings
       // Get count of each rating type
    routeRatingCounts.forEach(function (c) {
      routeRating.forEach(function (f) {
        if (c.includes(f['rating'])) {
          var thisCount = f['count'];
          f['count'] = thisCount+1
        };
      });
    });
    //empty arrays for x and y
    x = []
    y = []
    //populate x and y arrays
    routeRating.forEach(function (z) {
      x.push(z['rating']);
      y.push(z['count']);
    });
    //create trace
    var trace2 = {
      x: x,
      y: y,
      type: "bar"
    };
    // create data array for the plot
    var dataBar = [trace2];
    //Define plot layout
    var layoutBar = {
      title: `Route Rating Counts for ${selectedArea}`,
      xaxis: {title: "Rating", type: 'category'},
      yaxis: {title: "Number of Routes"}
    };
    //Rating bar plot
    Plotly.newPlot("routes-plot", dataBar, layoutBar)

    //Pie Chart with Types
    // Get count of each type type
    routeTypeCounts.forEach(function (c) {
      routeType.forEach(function (f) {
        if (c.includes(f['type'])) {
          var thisCount = f['count'];
          f['count'] = thisCount+1
        };
      });
    });

    //empty arrays for values and labels
    values = []
    labels = []

    //populate values and labels arrays
    routeType.forEach(function (z) {
      values.push(z['count']);
      labels.push(z['type']);
    });

    //create traces
    var trace3 = {
      values: values,
      labels: labels,
      type: "pie"
    };

    var dataPie = [trace3];

    //Define pie layout
    var layoutPie = {
      title: `Route Types in ${selectedArea}`,
      height: 400,
      width: 400
    };
    
    //Type pie chart
    Plotly.newPlot("routes-pie", dataPie, layoutPie)

  });


  // Bring in Dispensary data 
  d3.json(`/dispensaries/${lat}/${lon}`).then(d => {    
  // Loop through the trail data
    d.forEach(function (tr) {
      trailMarkers.addLayer(L.marker([tr['lat'], tr['lon']],{icon: dispIcon})
      .bindPopup(
        `<strong>${tr['dispensary']}</strong><br>
        Type: ${tr['type']}<br>
      `))
    });
    dispMarkers.addTo(dispLayer);
    myMap.addLayer(dispLayer);

    //Additional steps with the data
  });
    myMap.flyTo([`${e.layer._latlng.lat}`,`${e.layer._latlng.lng}`],8)
};























// //bring in activity data when clicking a city
// function click(e) {

//   // Create a new marker cluster group
//   var trailLayer = L.layerGroup()
//   var trailMarkers = L.markerClusterGroup();

//   // Create a new marker cluster group
//   var routeLayer = L.layerGroup()
//   var routeMarkers = L.markerClusterGroup();

//   // Create a new marker cluster group
//   var dispLayer = L.layerGroup()
//   var dispMarkers = L.markerClusterGroup();

//   // Bring in Trails data 
//   d3.json(`/trails/${e.layer._popup._content}`).then(d => {    
//     // Loop through the trail data
//     d.forEach(function (tr) {
//       trailMarkers.addLayer(L.marker([tr['lat'], tr['lon']],{icon: trailIcon})
//       .bindPopup(
//         `<strong>${tr['trail']}</strong><br>
//         <a href=${tr['url']} target="_blank"><img src=${tr['image_url']}></a><br>
//         ${tr['summary']}<br>
//         Length: ${tr['length']}<br>
//         Difficulty: ${tr['difficulty']}<br>
//         Stars: ${tr['stars']}

//       `))
//     });
//     trailMarkers.addTo(trailLayer);
//     myMap.addLayer(trailLayer);



//     //Additional steps with the data

//   });

//   // Bring in Routes data 
//   d3.json(`/routes/${e.layer._popup._content}`).then(d => {    
//     // Loop through the trail data
//     d.forEach(function (tr) {
//       routeMarkers.addLayer(L.marker([tr['lat'], tr['lon']],{icon: routeIcon})
//       .bindPopup(
//         `<strong>${tr['route']}</strong><br>
//         <a href=${tr['url']} target="_blank"><img src=${tr['image_url']}></a><br>
//         Type: ${tr['type']}<br>
//         Rating: ${tr['rating']}<br>
//         Pitches: ${tr['pitches']}<br>
//         Stars: ${tr['stars']}
//       `))
//     });
//     routeMarkers.addTo(routeLayer);
//     myMap.addLayer(routeLayer);
    
//     //Additional steps with the data
//   });


//   // Bring in Dispensary data 
//   d3.json(`/dispensaries/${e.layer._latlng.lat}/${e.layer._latlng.lng}`).then(d => {    
//   // Loop through the trail data
//     d.forEach(function (tr) {
//       trailMarkers.addLayer(L.marker([tr['lat'], tr['lon']],{icon: dispIcon})
//       .bindPopup(
//         `<strong>${tr['dispensary']}</strong><br>
//         Type: ${tr['type']}<br>
//       `))
//     });
//     dispMarkers.addTo(dispLayer);
//     myMap.addLayer(dispLayer);

//     //Additional steps with the data
//   });
//   myMap.flyTo([`${e.layer._latlng.lat}`,`${e.layer._latlng.lng}`],8)
// };