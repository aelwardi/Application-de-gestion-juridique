import { vi } from 'vitest';

export const mockAuthStore = {
  user: null,
  accessToken: null,
  refreshToken: null,
  isAuthenticated: false,
  isLoading: false,
  isAdmin: false,
  isLawyer: false,
  isClient: false,
  isCollaborator: false,
  fullName: '',
  setAuth: vi.fn(),
  clearAuth: vi.fn(),
  loadTokensFromStorage: vi.fn(),
  register: vi.fn(),
  login: vi.fn(),
  logout: vi.fn(),
  refreshToken: vi.fn(),
  fetchProfile: vi.fn(),
  updateProfile: vi.fn(),
  changePassword: vi.fn(),
  enable2FA: vi.fn(),
  disable2FA: vi.fn(),
};

export const mockToastStore = {
  toasts: [],
  success: vi.fn(),
  error: vi.fn(),
  warning: vi.fn(),
  info: vi.fn(),
  remove: vi.fn(),
};

export const mockNotificationsStore = {
  notifications: [],
  unreadCount: 0,
  isLoading: false,
  fetchNotifications: vi.fn(),
  markAsRead: vi.fn(),
  markAllAsRead: vi.fn(),
  deleteNotification: vi.fn(),
};

export const mockConfirmStore = {
  isOpen: false,
  title: '',
  message: '',
  confirmText: '',
  cancelText: '',
  onConfirm: null,
  onCancel: null,
  open: vi.fn(),
  close: vi.fn(),
  confirm: vi.fn(),
  cancel: vi.fn(),
};

export const resetStoreMocks = () => {
  Object.values(mockAuthStore).forEach((mock) => {
    if (typeof mock === 'function' && mock.mockReset) {
      mock.mockReset();
    }
  });
  Object.values(mockToastStore).forEach((mock) => {
    if (typeof mock === 'function' && mock.mockReset) {
      mock.mockReset();
    }
  });
  Object.values(mockNotificationsStore).forEach((mock) => {
    if (typeof mock === 'function' && mock.mockReset) {
      mock.mockReset();
    }
  });
  Object.values(mockConfirmStore).forEach((mock) => {
    if (typeof mock === 'function' && mock.mockReset) {
      mock.mockReset();
    }
  });

  mockAuthStore.user = null;
  mockAuthStore.accessToken = null;
  mockAuthStore.isAuthenticated = false;
  mockToastStore.toasts = [];
  mockNotificationsStore.notifications = [];
  mockNotificationsStore.unreadCount = 0;
};

