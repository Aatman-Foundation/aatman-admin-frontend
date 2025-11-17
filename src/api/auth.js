import apiClient from './client.js';

const ADMIN_LOGIN_ENDPOINT = '/api/v1/admin/admin-login';
const ADMIN_LOGOUT_ENDPOINT = '/api/v1/admin/admin-logout';
const ADMIN_REGISTER_ENDPOINT = '/api/v1/admin/admin-register';

const parseAdminLoginResponse = (payload = {}) => {
  const admin = payload.admin ?? payload.user ?? payload.profile ?? {};
  const token =
    payload.token ??
    payload.accessToken ??
    payload.authToken ??
    payload?.tokens?.access ??
    null;

  return {
    admin,
    token,
    email: admin.email ?? payload.email ?? null,
    displayName: admin.fullname ?? admin.full_name ?? admin.name ?? null
  };
};

export const adminLogin = async (credentials) => {
  const { data } = await apiClient.post(ADMIN_LOGIN_ENDPOINT, credentials);
  if (!data?.success) {
    throw new Error(data?.message || 'Failed to login');
  }
  const loginData = parseAdminLoginResponse(data.data);
  return {
    ...loginData,
    message: data.message ?? 'Login successful'
  };
};

export const adminLogout = async () => {
  try {
    const { data } = await apiClient.post(ADMIN_LOGOUT_ENDPOINT);
    if (data && data.success === false) {
      throw new Error(data?.message || 'Failed to logout');
    }
    return data ?? { success: true };
  } catch (error) {
    if (error?.response?.status === 401) {
      return { success: true };
    }
    throw error;
  }
};

export const adminRegister = async (payload) => {
  const { data } = await apiClient.post(ADMIN_REGISTER_ENDPOINT, payload);
  if (!data?.success) {
    throw new Error(data?.message || 'Failed to register admin');
  }
  return {
    admin: data.data ?? null,
    message: data.message ?? 'Registration successful'
  };
};
