import { btoa } from 'js-base64';

export function createTab(url: string): Promise<number> {
  let targetTabId: number | undefined;

  return new Promise((resolve, reject) => {
    function tabListener(tabId: number, changeInfo: chrome.tabs.TabChangeInfo) {
      // make sure the status is 'complete' and it's the right tab
      if (targetTabId === tabId && changeInfo.status === 'complete') {
        chrome.tabs.onUpdated.removeListener(tabListener);
        resolve(targetTabId);
      }
    }

    chrome.tabs.onUpdated.addListener(tabListener);
    chrome.tabs
      .create({ url })
      .then((tab) => (targetTabId = tab.id))
      .catch(reject);
  });
}

export async function getCurrentTab(): Promise<chrome.tabs.Tab> {
  const queryOptions = { active: true, currentWindow: true };
  const [tab] = await chrome.tabs.query(queryOptions);
  return tab;
}

export function timeout(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function saveData<T>(key: string, data: T) {
  return chrome.storage.local.set({
    [key]: {
      timestamp: Date.now(),
      data,
    },
  });
}

export async function downloadAsJSON<T>(filePrefix: string, data: T) {
  // Sting is unescaped before encoded as some characters may be out of Latin1 range.
  // Ref: https://developer.mozilla.org/en-US/docs/Glossary/Base64#solution_1_%E2%80%93_escaping_the_string_before_encoding_it
  const base64Data = btoa(unescape(encodeURIComponent(JSON.stringify(data))));
  const timestamp = new Date().toISOString().replace(/:/g, '.');

  await chrome.downloads.download({
    url: `data:application/json;base64,${base64Data}`,
    filename: `${filePrefix}-${timestamp}.json`,
  });
}

export function getWarningHtml(title: string): string {
  return `
    <div style="
    position: fixed;
    display: block;
    width: 100%;
    height: 100%;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(47, 57, 65, 0.8);
    z-index: 2;
    ">
    </div>

    <div style="
    position: absolute;
    width: 100%;
    top: 0;
    left: 0;
    height: 100px;
    display: flex;
    background: #8C232C;
    flex-direction: row;
    z-index: 3;
    ">

    <div style="
    height: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    margin-left: 2%;
    ">
    <img src=${chrome.runtime.getURL(
      'assets/img/loading-icon.gif'
    )} style="width: 50px; height: 50px" />
    </div>
    <div style="
    height: 100%;
    display: flex;
    flex-direction: column;
    align-items: left;
    justify-content: center;
    margin-left: 2%;
    ">
    <span style="font-family: sans-serif !important;
    font-style: normal;
    font-weight: 600;
    font-size: 18px;
    line-height: 133%;
    letter-spacing: -0.45px;
    color: #FFFFFF;
    ">Machine Diagnostic: ${title} in progress...</span>
    <span style="
    font-family: sans-serif !important;
    font-style: normal;
    font-weight: 400;
    font-size: 14px;
    line-height: 143%;
    letter-spacing: -0.154px;
    color: #FFFFFF;
    ">Please <b>remain active on this tab</b> and avoid navigating to other windows. Once complete, this tab will be
    closed automatically</span>
    </div>

    </div>`;
}
