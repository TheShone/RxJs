import { combineLatest, map, startWith } from "rxjs";
import { getTeams } from "../observables/apiService";
import { inputs, teams } from "./viewConfig";

export function drawInit(host: HTMLElement){
    const instructionsContainer = document.createElement("div");
    instructionsContainer.classList.add("instructions-container");
    drawInputs(instructionsContainer);
    host.appendChild(instructionsContainer);
}
function drawInputs(host: HTMLDivElement) {
    const inputsContainer = document.createElement("div");
    inputsContainer.classList.add("inputs-container");
  
    const inputForm = document.createElement("form");
    inputForm.classList.add("inputs-form");
    const title = document.createElement("label");
    title.classList.add("title");
    title.textContent="Filipini MundoBasket 2023";
    inputForm.appendChild(title);
    const buttonGame = document.createElement("button");
    buttonGame.innerHTML = "Započni utakmicu";
    buttonGame.classList.add("btn-simulate");
    buttonGame.id="startGame"
    inputsContainer.appendChild(buttonGame);
    drawInputFields(inputForm);
    inputsContainer.appendChild(inputForm);
    const buttonQuarter = document.createElement("button");
    buttonQuarter.innerHTML = "Započni četvrtinu";
    buttonQuarter.classList.add("btn-simulate");
    buttonQuarter.id="buttonQuarter"
    inputsContainer.appendChild(buttonQuarter);
  
    host.appendChild(inputsContainer);
  }
  function drawInputFields(host: HTMLFormElement) {
    const container = document.createElement("div");
    container.classList.add("input-group");
    const label = document.createElement("label");
    label.innerHTML = inputs[0].name;
    label.classList.add("input-label");
    label.htmlFor = inputs[0].id;
    container.appendChild(label);
    const team1Select = document.createElement("select");
    team1Select.id = inputs[0].id;
    team1Select.name = inputs[0].name;
    team1Select.classList.add(inputs[0].id);
    container.appendChild(team1Select);
    const container2 = document.createElement("div");
    container2.classList.add("input-group");
    const label2 = document.createElement("label");
    label2.innerHTML = inputs[1].name;
    label2.classList.add("input-label");
    label2.htmlFor = inputs[1].id;
    container2.appendChild(label2);
    const team2Select = document.createElement("select");
    team2Select.id = inputs[1].id;
    team2Select.name = inputs[1].name;
    team2Select.classList.add(inputs[1].id);
    container2.appendChild(team2Select);
    const team1Options = createTeamOptions(team1Select);
    const team2Options = createTeamOptions(team2Select);
    
    combineLatest([team1Options, team2Options]).pipe(
      map(([team1Options, team2Options]) => {
        return { team1Options, team2Options };
      }),
      startWith({ team1Options: [], team2Options: [] })
    ).subscribe(({ team1Options, team2Options }) => {
      team1Select.innerHTML = "";
      team2Select.innerHTML = "";
      team1Options.forEach((option) => {
        team1Select.appendChild(option);
      });
      team2Options.forEach((option) => {
        team2Select.appendChild(option);
      });
    });
    
    host.appendChild(container);
    host.appendChild(container2);
  }
  function createTeamOptions(select: HTMLSelectElement) {
    return getTeams().pipe(
      map((teams) => {
        const options: HTMLOptionElement[] = [];
        const chooseOption = document.createElement("option");
        chooseOption.value = ""; 
        chooseOption.textContent = "Izaberi...";
        options.push(chooseOption);
        teams.forEach((team) => {
          const option = document.createElement("option");
          option.value = team.id.toString();
          option.textContent = team.name;
          options.push(option);
        });
        return options;
      })
    );
  }