"use strict";

const months = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

// DOM Element Selection

const containerWorkouts = document.querySelector(".workouts");
const inputCadence = document.querySelector(".form__input--cadence");
const inputDistance = document.querySelector(".form__input--distance");
const inputDuration = document.querySelector(".form__input--duration");
const inputType = document.querySelector(".form__input--type");
const form = document.querySelector(".form");

// GLOBAL VARIABLES
let map, mapEvent;

// Get location
if (navigator.geolocation) {
  navigator.geolocation.getCurrentPosition(
    (position) => {
      //   Obtain coordinates from navigator Obj
      const { latitude, longitude } = position.coords;
      console.log(latitude, longitude);
      const coords = [latitude, longitude];

      // Code from Leaflet Overview page || map.Js requires #map
      map = L.map("map").setView([...coords], 17);

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      }).addTo(map);

      // handle map click events
      map.on("click", (mapE) => {
        mapEvent = mapE;
        form.classList.remove("hidden");
        inputDistance.focus();
      });
    },
    () => {
      alert("Please turn on your location");
    }
  );
}

form.addEventListener("submit", function (e) {
  e.preventDefault();

  // Clear input fields upon form submission
  inputDistance.value = inputDuration.value = inputCadence.value = "";

  // Display marker upon form submission
  console.log(mapEvent);
  const { lat, lng } = mapEvent.latlng;

  // Marker

  L.marker([lat, lng])
    .addTo(map)
    .bindPopup(
      L.popup({
        autoClose: false,
        closeOnClick: false,
        className: "popup",
        maxWidth: 300,
        minWidth: 50,
      })
    )
    .setPopupContent("Workout")
    .openPopup();
});
