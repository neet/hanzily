import { browser } from 'webextension-polyfill-ts';
import { isLeft } from 'fp-ts/lib/Either';
import { Kyujitai } from '@neetshin/kyujitai';
import { dataset } from '@neetshin/kyujitai/dataset';
import {
  SyncStorageCodec,
  DocumentTransformerSetting,
  getActiveDocumentTransformerSetting,
} from '../sync-storage';

const editableQueries = [
  'textarea',
  'input[type="text"]',
  '*[contenteditable="true"]',
];

const unkyujitaizableQueries = [
  'script',
  'style',
  'meta',
  'link',
  'svg',
  'path',
  ...editableQueries,
];

class ContentScript {
  /** Instance of Kuyjitai.js */
  private readonly kyujitai: Kyujitai;
  /** Cache layer for nodes which has alredy been kujitaized */
  private readonly kyujitaizedNodes = new WeakSet<Node>();
  /** Active document transfromer setting */
  private readonly documentTransformerSetting: DocumentTransformerSetting;

  /**
   * Private constructor
   * @param kyujitai instance of Kyujitai.js
   * @param activeSetting Active document transformer setting
   */
  private constructor(
    kyujitai: Kyujitai,
    activeSetting: DocumentTransformerSetting,
  ) {
    this.kyujitai = kyujitai;
    this.documentTransformerSetting = activeSetting;
  }

  /**
   * Public constructor
   * @returns Instance of content script
   */
  static init = async () => {
    const rawdata = await browser.storage.sync.get();
    const storage = SyncStorageCodec.decode(rawdata);

    if (isLeft(storage)) return;
    const { preferences } = storage.right;

    const kyujitai = await Kyujitai.init({ dataset });
    const activeSetting = getActiveDocumentTransformerSetting(preferences);
    const contentScript = new ContentScript(kyujitai, activeSetting);

    // Transform Content
    if (contentScript.documentTransformerSetting.transformContent) {
      for (const node of contentScript.retriveTerminals(document.body)) {
        contentScript.kyujitaizeNode(node);
      }
    }

    // Observe editable elements
    // if (contentScript.documentTransformerSetting.transformInput) {
    for (const element of contentScript.retriveEditables(document.body)) {
      await contentScript.observeInputs(element);
    }
    // }

    // Observe updates of body
    contentScript.observeNodeUpdates(document.body);

    // eslint-disable-next-line no-console
    console.log('Hanzily: initialization completed');
    return contentScript;
  };

  /**
   * Kyujitaize given Node
   * @param node Node
   * @param force Whether force update
   * @return Nothing
   */
  private kyujitaizeNode = async (
    node: Node,
    force = false,
    appendWrapper = true,
  ) => {
    // Cache processing
    if (this.kyujitaizedNodes.has(node) && !force) return;

    const originalText = node.textContent;
    if (!originalText || !originalText.trim()) return;

    const kyujitaizedText = await this.kyujitai.kyujitaize(originalText);
    if (originalText === kyujitaizedText) return;

    // Replace
    if (appendWrapper) {
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
    } else {
      // eslint-disable-next-line require-atomic-updates
      node.textContent = kyujitaizedText;
    }
  };

  /**
   * Kyujitaize value of given element
   * @param element Element to update
   * @return Nothing
   */
  private kyujitaizeValue = async (element: Element) => {
    if (
      element instanceof HTMLTextAreaElement ||
      element instanceof HTMLInputElement
    ) {
      const kyujified = await this.kyujitai.kyujitaize(element.value);
      // eslint-disable-next-line require-atomic-updates
      element.value = kyujified;
    }

    if (element.getAttribute('contenteditable') === 'true') {
      await this.kyujitaizeNode(element, true, false);
    }
  };

  /**
   * Helper function that retrives all terminals of the parent node
   * @param node Parent node
   * @return Terminals
   */
  private retriveTerminals = (node: Node): Node[] => {
    if (!node.childNodes.length) return [node];

    return Array.from(node.childNodes)
      .filter(node => {
        if (
          node instanceof Element &&
          unkyujitaizableQueries.some(query => node.matches(query))
        ) {
          return false;
        }

        return true;
      })
      .flatMap(node => this.retriveTerminals(node));
  };

  /**
   * Helper function that retrives all editable element from given node
   * @param element Parent node
   * @return Editable elements
   */
  private retriveEditables = (element: Element): Element[] => {
    return editableQueries
      .map(query => Array.from(element.querySelectorAll(query)))
      .flat();
  };

  /**
   * Add mutation observer to the given node and subscribe
   * for updates of its children
   * @param node Node
   * @return MutationObserver
   */
  private observeNodeUpdates = (node: Node) => {
    const mo = new MutationObserver(async records => {
      for (const { target, addedNodes, oldValue } of records) {
        if (oldValue) {
          this.kyujitaizeNode(target, true);
        }

        if (addedNodes) {
          this.handleNewNodes(addedNodes);
        }
      }
    });

    mo.observe(node, {
      characterData: true,
      characterDataOldValue: true,
      childList: true,
      subtree: true,
    });

    return mo;
  };

  /**
   * Observe inputs of given elements
   * @param element Element to observe
   * @return nothing
   */
  private observeInputs = async (element: Element) => {
    // eslint-disable-next-line
    console.log('element', element);

    element.addEventListener('compositionend', async e => {
      if (!(e.currentTarget instanceof Element)) return;
      return await this.kyujitaizeValue(e.currentTarget);
    });
  };

  /**
   * Handle newly added nodes
   * @param addedNodes addedNodes
   * @return Nothing
   */
  private handleNewNodes = (addedNodes: NodeList) => {
    for (const node of Array.from(addedNodes)) {
      // Observe input events of added node
      if (node instanceof Element) {
        for (const editable of this.retriveEditables(node)) {
          this.observeInputs(editable);
        }
      }

      // Kyujitaize added node
      for (const terminal of this.retriveTerminals(node)) {
        this.kyujitaizeNode(terminal);
      }
    }
  };
}

// main
ContentScript.init();
