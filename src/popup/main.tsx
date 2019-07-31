import React from 'react';
import ReactDOM from 'react-dom';
import { browser } from 'webextension-polyfill-ts';
import { SyncStorage } from '../sync-storage';
import { Config } from './components/config';
import console = require('console');

(async () => {
  const mountNode = document.getElementById('root');
  if (!mountNode) return;
  const syncStorage = (await browser.storage.sync.get()) as SyncStorage;

  console.log(syncStorage);
  ReactDOM.render(<Config syncStorage={syncStorage} />, mountNode);
})();
