import * as t from 'io-ts';

export const DocumentTransformerSettingCodec = t.type({
  /** Whether transform the web content */
  transformContent: t.boolean,
  /** Whether transform the user's input */
  transformInput: t.boolean,
  /** Query selectors for ignoring from transformation */
  ignoreNodePatterns: t.array(t.string),
  /**
   * Strings which should be pre-transfromed (e.g. 関数 -> 函數)
   * Radical 160's 辨, 瓣 and 辯 will also be handled by this feature.
   */
  contextualTransformations: t.array(
    t.type({
      from: t.string,
      to: t.string,
    }),
  ),
});

export const SiteSettingCodec = t.type({
  /** Label of this site */
  title: t.string,
  /** URL of the icon  */
  thumbnail: t.union([t.string, t.undefined]),
  /** Activeate when matched to this pattern */
  urlMatchPattern: t.string,
  /** Per-site transformer setting */
  documentTransformerSetting: DocumentTransformerSettingCodec,
});

export const PreferencesCodec = t.type({
  /** State of the extension */
  state: t.union([t.literal('enabled'), t.literal('disabled')]),
  /** Per-site setting */
  siteSettings: t.array(SiteSettingCodec),
});

export const SyncStorageCodec = t.type({
  preferences: PreferencesCodec,
});

// prettier-ignore
export type DocumentTransformerSetting = t.TypeOf<typeof DocumentTransformerSettingCodec>;
export type SiteSetting = t.TypeOf<typeof SiteSettingCodec>;
export type Preferences = t.TypeOf<typeof PreferencesCodec>;
export type SyncStorage = t.TypeOf<typeof SyncStorageCodec>;

export const getActiveDocumentTransformerSetting = (preferences: Preferences) =>
  preferences.siteSettings
    .filter(setting => {
      return new RegExp(setting.urlMatchPattern).test(location.href);
    })
    .reduce<DocumentTransformerSetting>(
      (prev, cur) => {
        return { prev, ...cur.documentTransformerSetting };
      },
      {
        transformContent: true,
        transformInput: false,
        ignoreNodePatterns: [],
        contextualTransformations: [],
      },
    );
