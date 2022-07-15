interface Message {
  type: string;
  url: string;
}

type SenderResponse = (response: {
  success: boolean;
  message?: unknown;
}) => void;

export function takeScreenshot(tab: chrome.tabs.Tab) {
  return new Promise<string>((resolve) => {
    chrome.desktopCapture.chooseDesktopMedia(
      ['screen', 'window', 'tab'],
      tab,
      (streamId: string) => resolve(streamId)
    );
  }).then((streamId: string) => {
    if (!streamId) return;
    setTimeout(() => {
      chrome.scripting.executeScript({
        target: { tabId: tab.id as number },
        func: (streamId: string) => {
          let track: MediaStreamTrack, canvas: HTMLCanvasElement;
          (navigator.mediaDevices as any)
            .getUserMedia({
              video: {
                mandatory: {
                  chromeMediaSource: 'desktop',
                  chromeMediaSourceId: streamId,
                },
              },
            })
            .then((stream: MediaStream) => {
              track = stream.getVideoTracks()[0];
              const imageCapture = new ImageCapture(track);
              return imageCapture.grabFrame();
            })
            .then((bitmap: ImageBitmap) => {
              track.stop();
              canvas = document.createElement('canvas');
              canvas.width = bitmap.width; // if not set, the width will default to 200px
              canvas.height = bitmap.height; // if not set, the height will default to 200px
              const context = canvas.getContext('2d');
              context?.drawImage(bitmap, 0, 0, bitmap.width, bitmap.height);
              return canvas.toDataURL();
            })
            .then((url: string) => {
              chrome.runtime.sendMessage(
                chrome.runtime.id,
                { type: 'download-screenshot', url },
                (response) => {
                  if (response.success) {
                    alert('Screenshot saved');
                  } else {
                    alert('Could not save screenshot');
                  }
                  canvas.remove();
                }
              );
            })
            .catch((err: Error) => {
              console.log('Error', err);
              alert('Error! Could not take screenshot');
            });
        },
        args: [streamId],
      });
    }, 200);
  });
}

export function downloadScreenshot(
  message: Message,
  senderResponse: SenderResponse
): boolean | undefined {
  if (message.url) {
    const timestamp = new Date().toISOString().replace(/:/g, '.');

    chrome.downloads.download(
      {
        filename: `screenshot-${timestamp}.png`,
        url: message.url,
      },
      (downloadId) => {
        senderResponse({ success: true });
      }
    );
    return true;
  }
}
