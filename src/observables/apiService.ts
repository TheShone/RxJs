import { Observable, from, map } from "rxjs";
import { Team } from "../models/team";
import { Player } from "../models/player";

const BASE_URL = "http://localhost:5000";
export function getTeam(id: string): Observable<Team>{
    return from(
        fetch(`${BASE_URL}/teams/?id=${id}`).
        then((res)=>{
            if(res.ok){
                return res.json()
            }
            else{
                console.log("Error response "+res.status);
            }
        })
        .catch((err) => console.log(err))
    ).pipe(
        map((teams: Team[]) => {
            if (teams && teams.length > 0) {
                return teams[0]; 
            } else {
                throw new Error("Tim nije pronađen");
            }
        })
    );
}
export function getTeams():Observable<Team[]>{
    return from(
        fetch(`${BASE_URL}/teams`).
        then((res)=>{
            if(res.ok){
                console.log(res);
                return res.json()
            }
            else{
                console.log("Error response "+res.status);
            }
        })
        .catch((err) => console.log(err))
    )
}
