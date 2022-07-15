import { getSystemInfo } from './system';
import { createTab, downloadAsJSON, saveData } from './utils';
import { startBenchmark } from './benchmark';
import { BROWSERBENCH_URL } from './constants';

export async function runTests() {
  const { testProgress } = await chrome.storage.local.get('testProgress');
  for (const [testName, completed] of Object.entries(testProgress)) {
    if (!completed) {
      await runTest(testName);
      break;
    }
  }

  const testNumberValues: number[] = Object.values(testProgress);
  const totalTestCount = testNumberValues.length;
  const completedTestCount = testNumberValues.reduce<number>(
    (start, current) => {
      return start + current;
    },
    0
  );

  if (completedTestCount === totalTestCount) {
    const data = await chrome.storage.local.get([
      'system',
      'benchmark',
      'network',
    ]);

    await downloadAsJSON('machine-diagnostic', data);

    await chrome.storage.local.set({
      testsComplete: true,
      testsJustCompleted: true,
    });
  }

  async function runTest(testName: string) {
    chrome.storage.local.set({
      currentTest: testName,
    });
    await chrome.storage.local.set({ testRunningStatus: true });
    switch (testName) {
      case 'system': {
        getSystemInfo().then((results) => saveData('system', results));
        await chrome.storage.local.set({ testRunningStatus: false });
        await chrome.storage.local.get('testProgress', async (result) => {
          await chrome.storage.local.set({
            testProgress: {
              ...result.testProgress,
              system: 1,
            },
          });
          await runTests();
        });

        break;
      }

      case 'benchmark': {
        const tabId = await createTab(BROWSERBENCH_URL);
        await startBenchmark(tabId);
        break;
      }
      case 'network': {
        const tabId = await createTab(
          chrome.runtime.getURL('networkTest/index.html')
        );
        const tabRemovedEventHandler = async function (
          closedTabId: number,
          _removeInfo: chrome.tabs.TabRemoveInfo
        ) {
          if (closedTabId !== tabId) return;
          await chrome.storage.local.set({
            testRunningStatus: false,
          });
          chrome.tabs.onRemoved.removeListener(tabRemovedEventHandler);
        };
        chrome.tabs.onRemoved.addListener(tabRemovedEventHandler);
        break;
      }
      default:
        break;
    }
  }
}
