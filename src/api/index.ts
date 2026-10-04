import axios, { AxiosError } from 'axios';

export const apiClient = axios.create({
  baseURL: '/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
});

// 添加请求拦截器，自动添加JWT令牌
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
);

// 添加响应拦截器，处理认证错误
const rejectAPIError = (error: AxiosError<ApiResponse<null>>) => {
  const body = error.response?.data
  if (error.response?.status === 401 || body?.code === 401 || body?.code === 40101) {
    const requestUrl = error.config?.url || ''
    if (!requestUrl.includes('/auth/login')) {
      localStorage.removeItem('auth_token')
      localStorage.removeItem('user_info')
      import('element-plus').then(({ ElMessage }) => {
        ElMessage.warning(body?.msg || '登录已过期，请重新登录')
      })
      if (!window.location.hash.includes('/login')) {
        window.location.href = window.location.origin + '/#/login'
      }
    }
  }
  return Promise.reject(error)
}

apiClient.interceptors.response.use(
  (response) => {
    if (response.data.code !== 200) {
      return rejectAPIError(new AxiosError(response.data.msg, 'ERR_API_RESPONSE', response.config, response.request, response))
    }
    return response
  },
  rejectAPIError
);

// Generic API response type
export interface ApiResponse<T> {
  code: number;
  data: T;
  msg: string;
  reason?: string;
}

// Firewall Rule types
export interface FirewallRule {
  ID: number;
  remark: string;
  provider: string;
  instance_id: string;
  port: string;
  protocol: string;
  last_ip: string;
  enabled: boolean;
  UpdatedAt: string;
  cloud_config_id: number;
}

// Cloud Config types
export interface CloudConfig {
  ID: number;
  provider: string;
  region: string;
  instance_id: string;
  description: string;
  is_default: boolean;
  is_enabled: boolean;
  project_id?: string;
  tenant_id?: string;
  subscription_id?: string;
  type?: number;
  CreatedAt: string;
}

export type CloudConfigRequest = Omit<CloudConfig, 'ID' | 'CreatedAt'> & {
  secret_id?: string;
  secret_key?: string;
};

// System Config types
export interface SystemConfig {
  ip_fetch_url: string;
  ip_check_interval: number;
  cron_enabled: string;
}

// Execute Rule Response types
export interface ExecuteRuleResponse {
  cloud_ip: string;
  previous_ip: string;
  current_ip: string;
  ip_changed: boolean;
  status: 'unchanged' | 'updated' | 'error';
}

// API functions

// Firewall Rules
export const getRules = () => apiClient.get<ApiResponse<FirewallRule[]>>('/rules/');
export const addRule = (rule: Omit<FirewallRule, 'ID' | 'UpdatedAt' | 'last_ip' | 'provider' | 'instance_id'>) => apiClient.post('/rules/', rule);
export const updateRule = (id: number, rule: FirewallRule) => apiClient.put(`/rules/${id}`, rule);
export const deleteRule = (id: number) => apiClient.delete(`/rules/${id}`);
export const executeRule = (id: number) => 
  apiClient.patch<ApiResponse<ExecuteRuleResponse>>(`/rules/${id}`, { action: 'execute' });

// Cloud Configs
export const getCloudConfigs = () => apiClient.get<ApiResponse<CloudConfig[]>>('/cloud-configs/');
export const addCloudConfig = (config: CloudConfigRequest) => apiClient.post<ApiResponse<CloudConfig>>('/cloud-configs/', config);
export const updateCloudConfig = (id: number, config: Partial<CloudConfigRequest>) => apiClient.put(`/cloud-configs/${id}`, config);
export const deleteCloudConfig = (id: number) => apiClient.delete(`/cloud-configs/${id}`);
export const testCloudConfig = (id: number) => apiClient.post<ApiResponse<null>>(`/cloud-configs/${id}/actions`, { action: 'test' });
export const getProviders = () => apiClient.get<ApiResponse<string[]>>('/providers');
export const getRegions = (provider: string) => apiClient.get<ApiResponse<{items: {code: string, name: string}[], total: number}>>(`/regions/?provider=${provider}`);
export const searchRegions = (provider: string, keyword: string) => apiClient.get<ApiResponse<{items: {code: string, name: string}[], total: number}>>(`/regions/?provider=${provider}&search=${keyword}`);
export const getServiceTypes = (provider: string) => apiClient.get<ApiResponse<any[]>>(`/providers/${provider}/service-types`);
export const getServiceTypeDetail = (provider: string, type: string) => apiClient.get<ApiResponse<{value: number, name: string, display_name: string, description: string}>>(`/providers/${provider}/service-types/${type}`);
export const getServiceTypeByValue = (provider: string, value: number) => apiClient.get<ApiResponse<{value: number, name: string, display_name: string, description: string}>>(`/providers/${provider}/service-types/${value}`);


// System Config
export const getSystemConfig = () => apiClient.get<ApiResponse<SystemConfig>>('/system/config');
export const saveSystemConfig = (config: SystemConfig) => apiClient.put('/system/config', config);
export const getConfigs = (category: string) => apiClient.get<any>(`/configs/?category=${category}`);
export const getConfig = (key: string) => apiClient.get<ApiResponse<{key: string, value?: string}>>(`/configs/${key}`);
export const setConfig = (key: string, value: string, type?: string, category?: string, description?: string) => 
  apiClient.put(`/configs/${key}`, { value, type, category, description });

// System IP Management
export const syncIPNow = () => apiClient.post<ApiResponse<{current_ip: string, updated_rules: number, failed_rules: number}>>('/system/ip/sync');
export const getCurrentIP = () => apiClient.get<ApiResponse<{current_ip: string}>>('/system/ip/current');

export type StatusAction = 'enable' | 'disable';
export const setRuleStatus = (id: number, action: StatusAction) =>
  apiClient.post<ApiResponse<{id: number, enabled: boolean}>>(`/rules/${id}/status`, { action });
export const setCloudConfigStatus = (id: number, action: StatusAction) =>
  apiClient.post<ApiResponse<{id: number, is_enabled: boolean}>>(`/cloud-configs/${id}/status`, { action });
