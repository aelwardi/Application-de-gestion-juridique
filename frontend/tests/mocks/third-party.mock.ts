import { vi } from 'vitest';

export const mockLeaflet = {
  map: vi.fn(() => ({
    setView: vi.fn(),
    on: vi.fn(),
    off: vi.fn(),
    remove: vi.fn(),
    addLayer: vi.fn(),
    removeLayer: vi.fn(),
  })),
  tileLayer: vi.fn(() => ({
    addTo: vi.fn(),
  })),
  marker: vi.fn(() => ({
    addTo: vi.fn(),
    bindPopup: vi.fn(),
    on: vi.fn(),
    remove: vi.fn(),
    setLatLng: vi.fn(),
  })),
  icon: vi.fn(),
  LatLng: class {
    constructor(public lat: number, public lng: number) {}
  },
};


export const mockChart = vi.fn().mockImplementation(() => ({
  destroy: vi.fn(),
  update: vi.fn(),
  resize: vi.fn(),
  clear: vi.fn(),
  stop: vi.fn(),
  render: vi.fn(),
  data: {
    labels: [],
    datasets: [],
  },
}));


export const mockGeolocation = {
  getCurrentPosition: vi.fn((success) => {
    success({
      coords: {
        latitude: 48.8566,
        longitude: 2.3522,
        accuracy: 100,
      },
    });
  }),
  watchPosition: vi.fn(),
  clearWatch: vi.fn(),
};

export class MockFile {
  constructor(
    public parts: any[],
    public name: string,
    public options?: { type?: string }
  ) {}

  get type() {
    return this.options?.type || '';
  }

  get size() {
    return this.parts.reduce((acc, part) => acc + part.length, 0);
  }
}

export class MockFileReader {
  onload: ((event: any) => void) | null = null;
  onerror: ((event: any) => void) | null = null;
  result: string | ArrayBuffer | null = null;

  readAsDataURL(file: MockFile) {
    setTimeout(() => {
      this.result = `data:${file.type};base64,mockbase64data`;
      this.onload?.({ target: this });
    }, 0);
  }

  readAsText(file: MockFile) {
    setTimeout(() => {
      this.result = 'mock file content';
      this.onload?.({ target: this });
    }, 0);
  }
}


export class MockIntersectionObserver {
  constructor(public callback: IntersectionObserverCallback) {}

  observe = vi.fn();
  unobserve = vi.fn();
  disconnect = vi.fn();
}

export class MockResizeObserver {
  constructor(public callback: ResizeObserverCallback) {}

  observe = vi.fn();
  unobserve = vi.fn();
  disconnect = vi.fn();
}

export class MockMutationObserver {
  constructor(public callback: MutationCallback) {}

  observe = vi.fn();
  disconnect = vi.fn();
  takeRecords = vi.fn(() => []);
}

export const mockClipboard = {
  writeText: vi.fn().mockResolvedValue(undefined),
  readText: vi.fn().mockResolvedValue('mocked clipboard text'),
};

export class MockNotification {
  static permission: NotificationPermission = 'default';

  static requestPermission = vi.fn().mockResolvedValue('granted');

  constructor(public title: string, public options?: NotificationOptions) {}

  close = vi.fn();
  onclick: ((event: Event) => void) | null = null;
  onerror: ((event: Event) => void) | null = null;
}


export const setupThirdPartyMocks = () => {
  global.L = mockLeaflet as any;

  (global as any).Chart = mockChart;

  if (!global.navigator) {
    (global as any).navigator = {};
  }

  Object.defineProperty(global.navigator, 'geolocation', {
    value: mockGeolocation,
    writable: true,
    configurable: true,
  });

  global.File = MockFile as any;
  global.FileReader = MockFileReader as any;

  global.IntersectionObserver = MockIntersectionObserver as any;
  global.ResizeObserver = MockResizeObserver as any;
  global.MutationObserver = MockMutationObserver as any;

  if (!global.navigator.clipboard) {
    (global.navigator as any).clipboard = mockClipboard;
  }

  global.Notification = MockNotification as any;

  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation((query) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  });

  window.scrollTo = vi.fn() as any;

  window.open = vi.fn();

  global.console.warn = vi.fn();
  global.console.error = vi.fn();
};


export const cleanupThirdPartyMocks = () => {
  vi.clearAllMocks();
};