import { Team } from "../models/team";

export interface Input {
    name: string;
    type: string;
    id: string;
    value: string;
  }
  
  export interface Unit {
    name: string;
  }
  
  export const inputs: Input[] = [
    {
      name: "Team-1",
      type: "select",
      id: "team1",
      value: "",
    },
    {
      name: "Team-2",
      type: "select",
      id: "team2",
      value: "",
    },
  ];
  export class tim  {
    name:string;
    id:number
  }
  export const teams: tim[] = [
    {
        name: "Srbija",
        id: 0,
    },
    {
        name: "USA",
        id: 1,
    },
    {
      name: "Canada",
        id: 2,
    },
    {
      name: "Germany",
        id: 3,
    }
];
  
  