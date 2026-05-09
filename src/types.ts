export interface Site {
  id: string;
  name: string;
  location: string;
  createdAt: string;
  ownerId: string;
}

export interface Laborer {
  id: string;
  name: string;
  siteId: string;
  dailyWage: number;
  totalAdvances: number;
  totalEarnings: number;
  ownerId: string;
}

export interface DailyLog {
  id: string;
  laborerId: string;
  siteId: string;
  date: string;
  present: boolean;
  advanceAmount: number;
  ownerId: string;
}

export interface StandardRate {
  id: string;
  material: string;
  price: number;
  unit: string;
  ownerId: string;
}

export interface ProgressPhoto {
  id: string;
  siteId: string;
  imageUrl: string;
  caption: string;
  timestamp: string;
  ownerId: string;
}

export enum CalculationUnit {
  METERS = 'm',
  FEET = 'ft'
}
