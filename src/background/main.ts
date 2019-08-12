import { browser } from 'webextension-polyfill-ts';
import { SyncStorage } from '../sync-storage';

const populateSyncStorage = () => {
  const initialStorage = SyncStorage.encode({
    preferences: {
      state: 'enabled',
      siteSettings: [
        {
          urlMatchPattern: '<all_sites>',
          documentTransformerSetting: {
            transformContent: true,
            transformInput: false,
            ignoreNodePatterns: ['script', 'style', 'textarea', 'input'],
            ignorePseudoTextareaNodePatterns: ['.DraftEditor-root'],
            contextualTransformations: [],
          },
        },
      ],
      blacklist: [],
      whitelist: [],
      activeListType: 'blacklist',
    },
  });

  browser.storage.sync.set(initialStorage);
};

browser.runtime.onInstalled.addListener(e => {
  if (e.reason === 'install') {
    populateSyncStorage();
  }
});
