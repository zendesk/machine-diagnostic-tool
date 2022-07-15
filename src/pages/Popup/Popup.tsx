import React from 'react';
import './Popup.css';
import { useEffect, useState } from 'react';
import { useIsRecordingStarted } from './useIsRecordingStarted';
import { useAreTestsComplete } from './useAreTestsComplete';
import { useAreTestsRunning } from './useAreTestsRunning';

function runTests() {
  chrome.runtime.sendMessage(chrome.runtime.id, { type: 'run-tests' });
}

function takeScreenshot() {
  chrome.runtime.sendMessage(chrome.runtime.id, { type: 'screenshot' });
}

function toggleRecording() {
  chrome.runtime.sendMessage(chrome.runtime.id, { type: 'toggle-recording' });
}

function refresh() {
  chrome.runtime.reload();
  chrome.storage.local.clear();
}

const CAPTURE_ICON_URL = chrome.runtime.getURL('assets/img/screenshot-capture.png');
const REFRESH_ICON_URL = chrome.runtime.getURL('assets/img/refresh.png');
const RUN_TESTS_ICON_URL = chrome.runtime.getURL('assets/img/run-tests.png');
const RUNNING_TESTS_ICON_URL = chrome.runtime.getURL('assets/img/loading-icon.gif');
const RUN_TESTS_COMPLETE_ICON_URL = chrome.runtime.getURL('assets/img/run-tests-complete.png');
const RECORD_ICON_URL = chrome.runtime.getURL('assets/img/record-performance.png');
const STOP_RECORD_ICON_URL = chrome.runtime.getURL(
  'assets/img/stop-record-performance.png'
);


const Popup: React.FC = React.memo(() => {

  const [isRecordingStarted, timeLapsed, recordingJustFinished] = useIsRecordingStarted();

  const timeLapsedInSeconds = (timeLapsed / 1000) % 60000;
  const mm = `${Math.floor(timeLapsedInSeconds / 60)}`.padStart(2, '0');
  const ss = `${Math.floor(timeLapsedInSeconds % 60)}`.padStart(2, '0');
  const recordingDuration = `${mm}:${ss}`;

  const [areTestsComplete, testsJustCompleted] = useAreTestsComplete();
  const [areTestsRunning, currentTest] = useAreTestsRunning();

  const [promptText, setPromptText] = useState('');

  useEffect(() => {
    if (areTestsRunning) {
      const promptText = `${currentTest} test in progress...`;
      setPromptText(promptText.charAt(0).toUpperCase() + promptText.slice(1));
    }
  }, [areTestsRunning, currentTest]);

  useEffect(() => {
    if (testsJustCompleted) {
      setPromptText('Test data has been downloaded to your computer');
      setTimeout(() => {
        setPromptText('');
        chrome.storage.local.set({ testsJustCompleted: false });
      }, 2500);
    }
  }, [testsJustCompleted]);

  useEffect(() => {
    if (recordingJustFinished) {
      setPromptText('Recording has been saved to your computer');
      setTimeout(() => {
        setPromptText('');
        chrome.storage.local.set({ recordingJustFinished: false });
      }, 2500);
    }
  }, [recordingJustFinished]);

  return (
    <div className="App">
      <header className="App-header">
        <button
          className="Refresh-button"
          onClick={refresh}
        >
          <img
            src={REFRESH_ICON_URL}
            alt="Refresh icon"
            className="Refresh-button-icon"
          />
        </button>
        <button
          className="Run-tests-button"
          onClick={runTests}
          disabled={isRecordingStarted || areTestsRunning || areTestsComplete}
        >
          <img
            src={areTestsComplete ? RUN_TESTS_COMPLETE_ICON_URL : (areTestsRunning ? RUNNING_TESTS_ICON_URL : RUN_TESTS_ICON_URL)}
            alt="Run tests icon"
            className="Run-tests-button-icon"
          />
          <p>{areTestsComplete ? "Tests done" : "Run tests"}</p>
        </button>
        <button
          className="Screenshot-button"
          onClick={takeScreenshot}
          disabled={isRecordingStarted || areTestsRunning}
        >
          <img
            src={CAPTURE_ICON_URL}
            alt="Screenshot icon"
            className="Screenshot-button-icon"
          />
          <p>Capture</p>
        </button>
        <button className="Record-button"
          onClick={toggleRecording}
          disabled={areTestsRunning}
        >
          <img
            src={isRecordingStarted ? STOP_RECORD_ICON_URL : RECORD_ICON_URL}
            alt="Toggle record performance button"
            className="Record-button-icon"
          />
          <p>{isRecordingStarted ? recordingDuration : 'Record'}</p>
        </button>
        <p className="Feedback-prompt">{promptText}</p>

      </header>
    </div>
  );
});

export default Popup;
