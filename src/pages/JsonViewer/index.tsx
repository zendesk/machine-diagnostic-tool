import React from 'react';
import { render } from 'react-dom';

import JsonViewer from './JsonViewer';
import './index.css';

render(<JsonViewer />, window.document.querySelector('#app-container'));

if (module.hot) module.hot.accept();
