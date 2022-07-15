import {
  CDP_VERSION,
  INCLUDED_CATEGORIES,
  EXCLUDED_CATEGORIES,
} from './constants';
import { downloadAsJSON, timeout } from './utils';

export async function toggleRecording(tabId: number) {
  const { recordingState: isRecording } = await chrome.storage.local.get(
    'recordingState'
  );

  if (isRecording) {
    await chrome.storage.local.set({
      recordingState: false,
    });
    await chrome.debugger.sendCommand({ tabId }, 'Tracing.end');
    await chrome.scripting.executeScript({
      target: { tabId },
      func: () => {
        alert('Recording stopped. Please wait for recording to download!');
      },
      args: [],
      world: 'MAIN',
    });
    return;
  }

  async function recordingStopped() {
    //chrome.storage.local set again here to catch edge cases (e.g. tab closes, user cancels debugging etc.)
    await chrome.storage.local.set({
      recordingState: false,
    });
    chrome.debugger.onEvent.removeListener(allEventHandler);
    chrome.tabs.onRemoved.removeListener(tabRemovedEventHandler);
    chrome.debugger.onDetach.removeListener(debuggerRemovedEventHandler);
    await chrome.debugger.detach({ tabId });
  }

  let perfTrace: any[] = [];

  async function allEventHandler(
    debuggee: chrome.debugger.Debuggee,
    message: string,
    params?: any
  ) {
    if (tabId !== debuggee.tabId) {
      return;
    }

    if (message === 'Tracing.dataCollected') {
      // loop to de-nest performance trace data
      for (var i = 0; i < params.value.length; i++) {
        perfTrace.push(params.value[i]);
      }
      return;
    }

    if (message !== 'Tracing.tracingComplete') {
      return;
    }

    await downloadAsJSON('recording', perfTrace);

    await chrome.storage.local.set({
      recordingJustFinished: true,
    });
    await recordingStopped();
  }

  async function tabRemovedEventHandler(
    closedTabId: number,
    _removeInfo: chrome.tabs.TabRemoveInfo
  ) {
    if (closedTabId !== tabId) return;
    await recordingStopped();
  }

  async function debuggerRemovedEventHandler(
    source: chrome.debugger.Debuggee,
    _reason: string
  ) {
    const { tabId: tabDetached } = source;
    if (tabDetached !== tabId) return;
    await recordingStopped();
  }

  async function onDebuggerAttach() {
    chrome.debugger.onEvent.addListener(allEventHandler);
    chrome.tabs.onRemoved.addListener(tabRemovedEventHandler);
    chrome.debugger.onDetach.addListener(debuggerRemovedEventHandler);

    await chrome.scripting.executeScript({
      target: { tabId },
      func: () => {
        alert('Recording has started! Please reproduce the issue!');
      },
      args: [],
      world: 'MAIN',
    });

    await chrome.storage.local.set({
      recordingState: true,
      recordingStartTime: Date.now(),
    });

    await chrome.debugger.sendCommand({ tabId }, 'Tracing.start', {
      traceConfig: {
        includedCategories: INCLUDED_CATEGORIES,
        excludedCategories: EXCLUDED_CATEGORIES,
      },
    });

    // recording will stop after 2 minutes
    await timeout(120000);
    const targetList = await chrome.debugger.getTargets();

    for (let i = 0; i < targetList.length; i++) {
      const { tabId: targetTabId, attached } = targetList[i];
      if (targetTabId === tabId) {
        if (attached) {
          await chrome.scripting.executeScript({
            target: { tabId },
            func: () => {
              alert('Timed out! Please stop recording within 60 seconds.');
            },
            args: [],
            world: 'MAIN',
          });
          await recordingStopped();
        }
      }
    }
  }
  await chrome.debugger.attach({ tabId }, CDP_VERSION);
  await onDebuggerAttach();
}
