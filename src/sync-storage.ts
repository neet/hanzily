import * as t from 'io-ts';

export const DocumentTransformerSetting = t.type({
  /** Whether transform the web content */
  transformContent: t.boolean,
  /** Whether transform the user's input */
  transformInput: t.boolean,
  /** Query selectors for ignoring from transformation */
  ignoreNodePatterns: t.array(t.string),
  /**
   * Query selectors for ingoring from transformation when `transformInput` is false
   * Used for handling of [Draft.js](https://draftjs.org)
   */
  ignorePseudoTextareaNodePatterns: t.array(t.string),
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
  /** Blacklisted websites. written in URL match pattern */
  blacklist: t.array(t.string),
  /** Whitelisted websites */
  whitelist: t.array(t.string),
  /** String that represents either black or whitelist is enabled */
  activeListType: t.union([t.literal('blacklist'), t.literal('whitelist')]),
});

export const SyncStorage = t.type({
  preferences: Preferences,
});
