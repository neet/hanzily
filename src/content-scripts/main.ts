import { browser } from 'webextension-polyfill-ts';
import { isLeft } from 'fp-ts/lib/Either';
import * as t from 'io-ts';
import { Kyujitai } from '@neetshin/kyujitai';
import { dataset } from '@neetshin/kyujitai/esm/dataset';
import { SyncStorage, DocumentTransformerSetting } from '../sync-storage';

const defaultBannedTagNames = [
  'SCRIPT',
  'STYLE',
  'INPUT',
  'TEXTAREA',
  'META',
  'LINK',
  'svg',
  'path',
];

class ContentScript {
  private readonly kyujitai: Kyujitai;
  private readonly kyujitaizedNodes = new WeakSet<Node>();

  private constructor(kyujitai: Kyujitai) {
    this.kyujitai = kyujitai;
  }

  static init = async () => {
    const kyujitai = await Kyujitai.init({ dataset });
    const rawdata = await browser.storage.sync.get();
    const storage = SyncStorage.decode(rawdata);
    if (isLeft(storage)) return;

    const contentScript = new ContentScript(kyujitai);

    const globalConfig = storage.right.preferences.siteSettings.find(
      ({ urlMatchPattern }) => urlMatchPattern === '<all_sites>',
    );
    if (!globalConfig) return;

    if (globalConfig.documentTransformerSetting.transformContent) {
      // kyujitaize body
      for (const node of contentScript.retriveTerminals(document.body)) {
        contentScript.kyujitaizeNode(node);
      }
    }

    // Observe DOM updates
    contentScript.observeDomUpdates(
      document.body,
      globalConfig.documentTransformerSetting,
    );

    // eslint-disable-next-line no-console
    console.log('Hanzily: initialization completed');
  };

  kyujitaizeNode = async (node: Node, force = false) => {
    // Return if node has alredy been kyujified
    if (this.kyujitaizedNodes.has(node) && !force) return;

    const originalText = node.textContent;
    if (!originalText || !originalText.trim()) return;

    const kyujitaizedText = await this.kyujitai.kyujitaize(originalText);
    if (originalText === kyujitaizedText) return;

    const kyujitaizedNode = document.createElement('span');
    kyujitaizedNode.setAttribute('title', originalText);
    kyujitaizedNode.setAttribute('aria-label', originalText);
    kyujitaizedNode.setAttribute('data-shinjitai', originalText);
    kyujitaizedNode.textContent = kyujitaizedText;

    if (!node.parentNode) {
      throw Error("Root element can't be kyujified");
    }

    node.parentNode.replaceChild(kyujitaizedNode, node);

    if (!kyujitaizedNode.firstChild) {
      throw Error('Failed to insert kyujitaized node');
    }

    this.kyujitaizedNodes.add(kyujitaizedNode.firstChild);

    return { node, kyujitaizedNode };
  };

  retriveTerminals = (
    node: Node,
    bannedTagNames = defaultBannedTagNames,
  ): Node[] => {
    if (!node.childNodes.length) return [node];

    return Array.from(node.childNodes)
      .filter(childNode => {
        if (
          childNode instanceof Element &&
          bannedTagNames.includes(childNode.tagName)
        ) {
          return false;
        }

        return true;
      })
      .flatMap(childNode => this.retriveTerminals(childNode, bannedTagNames));
  };

  handleNodeAdded = (addedNodes: NodeList) => {
    for (const node of Array.from(addedNodes)) {
      for (const terminal of this.retriveTerminals(node)) {
        this.kyujitaizeNode(terminal);
      }
    }
  };

  handleCharacterDataMutated = (target: Node) => {
    this.kyujitaizeNode(target, true);
  };

  observeDomUpdates = (
    element: Node,
    storage: t.TypeOf<typeof DocumentTransformerSetting>,
  ) => {
    // Add mutation observer to the body and subscribe for updates of children
    new MutationObserver(async records => {
      for (const { target, addedNodes, oldValue } of records) {
        if (storage.transformContent) {
          if (addedNodes) this.handleNodeAdded(addedNodes);
          if (oldValue) this.handleCharacterDataMutated(target);
        }
      }
    }).observe(element, {
      characterData: true,
      characterDataOldValue: true,
      childList: true,
      subtree: true,
    });
  };
}

// main
ContentScript.init();
