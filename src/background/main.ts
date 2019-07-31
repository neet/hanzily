import { browser } from 'webextension-polyfill-ts';

const populateSyncStorage = () => {
  browser.storage.sync.set({
    transform_content: true,
    transform_input: false,
  });
};

browser.runtime.onInstalled.addListener(e => {
  if (e.reason === 'install') {
    populateSyncStorage();
  }
});
