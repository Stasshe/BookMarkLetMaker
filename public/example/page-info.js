// Page Info Example
const info = {
  title: document.title,
  url: window.location.href,
  domain: window.location.hostname,
  links: document.querySelectorAll('a').length,
  images: document.querySelectorAll('img').length,
};

alert(JSON.stringify(info, null, 2));
