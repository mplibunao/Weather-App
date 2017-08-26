var skycons = new Skycons({"color": "#A9DD9B"});
  

$(document).ready(function(){
  //get geolocation using built-in navigator
  getLatLong();
  
  //generate weather icon
  skycons.add("weather-icon",Skycons.CLEAR_DAY);
  skycons.play();
  
  //event handler for convering temperature unit
  $('.temp-unit').on('click',function(){
    var tempValue = $('.temp-value').text();
    var apparentTemp = $('.apparent-temp').text();
    //remove the ° using regex
    tempValue = tempValue.replace(/\D/g,'');
    apparentTemp = apparentTemp.replace(/\D/g,'');
    var tempUnit = $('.temp-unit').text();
    convertTemp(tempValue,tempUnit,apparentTemp);
  });
  
});

//get location. if error call showError else call success
var getLatLong = function(){
  if (navigator.geolocation){
    navigator.geolocation.getCurrentPosition(success, showError);    
  } else{
    alert('Your browser does not support geolocation');
  }
}

//set position and call getLocation
var success = function(position){
  var lat = position.coords.latitude;
  var long = position.coords.longitude;
  getLocation(lat,long);
}

//show error; EDIT to show error on html instead
var showError = function(error) {
    switch(error.code) {
        case error.PERMISSION_DENIED:
            console.log("User denied the request for Geolocation.");
            break;
        case error.POSITION_UNAVAILABLE:
            console("Location information is unavailable.");
            break;
        case error.TIMEOUT:
            console("The request to get user location timed out.");
            break;
        case error.UNKNOWN_ERROR:
            console("An unknown error occurred.");
            break;
    }
}

//use google maps api to get address of lat and long
var getLocation = function(lat,long){
  var key="AIzaSyCeS0ONZ-_z1FP6jiLTzjZutI3qnU9HQ6s";
  var resultType = "neighborhood|political|locality"
  var url = "https://maps.googleapis.com/maps/api/geocode/json?latlng="+lat+","+long+"&key="+key+"&result_type="+resultType;
  //console.log(url);
  $.getJSON(url, function(json){
    //console.log(json);
    if (json.status =="OK"){
      var neighborhood;
      var locality;
      var province;
      var country;
      var region; //don't use this anymore
      
      //only select results index 0 because it's the most accurate location
      for (var i=0; i<json.results[0].address_components.length; i++){
        for (var j=0; j<json.results[0].address_components[i].types.length; j++){
          //check types value then store corresponding long_name
          switch (json.results[0].address_components[i].types[j]){
            case "neighborhood":
              neighborhood = json.results[0].address_components[i].long_name;
              break;
            case "locality":
              locality = json.results[0].address_components[i].long_name;
              break;
            case "administrative_area_level_2":
              province = json.results[0].address_components[i].long_name;
              break;
            case "route":  
            //case "administrative_area_level_1":
              region = json.results[0].address_components[i].long_name;
              break;
            case "country":
              country = json.results[0].address_components[i].long_name;
              break;
          }    
        }
      }
      //start calling weather api since maps api is done
      getWeather(lat,long);
      //insert values to html
      setNeighborhood(neighborhood);
      setLocality(locality);
      setCountry(country);
      setProvince(province);
      //setRegion(region);
      
      
    } else{
      //get weather using lat/long regardless of address
      getWeather(lat,long);
      checkMapsError(json.status);
    }
  });
}

//wait for delay, fadeOut, change html then fade back in
var setNeighborhood = function(value){
  $('.neighborhood').delay(1000).slideUp();
  setTimeout(function(){
      $('.neighborhood').html(value);
      $('.neighborhood').delay(400).slideDown();
    },1600);
}

var setLocality = function(value){
  $('.locality').delay(1000).slideUp();
    setTimeout(function(){
      $('.locality').html(value);
      $('.locality').delay(400).slideDown();
    },1600);
}

var setProvince = function(value){
  $('.province').delay(1000).slideUp();
  setTimeout(function(){
      $('.province').html(value);
      $('.province').delay(400).slideDown();
    },1600);
}

//insert region to neightborhood instead because it's too specific
var setRegion = function (value){
  $('.neighborhood').delay(1000).slideUp();
  setTimeout(function(){
      $('.neighborhood').html(value);
      $('.neighborhood').delay(400).slideDown();
    },1600);
}

