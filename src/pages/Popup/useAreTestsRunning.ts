import { useEffect, useState } from 'react';

export function useAreTestsRunning(): [boolean, string] {
  const [areTestsRunning, setAreTestsRunning] = useState<boolean>(false);
  const [currentTest, setCurrentTest] = useState<string>('');

  // Get current test states
  useEffect(() => {
    async function getTestStates() {
      const { testRunningStatus } = await chrome.storage.local.get(
        'testRunningStatus'
      );
      setAreTestsRunning(testRunningStatus);
      const { currentTest } = await chrome.storage.local.get('currentTest');
      setCurrentTest(currentTest);
    }

    getTestStates();
  }, []);

  // React to changes on the test states
  useEffect(() => {
    function listener(
      changes: {
        [key: string]: chrome.storage.StorageChange;
      },
      area: 'local' | 'sync' | 'managed'
    ) {
      if (area !== 'local') return;
      if ('testRunningStatus' in changes) {
        const testRunningStatus = changes.testRunningStatus.newValue;
        setAreTestsRunning(testRunningStatus);
      }
      if ('currentTest' in changes) {
        const currentTest = changes.currentTest.newValue;
        setAreTestsRunning(currentTest);
      }
    }

    chrome.storage.onChanged.addListener(listener);

    return () => {
      chrome.storage.onChanged.removeListener(listener);
    };
  }, []);

  return [areTestsRunning, currentTest];
}
