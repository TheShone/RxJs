import { Logic } from "./observables/logic";
import { drawInit } from "./view/intialView";

console.log("pusiKurac")
drawInit(document.body);

const inputTeam1:HTMLSelectElement = document.querySelector(".team1");
const inputTeam2:HTMLSelectElement = document.querySelector(".team2");
const startMatch:HTMLButtonElement = document.querySelector("#startGame")
console.log(startMatch)

const logic = new Logic(inputTeam1,inputTeam2,startMatch);