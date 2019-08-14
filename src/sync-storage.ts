import * as t from 'io-ts';

export const DocumentTransformerSetting = t.type({
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

export const SiteSetting = t.type({
  /** Label of this site */
  title: t.string,
  /** URL of the icon  */
  thumbnail: t.union([t.string, t.undefined]),
  /** Activeate when matched to this pattern */
  urlMatchPattern: t.string,
  /** Per-site transformer setting */
  documentTransformerSetting: DocumentTransformerSetting,
});

export const Preferences = t.type({
  /** State of the extension */
  state: t.union([t.literal('enabled'), t.literal('disabled')]),
  /** Per-site setting */
  siteSettings: t.array(SiteSetting),
});

export const SyncStorage = t.type({
  preferences: Preferences,
});
