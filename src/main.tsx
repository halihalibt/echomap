import React from 'react';
import {createRoot} from 'react-dom/client';
import App from './App';
import './styles.css';
import {installReadScheduler} from './read-scheduler';
installReadScheduler();
createRoot(document.getElementById('root')!).render(<App/>);
