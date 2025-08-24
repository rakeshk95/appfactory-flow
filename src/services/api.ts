const API_BASE_URL = 'http://localhost:8000/api/v1';

// API Response types
interface ApiResponse<T> {
  data?: T;
  error?: string;
  message?: string;
}

// User types
export interface User {
  id: number;
  email: string;
  name: string;
  role: string;
  department: string;
  position: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// Performance Cycle types
export interface PerformanceCycle {
  id: number;
  name: string;
  start_date: string;
  end_date: string;
  status: string;
  description: string;
  created_at: string;
  updated_at: string;
}

// Reviewer Selection types
export interface ReviewerSelection {
  id: number;
  performance_cycle_id: number;
  mentee_id: number;
  status: string;
  submitted_at: string;
  mentor_feedback?: string;
  created_at: string;
  updated_at: string;
  selected_reviewers?: number[];
}

// Feedback Form types
export interface FeedbackForm {
  id: number;
  employee_id: number;
  reviewer_id: number;
  performance_cycle_id: number;
  strengths: string;
  improvements: string;
  overall_rating: string;
  status: string;
  created_at: string;
  updated_at: string;
}

// Auth types
export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  access_token: string;
  token_type: string;
  user: User;
}

// API Service class
class ApiService {
  private token: string | null = null;

  setToken(token: string) {
    this.token = token;
    localStorage.setItem('access_token', token);
  }

  getToken(): string | null {
    if (!this.token) {
      this.token = localStorage.getItem('access_token');
    }
    return this.token;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${API_BASE_URL}${endpoint}`;
    const token = this.getToken();

    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        return {
          error: data.detail || `HTTP error! status: ${response.status}`,
        };
      }

      return { data };
    } catch (error) {
      return {
        error: error instanceof Error ? error.message : 'Network error',
      };
    }
  }

  // Authentication endpoints
  async login(credentials: LoginRequest): Promise<ApiResponse<LoginResponse>> {
    const response = await this.request<LoginResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });

    if (response.data) {
      this.setToken(response.data.access_token);
    }

    return response;
  }

  async getProfile(): Promise<ApiResponse<User>> {
    return this.request<User>('/users/profile');
  }

  // Performance Cycle endpoints
  async getActivePerformanceCycle(): Promise<ApiResponse<PerformanceCycle>> {
    return this.request<PerformanceCycle>('/performance-cycles/active');
  }

  async getPerformanceCycles(
    status?: string,
    page: number = 1,
    limit: number = 10
  ): Promise<ApiResponse<PerformanceCycle[]>> {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...(status && { status }),
    });
    return this.request<PerformanceCycle[]>(`/performance-cycles?${params}`);
  }

  // User Management endpoints
  async getAvailableReviewers(
    excludeCurrentUser: boolean = true
  ): Promise<ApiResponse<User[]>> {
    const params = new URLSearchParams({
      exclude_current_user: excludeCurrentUser.toString(),
    });
    return this.request<User[]>(`/users/reviewers?${params}`);
  }

  // Reviewer Selection endpoints
  async submitReviewerSelection(
    selectionData: {
      performance_cycle_id: number;
      selected_reviewers: number[];
      comments?: string;
    }
  ): Promise<ApiResponse<ReviewerSelection>> {
    return this.request<ReviewerSelection>('/reviewer-selections', {
      method: 'POST',
      body: JSON.stringify(selectionData),
    });
  }

  async getMyReviewerSelection(): Promise<ApiResponse<ReviewerSelection>> {
    return this.request<ReviewerSelection>('/reviewer-selections/my-selection');
  }

  // Mentor Approval endpoints
  async getPendingApprovals(): Promise<ApiResponse<any[]>> {
    return this.request<any[]>('/mentor/approvals/pending');
  }

  async approveReviewerSelection(selectionId: number): Promise<ApiResponse<{ message: string }>> {
    return this.request<{ message: string }>(`/mentor/approvals/${selectionId}/approve`, {
      method: 'POST',
    });
  }

  // Feedback Management endpoints
  async getAssignedEmployees(): Promise<ApiResponse<any[]>> {
    return this.request<any[]>('/reviewer/assignments');
  }

  async createFeedbackForm(
    formData: {
      employee_id: number;
      performance_cycle_id: number;
      strengths: string;
      improvements: string;
      overall_rating: string;
      status: string;
    }
  ): Promise<ApiResponse<FeedbackForm>> {
    return this.request<FeedbackForm>('/reviewer/feedback-forms', {
      method: 'POST',
      body: JSON.stringify(formData),
    });
  }

  // Dashboard endpoints
  async getDashboardStats(): Promise<ApiResponse<any>> {
    return this.request<any>('/dashboard/stats');
  }

  // Health check
  async healthCheck(): Promise<ApiResponse<{ status: string; timestamp: string }>> {
    return this.request<{ status: string; timestamp: string }>('/health');
  }

  // Logout
  logout() {
    this.token = null;
    localStorage.removeItem('access_token');
  }
}

export const apiService = new ApiService();
export default apiService;
