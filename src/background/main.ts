import { isLeft } from 'fp-ts/lib/Either';
import { browser, Runtime } from 'webextension-polyfill-ts';
import { SyncStorageCodec } from '../sync-storage';

export class Background {
  constructor() {
    browser.runtime.onInstalled.addListener(this.handleInstalled);
  }

  static async init() {
    const storageData = await browser.storage.sync.get();
    const storage = SyncStorageCodec.decode(storageData);

    if (isLeft(storage)) {
      Background.populateSyncStorage();
    }

    return new Background();
  }

  static async populateSyncStorage() {
    const initialStorage = SyncStorageCodec.encode({
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

    return await browser.storage.sync.set(initialStorage);
  }

  async handleInstalled(e: Runtime.OnInstalledDetailsType) {
    if (e.reason === 'install') {
      await Background.populateSyncStorage();
    }
  }
}

Background.init();
