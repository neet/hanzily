import { isLeft } from 'fp-ts/lib/Either';
import { browser } from 'webextension-polyfill-ts';
import { SyncStorage } from '../sync-storage';

const populateSyncStorage = () => {
  const initialStorage = SyncStorage.encode({
    preferences: {
      state: 'enabled',
      siteSettings: [
        {
          title: '全てのWebサイト',
          thumbnail: undefined,
          urlMatchPattern: '*',
          documentTransformerSetting: {
            transformContent: true,
            transformInput: false,
            ignoreNodePatterns: [],
            contextualTransformations: [],
          },
        },
      ],
    },
  });

  browser.storage.sync.set(initialStorage);
};

(async () => {
  const storage = SyncStorage.decode(await browser.storage.sync.get());

  if (isLeft(storage)) {
    populateSyncStorage();
  }
})();

browser.runtime.onInstalled.addListener(e => {
  if (e.reason === 'install') {
    populateSyncStorage();
  }
});
