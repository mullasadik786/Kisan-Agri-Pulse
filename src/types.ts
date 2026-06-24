export type CropCategory = 'Kharif' | 'Rabi' | 'Zaid';

export interface Scheme {
  id: string;
  name: string;
  authority: string;
  description: string;
  benefit: string;
  eligibility: {
    landLimitMaxHectares?: number;
    states?: string[];
    cropCategories?: CropCategory[];
    targetGroup?: string;
  };
  link: string;
  source: string;
}

export interface FarmerProfile {
  id: string;
  name: string;
  state: string;
  district: string;
  landSizeHectares: number;
  cropCategory: CropCategory;
  mainCrops: string[];
  farmerId: string;
}

export interface MSPCrop {
  id: string;
  name: string;
  category: CropCategory;
  mspCurrent: number; // in INR per Quintal
  mspPrevious: number; // in INR per Quintal
  percentChange: number;
  lastUpdated: string;
  arrivalTrend: 'Increasing' | 'Stable' | 'Decreasing';
  demandIndex: 'High' | 'Moderate' | 'Low';
  salesRecommendation: string;
  marketCentres: { name: string; price: number }[];
  isZbnf?: boolean;
  isHorticulture?: boolean;
}

export interface WeatherAlert {
  id: string;
  block: string;
  district: string;
  state: string;
  severity: 'Info' | 'Warning' | 'Danger';
  event: string;
  description: string;
  triggerAction: string;
  validUntil: string;
}

export interface CropDiagnosticResult {
  diagnosis: string;
  severity: 'Mild' | 'Moderate' | 'Severe' | 'Healthy';
  remedyOrganic: string;
  remedyChemical: string;
  expertTips: string[];
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  timestamp: string;
  text: string;
  image?: string; // base64 or representation
  diagnostic?: CropDiagnosticResult;
}

export interface PitchSlide {
  id: string;
  slideNumber: number;
  title: string;
  subtitle?: string;
  focusArea: string;
  bullets: string[];
  designAesthetic: string;
  technicalEnablers: string[];
}

export interface IdeathonPitch {
  title: string;
  trackName: string;
  proposedByString: string;
  problemStatement: string;
  solutionOverview: string;
  alignmentDigitalAgri: string;
  slides: PitchSlide[];
}
