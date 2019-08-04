import { browser } from 'webextension-polyfill-ts';
import { SyncStorage } from '../sync-storage';
import { kyujify } from './util';

const kyujifiedNodeStore = new WeakSet<Node>();

async function kyujifyNode(node: Node, force = false) {
  // Return if node has alredy been kyujified
  if (!force && kyujifiedNodeStore.has(node)) return;

  const originalText = node.textContent;
  if (!originalText || !originalText.trim()) return;

  const kyujifiedText = await kyujify(originalText);
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
  kyujifiedNodeStore.add(newNode);

  return { node, newNode };
}

function retriveTerminals(
  node: Node,
  banTagName: string[] = ['SCRIPT', 'STYLE', 'INPUT', 'TEXTAREA'],
): Node[] {
  if (!node.childNodes.length) return [node];

  return Array.from(node.childNodes)
    .filter(childNode =>
      childNode instanceof Element
        ? !banTagName.includes(childNode.tagName)
        : true,
    )
    .flatMap(childNode => retriveTerminals(childNode, banTagName));
}

// function observeUserInputs(element: Element) {
//   element.addEventListener('input', async event => {
//     // Cancel when composing
//     if ((event as any).isComposing || (event as any).which === 229) return;

//     if (
//       event.target instanceof HTMLTextAreaElement ||
//       event.target instanceof HTMLInputElement
//     ) {
//       const kyujified = await kyujify(event.target.value);
//       // eslint-disable-next-line require-atomic-updates
//       event.target.value = kyujified;
//     }
//   });
// }

const handleNodeAdded = (addedNodes: NodeList) => {
  for (const node of Array.from(addedNodes)) {
    for (const terminal of retriveTerminals(node)) {
      kyujifyNode(terminal);
    }
  }
};

const handleCharacterDataMutated = (target: Node) => {
  kyujifyNode(target, true);
};

function observeDomUpdates(element: Node, storage: SyncStorage) {
  // Add mutation observer to the body and subscribe for updates of children
  new MutationObserver(records => {
    for (const { target, addedNodes, oldValue } of records) {
      if (storage.transform_content) {
        if (addedNodes) handleNodeAdded(addedNodes);
        if (oldValue) handleCharacterDataMutated(target);
      }
    }
  }).observe(element, {
    characterData: true,
    characterDataOldValue: true,
    childList: true,
    subtree: true,
  });
}

async function main() {
  const storage = (await browser.storage.sync.get()) as SyncStorage;

  // if (storage.transform_input) {
  //   // Observe textarea / input changes
  //   document.querySelectorAll('textarea, input').forEach(observeUserInputs);
  // }

  if (storage.transform_content) {
    // Kyujify body
    retriveTerminals(document).forEach(elm => {
      return kyujifyNode(elm);
    });
  }

  // Observe DOM updates
  observeDomUpdates(document, storage);
}

main();
