import { Observable, Subject, combineLatest, interval, take } from "rxjs";
import { Team } from "../models/team";
import {  handleQuarterButtonClick, handleStartButtonClick, handleTeamSelect } from "./eventHandlers";

export class Logic {
    private team1$: Observable<Team>;
    private team2$: Observable<Team>;
    private startButtonClick$: Observable<Event>;
    private quarterButtonClick$: Observable<Event>;
    private matchEndedSubject = new Subject<void>();
    private threePointerSubject= new Subject<Team>();
    public Team1!: Team;
    public Team2!: Team;
    private scoringEnabled: boolean = false;
    private cetvrtina: number = 0;
    constructor(inputTeam1:HTMLSelectElement,
        inputTeam2:HTMLSelectElement,
        startButton:HTMLButtonElement,
        quarterButton:HTMLButtonElement
        )
    {
        this.team1$ = handleTeamSelect(inputTeam1);
        this.team2$=handleTeamSelect(inputTeam2);
        this.startButtonClick$ = handleStartButtonClick(startButton);
        this.startButtonClick$.subscribe(() => {
        this.startMatch(document.body);
        });
        this.matchEndedSubject.subscribe(() => {
            this.endMatch();
        });
        this.threePointerSubject.subscribe((team:Team)=>{
            this.threePoint(team);
        })
        this.quarterButtonClick$ = handleQuarterButtonClick(quarterButton);
        this.quarterButtonClick$.subscribe(() => {
            this.scoringEnabled = true;
            this.cetvrtina=(this.cetvrtina+1);

            if(this.cetvrtina==4)
            {
                const buttonQuarter = document.getElementById("buttonQuarter") as HTMLButtonElement;
                buttonQuarter.disabled=true;
                
            }
            
            const quarterElement = document.getElementById("quarterElement");
            quarterElement.textContent=this.cetvrtina.toString() 
            interval(1000)
                .pipe(take(Math.floor(Math.random() * 10)+1))
                .subscribe(() => {
                    const randomTeam = Math.random() < 0.5 ? this.Team1 : this.Team2;
                    const randomPoints = Math.floor(Math.random() * 3) + 1;
                    randomTeam.score += randomPoints;
                    if(randomPoints===3)
                    {
                        this.threePointerSubject.next(randomTeam);
                    }
                    this.updateScoreDisplay();
                });
                console.log(this.cetvrtina);
                if (this.cetvrtina === 4) {
                    console.log("Čekanje kraja četvrte četvrtine...");
                    interval(1000*6)
                        .pipe(take(1))
                        .subscribe(() => {
                            console.log("Kraj meča");
                            this.matchEndedSubject.next();
                        });
                    }
            });
            
    }
    private startMatch(host: HTMLElement) {
        const backetballDiv = document.createElement("div");
        backetballDiv.classList.add("basketDiv");
        host.appendChild(backetballDiv);
        const scoreContainer = document.createElement("div");
        scoreContainer.classList.add("score-container");

        const quarterDiv = document.createElement("div");
        scoreContainer.appendChild(quarterDiv);
        const quarterLabel= document.createElement("label")
        quarterLabel.id = "quarterLabel";
        quarterLabel.classList.add("quarterLabel");
        quarterLabel.textContent="Četvrtina: ";
        quarterDiv.appendChild(quarterLabel);
        const quarterElement = document.createElement("span");
        quarterElement.id = "quarterElement";
        quarterElement.classList.add("quarterElement");
        quarterDiv.appendChild(quarterElement);

        const team1Scorediv = document.createElement("div");
        scoreContainer.appendChild(team1Scorediv);

        const team1ScoreLabel= document.createElement("label")
        team1ScoreLabel.id = "team1ScoreLabel";
        team1ScoreLabel.classList.add("team1ScoreLabel");
        team1Scorediv.appendChild(team1ScoreLabel);
        const team1ScoreElement = document.createElement("span");
        team1ScoreElement.id = "team1-score";
        team1ScoreElement.classList.add("team-score");
        team1Scorediv.appendChild(team1ScoreElement);

        const team2Scorediv = document.createElement("div");
        scoreContainer.appendChild(team2Scorediv);
        const team2ScoreLabel= document.createElement("label")
        team2ScoreLabel.id = "team2ScoreLabel";
        team2ScoreLabel.classList.add("team2ScoreLabel");
        team2Scorediv.appendChild(team2ScoreLabel);
        const team2ScoreElement = document.createElement("span");
        team2ScoreElement.id = "team2-score";
        team2ScoreElement.classList.add("team-score");
        team2Scorediv.appendChild(team2ScoreElement);
        const winnerDisplay = document.createElement("div");
        winnerDisplay.id = "winner-display";
        winnerDisplay.classList.add("winner-display");
        scoreContainer.appendChild(winnerDisplay);
        backetballDiv.appendChild(scoreContainer);
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
                const team1ScoreLabel = document.getElementById("team1ScoreLabel");
                const team2ScoreLabel = document.getElementById("team2ScoreLabel");
            
                if (team1ScoreLabel && team2ScoreLabel) {
                    team1ScoreLabel.textContent = this.Team1.name+": ";
                    team2ScoreLabel.textContent = this.Team2.name+": ";
                }
            }
        });
        
    }
    private drawPlayers1(courtContainer: HTMLElement, team: Team) {
        if (team && team.players) { 
            team.players
            .filter(player => player.position !== 6)
            .forEach((player) => {
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
                    const labelElement = document.createElement("label");
                    labelElement.classList.add('jersey-number');
                    labelElement.textContent=(player.jerseyNumber).toString();
                    playerElement.appendChild(labelElement);
                    courtContainer.appendChild(playerElement);
                
            });
        }
        else
        {
            console.log("else "+ team)
        }
    }
    private drawPlayers2(courtContainer: HTMLElement, team:Team) {
        if (team && team.players) { 
            team.players
            .filter(player => player.position !== 6)
            .forEach((player) => {
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
                    const labelElement = document.createElement("label");
                    labelElement.classList.add('jersey-number');
                    labelElement.textContent=(player.jerseyNumber).toString();
                    playerElement.appendChild(labelElement);
                    courtContainer.appendChild(playerElement);
                
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
    private updateScoreDisplay() {
        const team1ScoreElement = document.getElementById("team1-score");
        const team2ScoreElement = document.getElementById("team2-score");
    
        if (team1ScoreElement && team2ScoreElement) {
            team1ScoreElement.textContent = this.Team1.score.toString();
            team2ScoreElement.textContent = this.Team2.score.toString();
        }
    }
    private endMatch(){
        const winnerDisplay = document.getElementById("winner-display")
        if (this.Team1.score > this.Team2.score) {
             winnerDisplay.textContent = `${this.Team1.name} je pobedila!`;
        } else if (this.Team2.score > this.Team1.score) {
            winnerDisplay.textContent = `${this.Team2.name} je pobedila!`;
        } else {
            winnerDisplay.textContent = "Nerešeno!";
        }
        
    }
    private threePoint(tim: Team)
    {
        const winnerDisplay = document.getElementById("winner-display")
        winnerDisplay.textContent = `${tim.name} je postigla 3 poena!`;
    }
}
