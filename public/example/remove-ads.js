// Remove Ads Example
const selectors = [
  '[class*="ad"]',
  '[id*="ad"]',
  '[class*="banner"]',
  '[class*="popup"]',
  '.advertisement',
];

selectors.forEach(selector => {
  document.querySelectorAll(selector).forEach(el => {
    el.style.display = 'none';
  });
});

console.log('Ad elements hidden');
