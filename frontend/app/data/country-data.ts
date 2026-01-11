export interface CountryData {
  value: number;
  color?: string;
}

export interface RegionMarker {
  id: string;
  name: string;
  coordinates: [number, number];
}

// Default to 0 - populated based on actual data
export const topCountries = [
  { code: "US", name: "United States", requests: 0, color: "#1e40af" },
  { code: "DE", name: "Germany", requests: 0, color: "#FFCE00" },
  { code: "GB", name: "United Kingdom", requests: 0, color: "#2563eb" },
  { code: "IN", name: "India", requests: 0, color: "#f59e0b" },
  { code: "BR", name: "Brazil", requests: 0, color: "#FF0000" },
  { code: "SG", name: "Singapore", requests: 0, color: "#f59e0b" },
  { code: "JP", name: "Japan", requests: 0, color: "#dc143c" },
];

export const countryRequests: Record<string, CountryData> = {
  US: { value: 0, color: "#1e40af" },
  DE: { value: 0, color: "#FFCE00" },
  GB: { value: 0, color: "#2563eb" },
  IN: { value: 0, color: "#f59e0b" },
  BR: { value: 0, color: "#FF0000" },
  SG: { value: 0, color: "#f59e0b" },
  JP: { value: 0, color: "#dc143c" },
  FR: { value: 0, color: "#1d4ed8" },
  CA: { value: 0, color: "#b91c1c" },
  SE: { value: 0, color: "#2563eb" },
  AU: { value: 0, color: "#3b82f6" },
  KR: { value: 0, color: "#3b82f6" },
  NL: { value: 0, color: "#ea580c" },
  NO: { value: 0, color: "#dc2626" },
  CN: { value: 0, color: "#991b1b" },
  ES: { value: 0, color: "#b91c1c" },
  DK: { value: 0, color: "#dc2626" },
  FI: { value: 0, color: "#3b82f6" },
  IT: { value: 0, color: "#15803d" },
  HK: { value: 0, color: "#b91c1c" },
  IE: { value: 0, color: "#16a34a" },
  PL: { value: 0, color: "#dc2626" },
  ID: { value: 0, color: "#b91c1c" },
  TH: { value: 0, color: "#2563eb" },
  MX: { value: 0, color: "#15803d" },
  CH: { value: 0, color: "#dc2626" },
  VN: { value: 0, color: "#b91c1c" },
  PH: { value: 0, color: "#2563eb" },
  TR: { value: 0, color: "#b91c1c" },
  BE: { value: 0, color: "#525252" },
  AR: { value: 0, color: "#3b82f6" },
  AT: { value: 0, color: "#dc2626" },
  RU: { value: 0, color: "#2563eb" },
  ZA: { value: 0, color: "#16a34a" },
};

export const regionMarkers: RegionMarker[] = [
  { id: "hnd1", name: "Tokyo", coordinates: [139.6922, 35.6897] },
  { id: "kix1", name: "Osaka", coordinates: [135.5023, 34.6937] },
  { id: "bom1", name: "Mumbai", coordinates: [72.8775, 19.0761] },
  { id: "gru1", name: "Sao Paulo", coordinates: [-46.6333, -23.55] },
  { id: "icn1", name: "Seoul", coordinates: [126.99, 37.56] },
  { id: "iad1", name: "Virginia", coordinates: [-77.0163, 38.9047] },
  { id: "sfo1", name: "San Francisco", coordinates: [-122.4449, 37.7558] },
  { id: "cle1", name: "Cleveland", coordinates: [-81.6805, 41.4764] },
  { id: "pdx1", name: "Portland", coordinates: [-122.65, 45.5371] },
  { id: "lhr1", name: "London", coordinates: [-0.1275, 51.5072] },
  { id: "cdg1", name: "Paris", coordinates: [2.3522, 48.8567] },
  { id: "cpt1", name: "Cape Town", coordinates: [18.4239, -33.9253] },
  { id: "hkg1", name: "Hong Kong", coordinates: [114.2, 22.3] },
  { id: "sin1", name: "Singapore", coordinates: [103.8, 1.3] },
  { id: "syd1", name: "Sydney", coordinates: [151.21, -33.8678] },
  { id: "fra1", name: "Frankfurt", coordinates: [8.6822, 50.1106] },
  { id: "dxb1", name: "Dubai", coordinates: [55.2972, 25.2631] },
  { id: "arn1", name: "Stockholm", coordinates: [18.0686, 59.3294] },
  { id: "dub1", name: "Dublin", coordinates: [-6.2603, 53.35] },
];

// All stats default to 0
export const stats = {
  totalRequests: 0,
  totalDeployments: 0,
  firewallActions: {
    total: 0,
    systemBlocks: 0,
    systemChallenges: 0,
    customWafBlocks: 0,
  },
  botManagement: {
    botsBlocked: 0,
    humansVerified: 0,
  },
  cacheHits: 0,
  isrRevalidations: 0,
  aiGatewayRequests: 0,
};

export const formatNumber = (num: number): string => {
  return num.toLocaleString("en-US");
};
