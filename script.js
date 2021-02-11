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

const form = document.querySelector(".form");
const containerWorkouts = document.querySelector(".workouts");
const inputType = document.querySelector(".form__input--type");
const inputDistance = document.querySelector(".form__input--distance");
const inputDuration = document.querySelector(".form__input--duration");
const inputCadence = document.querySelector(".form__input--cadence");
const inputElevation = document.querySelector(".form__input--elevation");

class Workout {
  date = new Date();
  id = (Date.now() + "").slice(-10);
  constructor(coords, distance, duration) {
    this.coords = coords; //[lat, lng]
    this.distance = distance;
    this.duration = duration;
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
    //min per km
    this.pace = this.duration / this.distance;
    return this.pace;
  }
}

class Cycling extends Workout {
  type = "cycling";
  constructor(coords, distance, duration, elevGain) {
    super(coords, distance, duration);
    this.elevGain = elevGain;
    this.clacSpeed();
  }
  clacSpeed() {
    //km/h
    this.speed = this.distance / (this.duration / 60);
    return this.speed;
  }
}
// const run = new Running([39, -12], 5.2, 24, 178);
// const cycle = new Cycling([39, -12], 27, 95, 523);
//console.log(run, cycle);
class App {
  #map;
  #mapEvt;
  #workouts = [];
  constructor() {
    this._getPosition();
    form.addEventListener("submit", this._newWorkout.bind(this));
    inputType.addEventListener("change", this._toggleElevationField);
  }
  _getPosition() {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        this._loadMap.bind(this),
        function (err) {
          alert("could not get your position");
          console.log(err);
        }
      );
    }
  }
  _loadMap(position) {
    const { latitude } = position.coords;
    const { longitude } = position.coords;
    const coords = [latitude, longitude];
    this.#map = L.map("map").setView(coords, 13);
    L.tileLayer("https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png", {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(this.#map);
    this.#map.on("click", this._showForm.bind(this));
  }

  _showForm(mapE) {
    this.#mapEvt = mapE;
    form.classList.remove("hidden");
    inputDistance.focus();
  }
  _toggleElevationField() {
    inputElevation.closest(".form__row").classList.toggle("form__row--hidden");
    inputCadence.closest(".form__row").classList.toggle("form__row--hidden");
  }

  _newWorkout(evt) {
    const inputValidity = (...inputs) =>
      inputs.every((inp) => Number.isFinite(inp));
    const inputPositive = (...inputs) => inputs.every((inp) => inp > 0);
    evt.preventDefault();
    //get data from form
    const type = inputType.value;
    const distance = +inputDistance.value;
    const duration = +inputDuration.value;
    const { lat, lng } = this.#mapEvt.latlng;
    let workout;
    //validate data

    //if running create a run
    if (type === "running") {
      const cadence = +inputCadence.value;
      if (
        !inputValidity(distance, duration, cadence) ||
        !inputPositive(distance, duration, cadence)
      )
        return alert("Inputs have to be positive numbers");
      workout = new Running([lat, lng], distance, duration, cadence);
      //add new workout objec to workouts array
      this.#workouts.push(workout);
    }

    //if cycling create a cycle
    if (type === "cycling") {
      const elevGain = +inputElevation.value;
      if (
        !inputValidity(distance, duration, elevGain) ||
        !inputPositive(distance, duration)
      )
        return alert("Inputs have to be positive numbers");
      //add new workout objec to workouts array
      workout = new Cycling([lat, lng], distance, duration, elevGain);
      this.#workouts.push(workout);
    }
    console.log(this.#workouts);

    //render workout as marker
    this.renderWorkoutMarker(workout);

    // render workout on the list

    //hide form and i/p fields
    inputDistance.value = inputDuration.value = inputCadence.value = inputElevation.value =
      "";
    form.classList.add("hidden");
  }
  renderWorkoutMarker(workout) {
    L.marker(workout.coords)
      .addTo(this.#map)
      .bindPopup(
        L.popup({
          maxWidth: 250,
          minWidth: 100,
          autoClose: false,
          closeOnClick: false,
          className: `${workout.type}-popup`,
        })
      )
      .setPopupContent(workout.type)
      .openPopup();
  }
}

const app = new App();
console.log(app);