var setCountry = function(value){
  $('.country').delay(1000).slideUp();
  setTimeout(function(){
      $('.country').html(value);
      $('.country').delay(400).slideDown();
    },1600);
}


var checkMapsError = function(status){
  //add error handling for different status types
  //if no address was found add functionality that displays latlong instead
  switch(status){
    case "ZERO_RESULTS":
      console.log("Geocode was successful but returned no results. Your Navigator's geolocation might have passed the wrong coordinates");
      break;
    case "OVER_QUERY_LIMIT":
      console.log("You api key has exceeded its quota");
      break;
    case "REQUEST_DENIED":
      console.log("Your request has been denied");
      break;
    case "INVALID_REQUEST":
      console.log("There might be something wrong with the API request. Check your query if any parameters are missing");
      break;
    case "UNKNOWN_ERROR":
      console.log("Request could not be processed due to a server error. Try again");
      break;
    default:
      console.log("Unknown Error. Status Message: "+status);
      break;
               }
}


//get weather
var getWeather = function (lat, lon){
  //create prompt that ask for the api key
  var apiId = "712a14e4abd28b917211dd985df0c06a";
  //optional arguements for the api call
  var exclude = "exclude=minutely,hourly,daily,alerts,flags";
  var units = "si";
  
  var apiUrl = "https://api.darksky.net/forecast/"+apiId+"/"+lat+","+lon+"?units="+units+"&callback=?";
  console.log(apiUrl);
  //$.getJSON("https://api.darksky.net/forecast/712a14e4abd28b917211dd985df0c06a/"+lat+","+lon+"?units=si&callback=?", function(json){
  $.getJSON(apiUrl, function(json){
    //console.log(json);
    //var weatherCondition = json.currently.summary;
    var weather = json.currently.icon
    var temp = json.currently.temperature;
    var apparentTemp = json.currently.apparentTemperature;
    setTemp(temp,'C',apparentTemp);
    setWeather(weather);
  });
}

//add effects and delays
var setTemp = function(temp,unit,apparentTemp){
  temp = Math.floor(temp);
  apparentTemp  = Math.floor(apparentTemp);
  $('.temp-value').delay(600).slideUp();
  $('.temp-unit').delay(600).slideUp();
  $('.apparent-temp').slideUp();
  
  setTimeout(function(){
      $('.temp-value').html(temp + "°").delay(400).slideDown();
      $('.temp-unit').html(unit).delay(400).slideDown();
      $('.apparent-temp').html("Feels like: "+ apparentTemp+"°").delay(400).slideDown();
    },1200);
}


//capitilze weather value then set
var setWeather = function(weather){
  
  var weatherArray = weather.split('-');
  //for each word, capitalize each first letter
  for (var i=0;i<weatherArray.length; i++){
    //split word into letter
    weatherArray[i] = weatherArray[i].split('');
    //capitlize first letter
    weatherArray[i][0] = weatherArray[i][0].toUpperCase();
    //join them back into a string
    weatherArray[i] = weatherArray[i].join('');
  }
  var weatherText = weatherArray.join(" ");
  
  
  $('.weather').delay(600).slideUp();
  $('#weather-icon').delay(600).slideUp();
  setTimeout(function(){
      $('.weather').html(weatherText).delay(400).slideDown();
      skycons.set("weather-icon", weather);
      $('#weather-icon').delay(400).slideDown();
    },1200);
}


var convertTemp = function(temp,unit,apparentTemp){
  unit = unit.toUpperCase();
  switch (unit) {
    case 'C':
      temp = Math.floor((temp*9/5)+32);
      apparentTemp = Math.floor((apparentTemp*9/5)+32);
      $('.temp-value').html(temp+"°");
      $('.temp-unit').html('F');
      $('.apparent-temp').html("Feels like: "+apparentTemp+"°");
      break;
    case 'F':
      temp = Math.floor((temp-32)* 5/9);
      apparentTemp = Math.floor((apparentTemp-32)* 5/9);
      $('.temp-value').html(temp+"°");
      $('.temp-unit').html('C');
      $('.apparent-temp').html("Feels like: "+apparentTemp+"°");
      break;
  }
}