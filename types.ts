
export enum RiskLevel {
  LOW = 'Low',
  MEDIUM = 'Medium',
  HIGH = 'High'
}

export interface SecurityIssue {
  id: string;
  category: 'HTTPS' | 'Headers' | 'Tech' | 'Ports';
  title: string;
  description: string;
  impact: 'Critical' | 'Warning' | 'Info';
  status: 'Pass' | 'Fail';
  recommendation?: string; // Only for premium
}

export interface ScanResult {
  url: string;
  score: number;
  riskLevel: RiskLevel;
  timestamp: string;
  issues: SecurityIssue[];
  techStack: string[];
  openPorts: number[];
  httpsStatus: {
    enabled: boolean;
    redirects: boolean;
    validCert: boolean;
  };
}

export interface PremiumReport extends ScanResult {
  detailedRecommendations: {
    issueId: string;
    steps: string[];
    remediationLink: string;
  }[];
}
