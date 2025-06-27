export interface Case {
  id: string;
  confirmationCode: string;
  status: 'open' | 'investigating' | 'closed';
  severity: number;
  category: string;
  summary: string;
  createdAt: string;
  updatedAt: string;
  unreadMessages?: number;
}

export interface Message {
  id: string;
  caseId: string;
  content: string;
  sender: 'employee' | 'hr_manager' | 'system';
  timestamp: string;
}

export interface Transcript {
  id: string;
  caseId: string;
  rawTranscript: string;
  processedSummary: string;
  sentimentScore: number;
  createdAt: string;
}

export interface AIInsight {
  id: string;
  caseId: string;
  insightType: 'risk_assessment' | 'next_steps' | 'similar_cases';
  content: Record<string, any>;
  confidenceScore: number;
  createdAt: string;
}

export interface HRUser {
  id: string;
  email: string;
  name: string;
  role: string;
  createdAt: string;
}

export interface RecordingState {
  isRecording: boolean;
  isPaused: boolean;
  duration: number;
  audioBlob: Blob | null;
}

export interface ProcessingState {
  isProcessing: boolean;
  stage: 'transcribing' | 'analyzing' | 'saving' | 'complete';
  progress: number;
}