"use strict";

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

  _setDescription() {
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
    this.description = `${this.type[0].toUpperCase()}${this.type.slice(1)} on ${
      months[this.date.getMonth()]
    } ${this.date.getDate()}`;
  }
}

class Running extends Workout {
  type = "running";
  constructor(coords, distance, duration, cadence) {
    super(coords, distance, duration);
    this.cadence = cadence;
    this.calcPace();
    this._setDescription();
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
    // event handlers
    form.addEventListener("submit", this._newWorkout.bind(this));

    // retrieve data from local storage
    this._getLocalStorage();
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
    form.style.display = "grid";
  }

  _hideForm() {
    // clear input
    inputDistance.value = inputDuration.value = inputCadence.value = "";

    form.classList.add("hidden");
    form.style.display = "none";
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

    //TODO: Add new object to workout array
    this.#workouts.push(workout);

    //TODO: Render workout as marker on map
    this._renderWorkoutMarker(workout);

    //TODO: Render workout on workout list
    this._renderWorkout(workout);

    // TODO: Clear input field and hide form
    this._hideForm();
    // Persisting data of all workouts in local storage
    this._setLocalStorage();
  }

  // Marker
  _renderWorkoutMarker(workout) {
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
      .setPopupContent(
        `${workout.type === "running" ? "🏃‍♂️" : "❓"} ${workout.description}`
      )
      .openPopup();
  }

  // DOM Manipulation
  _renderWorkout(workout) {
    let html = `
        <li class="workout workout--${workout.type}" data-id="${workout.id}">
          <h2 class="workout__title">${workout.description}</h2>
          <div class="workout__details">
            <span class="workout__icon"
              >${workout.type === "running" ? "🏃‍♂️" : "❓"}</span
            >
            <span class="workout__value">${workout.distance}</span>
            <span class="workout__unit">miles</span>
          </div>
          <div class="workout__details">
            <span class="workout__icon">⏱</span>
            <span class="workout__value">${workout.distance}</span>
            <span class="workout__unit">min</span>
          </div>

          <!--TODO: math function in JS to calculate this -->
          <div class="workout__details">
            <span class="workout__icon">⚡️</span>
            <span class="workout__value">${workout.pace.toFixed(1)}</span>
            <span class="workout__unit">min/mile</span>
          </div>
          <div class="workout__details">
            <span class="workout__icon">🦶🏼</span>
            <span class="workout__value">${workout.cadence}</span>
            <span class="workout__unit">spm</span>
          </div>
        </li>
    `;
    form.insertAdjacentHTML("afterend", html);
  }
  _setLocalStorage() {
    localStorage.setItem("workouts", JSON.stringify(this.#workouts));
  }

  _getLocalStorage() {
    const data = JSON.parse(localStorage.getItem("workouts"));

    if (!data) return;

    this.#workouts = data;

    this.#workouts.forEach((work) => {
      this._renderWorkout(work);
    });
  }

  reset() {
    localStorage.removeItem("workouts");
    location.reload();
  }
}

const app = new App();
