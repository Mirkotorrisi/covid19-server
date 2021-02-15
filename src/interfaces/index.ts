export default interface Swab {
  swab_id: number;
  team_id: number;
  date: string;
  type: "rap" | "sier" | "mol";
  patient_id: number;
  done: boolean;
  positive_res: boolean;
}
export default interface Patient {
  patient_id: number;
  name: string;
  fiscal_code: string;
  dob: string;
  address: string;
  email: string;
  phone: string;
  hasCovid: boolean;
  swabs: Swab[];
}
