// https://wicg.github.io/ua-client-hints/#dictdef-navigatoruabrandversion
interface NavigatorUABrandVersion {
  readonly brand: string;
  readonly version: string;
}

// https://wicg.github.io/ua-client-hints/#dictdef-uadatavalues
interface UADataValues {
  readonly brands?: NavigatorUABrandVersion[];
  readonly mobile?: boolean;
  readonly platform?: string;
  readonly architecture?: string;
  readonly bitness?: string;
  readonly model?: string;
  readonly platformVersion?: string;
  readonly uaFullVersion?: string;
}

// https://wicg.github.io/ua-client-hints/#dictdef-ualowentropyjson
interface UALowEntropyJSON {
  readonly brands: NavigatorUABrandVersion[];
  readonly mobile: boolean;
  readonly platform: string;
}

// https://wicg.github.io/ua-client-hints/#navigatoruadata
interface NavigatorUAData extends UALowEntropyJSON {
  getHighEntropyValues(hints: string[]): Promise<UADataValues>;
  toJSON(): UALowEntropyJSON;
}

interface UADataExtension {
  userAgentData?: NavigatorUAData;
}

declare const navigator: typeof window.navigator & UADataExtension;

function getPlatformInfo(): Promise<chrome.runtime.PlatformInfo> {
  return new Promise((resolve) => {
    chrome.runtime.getPlatformInfo(resolve);
  });
}

async function getSystemInfo() {
  const [
    extensions,
    cpu,
    memory,
    storage,
    platformInfo,
    highEntropyUserAgentData,
  ] = await Promise.all([
    chrome.management.getAll(),
    chrome.system.cpu.getInfo(),
    chrome.system.memory.getInfo(),
    chrome.system.storage.getInfo(),
    getPlatformInfo(),
    navigator.userAgentData
      ?.getHighEntropyValues?.([
        'architecture',
        'bitness',
        'brands',
        'mobile',
        'model',
        'platform',
        'platformVersion',
        'uaFullVersion',
        'fullVersionList',
      ])
      .catch(() => {}),
  ]);

  return {
    extensions,
    cpu,
    memory,
    storage,
    platformInfo,
    navigator: {
      userAgent: navigator.userAgent,
      userAgentData: navigator.userAgentData,
      highEntropyUserAgentData,
    },
  };
}

export { getSystemInfo };
