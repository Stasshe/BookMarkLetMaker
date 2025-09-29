// Highlight Text Example
const searchTerm = prompt('Enter text to highlight:');
if (searchTerm) {
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);

  let node;
  while ((node = walker.nextNode())) {
    if (node.textContent.toLowerCase().includes(searchTerm.toLowerCase())) {
      const parent = node.parentNode;
      const highlighted = document.createElement('mark');
      highlighted.style.backgroundColor = 'yellow';
      highlighted.textContent = node.textContent;
      parent.replaceChild(highlighted, node);
    }
  }
}
