export type Severity = "critical" | "serious" | "moderate" | "minor";

export const SEVERITIES: Severity[] = [
  "critical",
  "serious",
  "moderate",
  "minor",
];

export interface Issue {
  issueType: string;
  issueName: string;
  severity: Severity;
  component: string;
  behavior: string;
  description: string;
  affectedPage: string;
  guidelines: string[];
  htmlSnippet: string;
  cssSelector: string;
  needsReview: boolean;
  needsReviewStatus: string;
  bestPractice: boolean;
  howToFix: string;
  issueLink: string;
  timestamp: string;
  issueStatus: string;
}

export interface ParsedReport {
  issues: Issue[];
  auditedUrls: string[];
}
