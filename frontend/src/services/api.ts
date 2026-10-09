// Typed API Client for UniSphere AI

const API_BASE = '/api';

export function getToken(): string | null {
  return localStorage.getItem('unisphere_token');
}

export function setToken(token: string) {
  localStorage.setItem('unisphere_token', token);
}

export function clearToken() {
  localStorage.removeItem('unisphere_token');
  localStorage.removeItem('unisphere_user');
}

export async function apiRequest<T = any>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    ...(options.headers as Record<string, string> || {}),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  if (!(options.body instanceof FormData) && !headers['Content-Type']) {
    headers['Content-Type'] = 'application/json';
  }

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  if (response.status === 401) {
    clearToken();
    if (window.location.pathname !== '/login' && window.location.pathname !== '/') {
      window.location.href = '/login';
    }
    throw new Error('Session expired. Please log in again.');
  }

  if (!response.ok) {
    let errorMsg = `Error: ${response.statusText}`;
    try {
      const errData = await response.json();
      errorMsg = errData.detail || errData.message || errorMsg;
    } catch {
      // fallback
    }
    throw new Error(errorMsg);
  }

  // Handle blob or text responses if needed
  const contentType = response.headers.get('content-type');
  if (contentType && contentType.includes('text/csv')) {
    return (await response.text()) as unknown as T;
  }

  return response.json();
}

