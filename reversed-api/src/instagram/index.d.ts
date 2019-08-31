interface IGLiteBridge {
  enablePullToRefresh: () => void;
  disablePullToRefresh: () => void;
  enableFullscreen: () => void;
  disableFullscreen: () => void;
  getPushToken: () => string;
  getFcmPushToken: () => string;
  getGUID: () => string;
  getPermissionStatus: (permission_name: string) => void;
  setUserId: (id: string) => void;
  getLastUsedUserName: () => string;
  setLastUsedUserName: (username: string) => void;
  clearUserId: () => void;
  requestImportContacts: () => void;
  notifyCancelPageLoad: () => void;
  notifyFirstPageLoadFinished: () => void;
  notifyFirstPageLoadFinishedWithSessionId: (id: string) => void;
  getPhoneIDAsync: () => Promise<string>;
  getFbTokenAsync: () => Promise<string>;
  getGauthTokensAsync: () => Promise<string>;
  getImageGalleryAsync: () => Promise<any>;
  getVideoGalleryAsync: () => Promise<any>;
  getImageCameraAsync: () => Promise<any>;
  getNetworkTypeAsync: () => Promise<any>;
  isWhatsAppInstalled: () => void;
  shareToWhatsApp: (message: string) => void;
}

interface Window {
  Object: ObjectConstructor;
  Symbol: SymbolConstructor;
  Uint32Array: Uint32ArrayConstructor;

  _ssr?: boolean;

  __bufferedErrors?: any;
  __bufferedPerformance?: any;
  _sharedData?: any;
  __initialData?: any;
  _cached_shared_Data?: any;
  _csrf_token?: any;
  __igExposedQEs?: any;
  __igExposedQEX?: { [key: string]: boolean };
  _cstart?: number;
  __additionalData?: { [key: string]: any };

  IG_LITE_JS_BRIDGE: IGLiteBridge;
  IG_LITE_JS_BRIDGE_DEBUG: any;
  perfMetrics: any;

  // Deferred add to home screen prompt
  defferedA2HSPrompt: Event;

  visualViewport: {
    scale: number;
  };

  msCrypto?: any;
  msPerformance?: Performance;
  webkitPerformance?: Performance;
}

interface Screen {
  devicePixelRatio: number;
}

interface Console {
  firebug?: any;
}

interface Navigator {
  connection?: {
    downlink: number;
    effectiveType: string;
    rtt: number;
    type: string;
  };
  deviceMemory: number;
}

declare const chrome: {
  storage: {
    local: Storage;
  };
};

declare const IG_LITE_JS_BRIDGE: IGLiteBridge;
declare const IG_LITE_JS_BRIDGE_DEBUG: {
  getDevServer: () => void;
  setDevServer: (address: string) => void;
};

declare const process:
  | {
      env: { [key: string]: string };
    }
  | undefined;
