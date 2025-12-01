import { environment } from '../environments';

const API_BASE = environment.apiBase;

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE';

let accessToken: string | null = typeof localStorage !== 'undefined' ? localStorage.getItem('accessToken') : null;
let refreshToken: string | null = typeof localStorage !== 'undefined' ? localStorage.getItem('refreshToken') : null;

const setTokens = (access: string | null, refresh?: string | null) => {
  accessToken = access;
  if (typeof localStorage !== 'undefined') {
    if (access) {
      localStorage.setItem('accessToken', access);
    } else {
      localStorage.removeItem('accessToken');
    }
  }
  if (refresh !== undefined) {
    refreshToken = refresh;
    if (typeof localStorage !== 'undefined') {
      if (refresh) {
        localStorage.setItem('refreshToken', refresh);
      } else {
        localStorage.removeItem('refreshToken');
      }
    }
  }
};

const clearTokens = () => setTokens(null, null);

async function request<T>(
  path: string,
  {
    method = 'GET',
    body,
    auth = true,
  }: { method?: HttpMethod; body?: any; auth?: boolean } = {}
): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (auth && accessToken) {
    headers['Authorization'] = `Bearer ${accessToken}`;
  }

  const res = await fetch(`${API_BASE}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
    credentials: 'include', // Enable credentials for CORS
  });

  if (res.status === 401 && auth && refreshToken) {
    // try refresh once
    const refreshed = await refreshAccessToken();
    if (refreshed) {
      headers['Authorization'] = `Bearer ${accessToken}`;
      const retry = await fetch(`${API_BASE}${path}`, {
        method,
        headers,
        body: body ? JSON.stringify(body) : undefined,
        credentials: 'include', // Enable credentials for CORS
      });
      return handleResponse<T>(retry);
    }
  }

  return handleResponse<T>(res);
}

async function handleResponse<T>(res: Response): Promise<T> {
  const contentType = res.headers.get('content-type');
  const isJson = contentType && contentType.includes('application/json');
  const data = isJson ? await res.json() : ({} as any);

  if (!res.ok) {
    const message = data?.message || `Request failed with status ${res.status}`;
    throw new Error(message);
  }
  return data as T;
}

async function refreshAccessToken(): Promise<boolean> {
  if (!refreshToken) return false;
  try {
    const res = await fetch(`${API_BASE}/auth/refresh`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${refreshToken}`,
      },
      credentials: 'include', // Enable credentials for CORS
    });
    if (!res.ok) return false;
    const data = (await res.json()) as { accessToken?: string };
    if (data.accessToken) {
      setTokens(data.accessToken);
      return true;
    }
    return false;
  } catch (err) {
    return false;
  }
}

export const api = {
  auth: {
    async register(payload: { email: string; password: string; displayName: string }) {
      const data = await request<{
        user: any;
        accessToken: string;
        refreshToken: string;
      }>('/auth/register', { method: 'POST', body: payload, auth: false });
      setTokens(data.accessToken, data.refreshToken);
      return data;
    },
    async login(payload: { email: string; password: string }) {
      const data = await request<{
        user: any;
        accessToken: string;
        refreshToken: string;
      }>('/auth/login', { method: 'POST', body: payload, auth: false });
      setTokens(data.accessToken, data.refreshToken);
      return data;
    },
    async me() {
      return request<{ user: any; memberships: any[] }>('/auth/me');
    },
    logout: () => {
      clearTokens();
    },
  },
  organizations: {
    list() {
      return request<{ organizations: any[] }>('/organizations/');
    },
    create(payload: { name: string; slug: string; description?: string; settings?: any }) {
      return request<{ organization: any }>('/organizations/', { method: 'POST', body: payload });
    },
  },
  tasks: {
    list(query: string = '') {
      const path = query ? `/tasks/${query.startsWith('?') ? query : `?${query}`}` : '/tasks/';
      return request<{ tasks: any[] }>(path);
    },
    create(task: any) {
      return request<{ task: any }>('/tasks/', { method: 'POST', body: task });
    },
    update(id: string, updates: any) {
      return request<{ task: any }>(`/tasks/${id}`, { method: 'PUT', body: updates });
    },
    remove(id: string) {
      return request<void>(`/tasks/${id}`, { method: 'DELETE' });
    },
  },
  roadmap: {
    listPhases(organizationId?: string) {
      const qs = organizationId ? `?organizationId=${organizationId}` : '';
      return request<{ phases: any[] }>(`/roadmap/phases${qs}`);
    },
    createPhase(payload: any) {
      return request<{ phase: any }>('/roadmap/phases', { method: 'POST', body: payload });
    },
    listMilestones(organizationId?: string) {
      const qs = organizationId ? `?organizationId=${organizationId}` : '';
      return request<{ milestones: any[] }>(`/roadmap/milestones${qs}`);
    },
    createMilestone(payload: any) {
      return request<{ milestone: any }>('/roadmap/milestones', { method: 'POST', body: payload });
    },
  },
  teams: {
    list(organizationId?: string) {
      const qs = organizationId ? `?organizationId=${organizationId}` : '';
      return request<{ teams: any[] }>(`/teams/${qs}`);
    },
    create(payload: any) {
      return request<{ team: any }>('/teams/', { method: 'POST', body: payload });
    },
  },
  projects: {
    list(organizationId?: string) {
      const qs = organizationId ? `?organizationId=${organizationId}` : '';
      return request<{ projects: any[] }>(`/projects/${qs}`);
    },
    create(payload: any) {
      return request<{ project: any }>('/projects/', { method: 'POST', body: payload });
    },
  },
  tokens: {
    setTokens,
    clearTokens,
    getAccessToken: () => accessToken,
    getRefreshToken: () => refreshToken,
  },
};
