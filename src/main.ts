import resources from "./resources.json";

const kyujify = async (text: string) =>
  Array.from(text)
    .map(character => {
      const match = resources.find(({ Shinji }) => Shinji === character);
      return match ? match.Kyuji : character;
    })
    .join("");

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
      : document.createElement("span");

  elm.setAttribute("title", originalText);
  elm.setAttribute("aria-label", originalText);
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

function observeDomUpdates(element: Node) {
  // Add mutation observer to the body
  // and subscribe for updates of children
  new MutationObserver(records => {
    for (const { target, addedNodes } of records) {
      retriveTerminals(target).forEach(kyujifyNode);

      for (const addedNode of Array.from(addedNodes)) {
        if (addedNode instanceof Element) {
          addedNode.querySelectorAll("textarea, input").forEach(observeUserInputs);
        }
      }
    }
  }).observe(element, {
    characterData: true,
    childList: true,
    subtree: true
  });
}

function observeUserInputs(element: Element) {
  element.addEventListener("input", async event => {
    // Cancel when composing
    if (event.isComposing || event.which === 229) return;
    if (
      (event.currentTarget instanceof HTMLTextAreaElement) ||
      (event.currentTarget instanceof HTMLInputElement)
      ) {
      event.currentTarget.value = await kyujify(event.currentTarget.value);
    }
  });
}

function main() {
  // Kyujify body
  retriveTerminals(document).forEach(kyujifyNode);

  // Observe DOM updates
  observeDomUpdates(document);

  // Observe textarea / input changes
  document.querySelectorAll("textarea, input").forEach(observeUserInputs);
}

main();
