export function applyShortsFilter(topic: string, defaultTopic: string) {
  // If we are on /shorts/ and it's filter-active, we block the shorts player.
  if (document.getElementById('focustube-shorts-blocker')) return;

  // We can just hide the entire ytd-shorts element.
  const shortsEl = document.querySelector('ytd-shorts');
  if (shortsEl) {
    (shortsEl as HTMLElement).style.setProperty('display', 'none', 'important');
  }

  const blocker = document.createElement('div');
  blocker.id = 'focustube-shorts-blocker';
  blocker.style.cssText = `
    position: fixed; top: 0; left: 0; width: 100vw; height: 100vh;
    background: #0f0f0f; display: flex; flex-direction: column;
    align-items: center; justify-content: center; z-index: 999999;
    color: white; font-family: Roboto, Arial, sans-serif;
  `;
  
  const searchTopic = topic || defaultTopic || 'learning';
  const searchUrl = `/results?search_query=${encodeURIComponent(searchTopic)}`;
  
  blocker.innerHTML = `
    <h2 style="font-size: 24px; margin-bottom: 16px;">Shorts are hidden during active sessions</h2>
    <a href="${searchUrl}" style="
      background-color: #3ea6ff; color: #0f0f0f; padding: 10px 20px;
      border-radius: 18px; text-decoration: none; font-weight: bold; font-size: 14px;
    ">Go study: ${searchTopic}</a>
  `;
  
  document.body.appendChild(blocker);
}

export function restoreShorts() {
  const blocker = document.getElementById('focustube-shorts-blocker');
  if (blocker) blocker.remove();
  
  const shortsEl = document.querySelector('ytd-shorts');
  if (shortsEl) {
    (shortsEl as HTMLElement).style.removeProperty('display');
  }
}
