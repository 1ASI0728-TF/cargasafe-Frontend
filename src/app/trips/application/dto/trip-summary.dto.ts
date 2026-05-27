export interface TotalTripSummary {
  totalTrips: {
    today: number;
    yesterday: number;
    last7Days: number;
    lastYear: number;
  };
}
