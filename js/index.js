"use strict";

//TO DO
//Display weather icon
//Optional: Display google map of location

//Outline of code flow:
//buttonHandler -> getUserLocation -> getWeather -> weather
$(document).ready(function () {

  //Listens and handles button clicks and calls the appropriate functions
  var buttonHandler = function buttonHandler() {

    $("#getWeatherButton").on("click", function () {
      if (navigator.geolocation) {
        getUserLocation();
      } else $("#displayWeather > h1").text("This browser does not support HTML5 Geolocation");
    });
  };

  //Gets user location and passes it to getWeather to make the API call.
  var getUserLocation = function getUserLocation() {
    var saveCurrentPosition = function saveCurrentPosition(position) {
      var userPosition = {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude
      };
      return userPosition;
    };

    var handleError = function handleError(error) {
      switch (error.code) {
        case error.PERMISSION_DENIED:
          $("#displayWeather > h1").text("User denied the request for Geolocation.");
          break;
        case error.POSITION_UNAVAILABLE:
          $("#displayWeather > h1").text("Location information is unavailable.");
          break;
        case error.TIMEOUT:
          $("#displayWeather > h1").text("The request to get user location timed out.");
          break;
        default:
          $("#displayWeather > h1").text("An unknown error has occurred.");
      }
    };

    var getPosition = function getPosition() {
      return new Promise(function (resolve, reject) {
        navigator.geolocation.getCurrentPosition(function (position) {
          resolve(saveCurrentPosition(position));
        }, function (error) {
          handleError(error);
        });
      });
    };

    getPosition().then(function (position) {
      return getWeather(position);
    }).catch(function (error) {
      return console.error(error);
    });
  };

  //Takes the given user position and makes the API call to get the weather object.
  //Take the weather object response and pass it to weather, which handles display as
  //well as converting the temperature.
  var getWeather = function getWeather(position) {
    var url = "https://fcc-weather-api.glitch.me/api/current?";
    var longitude = position.longitude;
    var latitude = position.latitude;

    return fetch(url + "lon=" + longitude + "&lat=" + latitude).then(function (response) {
      if (response.ok) {
        return response.json();
      }
    }).catch(function (error) {
      console.error(error);
      Promise.reject(error);
    }).then(function (jsonResponse) {
      weather.displayInfo(jsonResponse);
    });
  };

  //Handles display related functionalities as well as converting temperatures
  //from C to F or vice versa.
  //Note that temp returned from API call is in Celsius by default.
  var weather = function () {
    var displayInfo = function displayInfo(tempObj) {
      displayTemp(tempObj);
      displayMap(tempObj);
    };

    var displayTemp = function displayTemp(tempObj) {
      var tempInC = Math.round(tempObj.main.temp);
      var tempInF = convertTemp(tempObj.main.temp);
      $("#temperature").html(tempInF + "&deg; F <span style=\"border-right:2px solid #f4e7d7;margin-right:5px;\"></span>" + tempInC + "&deg; C");
      if (tempObj.weather[0].icon) {
        $("#weather-icon").attr("src", "https://openweathermap.org/img/w/" + tempObj.weather[0].icon + ".png");
        $("#weather-icon").css({ "border": "1px solid white", "border-radius": "4px" });
        $("#weather-icon-wrapper").show("fade", 1000);
      }
    };

    var displayMap = function displayMap(tempObj) {
      var gMapAPIKey = "AIzaSyCs0ElTOi7J5XJ0YgrBjP-4DPU8dg4akeQ";
      var url = "https://maps.googleapis.com/maps/api/staticmap?";
      var latitude = tempObj.coord.lat;
      var longitude = tempObj.coord.lon;
      var zoom = 12;
      var imgWidth = 700;
      var imgHeight = 350;
      var mapType = "roadMap";
      console.log(tempObj);
      $("#map").attr("src", url + "center=" + latitude + "," + longitude + "&zoom=" + zoom + "&size=" + imgWidth + "x" + imgHeight + "&mapType=" + mapType + "&key=" + gMapAPIKey);
      $("#map").css({ "border": "1px solid white", "border-radius": "3px", "box-shadow": "box-shadow: 5px 3px 15px rgba(0,0,0,0.2)" });
      $("#map-wrapper").show("drop", { "direction": "up" }, 1000);
    };

    //Main function used to convert temp. Only this function is
    //visible outside of this scope. Relies on convertCtoF() and
    //convertFtoC()
    var convertTemp = function convertTemp(temp) {
      //if (tempObj.metric === 'C')
      return convertCtoF(temp);
      //return convertFtoC(tempObj);
    };

    //To convert temperatures in degrees Celsius to Fahrenheit,
    //multiply by 1.8 (or 9/5) and add 32.
    var convertCtoF = function convertCtoF(temp) {
      temp = Math.round(temp * 1.8 + 32);
      return temp;
    };

    //To convert temperatures in degrees Fahrenheit to Celsius,
    //subtract 32 and multiply by .5556 (or 5/9).
    //     let convertFtoC = (tempObj) => {
    //       tempObj.temp = Math.trunc((tempObj.temp - 32) * 0.5556);
    //       tempObj.metric = 'C';
    //       return tempObj;
    //     }

    return {
      displayInfo: displayInfo
    };
  }();

  //Runs the app
  buttonHandler();
});