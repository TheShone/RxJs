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
    inputs.forEach((input) => {
      const container = document.createElement("div");
      container.classList.add("input-group");
  
      const label = document.createElement("label");
      label.innerHTML = input.name;
      label.classList.add("input-label");
      label.htmlFor = input.id;
      container.appendChild(label);
  
      const selectField = document.createElement("select");
            selectField.id = input.id;
            selectField.name = input.name;
            selectField.classList.add(input.id);

     teams.forEach((team) => {
                const option = document.createElement("option");
                option.value = team.id.toString(); 
                option.textContent = team.name; 
                selectField.appendChild(option);
            });
            container.appendChild(selectField);
  
      host.appendChild(container);
    });
  }