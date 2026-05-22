import { apiClient } from './client';

export interface ResumeListItem {
  id: string;
  filename: string;
  name: string | null;
  email: string | null;
  skills: string[];
  created_at: string;
}

export interface JobListItem {
  id: string;
  filename: string;
  skills: string[];
  created_at: string;
}

export interface CandidateListItem {
  id: string;
  email: string;
  full_name: string | null;
  role: string;
  resume_count: number;
  created_at: string;
}

export interface ResumeParseResult {
  filename: string;
  text: string;
  name: string | null;
  email: string | null;
  phone: string | null;
  skills: string[];
  education: string[];
  experience: string[];
  certifications: string[];
}

export interface ResumeUploadResult {
  filename: string;
  file_path: string;
  extracted_text: string;
  upload_status: string;
}

export interface JobUploadResult {
  filename: string;
  text: string;
  skills: string[];
}

export interface CandidateRecommendation {
  candidate_id: string;
  match_score: number;
  summary: string;
}

export interface JobRecommendation {
  job_id: string;
  match_score: number;
  summary: string;
}

export interface AdminDashboard {
  total_users: number;
  total_resumes: number;
  total_jobs: number;
  open_recommendations: number;
}

export interface AdminUserSummary {
  id: string;
  email: string;
  full_name: string | null;
  role: 'admin' | 'recruiter' | 'candidate';
  created_at: string;
  updated_at: string | null;
  last_login_at: string | null;
  login_count: number;
  resume_count: number;
  job_count: number;
}

export interface AdminAuditEvent {
  id: string;
  user_id: string;
  email: string;
  full_name: string | null;
  role: 'admin' | 'recruiter' | 'candidate';
  event_type: string;
  created_at: string;
}

export interface AdminUserDocumentItem {
  id: string;
  filename: string;
  created_at: string;
  skills: string[];
}

export interface AdminUserActivityItem {
  id: string;
  type: string;
  title: string;
  detail: string | null;
  created_at: string;
}

export interface AdminUserDetail {
  user: AdminUserSummary;
  resumes: AdminUserDocumentItem[];
  jobs: AdminUserDocumentItem[];
  audit_events: AdminAuditEvent[];
  activity: AdminUserActivityItem[];
}

export interface DashboardOverview {
  total_resumes: number;
  total_jobs: number;
  total_candidates: number;
}

function uploadFile(path: string, file: File) {
  const formData = new FormData();
  formData.append('file', file);
  return apiClient.post(path, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
}

export async function fetchResumes() {
  const { data } = await apiClient.get<ResumeListItem[]>('/resumes');
  return data;
}

export async function fetchJobs() {
  const { data } = await apiClient.get<JobListItem[]>('/jobs');
  return data;
}

export async function fetchCandidates() {
  const { data } = await apiClient.get<CandidateListItem[]>('/candidates');
  return data;
}

export async function uploadResume(file: File) {
  const { data } = await uploadFile('/resumes/upload', file);
  return data as ResumeUploadResult;
}

export async function parseResume(file: File) {
  const { data } = await uploadFile('/resumes/parse', file);
  return data as ResumeParseResult;
}

export async function uploadJob(file: File) {
  const { data } = await uploadFile('/jobs/upload', file);
  return data as JobUploadResult;
}

export async function fetchCandidateRecommendations(jobId: string, topK = 5) {
  const { data } = await apiClient.get<CandidateRecommendation[]>('/recommendations/candidates', {
    params: { job_id: jobId, top_k: topK },
  });
  return data;
}

export async function fetchJobRecommendations(resumeId: string, topK = 5) {
  const { data } = await apiClient.get<JobRecommendation[]>('/recommendations/jobs', {
    params: { resume_id: resumeId, top_k: topK },
  });
  return data;
}

export async function sendChatMessage(sessionId: string, message: string, jobId?: string) {
  const { data } = await apiClient.post<{ response: string; session_id: string }>('/chatbot/chat', {
    session_id: sessionId,
    message,
    job_id: jobId || null,
  });
  return data;
}

export async function fetchAdminDashboard() {
  const { data } = await apiClient.get<AdminDashboard>('/admin/dashboard');
  return data;
}

export async function fetchAdminUsers() {
  const { data } = await apiClient.get<AdminUserSummary[]>('/admin/users');
  return data;
}

export async function fetchAdminAuditLog() {
  const { data } = await apiClient.get<AdminAuditEvent[]>('/admin/audit-log');
  return data;
}

export async function fetchAdminUserDetail(userId: string) {
  const { data } = await apiClient.get<AdminUserDetail>(`/admin/users/${userId}`);
  return data;
}

export async function fetchDashboardOverview(): Promise<DashboardOverview> {
  const [resumes, jobs, candidates] = await Promise.all([
    fetchResumes().catch(() => []),
    fetchJobs().catch(() => []),
    fetchCandidates().catch(() => []),
  ]);
  return {
    total_resumes: resumes.length,
    total_jobs: jobs.length,
    total_candidates: candidates.length,
  };
}
