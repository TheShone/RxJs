import { Logic } from "./observables/logic";
import { drawInit } from "./view/intialView";

console.log('Jes')

drawInit(document.body);
console.log('Kurac')

const inputTeam1:HTMLSelectElement = document.querySelector(".team1");
const inputTeam2:HTMLSelectElement = document.querySelector(".team2");

const logic = new Logic(inputTeam1,inputTeam2);