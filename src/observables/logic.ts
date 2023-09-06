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
      console.log(`Timeout za ${team.name}!`);
      const winnerDisplay = document.getElementById("winner-display");
      winnerDisplay.textContent = `Timeout za ${team.name}!`;
      this.timeoutActive = true;
      this.timeoutTeam = team;
      this.remainingTimeoutTime = this.timeoutDuration;
      this.scoringEnabled = false;
      this.pauseScoring();
      this.startTimeoutCountdown();
    });
    const buttonQuarter = document.getElementById(
      "buttonQuarter"
    ) as HTMLButtonElement;
    buttonQuarter.disabled = true;
    this.quarterButtonClick$ = handleQuarterButtonClick(quarterButton);
    this.quarterButtonClick$.subscribe(() => {
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

        this.drawPlayers1(courtContainer, this.Team1);
        this.drawPlayers2(courtContainer, this.Team2);
        const team1ScoreLabel = document.getElementById("team1ScoreLabel");
        const team2ScoreLabel = document.getElementById("team2ScoreLabel");

        if (team1ScoreLabel && team2ScoreLabel) {
          team1ScoreLabel.textContent = this.Team1.name + ": ";
          team2ScoreLabel.textContent = this.Team2.name + ": ";
        }
      }
    });
  }
  private drawPlayers1(courtContainer: HTMLElement, team: Team) {
    if (team && team.players) {
      team.players
        .filter((player) => player.position !== 6)
        .forEach((player) => {
          const playerElement = document.createElement("div");
          playerElement.classList.add("player1");
          switch (player.position) {
            case 1: {
              this.setStyles(playerElement, {
                top: "215px",
                left: `400px`,
              });
              break;
            }
            case 2: {
              this.setStyles(playerElement, {
                top: "115px",
                left: `250px`,
              });
              break;
            }
            case 3: {
              this.setStyles(playerElement, {
                top: "315px",
                left: `250px`,
              });
              break;
            }
            case 4: {
              this.setStyles(playerElement, {
                top: "80px",
                left: `100px`,
              });
              break;
            }
            case 5: {
              this.setStyles(playerElement, {
                top: "350px",
                left: `100px`,
              });
              break;
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
  private drawPlayers2(courtContainer: HTMLElement, team: Team) {
    if (team && team.players) {
      team.players
        .filter((player) => player.position !== 6)
        .forEach((player) => {
          const playerElement = document.createElement("div");
          playerElement.classList.add("player2");
          switch (player.position) {
            case 1: {
              this.setStyles(playerElement, {
                top: "215px",
                left: `580px`,
              });
              break;
            }
            case 2: {
              this.setStyles(playerElement, {
                top: "115px",
                left: `730px`,
              });
              break;
            }
            case 3: {
              this.setStyles(playerElement, {
                top: "315px",
                left: `730px`,
              });
              break;
            }
            case 4: {
              this.setStyles(playerElement, {
                top: "80px",
                left: `880px`,
              });
              break;
            }
            case 5: {
              this.setStyles(playerElement, {
                top: "350px",
                left: `880px`,
              });
              break;
            }
          }
          const labelElement = document.createElement("label");
          labelElement.classList.add("jersey-number");
          labelElement.textContent = player.jerseyNumber.toString();
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
    interval(3000)
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
}
