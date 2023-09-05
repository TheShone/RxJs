import { Logic } from "./observables/logic";
import { drawInit } from "./view/intialView";

drawInit(document.body);

const inputTeam1:HTMLSelectElement = document.querySelector(".team1");
const inputTeam2:HTMLSelectElement = document.querySelector(".team2");
const startMatch:HTMLButtonElement = document.querySelector("#startGame")
const startQuarter:HTMLButtonElement = document.querySelector("#buttonQuarter")
const logic = new Logic(inputTeam1,inputTeam2,startMatch,startQuarter);