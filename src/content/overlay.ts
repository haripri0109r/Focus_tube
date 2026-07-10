import seedData from '../data/keyword-seeds.json';
import { SessionRecord } from '../types';

export async function mountOverlay(tabId: number) {
  if (document.getElementById('focustube-overlay')) return;
  
  // Lock scroll on html and body to keep overlay centered and prevent scrolling
  document.documentElement.style.setProperty('overflow', 'hidden', 'important');
  document.body.style.setProperty('overflow', 'hidden', 'important');
  
  // Force scroll to top so the overlay content is centered in the visible viewport
  window.scrollTo(0, 0);

  const container = document.createElement('div');
  container.id = 'focustube-overlay';
  container.style.cssText = `
    position: absolute;
    top: 0; left: 0; right: 0; bottom: 0;
    min-height: 100vh;
    background: #0f0f0f;
    z-index: 2000;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    color: white;
    font-family: Roboto, Arial, sans-serif;
  `;

  // Draw early so we don't flash empty content, then hydrate with history
  hydrateOverlay(container, tabId);

  const pageManager = document.querySelector('ytd-page-manager');
  if (pageManager) {
    pageManager.appendChild(container);
  } else {
    document.body.appendChild(container);
  }
}

async function hydrateOverlay(container: HTMLElement, tabId: number) {
  const storage = await chrome.storage.local.get('focustube_history');
  const history = (storage.focustube_history || []) as SessionRecord[];
  
  const counts: Record<string, number> = {};
  history.forEach(r => counts[r.topic] = (counts[r.topic] || 0) + 1);
  const topTopics = Object.keys(counts).sort((a, b) => counts[b] - counts[a]).slice(0, 3);
  
  if (topTopics.length < 3) {
    const seeds = Object.keys(seedData);
    seeds.forEach(s => {
      if (!topTopics.includes(s) && topTopics.length < 3) topTopics.push(s);
    });
  }

  const topTopicsHtml = topTopics.map(t => 
    `<button class="ft-suggestion" style="background:#272727; border:none; border-radius:16px; padding:8px 16px; color:#fff; cursor:pointer; margin:4px; font-size:14px; transition: background 0.2s;">${t}</button>`
  ).join('');

  container.innerHTML = `
    <h1 style="font-size: 32px; font-weight: bold; margin-bottom: 24px;">What do you want to learn today?</h1>
    <div style="display:flex; flex-direction:column; align-items:center; width: 100%; max-width: 500px;">
      <input type="text" id="ft-topic-input" placeholder="e.g. React, Algebra, Classical Music" 
        style="width: 100%; padding: 16px; border-radius: 8px; border: 1px solid #333; background: #121212; color: #fff; font-size: 18px; margin-bottom: 16px; outline: none; text-align: center; box-shadow: inset 0 2px 4px rgba(0,0,0,0.5);" 
        autocomplete="off" />
      <button id="ft-start-btn" style="background: #3ea6ff; color: #0f0f0f; font-weight: bold; font-size: 16px; padding: 12px 32px; border: none; border-radius: 20px; cursor: pointer; transition: opacity 0.2s;">
        Start Focus Session
      </button>
    </div>
    <div style="margin-top: 32px; text-align: center;">
      <p style="color: #aaa; font-size: 14px; margin-bottom: 12px;">Quick Start</p>
      <div style="display:flex; justify-content:center; flex-wrap:wrap;">
        ${topTopicsHtml}
      </div>
    </div>
  `;

  container.querySelectorAll('.ft-suggestion').forEach(btn => {
    btn.addEventListener('mouseover', () => (btn as HTMLElement).style.background = '#3f3f3f');
    btn.addEventListener('mouseout', () => (btn as HTMLElement).style.background = '#272727');
    btn.addEventListener('click', () => {
      const input = container.querySelector('#ft-topic-input') as HTMLInputElement;
      input.value = btn.textContent!.trim();
      startSession(input.value);
    });
  });
  
  const startBtn = container.querySelector('#ft-start-btn') as HTMLElement;
  startBtn.addEventListener('mouseover', () => startBtn.style.opacity = '0.9');
  startBtn.addEventListener('mouseout', () => startBtn.style.opacity = '1');
  
  const input = container.querySelector('#ft-topic-input') as HTMLInputElement;
  startBtn.addEventListener('click', () => startSession(input.value));
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') startSession(input.value);
  });
  
  setTimeout(() => input.focus(), 100);

  function startSession(val: string) {
    if (!val.trim()) return;
    chrome.runtime.sendMessage({
      type: 'SESSION_START',
      tabId,
      topic: val.trim(),
      keywords: [] 
    });
  }
}

export function unmountOverlay() {
  const el = document.getElementById('focustube-overlay');
  if (el) el.remove();
  document.documentElement.style.removeProperty('overflow');
  document.body.style.removeProperty('overflow');
}
