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

class Workout {
  date = new Date();
  // generate ID from date(timestamp) for each workout
  id = (Date.now() + "").slice(-10);

  constructor(coords, distance, duration) {
    this.coords = coords; // [lat, lng]
    this.distance = distance; // miles
    this.duration = duration; // mins
  }
}

class Running extends Workout {
  constructor(coords, distance, duration, cadence) {
    super(coords, distance, duration);
    this.cadence = cadence;
    this.calcPace();
  }

  calcPace() {
    // min/mile
    this.pace = this.duration / this.distance;
    return this.pace;
  }
}

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////// OOP ARCHITECTURE

class App {
  //  create private class fields
  #map;
  #mapEvent;
  constructor() {
    // Need to get geolocation as soon as obj is created
    this._getPosition();

    form.addEventListener("submit", this._newWorkout.bind(this));
  }

  _getPosition() {
    // Get location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        this._loadMap.bind(this),
        function () {
          alert("Please turn on your location");
        }
      );
    }
  }

  _loadMap(position) {
    //   Obtain coordinates from navigator Obj
    const { latitude, longitude } = position.coords;
    console.log(latitude, longitude);
    const coords = [latitude, longitude];

    // Code from Leaflet Overview page
    this.#map = L.map("map").setView([...coords], 17);

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(this.#map);

    // handle map click events
    this.#map.on("click", this._showForm.bind(this));
  }

  _showForm(mapE) {
    this.#mapEvent = mapE;
    form.classList.remove("hidden");
    inputDistance.focus();
  }

  _newWorkout(e) {
    e.preventDefault();

    // Clear input fields upon form submission
    inputDistance.value = inputDuration.value = inputCadence.value = "";

    // Display marker upon form submission
    const { lat, lng } = this.#mapEvent.latlng;

    // Marker

    L.marker([lat, lng])
      .addTo(this.#map)
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
  }
}

const app = new App();
