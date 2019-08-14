import React from 'react';
import ReactDOM from 'react-dom';
import { isLeft } from 'fp-ts/lib/Either';
import { browser } from 'webextension-polyfill-ts';
import { SyncStorage } from '../sync-storage';
import { Config } from './components/config';

(async () => {
  const mountNode = document.getElementById('root');
  if (!mountNode) return;

  const storage = SyncStorage.decode(await browser.storage.sync.get());

  if (isLeft(storage)) {
    return;
  }

  ReactDOM.render(<Config storage={storage.right} />, mountNode);
})();
