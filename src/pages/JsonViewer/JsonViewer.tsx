import React from 'react';
import './JsonViewer.css';

import { Base64 } from 'js-base64';

import { JsonView, defaultStyles } from 'react-json-view-lite';
import 'react-json-view-lite/dist/index.css';

const style: typeof defaultStyles = {
  ...defaultStyles,
  container: 'container',
  pointer: 'pointer',
};

const urlParams = new URLSearchParams(window.location.hash.slice(1));
const base64Json = urlParams.get('json');
const jsonData = base64Json ? JSON.parse(Base64.decode(base64Json)) : {};

const JsonViewer: React.FC = React.memo(() => {
  return (
    <div className="JsonViewerContainer">
      <JsonView
        data={jsonData}
        style={style}
        shouldInitiallyExpand={(level) => level <= 1}
      />
    </div>
  );
});

export default JsonViewer;
