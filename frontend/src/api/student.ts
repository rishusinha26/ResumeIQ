import { apiClient } from './client';

export interface StudentResume {
  id: string;
  filename: string;
  name: string | null;
  email: string | null;
  skills: string[];
  created_at: string;
}

export interface JobATSAnalysis {
  job_id: string;
  job_title: string;
  ats_score: number;
  keyword_match_percent: number;
  similarity_score: number;
  suitability: string;
  missing_keywords: string[];
  matched_keywords: string[];
  job_skills: string[];
}

export interface SuggestedRole {
  role_title: string;
  confidence: number;
  reason: string;
  matched_skills: string[];
}

export async function fetchMyResume() {
  const { data } = await apiClient.get<StudentResume | null>('/student/resume');
  return data;
}

export async function uploadMyResume(file: File) {
  const formData = new FormData();
  formData.append('file', file);
  const { data } = await apiClient.post('/student/resume/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data;
}

export async function fetchStudentJobs() {
  const { data } = await apiClient.get<{ id: string; filename: string; skills: string[]; created_at: string }[]>(
    '/student/jobs',
  );
  return data;
}

export async function analyzeJob(jobId: string) {
  const { data } = await apiClient.get<{ resume_id: string; analysis: JobATSAnalysis }>('/student/analyze', {
    params: { job_id: jobId },
  });
  return data;
}

export async function fetchJobMatches() {
  const { data } = await apiClient.get<{ resume_id: string; matches: JobATSAnalysis[] }>('/student/job-matches');
  return data;
}

export async function fetchSuggestedRoles() {
  const { data } = await apiClient.get<{ resume_id: string; roles: SuggestedRole[] }>('/student/suggested-roles');
  return data;
}
