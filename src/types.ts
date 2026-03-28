export type GrowthStage = "Seedling" | "Tillering" | "Flowering" | "Maturity";

export interface FieldStatus {
  healthIndex: number;
  waterLevel: number;
  humidity: number;
  temperature: number;
  currentStage: string;
  day: number;
  totalDays: number;
}

export interface TimelineStep {
  id: string;
  title: string;
  description: string;
  status: "completed" | "active" | "upcoming";
  day?: number;
}
