import { useEffect, useState } from 'react';

export function useIsRecordingStarted(): [boolean, number, boolean] {
  const [recordingJustFinished, setRecordingJustFinished] =
    useState<boolean>(false);
  const [isRecordingStarted, setIsRecordingStarted] = useState<boolean>(false);
  const [recordingStartTime, setRecordingStartTime] = useState<number>(0);
  const [recordingDuration, setRecordingDuration] = useState<number>(0);

  // Get current recording state
  useEffect(() => {
    async function getRecordingState() {
      const { recordingState, recordingStartTime, recordingJustFinished } =
        await chrome.storage.local.get([
          'recordingState',
          'recordingStartTime',
          'recordingJustFinished',
        ]);
      setIsRecordingStarted(recordingState ?? false);
      setRecordingStartTime(recordingStartTime ?? 0);
      setRecordingJustFinished(recordingJustFinished ?? false);
    }

    getRecordingState();
  }, []);

  useEffect(() => {
    let interval: any = null;
    if (isRecordingStarted) {
      interval = setInterval(() => {
        const timeNow = Date.now();
        setRecordingDuration(timeNow - recordingStartTime);
      }, 1000);
    } else {
      clearInterval(interval);
    }

    return () => clearInterval(interval);
  }, [isRecordingStarted, recordingStartTime]);

  // React to changes on the recording state
  useEffect(() => {
    function listener(
      changes: {
        [key: string]: chrome.storage.StorageChange;
      },
      area: 'local' | 'sync' | 'managed'
    ) {
      if (area !== 'local') return;
      if ('recordingState' in changes) {
        setIsRecordingStarted(changes.recordingState.newValue);
      }
      if ('recordingStartTime' in changes) {
        setRecordingStartTime(changes.recordingStartTime.newValue);
      }
      if ('recordingJustFinished' in changes) {
        setRecordingJustFinished(changes.recordingJustFinished.newValue);
      }
    }

    chrome.storage.onChanged.addListener(listener);

    return () => {
      chrome.storage.onChanged.removeListener(listener);
    };
  }, []);

  return [isRecordingStarted, recordingDuration, recordingJustFinished];
}
