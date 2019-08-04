import resources from './resources.json';

const getIndexOfText = (text: Text) => {
  if (!text.parentElement) throw Error('Invalid DOM');
  return Array.from(text.parentElement.childNodes).findIndex(
    node => node === text,
  );
};

export const getUniqueNodeId = (node: Node, childId = ''): string => {
  const selfId =
    node instanceof Text
      ? `${node.textContent}-${getIndexOfText(node)}`
      : node.nodeName;
  const descendantId = selfId + (childId ? ` > ${childId}` : '');

  if (!node.parentElement) {
    return descendantId;
  }

  return getUniqueNodeId(node.parentElement, descendantId);
};

export const kyujify = async (text: string) =>
  Array.from(text)
    .map(character => {
      const match = resources[character as keyof typeof resources];
      return match ? match.kyuji : character;
    })
    .join('');