export const api = {
  // Auth
  login: (data: { identifier: string; password: string; role: string }) =>
    apiRequest('/auth/login', { method: 'POST', body: JSON.stringify(data) }),
  getProfile: () => apiRequest('/auth/me'),
  changePassword: (data: { current_password: string; new_password: string }) =>
    apiRequest('/auth/change-password', { method: 'POST', body: JSON.stringify(data) }),

  // Admin
  getDashboardStats: () => apiRequest('/admin/dashboard-stats'),
  getStudents: (params: Record<string, any> = {}) => {
    const q = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== '') q.append(k, String(v));
    });
    return apiRequest(`/admin/students?${q.toString()}`);
  },
  getStudentDetail: (id: number) => apiRequest(`/admin/students/${id}`),
  createStudent: (data: any) =>
    apiRequest('/admin/students', { method: 'POST', body: JSON.stringify(data) }),
  updateStudent: (id: number, data: any) =>
    apiRequest(`/admin/students/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deactivateStudent: (id: number) =>
    apiRequest(`/admin/students/${id}`, { method: 'DELETE' }),

  getFacultyList: () => apiRequest('/admin/faculty'),
  createFaculty: (data: any) =>
    apiRequest('/admin/faculty', { method: 'POST', body: JSON.stringify(data) }),

  getScoringSettings: () => apiRequest('/admin/settings/scoring'),
  updateScoringSettings: (data: any) =>
    apiRequest('/admin/settings/scoring', { method: 'PUT', body: JSON.stringify(data) }),
  getAuditLogs: () => apiRequest('/admin/audit-logs'),

  // Faculty
  getFacultyDashboard: () => apiRequest('/faculty/dashboard'),
  getFacultyStudents: (params: Record<string, any> = {}) => {
    const q = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== '') q.append(k, String(v));
    });
    return apiRequest(`/faculty/students?${q.toString()}`);
  },
  getFacultyStudentDetail: (id: number) => apiRequest(`/faculty/students/${id}`),
  getStudentRecommendations: (id: number) => apiRequest(`/faculty/students/${id}/recommendations`),
  getFacultyMessages: () => apiRequest('/faculty/messages'),
  sendFacultyMessage: (data: { student_id: number; subject: string; content: string; category?: string }) =>
    apiRequest('/faculty/messages', { method: 'POST', body: JSON.stringify(data) }),
  replyFacultyMessage: (id: number, content: string) =>
    apiRequest(`/faculty/messages/${id}/reply`, { method: 'POST', body: JSON.stringify({ content }) }),
  getFacultyAssignments: () => apiRequest('/faculty/assignments'),
  createFacultyAssignment: (data: any) =>
    apiRequest('/faculty/assignments', { method: 'POST', body: JSON.stringify(data) }),
  updateFacultyAssignment: (id: number, data: any) =>
    apiRequest(`/faculty/assignments/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteFacultyAssignment: (id: number) =>
    apiRequest(`/faculty/assignments/${id}`, { method: 'DELETE' }),
  assignImprovementTask: (data: any) =>
    apiRequest('/faculty/tasks', { method: 'POST', body: JSON.stringify(data) }),
  getFacultyTasks: () => apiRequest('/faculty/tasks'),
  getFacultyPerformanceAnalytics: () => apiRequest('/faculty/performance-analytics'),
  getFacultyStudyInsights: () => apiRequest('/faculty/study-insights'),
  getFacultyStudyMaterials: () => apiRequest('/faculty/study-materials'),
  uploadStudyMaterial: (formData: FormData) =>
    apiRequest('/faculty/study-materials/upload', { method: 'POST', body: formData }),
  togglePublishStudyMaterial: (id: number) =>
    apiRequest(`/faculty/study-materials/${id}/publish`, { method: 'PUT' }),
  deleteStudyMaterial: (id: number) =>
    apiRequest(`/faculty/study-materials/${id}`, { method: 'DELETE' }),

  // Student
  getStudentDashboard: () => apiRequest('/student/me/dashboard'),
  getStudentMessages: () => apiRequest('/student/me/messages'),
  markStudentMessageRead: (id: number) =>
    apiRequest(`/student/me/messages/${id}/read`, { method: 'PUT' }),
  replyToStudentMessage: (id: number, content: string) =>
    apiRequest(`/student/me/messages/${id}/reply`, {
      method: 'POST',
      body: JSON.stringify({ content }),
    }),
  getStudentAssignments: () => apiRequest('/student/me/assignments'),
  getStudentTasks: () => apiRequest('/student/me/tasks'),
  toggleStudentTask: (id: number) =>
    apiRequest(`/student/me/tasks/${id}/toggle`, { method: 'PUT' }),
  getStudentStudyMaterials: () => apiRequest('/student/me/study-materials'),

  // Admin AI Insights & Reports
  getAdminAIInsights: (department?: string) =>
    apiRequest(`/admin/ai-insights${department ? `?department=${department}` : ''}`),

  // Analytics
  getAnalyticsOverview: (department?: string) =>
    apiRequest(`/analytics/overview${department ? `?department=${department}` : ''}`),
  getRiskByDepartment: () => apiRequest('/analytics/risk-by-department'),
  getPlacementByDepartment: () => apiRequest('/analytics/placement-by-department'),
  getAttendanceTrends: () => apiRequest('/analytics/attendance-trends'),
  getAcademicVsPlacement: (department?: string) =>
    apiRequest(`/analytics/academic-vs-placement${department ? `?department=${department}` : ''}`),
  getSegmentation: () => apiRequest('/analytics/segmentation'),

  // Interventions
  getInterventions: (params: Record<string, any> = {}) => {
    const q = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== '') q.append(k, String(v));
    });
    return apiRequest(`/interventions?${q.toString()}`);
  },
  getInterventionDetail: (id: number) => apiRequest(`/interventions/${id}`),
  getInterventionStats: () => apiRequest('/interventions/stats'),
  createIntervention: (data: any) =>
    apiRequest('/interventions', { method: 'POST', body: JSON.stringify(data) }),
  updateInterventionStatus: (id: number, data: any) =>
    apiRequest(`/interventions/${id}/status`, { method: 'PATCH', body: JSON.stringify(data) }),
  addInterventionUpdate: (id: number, data: { notes: string }) =>
    apiRequest(`/interventions/${id}/updates`, { method: 'POST', body: JSON.stringify(data) }),

  // Data Integration
  previewCSV: (file: File, category: string) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('category', category);
    return apiRequest('/data-import/preview', { method: 'POST', body: formData });
  },
  commitCSV: (data: { category: string; filename: string; rows: any[] }) =>
    apiRequest('/data-import/commit', { method: 'POST', body: JSON.stringify(data) }),
  getImportHistory: () => apiRequest('/data-import/history'),

  // Reports
  getReportsSummary: (params: Record<string, any> = {}) => {
    const q = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== '' && v !== 'all') q.append(k, String(v));
    });
    return apiRequest(`/reports/summary?${q.toString()}`);
  },
  generateReport: (data: {
    report_type: string;
    department?: string;
    academic_year?: string;
    risk_level?: string;
    start_date?: string;
    end_date?: string;
  }) => apiRequest('/reports/generate', { method: 'POST', body: JSON.stringify(data) }),
  getReportHistory: () => apiRequest('/reports/history'),
  deleteReportHistory: (id: number) => apiRequest(`/reports/history/${id}`, { method: 'DELETE' }),
  exportStudentsCSV: (params: Record<string, any> = {}) => {
    const q = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== '' && v !== 'all') q.append(k, String(v));
    });
    return apiRequest(`/reports/export/students-csv?${q.toString()}`);
  },

  // Assistant
  askAssistant: (query: string) =>
    apiRequest('/assistant/query', { method: 'POST', body: JSON.stringify({ query }) }),
};
