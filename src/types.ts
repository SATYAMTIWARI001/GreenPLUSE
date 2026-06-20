export interface User {
  id: string;
  email: string;
  name: string;
  avatarUrl?: string;
  createdAt: string;
  carbonScore: number; // in kg CO2 per day / year
  ecoRank: string; // e.g. "Green Warrior"
  badgeIds: string[];
  points: number;
  completedChallenges: string[];
  role: 'admin' | 'user';
  gender?: string;
}

export interface UserStats {
  daily: number;
  weekly: number;
  monthly: number;
  yearly: number;
}

export interface CarbonInputs {
  // Transportation
  vehicleType: 'car' | 'bike' | 'bus' | 'train' | 'metro' | 'walking' | 'cycling' | 'none';
  distancePerDay: number; // km
  fuelType?: 'petrol' | 'diesel' | 'electric' | 'hybrid' | 'none';
  
  // Electricity
  acHours: number;
  fanHours: number;
  tvHours: number;
  computerHours: number;
  mobileChargingSessions: number;

  // Food Habits
  dietType: 'vegan' | 'vegetarian' | 'mixed_diet';

  // Waste
  plasticUseScale: number; // 1-5 scale (1: none, 5: excessive)
  recyclingHabit: 'none' | 'partial' | 'full';
  foodWasteScale: number; // 1-5 scale
}

export interface CarbonResult {
  engine?: string;
  score: number; // Daily emissions in kg CO2
  yearlyScore: number; // Yearly emissions in metric tons
  grade: 'A+' | 'A' | 'B' | 'C' | 'D' | 'F';
  comparisonPercent: number; // comparison to average (e.g. -30% or +15%)
  breakdown: {
    transport: number;
    electricity: number;
    food: number;
    waste: number;
  };
  equivalents: {
    treesPlanted: number;
    carsRemovedDays: number;
    electricitySavedKwh: number;
  };
  suggestions: {
    transport: string[];
    energy: string[];
    food: string[];
    waste: string[];
  };
}

export interface Challenge {
  id: string;
  title: string;
  description: string;
  category: 'transport' | 'energy' | 'food' | 'waste';
  points: number;
  completedCount: number;
}

export interface LeaderboardEntry {
  id: string;
  name: string;
  avatarUrl?: string;
  ecoRank: string;
  carbonScore: number;
  points: number;
  type: 'user' | 'college' | 'city';
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  important: boolean;
}

export interface EnvironmentStats {
  treesPlantedTotal: number;
  co2ReducedTotal: number; // in kg
  usersActiveCount: number;
}

export interface SystemAnalytics {
  totalUsers: number;
  avgCarbonScore: number;
  totalChallengesCompleted: number;
  announcements: Announcement[];
  environment: EnvironmentStats;
}
