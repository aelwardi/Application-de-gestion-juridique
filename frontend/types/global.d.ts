declare module '#app' {
  interface NuxtApp {
    $pinia: any;
  }
}

declare global {
  interface Window {
    $pinia: any;
  }
}

export {};