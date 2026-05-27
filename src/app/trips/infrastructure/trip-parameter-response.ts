export interface TripParameterResource {
  id: number;
  tripId: number;
  minTemperature: number | null;
  maxTemperature: number | null;
  minHumidity: number | null;
  maxHumidity: number | null;
  maxVibration: number | null;
}
