import { getCurrentTab, saveData } from './utils';
import { runTests } from './runTests';
import { takeScreenshot, downloadScreenshot } from './screenshot';
import { toggleRecording } from './toggleRecording';

chrome.storage.local.set({
  testProgress: { network: 0, benchmark: 0, system: 0 },
});

chrome.runtime.onMessage.addListener(
  async (message, sender, senderResponse) => {
    console.log('message', message);

    switch (message.type) {
      case 'run-tests': {
        await runTests();
        break;
      }

      case 'screenshot': {
        await takeScreenshot(await getCurrentTab());
        break;
      }
      case 'download-screenshot': {
        await downloadScreenshot(message, senderResponse);
        break;
      }

      case 'toggle-recording': {
        const tab = await getCurrentTab();
        const { id: tabId } = tab;
        if (tabId === undefined) return;
        await toggleRecording(tabId);
        break;
      }

      case 'network-test-complete': {
        const { allDownloadMeasurements, allUploadMeasurements } = message;
        await chrome.storage.local.set({
          network: {
            allDownloadMeasurements,
            allUploadMeasurements,
            'averageDownloadSpeed(Mbps)': allDownloadMeasurements.slice(-1)[0],
            'averageUploadSpeed(Mbps)': allUploadMeasurements.slice(-1)[0],
          },
        });
        await chrome.storage.local.get('testProgress', async (result) => {
          await chrome.storage.local.set({
            testProgress: {
              ...result.testProgress,
              network: 1,
            },
          });
          await runTests();
        });
        break;
      }

      default:
        break;
    }
  }
);

chrome.runtime.onMessageExternal.addListener(async (message) => {
  console.log('external message', message);
  switch (message.type) {
    case 'benchmark-results': {
      const { tabId, results } = message;
      await saveData('benchmark', results);
      await chrome.tabs.remove(tabId);
      await chrome.storage.local.get('testProgress', async (result) => {
        await chrome.storage.local.set({
          testProgress: {
            ...result.testProgress,
            benchmark: 1,
          },
        });
        await runTests();
      });
      break;
    }

    default:
      break;
  }
});
