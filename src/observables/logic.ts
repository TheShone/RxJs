import {
  EMPTY,
  Observable,
  Subject,
  combineLatest,
  interval,
  switchMap,
  take,
  takeUntil,
  takeWhile,
} from "rxjs";
import { Team } from "../models/team";
import {
  handleQuarterButtonClick,
  handleStartButtonClick,
  handleTeamSelect,
} from "./eventHandlers";

export class Logic {
  private team1$: Observable<Team>;
  private team2$: Observable<Team>;
  private startButtonClick$: Observable<Event>;
  private quarterButtonClick$: Observable<Event>;
  private endQuarterSubject = new Subject<number>();
  private endGameSubject = new Subject<void>();
  private threePointerSubject = new Subject<Team>();
  private timeoutSubject = new Subject<Team>();
  private substitution1 : number = 6;
  private substitution2 : number = 6;
  private consecutiveScores: { [teamId: string]: number } = {};
  private consecutiveScoreThreshold = 3;
  public Team1!: Team;
  public Team2!: Team;
  private timeoutActive: boolean = false;
  private remainingTimeoutTime: number = 0;
  private remainingQuarterTime: number = 10;
  private timeoutDuration: number =3;
  private timeoutTeam: Team | null = null;
  private matchEnded= false;
  private scoringEnabled: boolean = false;
  private cetvrtina: number = 0;
  constructor(
    inputTeam1: HTMLSelectElement,
    inputTeam2: HTMLSelectElement,
    startButton: HTMLButtonElement,
    quarterButton: HTMLButtonElement
  ) {
    this.team1$ = handleTeamSelect(inputTeam1);
    this.team2$ = handleTeamSelect(inputTeam2);
    this.startButtonClick$ = handleStartButtonClick(startButton);
    this.startButtonClick$.subscribe(() => {
      this.startMatch(document.body);
    });
    this.threePointerSubject.subscribe((team: Team) => {
      this.threePoint(team);
    });
    this.endQuarterSubject.subscribe((cetvrtina: number) => {
      this.endQuarter(cetvrtina);
    });
    this.endGameSubject.subscribe(() => {
      this.endMatch();
    });
    this.timeoutSubject.subscribe((team) => {
      const winnerDisplay = document.getElementById("winner-display");
      if(team===this.Team1)
      {
          console.log(`Timeout za ${team.name}!. ${this.getPlayer(team,this.substitution1)}!`);
          winnerDisplay.textContent = `Timeout za ${team.name}!. ${this.getPlayer(team,this.substitution1)}!`;
      }
      else
      {
          console.log(`Timeout za ${team.name}!. ${this.getPlayer(team,this.substitution2)}!`);
          winnerDisplay.textContent = `Timeout za ${team.name}!. ${this.getPlayer(team,this.substitution2)}!`;
      }
      this.timeoutActive = true;
      this.timeoutTeam = team;
      this.remainingTimeoutTime = this.timeoutDuration;
      this.scoringEnabled = false;
      this.clearCourt();
      const positions: number[]=[1,2,3,4,5,6]
      const courtContainer = document.getElementById("courtContainer")
      if(team===this.Team1)
      {
        const filteredPositions = positions.filter((p) => p !== this.substitution1);
        const randomIndex = Math.floor(Math.random() * filteredPositions.length);
        const randomElement = filteredPositions[randomIndex];
        this.drawPlayers1(courtContainer,team,randomElement);
        this.substitution1=randomElement
      }
      else
      {
        const filteredPositions = positions.filter((p) => p !== this.substitution2);
        const randomIndex = Math.floor(Math.random() * filteredPositions.length);
        const randomElement = filteredPositions[randomIndex];
        this.drawPlayers2(courtContainer,team,randomElement);
        this.substitution2=randomElement
      }
      this.pauseScoring();
      this.startTimeoutCountdown();
    });
    const buttonQuarter = document.getElementById(
      "buttonQuarter"
    ) as HTMLButtonElement;
    buttonQuarter.disabled = true;
    this.quarterButtonClick$ = handleQuarterButtonClick(quarterButton);
    this.quarterButtonClick$.subscribe(() => {
      const buttonQuarter = document.getElementById(
        "buttonQuarter"
      ) as HTMLButtonElement;
      buttonQuarter.disabled = true;
      this.scoringEnabled = true;
      this.cetvrtina = this.cetvrtina + 1;

      if (this.cetvrtina == 4) {
        const buttonQuarter = document.getElementById(
          "buttonQuarter"
        ) as HTMLButtonElement;
        buttonQuarter.disabled = true;
      }

      const quarterElement = document.getElementById("quarterElement");
      quarterElement.textContent = this.cetvrtina.toString();
      this.remainingQuarterTime = 10;
      interval(1000)
        .pipe(
          takeUntil(
            this.cetvrtina === 4 ? this.endGameSubject : this.endQuarterSubject
          ),
          takeWhile(() => (!this.timeoutActive || this.remainingTimeoutTime <= 0) ||
          this.remainingQuarterTime > 0)
        )
        .subscribe(() => {
          if(!this.scoringEnabled || this.timeoutActive || this.matchEnded)
          {
            return;
          }
          const randomTeam = Math.random() < 0.5 ? this.Team1 : this.Team2;
            const randomPoints = Math.floor(Math.random() * 3) + 1;
            randomTeam.score += randomPoints;
            if (randomPoints === 3) {
              this.threePointerSubject.next(randomTeam);
            }
            this.updateScoreDisplay();
            this.remainingQuarterTime -= 1;
            if(this.remainingQuarterTime>0)
            {
              this.checkConsecutiveScores(randomTeam);
            }
            if (this.remainingQuarterTime <= 0) {
              this.endQuarterSubject.next(this.cetvrtina);
            }
        });
    });
  }
  private startMatch(host: HTMLElement) {
    const startGame = document.getElementById(
      "startGame"
    ) as HTMLButtonElement;
    startGame.disabled = true;
    const backetballDiv = document.createElement("div");
    backetballDiv.classList.add("basketDiv");
    host.appendChild(backetballDiv);
    const scoreContainer = document.createElement("div");
    scoreContainer.classList.add("score-container");

    const quarterDiv = document.createElement("div");
    scoreContainer.appendChild(quarterDiv);
    const quarterLabel = document.createElement("label");
    quarterLabel.id = "quarterLabel";
    quarterLabel.classList.add("quarterLabel");
    quarterLabel.textContent = "Četvrtina: ";
    quarterDiv.appendChild(quarterLabel);
    const quarterElement = document.createElement("span");
    quarterElement.id = "quarterElement";
    quarterElement.classList.add("quarterElement");
    quarterDiv.appendChild(quarterElement);

    const team1Scorediv = document.createElement("div");
    scoreContainer.appendChild(team1Scorediv);

    const team1ScoreLabel = document.createElement("label");
    team1ScoreLabel.id = "team1ScoreLabel";
    team1ScoreLabel.classList.add("team1ScoreLabel");
    team1Scorediv.appendChild(team1ScoreLabel);
    const team1ScoreElement = document.createElement("span");
    team1ScoreElement.id = "team1-score";
    team1ScoreElement.classList.add("team-score");
    team1Scorediv.appendChild(team1ScoreElement);

    const team2Scorediv = document.createElement("div");
    scoreContainer.appendChild(team2Scorediv);
    const team2ScoreLabel = document.createElement("label");
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
    courtContainer.id="courtContainer";
    courtContainer.classList.add("basketball-court");
    host.appendChild(courtContainer);
    const courtContainerin1 = document.createElement("div");
    courtContainerin1.classList.add("basketball-courtin");
    courtContainer.appendChild(courtContainerin1);
    const courtContainerin2 = document.createElement("div");
    courtContainerin2.classList.add("basketball-courtin2");
    courtContainer.appendChild(courtContainerin2);
    combineLatest([this.team1$, this.team2$]).subscribe(([team1, team2]) => {
      if (team1 != undefined && team2 != undefined) {
        const buttonQuarter = document.getElementById(
          "buttonQuarter"
        ) as HTMLButtonElement;
        buttonQuarter.disabled = false;
        this.Team1 = team1;
        this.Team2 = team2;
        console.log(this.Team1);
        console.log(this.Team2);

        this.drawPlayers1(courtContainer, this.Team1,6);
        this.drawPlayers2(courtContainer, this.Team2,6);
        const team1ScoreLabel = document.getElementById("team1ScoreLabel");
        const team2ScoreLabel = document.getElementById("team2ScoreLabel");

        if (team1ScoreLabel && team2ScoreLabel) {
          team1ScoreLabel.textContent = this.Team1.name + ": ";
          team2ScoreLabel.textContent = this.Team2.name + ": ";
        }
      }
    });
  }
  private drawPlayers1(courtContainer: HTMLElement, team: Team, position:number) {
    this.drawPlayers(courtContainer, team, position,"player1","215px","400px","115px",
      "250px","315px","250px","80px","100px","350px","100px"
      )
  }
  private drawPlayers2(courtContainer: HTMLElement, team: Team, position:number) {
    this.drawPlayers(courtContainer, team, position,"player2","215px","580px","115px",
      "730px","315px","730px","80px","880px","350px","880px"
      )
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
  private endMatch() {
    if (!this.matchEnded) {
    const winnerDisplay = document.getElementById("winner-display");
    if (this.Team1.score > this.Team2.score) {
      winnerDisplay.textContent = `${this.Team1.name} je pobedila!`;
      console.log(`${this.Team1.name} je pobedila!`);
    } else if (this.Team2.score > this.Team1.score) {
      winnerDisplay.textContent = `${this.Team2.name} je pobedila!`;
      console.log(`${this.Team2.name} je pobedila!`);
    } else {
      winnerDisplay.textContent = "Nerešeno!";
      console.log("Nerešeno!");
    }
    this.matchEnded = true;
  }
  }
  private threePoint(tim: Team) {
    const winnerDisplay = document.getElementById("winner-display");
    winnerDisplay.textContent = `${tim.name} je postigla 3 poena!`;
  }
  private endQuarter(cetvrtina: number) {
    if (!this.timeoutActive) {
      const winnerDisplay = document.getElementById("winner-display");
      if (this.cetvrtina < 4) {
        const buttonQuarter = document.getElementById(
          "buttonQuarter"
        ) as HTMLButtonElement;
        buttonQuarter.disabled = false;
        winnerDisplay.textContent = `Završena je ${cetvrtina} četvrtina!`;
        console.log(`Završena je ${cetvrtina} četvrtina!`);
      } else {
        this.endMatch();
      }
    }
  }
  private pauseScoring() {
    console.log("Pauziranje generisanja poena...");
    this.timeoutActive = true;
    this.remainingQuarterTime = Math.max(this.remainingQuarterTime, 0);
    interval(1000)
      .pipe(
      switchMap(() => {
        if (this.timeoutActive) {
          return EMPTY; 
        }
        return interval(1000); 
      }),
      take(3),
      takeUntil(this.endQuarterSubject)
    )
      .subscribe(() => {
        console.log("Nastavljanje generisanja poena...");
        this.timeoutActive = false;
        this.timeoutTeam = null;
        this.remainingTimeoutTime = 0;
      });
  }
  private startTimeoutCountdown() {
    interval(1000)
      .pipe(takeWhile(() => this.timeoutActive && this.remainingTimeoutTime > 0)
      , takeUntil(this.endQuarterSubject))
      .subscribe(() => {
        this.remainingTimeoutTime -= 1;
        console.log(
          `Preostalo vreme za timeout: ${this.remainingTimeoutTime} sekundi`
        );
        if (this.remainingTimeoutTime === 0) {
          this.timeoutActive = false;
          this.timeoutTeam = null;
          this.scoringEnabled = true;
          const winnerDisplay = document.getElementById("winner-display");
          winnerDisplay.textContent = `Time out zavrsen, igra nastavlja dalje`;
        }
      });
  }
  private checkConsecutiveScores(team: Team) {
    console.log(this.consecutiveScores[team.id] + " " + team.name);
    if (!this.consecutiveScores[team.id]) {
      this.consecutiveScores[team.id] = 1;
    } else {
      this.consecutiveScores[team.id]++;
    }
      if (team === this.Team1) 
          this.consecutiveScores[this.Team2.id] = 0;
       else 
          this.consecutiveScores[this.Team1.id] = 0;
        if (this.consecutiveScores[team.id] >= this.consecutiveScoreThreshold) 
        {
          if (!this.timeoutActive || this.remainingTimeoutTime === 0) 
          {
            const otherTeam = team === this.Team1 ? this.Team2 : this.Team1;
            this.timeoutSubject.next(otherTeam);
            this.timeoutActive = true;
          }
        this.consecutiveScores[team.id] = 0;
      }
    
  }
  private drawPlayers(courtContainer: HTMLElement, team: Team, position:number,cssClass:string,p1t:string,p1l:string,p2t:string,
    p2l:string,p3t:string,p3l:string,p4t:string,p4l:string,p5t:string,p5l:string
    ) {
    if (team && team.players) {
      team.players
        .filter((player) => player.position !== position)
        .forEach((player) => {
          const playerElement = document.createElement("div");
          playerElement.classList.add(cssClass);
          switch (player.position) {
            case 1: {
              this.setStyles(playerElement, {
                top: p1t,
                left: p1l,
              });
              break;
            }
            case 2: {
              this.setStyles(playerElement, {
                top: p2t,
                left: p2l,
              });
              break;
            }
            case 3: {
              this.setStyles(playerElement, {
                top: p3t,
                left: p3l,
              });
              break;
            }
            case 4: {
              this.setStyles(playerElement, {
                top: p4t,
                left: p4l,
              });
              break;
            }
            case 5: {
              this.setStyles(playerElement, {
                top: p5t,
                left: p5l,
              });
              break;
            }
            case 6: {
              switch (position) {
                case 1: {
                  this.setStyles(playerElement, {
                    top: p1t,
                    left: p1l,
                  });
                  break;
                }
                case 2: {
                  this.setStyles(playerElement, {
                    top: p2t,
                    left: p2l,
                  });
                  break;
                }
                case 3: {
                  this.setStyles(playerElement, {
                    top: p3t,
                    left: p3l,
                  });
                  break;
                }
                case 4: {
                  this.setStyles(playerElement, {
                    top: p4t,
                    left: p4l,
                  });
                  break;
                }
                case 5: {
                  this.setStyles(playerElement, {
                    top: p5t,
                    left: p5l,
                  });
                  break;
                }
              }
            }
          }
          const labelElement = document.createElement("label");
          labelElement.classList.add("jersey-number");
          labelElement.textContent = player.jerseyNumber.toString();
          playerElement.appendChild(labelElement);
          courtContainer.appendChild(playerElement);
        });
    } else {
      console.log("else " + team);
    }
  }
  private clearCourt() {
    const courtContainer = document.querySelector(".basketball-courtin");
    if (courtContainer) {
      while (courtContainer.firstChild) {
        courtContainer.removeChild(courtContainer.firstChild);
      }
    }
  }
  private getPlayer(team: Team, position: number): string {
    if (team) {
      const player = team.players.find((p) => p.position === position);
      if (player) {
        return "Ulazi igrac "+player.surname+" sa brojem: "+player.jerseyNumber;
      }
    }
    return null; 
  }
}
