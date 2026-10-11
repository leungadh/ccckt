export function el(tag: string, props: Record<string, string> = {}, children: Node[] = []) {
  const node = document.createElement(tag);
  for (const [key, value] of Object.entries(props)) {
    if (key === 'class') node.className = value;
    else node.setAttribute(key, value);
  }
  for (const child of children) node.appendChild(child);
  return node;
}

export function text(content: string) {
  return document.createTextNode(content);
}
