import { getLang, translate } from './store';

/*
 * Menerjemahkan teks yang sudah dirender, termasuk teks dari komponen server dan portal.
 * Hanya nilai node teks dan beberapa atribut yang diganti, tidak ada elemen yang ditambah atau dipindah,
 * jadi aman berdampingan dengan React. Teks aslinya disimpan supaya bisa dikembalikan.
 */

const SKIP_TAGS = new Set(['SCRIPT', 'STYLE', 'NOSCRIPT', 'TEXTAREA', 'PRE', 'CODE']);
const ATTRS = ['placeholder', 'title', 'aria-label', 'alt'];
const SKIP_SELECTOR = '[data-i18n-skip]';

type Entry = { src: string; out: string };
const textState = new WeakMap<Text, Entry>();
const attrState = new WeakMap<Element, Map<string, Entry>>();
let observer: MutationObserver | null = null;

/** Pertahankan spasi di tepi; spasi di tengah dirapikan hanya untuk pencarian kamus */
function convert(value: string) {
  if (!/[A-Za-z]{2}/.test(value)) return value;
  const m = value.match(/^(\s*)([\s\S]*?)(\s*)$/);
  if (!m) return value;
  const core = m[2].replace(/\s+/g, ' ');
  const out = translate(core);
  return out === core ? value : `${m[1]}${out}${m[3]}`;
}

function skipped(el: Element | null) {
  return !el || SKIP_TAGS.has(el.tagName) || !!el.closest(SKIP_SELECTOR);
}

function applyText(node: Text) {
  if (skipped(node.parentElement)) return;
  const current = node.nodeValue ?? '';
  const known = textState.get(node);
  if (known && current === known.out) return;
  const out = convert(current);
  if (out === current) {
    textState.delete(node);
    return;
  }
  textState.set(node, { src: current, out });
  node.nodeValue = out;
}

function applyAttr(el: Element, name: string) {
  if (el.closest(SKIP_SELECTOR)) return;
  const current = el.getAttribute(name);
  if (!current) return;
  let map = attrState.get(el);
  const known = map?.get(name);
  if (known && current === known.out) return;
  const out = convert(current);
  if (out === current) {
    map?.delete(name);
    return;
  }
  if (!map) {
    map = new Map();
    attrState.set(el, map);
  }
  map.set(name, { src: current, out });
  el.setAttribute(name, out);
}

function applyTree(root: Node) {
  if (root.nodeType === Node.TEXT_NODE) {
    applyText(root as Text);
    return;
  }
  if (root.nodeType !== Node.ELEMENT_NODE) return;
  const el = root as Element;
  if (skipped(el)) return;
  const walker = document.createTreeWalker(el, NodeFilter.SHOW_ELEMENT | NodeFilter.SHOW_TEXT, {
    acceptNode: n => (n.nodeType === Node.ELEMENT_NODE && skipped(n as Element) ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT),
  });
  ATTRS.forEach(a => applyAttr(el, a));
  for (let n = walker.nextNode(); n; n = walker.nextNode()) {
    if (n.nodeType === Node.TEXT_NODE) applyText(n as Text);
    else ATTRS.forEach(a => applyAttr(n as Element, a));
  }
}

function restoreTree(root: Element) {
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_ELEMENT | NodeFilter.SHOW_TEXT);
  for (let n = walker.nextNode(); n; n = walker.nextNode()) {
    if (n.nodeType === Node.TEXT_NODE) {
      const t = n as Text;
      const known = textState.get(t);
      if (known && t.nodeValue === known.out) t.nodeValue = known.src;
      textState.delete(t);
    } else {
      const el = n as Element;
      attrState.get(el)?.forEach((entry, name) => {
        if (el.getAttribute(name) === entry.out) el.setAttribute(name, entry.src);
      });
      attrState.delete(el);
    }
  }
}

function onMutations(records: MutationRecord[]) {
  if (getLang() !== 'id') return;
  for (const r of records) {
    if (r.type === 'characterData') applyText(r.target as Text);
    else if (r.type === 'attributes' && r.attributeName) applyAttr(r.target as Element, r.attributeName);
    else r.addedNodes.forEach(applyTree);
  }
}

/** Dipanggil setiap bahasa berubah */
export function syncDom(lang: 'en' | 'id') {
  observer?.disconnect();
  observer = null;
  if (lang === 'en') {
    restoreTree(document.body);
    return;
  }
  // Judul tab diatur DocumentTitle: hanya nama menunya yang mengikuti bahasa
  applyTree(document.body);
  observer = new MutationObserver(onMutations);
  observer.observe(document.body, { subtree: true, childList: true, characterData: true, attributes: true, attributeFilter: ATTRS });
}
