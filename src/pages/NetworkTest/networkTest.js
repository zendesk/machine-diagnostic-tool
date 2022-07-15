let downloadSpeeds = [];
let uploadSpeeds = [];

async function testComplete() {
  await chrome.runtime.sendMessage(chrome.runtime.id, {
    type: 'network-test-complete',
    allDownloadMeasurements: downloadSpeeds,
    allUploadMeasurements: uploadSpeeds,
  });
  window.close();
}

window.ndt7
  .test(
    {
      userAcceptedDataPolicy: true,
      downloadworkerfile: 'ndt7-download-worker.js',
      uploadworkerfile: 'ndt7-upload-worker.js',
      metadata: {
        client_name: 'ndt7-html-example',
      },
    },
    {
      serverChosen: async function (server) {
        console.log('Testing to:', {
          machine: server.machine,
          locations: server.location,
        });
        document.getElementById('server').innerHTML =
          'Testing to: ' + server.machine + ' (' + server.location.city + ')';
      },
      downloadMeasurement: function (data) {
        if (data.Source === 'client') {
          const downloadSpeedMeasurement = data.Data.MeanClientMbps.toFixed(2);
          document.getElementById('download').innerHTML =
            'Download speed: ' + downloadSpeedMeasurement + ' Mb/s';
          downloadSpeeds.push(downloadSpeedMeasurement);
        }
      },
      downloadComplete: async function (data) {
        console.log('download complete! data:', data);
        // (bytes/second) * (bits/byte) / (megabits/bit) = Mbps
        const serverBw = (data.LastServerMeasurement.BBRInfo.BW * 8) / 1000000;
        const clientGoodput =
          data.LastClientMeasurement.MeanClientMbps.toFixed(2);
        console.log(
          `Download test is complete:
    Instantaneous server bottleneck bandwidth estimate: ${serverBw} Mbps
    Mean client goodput: ${clientGoodput} Mbps`
        );
        document.getElementById('download').innerHTML =
          'Download: ' + clientGoodput + ' Mb/s';
      },
      uploadMeasurement: function (data) {
        if (data.Source === 'server') {
          const uploadSpeedMeasurement = (
            (data.Data.TCPInfo.BytesReceived / data.Data.TCPInfo.ElapsedTime) *
            8
          ).toFixed(2);
          document.getElementById('upload').innerHTML =
            'Upload speed: ' + uploadSpeedMeasurement + ' Mb/s';
          uploadSpeeds.push(uploadSpeedMeasurement);
        }
      },
      uploadComplete: async function (data) {
        console.log('upload complete! data:', data);
        const bytesReceived = data.LastServerMeasurement.TCPInfo.BytesReceived;
        const elapsed = data.LastServerMeasurement.TCPInfo.ElapsedTime;
        // bytes * bits/byte / microseconds = Mbps
        const throughput = ((bytesReceived * 8) / elapsed).toFixed(2);
        console.log(
          `Upload test completed in ${(elapsed / 1000000).toFixed(2)}s
        Mean server throughput: ${throughput} Mbps`
        );
      },
      error: function (err) {
        console.log('Error while running the test:', err.message);
        alert('Test error. Please close this tab and click "Run tests" again.');
      },
    }
  )
  .then(async (exitcode) => {
    console.log('ndt7 test completed with exit code:', exitcode);
    if (exitcode === 0) await testComplete();
  });
