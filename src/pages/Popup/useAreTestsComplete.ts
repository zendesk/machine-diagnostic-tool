import { useEffect, useState } from 'react';

export function useAreTestsComplete(): [boolean, boolean] {
  const [areTestsComplete, setAreTestsComplete] = useState<boolean>(false);
  const [testsJustCompleted, setTestsJustCompleted] = useState<boolean>(false);

  // Get current test states
  useEffect(() => {
    async function getTestStates() {
      const { testsComplete, testsJustCompleted } =
        await chrome.storage.local.get(['testsComplete', 'testsJustCompleted']);

      setAreTestsComplete(testsComplete ?? false);
      setTestsJustCompleted(testsJustCompleted ?? false);
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
      if ('testsComplete' in changes) {
        setAreTestsComplete(changes.testsComplete.newValue);
      }
      if ('testsJustCompleted' in changes) {
        setTestsJustCompleted(changes.testsJustCompleted.newValue);
      }
    }
    chrome.storage.onChanged.addListener(listener);

    return () => {
      chrome.storage.onChanged.removeListener(listener);
    };
  }, []);

  return [areTestsComplete, testsJustCompleted];
}
