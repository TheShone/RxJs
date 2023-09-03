import { Observable, combineLatest } from "rxjs";
import { Team } from "../models/team";
import { handleTeamSelect } from "./eventHandlers";

export class Logic {
    private team1$: Observable<Team>;
    private team2$: Observable<Team>;
    public Team1!: Team;
    public Team2!: Team;
    constructor(inputTeam1:HTMLSelectElement,
        inputTeam2:HTMLSelectElement)
    {
        this.team1$ = handleTeamSelect(inputTeam1);
        this.team2$=handleTeamSelect(inputTeam2);
        this.startMatch()
    }
    private startMatch() {
        combineLatest([this.team1$, this.team2$]).subscribe(([team1, team2]) => {
            if (team1 != undefined && team2 != undefined) {
                this.Team1 = team1;
                this.Team2 = team2;
                console.log(this.Team1);
                console.log(this.Team2);
            }
        });
    }
}