/**
 * Declaraciones de tipos para APIs del navegador
 * Necesarias para TypeScript y las funcionalidades avanzadas
 */

// Web Speech API
declare global {
  interface Window {
    SpeechRecognition: typeof SpeechRecognition;
    webkitSpeechRecognition: typeof SpeechRecognition;
    SpeechSynthesis: typeof SpeechSynthesis;
    speechSynthesis: SpeechSynthesis;
  }

  interface SpeechRecognition extends EventTarget {
    continuous: boolean;
    grammars: SpeechGrammarList;
    interimResults: boolean;
    lang: string;
    maxAlternatives: number;
    serviceURI: string;
    
    // Events
    onaudioend: ((this: SpeechRecognition, ev: Event) => any) | null;
    onaudiostart: ((this: SpeechRecognition, ev: Event) => any) | null;
    onend: ((this: SpeechRecognition, ev: Event) => any) | null;
    onerror: ((this: SpeechRecognition, ev: SpeechRecognitionErrorEvent) => any) | null;
    onnomatch: ((this: SpeechRecognition, ev: SpeechRecognitionEvent) => any) | null;
    onresult: ((this: SpeechRecognition, ev: SpeechRecognitionEvent) => any) | null;
    onsoundend: ((this: SpeechRecognition, ev: Event) => any) | null;
    onsoundstart: ((this: SpeechRecognition, ev: Event) => any) | null;
    onspeechend: ((this: SpeechRecognition, ev: Event) => any) | null;
    onspeechstart: ((this: SpeechRecognition, ev: Event) => any) | null;
    onstart: ((this: SpeechRecognition, ev: Event) => any) | null;
    
    // Methods
    abort(): void;
    start(): void;
    stop(): void;
  }

  declare var SpeechRecognition: {
    prototype: SpeechRecognition;
    new(): SpeechRecognition;
  };

  interface SpeechRecognitionEvent extends Event {
    readonly resultIndex: number;
    readonly results: SpeechRecognitionResultList;
  }

  interface SpeechRecognitionErrorEvent extends Event {
    readonly error: string;
    readonly message: string;
  }

  interface SpeechRecognitionResultList {
    readonly length: number;
    item(index: number): SpeechRecognitionResult;
    [index: number]: SpeechRecognitionResult;
  }

  interface SpeechRecognitionResult {
    readonly isFinal: boolean;
    readonly length: number;
    item(index: number): SpeechRecognitionAlternative;
    [index: number]: SpeechRecognitionAlternative;
  }

  interface SpeechRecognitionAlternative {
    readonly confidence: number;
    readonly transcript: string;
  }

  interface SpeechGrammarList {
    readonly length: number;
    addFromString(string: string, weight?: number): void;
    addFromURI(src: string, weight?: number): void;
    item(index: number): SpeechGrammar;
    [index: number]: SpeechGrammar;
  }

  interface SpeechGrammar {
    src: string;
    weight: number;
  }
}

// Geolocation API enhancements
declare global {
  interface GeolocationPosition {
    readonly coords: GeolocationCoordinates;
    readonly timestamp: number;
  }

  interface GeolocationCoordinates {
    readonly accuracy: number;
    readonly altitude: number | null;
    readonly altitudeAccuracy: number | null;
    readonly heading: number | null;
    readonly latitude: number;
    readonly longitude: number;
    readonly speed: number | null;
  }
}

// File API enhancements
declare global {
  interface FileReader {
    readAsArrayBuffer(file: Blob): void;
    readAsBinaryString(file: Blob): void;
    readAsDataURL(file: Blob): void;
    readAsText(file: Blob, encoding?: string): void;
  }
}

// Web Workers
declare global {
  interface Worker {
    postMessage(message: any, transfer?: Transferable[]): void;
    terminate(): void;
    onmessage: ((this: Worker, ev: MessageEvent) => any) | null;
    onerror: ((this: Worker, ev: ErrorEvent) => any) | null;
  }
}

// IndexedDB para cache local
declare global {
  interface IDBFactory {
    open(name: string, version?: number): IDBOpenDBRequest;
    deleteDatabase(name: string): IDBOpenDBRequest;
    cmp(first: any, second: any): number;
  }

  interface IDBDatabase extends EventTarget {
    readonly name: string;
    readonly version: number;
    readonly objectStoreNames: DOMStringList;
    
    close(): void;
    createObjectStore(name: string, options?: IDBObjectStoreParameters): IDBObjectStore;
    deleteObjectStore(name: string): void;
    transaction(storeNames: string | string[], mode?: IDBTransactionMode): IDBTransaction;
  }
}

// Notification API
declare global {
  interface Notification extends EventTarget {
    readonly actions: NotificationAction[];
    readonly badge: string;
    readonly body: string;
    readonly data: any;
    readonly dir: NotificationDirection;
    readonly icon: string;
    readonly image: string;
    readonly lang: string;
    readonly renotify: boolean;
    readonly requireInteraction: boolean;
    readonly silent: boolean;
    readonly tag: string;
    readonly timestamp: number;
    readonly title: string;
    readonly vibrate: number[];
    
    close(): void;
    
    onclick: ((this: Notification, ev: Event) => any) | null;
    onclose: ((this: Notification, ev: Event) => any) | null;
    onerror: ((this: Notification, ev: Event) => any) | null;
    onshow: ((this: Notification, ev: Event) => any) | null;
  }

  declare var Notification: {
    prototype: Notification;
    new(title: string, options?: NotificationOptions): Notification;
    readonly permission: NotificationPermission;
    requestPermission(): Promise<NotificationPermission>;
  };
}

// Performance API
declare global {
  interface Performance {
    now(): number;
    mark(markName: string): void;
    measure(measureName: string, startMark?: string, endMark?: string): void;
    getEntriesByName(name: string, entryType?: string): PerformanceEntry[];
    getEntriesByType(entryType: string): PerformanceEntry[];
    clearMarks(markName?: string): void;
    clearMeasures(measureName?: string): void;
  }
}

// Intersection Observer API
declare global {
  interface IntersectionObserver {
    readonly root: Element | null;
    readonly rootMargin: string;
    readonly thresholds: ReadonlyArray<number>;
    
    disconnect(): void;
    observe(target: Element): void;
    takeRecords(): IntersectionObserverEntry[];
    unobserve(target: Element): void;
  }

  declare var IntersectionObserver: {
    prototype: IntersectionObserver;
    new(callback: IntersectionObserverCallback, options?: IntersectionObserverInit): IntersectionObserver;
  };

  interface IntersectionObserverEntry {
    readonly boundingClientRect: DOMRectReadOnly;
    readonly intersectionRatio: number;
    readonly intersectionRect: DOMRectReadOnly;
    readonly isIntersecting: boolean;
    readonly rootBounds: DOMRectReadOnly | null;
    readonly target: Element;
    readonly time: number;
  }

  interface IntersectionObserverCallback {
    (entries: IntersectionObserverEntry[], observer: IntersectionObserver): void;
  }
}

// Clipboard API
declare global {
  interface Clipboard extends EventTarget {
    read(): Promise<ClipboardItem[]>;
    readText(): Promise<string>;
    write(data: ClipboardItem[]): Promise<void>;
    writeText(data: string): Promise<void>;
  }

  interface ClipboardItem {
    readonly types: ReadonlyArray<string>;
    getType(type: string): Promise<Blob>;
  }

  declare var ClipboardItem: {
    prototype: ClipboardItem;
    new(items: Record<string, string | Blob | Promise<string | Blob>>): ClipboardItem;
  };
}

export {}; 