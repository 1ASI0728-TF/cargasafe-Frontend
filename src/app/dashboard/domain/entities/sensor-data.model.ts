import { MovementData } from './movement-data.model';

export interface SensorData {
  temperature?: number;
  humidity?: number;
  movement?: MovementData;
  timestamp: Date;
}
