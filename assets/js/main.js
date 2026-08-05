document.addEventListener('DOMContentLoaded',()=>{
  const favicon=document.createElement('link');
  favicon.rel='icon';
  favicon.type='image/svg+xml';
  favicon.href='assets/images/fav/favicon.svg?v=2';
  document.head.appendChild(favicon);

  initMenu?.();
  initAccordion?.();
  initWeb3Forms?.();
  initReveal?.();
});
