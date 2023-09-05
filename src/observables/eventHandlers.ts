import { Observable, debounceTime, fromEvent, map, switchMap } from "rxjs";
import { Team } from "../models/team";
import { getTeam } from "./apiService";

export function handleTeamSelect(selectElement: HTMLSelectElement): Observable<Team> {
    return fromEvent(selectElement, "change").pipe(
        map((ev: Event) => {
            const selectedOption = (<HTMLSelectElement>ev.target).selectedOptions[0];
            return selectedOption ? selectedOption.value : null;
        }),
        switchMap((teamId: string | null) => {
            if (teamId !== null) {
                return getTeam(teamId); 
            } else {
                return ;
            }
        })
    );
}
export function handleStartButtonClick(startButton: HTMLButtonElement): Observable<Event> {
    return fromEvent(startButton, "click");
  }
  export function handleQuarterButtonClick(quarterButton: HTMLButtonElement): Observable<Event> {
    return fromEvent(quarterButton, "click");
  }






