import { browser } from 'webextension-polyfill-ts';
import { isLeft } from 'fp-ts/lib/Either';
import * as t from 'io-ts';
import { Kyujitai } from '@neetshin/kyujitai';
import { dataset } from '@neetshin/kyujitai/dist/main/dataset';
import { SyncStorage, DocumentTransformerSetting } from '../sync-storage';

class ContentScript {
  private readonly kyujitai: Kyujitai;
  private readonly kyujifiedNodes = new WeakSet<Node>();

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
      // Kyujify body
      contentScript.retriveTerminals(document).forEach(elm => {
        return contentScript.kyujifyNode(elm);
      });
    }

    // Observe DOM updates
    contentScript.observeDomUpdates(
      document,
      globalConfig.documentTransformerSetting,
    );
  };

  kyujifyNode = async (node: Node, force = false) => {
    // Return if node has alredy been kyujified
    if (!force && this.kyujifiedNodes.has(node)) return;

    const originalText = node.textContent;
    if (!originalText || !originalText.trim()) return;

    const kyujifiedText = await this.kyujitai.kyujitaize(originalText);
    if (originalText === kyujifiedText) return;

    const newNode = // do this with closest element instead
      node instanceof Element
        ? (node.cloneNode() as Element)
        : document.createElement('span');

    newNode.setAttribute('title', originalText);
    newNode.setAttribute('data-shinji', originalText);
    newNode.textContent = kyujifiedText;

    if (!node.parentNode) {
      throw Error("Root element can't be kyujified");
    }

    node.parentNode.replaceChild(newNode, node);
    this.kyujifiedNodes.add(newNode);

    return { node, newNode };
  };

  retriveTerminals = (
    node: Node,
    banTagName: string[] = ['SCRIPT', 'STYLE', 'INPUT', 'TEXTAREA'],
  ): Node[] => {
    if (!node.childNodes.length) return [node];

    return Array.from(node.childNodes)
      .filter(childNode =>
        childNode instanceof Element
          ? !banTagName.includes(childNode.tagName)
          : true,
      )
      .flatMap(childNode => this.retriveTerminals(childNode, banTagName));
  };

  handleNodeAdded = (addedNodes: NodeList) => {
    for (const node of Array.from(addedNodes)) {
      for (const terminal of this.retriveTerminals(node)) {
        console.log(terminal);
        // this.kyujifyNode(terminal);
      }
    }
  };

  handleCharacterDataMutated = (target: Node) => {
    this.kyujifyNode(target, true);
  };

  observeDomUpdates = (
    element: Node,
    storage: t.TypeOf<typeof DocumentTransformerSetting>,
  ) => {
    // Add mutation observer to the body and subscribe for updates of children
    new MutationObserver(records => {
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
