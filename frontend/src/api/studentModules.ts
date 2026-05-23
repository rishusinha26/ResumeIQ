import { apiClient } from './client';

export type InterviewTrack = 'frontend' | 'backend' | 'ml' | 'cloud' | 'devops' | 'fullstack' | 'data';

export interface InterviewTrackOption {
  value: InterviewTrack;
  label: string;
}

export interface InterviewQuestion {
  question: string;
  ideal_points: string[];
  difficulty: 'easy' | 'medium' | 'hard';
}

export interface InterviewMessage {
  speaker: 'candidate' | 'assistant';
  message: string;
  created_at: string;
}

export interface InterviewSessionSummary {
  id: string;
  role_track: InterviewTrack;
  role_title: string | null;
  status: string;
  created_at: string;
  updated_at: string;
  confidence_score: number | null;
  communication_score: number | null;
  technical_score: number | null;
}

export interface InterviewSessionDetail extends InterviewSessionSummary {
  years_of_experience: number;
  use_voice: boolean;
  context_note: string | null;
  questions: InterviewQuestion[];
  messages: InterviewMessage[];
  evaluation: {
    summary: string;
    strengths: string[];
    improvements: string[];
    confidence_score: number;
    communication_score: number;
    technical_score: number;
    next_steps: string[];
  } | null;
}

export interface InterviewSessionCreate {
  role_track: InterviewTrack;
  role_title?: string | null;
  years_of_experience?: number;
  use_voice?: boolean;
  context_note?: string | null;
}

export interface InterviewMessageCreate {
  message: string;
  voice_transcript?: string | null;
}

export interface CodingTestCase {
  stdin: string;
  expected_stdout: string;
}

export interface CodingChallenge {
  id: string;
  slug: string;
  title: string;
  category: 'arrays' | 'strings' | 'dp' | 'graphs' | 'sql';
  difficulty: 'easy' | 'medium' | 'hard';
  description: string;
  starter_code: string;
  languages: Array<'python' | 'javascript' | 'typescript' | 'java' | 'cpp' | 'sql'>;
  test_cases: CodingTestCase[];
  time_limit_seconds: number;
  memory_limit_kb: number;
  points: number;
  created_at: string;
}

export interface CodingSubmission {
  id: string;
  user_id: string;
  challenge_id: string;
  challenge_slug: string;
  challenge_title: string;
  language: 'python' | 'javascript' | 'typescript' | 'java' | 'cpp' | 'sql';
  source_code: string;
  stdout: string | null;
  stderr: string | null;
  verdict: string;
  passed_tests: number;
  total_tests: number;
  score: number;
  execution_time_ms: number | null;
  created_at: string;
}

export interface CodingLeaderboardEntry {
  user_id: string;
  email: string;
  full_name: string | null;
  score: number;
  submissions: number;
}

export interface AptitudeQuestion {
  id: string;
  topic: 'quantitative' | 'logical' | 'verbal';
  difficulty: 'easy' | 'medium' | 'hard';
  question: string;
  options: string[];
  correct_option: number;
  explanation: string;
  time_limit_seconds: number;
}

export interface AptitudeQuizSession {
  quiz_id: string;
  questions: AptitudeQuestion[];
  result: AptitudeQuizResult | null;
}

export interface AptitudeQuizResult {
  id: string;
  user_id: string;
  topic: 'quantitative' | 'logical' | 'verbal';
  difficulty: 'easy' | 'medium' | 'hard';
  total_questions: number;
  correct_answers: number;
  score: number;
  duration_seconds: number;
  answers: Array<{ question_id: string; selected_option: number }>;
  created_at: string;
}

export interface AptitudeQuizRequest {
  topic: 'quantitative' | 'logical' | 'verbal';
  difficulty: 'easy' | 'medium' | 'hard';
  question_count: number;
}

export interface AptitudeQuizSubmission {
  topic: 'quantitative' | 'logical' | 'verbal';
  difficulty: 'easy' | 'medium' | 'hard';
  question_ids: string[];
  answers: Array<{ question_id: string; selected_option: number }>;
  duration_seconds: number;
}

export interface DSAQuestion {
  id: string;
  company: string;
  title: string;
  difficulty: 'easy' | 'medium' | 'hard';
  topic: string;
  tags: string[];
  description: string;
  leetcode_slug: string;
  leetcode_url: string;
}

