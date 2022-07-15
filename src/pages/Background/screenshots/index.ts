export function takeScreenshot(tab: chrome.tabs.Tab) {
  chrome.desktopCapture.chooseDesktopMedia(
    ['screen', 'window', 'tab'],
    tab,
    (streamId) => {
      // check whether the user canceled the request or not
      if (streamId && streamId.length) {
        setTimeout(() => {
          // chrome.tabs.sendMessage(
          //   tab.id as number,
          //   { type: 'stream', streamId },
          //   (response) => console.log(response)
          // );
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
                  let context = canvas.getContext('2d');
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
                  alert('Could not take screenshot');
                });
            },
            args: [streamId],
          });
        }, 200);
      }
    }
  );
}
