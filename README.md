<img src="src/assets/img/icon-128.png" width="64"/>

## Machine Diagnostic Tool

Sometimes understanding our machine's performance can be a tedious process. This tool runs a series of tests to help you capture the information you need to do just that.

This tool allows you to:

1. Run tests to check your machine's specifications, network and browser performance.
2. Record a [performance trace](https://developer.chrome.com/docs/devtools/evaluate-performance/).
3. Capture a screenshot.

## Installing and Running

Check out [this video](https://drive.google.com/file/d/1GmZOxRQQlkEeJQWJhb_T5hjE4nlUQCpq/view?usp=sharing) for a setup demo.

## Features

### 1. Run Tests

This captures your machine specifications then tests your browser and network performance.

A JSON file will be automatically generated with the test results after.

Watch the demo [here](https://drive.google.com/file/d/1B8Lqt2Yn-QlOVTgos3d_YiSy6-5gqd-t/view?usp=sharing).

### 2. Screenshot

Capture a screenshot.

A PNG image file will be automatically generated.

Watch the demo [here](https://drive.google.com/file/d/1Lbu7egKZzkqrJyKDgpIT2Si1sstfIFcO/view?usp=sharing).

### 3. Record

Record a [performance trace](https://developer.chrome.com/docs/devtools/evaluate-performance/).

A JSON file will be automatically generated after the process is finished.

Process will automatically end after 60 seconds.

Watch the demo [here](https://drive.google.com/file/d/1zOT4sBnKTXuuiOgzFKxGlLukigqHS0wV/view?usp=sharing).

### 4. Reset

Reset the extension to run a new performance test.

Watch the demo [here](https://drive.google.com/file/d/1Xy-sn07rdsHu0WMIdGzrcwukC8oO2ClA/view?usp=sharing).

## Data Captured

The tool assists you to capture the data below:

- System specifications (e.g. CPU, RAM, HDDs, operating system)
- Browser specifications (e.g. Version, extensions used)
- Browser performance statistics
- Network performance statistics
- Performance traces of any problematic interactions
- Screenshots

The tool does not store, share or process this captured information beyond your local machine.

## Installing and Running (For Developers)

1. Check if your [Node.js](https://nodejs.org/) version is >= **14**.
2. Clone this repository.
3. Change the package's `name`, `description`, and `repository` fields in `package.json`.
4. Change the name of your extension on `src/manifest.json`.
5. Run `npm install` to install the dependencies.
6. Run `npm start`
7. Load your extension on Chrome following:
   1. Access `chrome://extensions/`
   2. Check `Developer mode`
   3. Click on `Load unpacked extension`
   4. Select the `build` folder.
8. Happy hacking.
