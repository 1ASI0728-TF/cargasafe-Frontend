import { Alert } from './alert.model';

export interface IncidentsByMonthData {
  month: string;
  year: number;
  temperatureIncidents: number;
  movementIncidents: number;
  totalIncidents: number;
  incidents: Alert[];
}