export interface CareerRoadmapStep {
  title: string;
  description: string;
  timeframe_weeks: number;
  resources: string[];
}

export interface CareerAnalysis {
  id: string;
  user_id: string;
  prompt: string;
  target_role: string | null;
  skill_gap_summary: string;
  learning_recommendations: string[];
  interview_preparation: string[];
  roadmap: CareerRoadmapStep[];
  created_at: string;
}

export interface LearningPath {
  id: string;
  user_id: string;
  target_role: string;
  skill_gaps: string[];
  roadmap: CareerRoadmapStep[];
  progress: number;
  created_at: string;
  updated_at: string;
}

export interface CareerAnalysisResponse {
  analysis: CareerAnalysis;
  learning_path: LearningPath | null;
}

export interface CareerSummaryResponse {
  latest_analysis: CareerAnalysis | null;
  latest_learning_path: LearningPath | null;
}

export async function fetchInterviewTracks() {
  const { data } = await apiClient.get<InterviewTrackOption[]>('/interviews/tracks');
  return data;
}

export async function fetchInterviewSessions() {
  const { data } = await apiClient.get<InterviewSessionSummary[]>('/interviews/sessions');
  return data;
}

export async function createInterviewSession(payload: InterviewSessionCreate) {
  const { data } = await apiClient.post<InterviewSessionDetail>('/interviews/sessions', payload);
  return data;
}

export async function fetchInterviewSession(sessionId: string) {
  const { data } = await apiClient.get<InterviewSessionDetail>(`/interviews/sessions/${sessionId}`);
  return data;
}

export async function sendInterviewMessage(sessionId: string, payload: InterviewMessageCreate) {
  const { data } = await apiClient.post<InterviewSessionDetail>(`/interviews/sessions/${sessionId}/messages`, payload);
  return data;
}

export async function evaluateInterviewSession(sessionId: string) {
  const { data } = await apiClient.post<InterviewSessionDetail>(`/interviews/sessions/${sessionId}/evaluate`);
  return data;
}

export async function fetchCodingChallenges() {
  const { data } = await apiClient.get<CodingChallenge[]>('/coding/challenges');
  return data;
}

export async function fetchCodingSubmissions() {
  const { data } = await apiClient.get<CodingSubmission[]>('/coding/submissions');
  return data;
}

export async function runCodingSubmission(payload: { challenge_id: string; language: CodingSubmission['language']; source_code: string }) {
  const { data } = await apiClient.post<CodingSubmission>('/coding/run', payload);
  return data;
}

export async function fetchCodingLeaderboard() {
  const { data } = await apiClient.get<CodingLeaderboardEntry[]>('/coding/leaderboard');
  return data;
}

export async function fetchDSACompanies() {
  const { data } = await apiClient.get<string[]>('/dsa/companies');
  return data;
}

export async function fetchDSAQuestions(company?: string, topic?: string, difficulty?: string) {
  const { data } = await apiClient.get<DSAQuestion[]>('/dsa/questions', { params: { company, topic, difficulty } });
  return data;
}

export async function fetchAptitudeQuestions(topic?: string, difficulty?: string) {
  const { data } = await apiClient.get<AptitudeQuestion[]>('/aptitude/questions', { params: { topic, difficulty } });
  return data;
}

export async function buildAptitudeQuiz(payload: AptitudeQuizRequest) {
  const { data } = await apiClient.post<AptitudeQuizSession>('/aptitude/quiz', payload);
  return data;
}

export async function submitAptitudeQuiz(payload: AptitudeQuizSubmission) {
  const { data } = await apiClient.post<AptitudeQuizResult>('/aptitude/quiz/submit', payload);
  return data;
}

export async function fetchAptitudeResults() {
  const { data } = await apiClient.get<AptitudeQuizResult[]>('/aptitude/results');
  return data;
}

export async function generateCareerAnalysis(payload: { prompt: string; target_role?: string | null; include_learning_path?: boolean }) {
  const { data } = await apiClient.post<CareerAnalysisResponse>('/career/analyze', payload);
  return data;
}

export async function fetchCareerSummary() {
  const { data } = await apiClient.get<CareerSummaryResponse>('/career/summary');
  return data;
}

export async function fetchLearningPaths() {
  const { data } = await apiClient.get<LearningPath[]>('/career/learning-paths');
  return data;
}