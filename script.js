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
  type = "running";
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
  #workouts = [];
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

    // For Validation
    //TODO: Get value from form inputs
    const type = inputType.value;
    const distance = +inputDistance.value;
    const duration = +inputDuration.value;
    const { lat, lng } = this.#mapEvent.latlng;
    let workout;

    //TODO: Check if data entered for Running is valid
    const validInputs = (...inputs) =>
      inputs.every((input) => Number.isFinite(input));
    const allPositive = (...inputs) => inputs.every((input) => input > 0);

    if (type === "running") {
      const cadence = +inputCadence.value; //running specific value
      console.log(distance, duration, cadence);
      if (
        !validInputs(distance, duration, cadence) ||
        !allPositive(distance, duration, cadence)
      ) {
        return alert("Input has to be a positive number");
      }

      // workout assignment based on exercise type
      workout = new Running([lat, lng], distance, duration, cadence);
      this.#workouts.push(workout);
      console.log(workout);
    }
    //TODO: Render workout as marker on map
    this.renderWorkoutMarker(workout);

    //TODO: Add new object to workout array
    this.#workouts.push(workout);

    //TODO: Render workout on workout list

    // Clear input fields upon form submission
    inputDistance.value = inputDuration.value = inputCadence.value = "";
  }

  // Marker
  renderWorkoutMarker(workout) {
    L.marker(workout.coords)
      .addTo(this.#map)
      .bindPopup(
        L.popup({
          autoClose: false,
          closeOnClick: false,
          className: `${workout.type}-popup`, //use css to style popup based on type
          maxWidth: 300,
          minWidth: 50,
        })
      )
      .setPopupContent(`workout`)
      .openPopup();
  }
}

const app = new App();
