import { browser } from 'webextension-polyfill-ts';
import { SyncStorage } from '../sync-storage';
import resources from './resources.json';

const kyujify = async (text: string) =>
  Array.from(text)
    .map(character => {
      const match = resources.find(({ Shinji }) => Shinji === character);
      return match ? match.Kyuji : character;
    })
    .join('');

async function kyujifyNode(node: Node) {
  const originalText = node.textContent;
  if (!originalText) return;

  const kyujifiedText = await kyujify(originalText);

  // Avoid unnecessary replacements
  if (originalText === kyujifiedText) return;

  // Create kyujified element and replace with it
  const elm =
    node instanceof Element
      ? (node.cloneNode() as Element)
      : document.createElement('span');

  elm.setAttribute('title', originalText);
  elm.setAttribute('aria-label', originalText);
  elm.textContent = kyujifiedText;

  if (node.parentElement) {
    node.parentElement.replaceChild(elm, node);
  }

  return { node, elm };
}

function retriveTerminals(node: Node): Node[] {
  if (!node.childNodes.length) return [node];

  return Array.from(node.childNodes).flatMap(childNode => {
    return retriveTerminals(childNode);
  });
}

function observeUserInputs(element: Element) {
  element.addEventListener('input', async event => {
    // Cancel when composing
    if ((event as any).isComposing || (event as any).which === 229) return;

    if (
      event.target instanceof HTMLTextAreaElement ||
      event.target instanceof HTMLInputElement
    ) {
      const kyujified = await kyujify(event.target.value);
      // eslint-disable-next-line require-atomic-updates
      event.target.value = kyujified;
    }
  });
}

function observeDomUpdates(element: Node, storage: SyncStorage) {
  // Add mutation observer to the body
  // and subscribe for updates of children
  new MutationObserver(async records => {
    for (const { target, addedNodes } of records) {
      if (storage.transform_content) {
        retriveTerminals(target).forEach(kyujifyNode);
      }

      if (storage.transform_input) {
        for (const addedNode of Array.from(addedNodes)) {
          if (!(addedNode instanceof Element)) return;

          addedNode
            .querySelectorAll('textarea, input')
            .forEach(observeUserInputs);
        }
      }
    }
  }).observe(element, {
    characterData: true,
    childList: true,
    subtree: true,
  });
}

async function main() {
  const storage = (await browser.storage.sync.get()) as SyncStorage;

  if (storage.transform_input) {
    // Observe textarea / input changes
    document.querySelectorAll('textarea, input').forEach(observeUserInputs);
  }

  if (storage.transform_content) {
    // Kyujify body
    retriveTerminals(document).forEach(kyujifyNode);
  }

  // Observe DOM updates
  observeDomUpdates(document, storage);
}

main();
