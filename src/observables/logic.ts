import { Observable, combineLatest } from "rxjs";
import { Team } from "../models/team";
import {  handleStartButtonClick, handleTeamSelect } from "./eventHandlers";

export class Logic {
    private team1$: Observable<Team>;
    private team2$: Observable<Team>;
    private startButtonClick$: Observable<Event>;
    public Team1!: Team;
    public Team2!: Team;
    constructor(inputTeam1:HTMLSelectElement,
        inputTeam2:HTMLSelectElement,
        startButton:HTMLButtonElement
        )
    {
        this.team1$ = handleTeamSelect(inputTeam1);
        this.team2$=handleTeamSelect(inputTeam2);
        this.startButtonClick$ = handleStartButtonClick(startButton);
        this.startButtonClick$.subscribe(() => {
        this.startMatch(document.body);
        });
    }
    private startMatch(host: HTMLElement) {
        const courtContainer = document.createElement("div");
        courtContainer.classList.add('basketball-court')
        host.appendChild(courtContainer);
        const courtContainerin1 = document.createElement("div");
        courtContainerin1.classList.add('basketball-courtin')
        courtContainer.appendChild(courtContainerin1);
        const courtContainerin2 = document.createElement("div");
        courtContainerin2.classList.add('basketball-courtin2')
        courtContainer.appendChild(courtContainerin2);
        combineLatest([this.team1$, this.team2$]).subscribe(([team1, team2]) => {
            if (team1 != undefined && team2 != undefined) {
                this.Team1 = team1;
                this.Team2 = team2;
                console.log(this.Team1);
                console.log(this.Team2);

                this.drawPlayers1(courtContainer, this.Team1);
                this.drawPlayers2(courtContainer, this.Team2);
            }
        });
        
    }
    private drawPlayers1(courtContainer: HTMLElement, team: Team) {
        if (team && team.players) { 
            team.players.forEach((player) => {
                const playerElement = document.createElement("div");
                playerElement.classList.add('player1')
                switch(player.position)
                {
                    case 1:{
                        this.setStyles(playerElement, {
                            top: '215px',
                            left: `400px`,
                        });
                        break;
                    }
                    case 2 : {
                        this.setStyles(playerElement, {
                            top: '115px',
                            left: `250px`,
                        });
                        break;
                    }
                    case 3 : {
                        this.setStyles(playerElement, {
                            top: '315px',
                            left: `250px`,
                        });
                        break;
                    }
                    case 4 : {
                        this.setStyles(playerElement, {
                            top: '80px',
                            left: `100px`,
                        });
                        break;
                    }
                    case 5 : {
                        this.setStyles(playerElement, {
                            top: '350px',
                            left: `100px`,
                        });
                        break;
                    }
                }
                if(player.position!=6)
                {
                    const labelElement = document.createElement("label");
                    labelElement.classList.add('jersey-number');
                    labelElement.textContent=(player.jerseyNumber).toString();
                    playerElement.appendChild(labelElement);
                    courtContainer.appendChild(playerElement);
                }
            });
        }
        else
        {
            console.log("else "+ team)
        }
    }
    private drawPlayers2(courtContainer: HTMLElement, team:Team) {
        if (team && team.players) { 
            team.players.forEach((player) => {
                const playerElement = document.createElement("div");
                playerElement.classList.add("player2")
                switch(player.position)
                {
                    case 1:{
                        this.setStyles(playerElement, {
                            top: '215px',
                            left: `580px`,
                        });
                        break;
                    }
                    case 2 : {
                        this.setStyles(playerElement, {
                            top: '115px',
                            left: `730px`,
                        });
                        break;
                    }
                    case 3 : {
                        this.setStyles(playerElement, {
                            top: '315px',
                            left: `730px`,
                        });
                        break;
                    }
                    case 4 : {
                        this.setStyles(playerElement, {
                            top: '80px',
                            left: `880px`,
                        });
                        break;
                    }
                    case 5 : {
                        this.setStyles(playerElement, {
                            top: '350px',
                            left: `880px`,
                        });
                        break;
                    }
                }
                if(player.position!=6)
                {
                    const labelElement = document.createElement("label");
                    labelElement.classList.add('jersey-number');
                    labelElement.textContent=(player.jerseyNumber).toString();
                    playerElement.appendChild(labelElement);
                    courtContainer.appendChild(playerElement);
                }
            });
        }
    }
    public setStyles(element: HTMLElement, styles: { [key: string]: string }) {
        for (const key in styles) {
            if (styles.hasOwnProperty(key)) {
                (element.style as any)[key] = styles[key];
            }
        }
    }
}
