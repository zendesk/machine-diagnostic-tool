import { EXTENSION_ID } from './constants';
import { getWarningHtml } from './utils';

export function startBenchmark(
  tabId: number
): Promise<chrome.scripting.InjectionResult[]> {
  async function tabRemovedEventHandler(
    closedTabId: number,
    _removeInfo: chrome.tabs.TabRemoveInfo
  ) {
    if (closedTabId !== tabId) return;
    await chrome.storage.local.set({
      testRunningStatus: false,
    });
    chrome.tabs.onRemoved.removeListener(tabRemovedEventHandler);
  }
  chrome.tabs.onRemoved.addListener(tabRemovedEventHandler);

  return chrome.scripting.executeScript({
    target: { tabId },
    func: (extensionId: string, tabId: number, warningHtml: string) => {
      function addWarning() {
        const wrapper = document.createElement('div');
        wrapper.innerHTML = warningHtml;
        document.body.appendChild(wrapper);
      }

      addWarning();

      //@ts-ignore
      if (!window.__modifiedBenchmark) {
        //@ts-ignore
        window.__modifiedBenchmark = true;
        //@ts-ignore
        const benchmarkClient = window.benchmarkClient;
        const originalDidRFinishLastIteration =
          benchmarkClient.didFinishLastIteration.bind(benchmarkClient);
        //@ts-ignore
        benchmarkClient.didFinishLastIteration = (...args) => {
          originalDidRFinishLastIteration.apply(benchmarkClient, args);

          const results = benchmarkClient._computeResults(
            benchmarkClient._measuredValuesList,
            benchmarkClient.displayUnit
          );
          chrome.runtime.sendMessage(extensionId, {
            type: 'benchmark-results',
            tabId,
            results,
          });
        };
      }
      //@ts-ignore
      window.startTest();
    },
    args: [EXTENSION_ID, tabId, getWarningHtml('Benchmark test')],
    world: 'MAIN',
  });
}
