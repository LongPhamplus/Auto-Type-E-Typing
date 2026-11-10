// Chẩn đoán: chạy TRƯỚC script auto type, rồi chạy auto type, gõ ~2 câu, sau đó gõ etDump() trong console.
(() => {
  const findDoc = () => {
    if (document.querySelector('#kanaText')) return document;
    for (const f of document.querySelectorAll('iframe')) {
      try { const d = f.contentDocument; if (d && d.querySelector('#kanaText')) return d; } catch (e) {}
    }
  };
  const doc = findDoc();
  if (!doc) return console.error('Không tìm thấy #kanaText — hãy chạy khi đã vào màn hình gõ (sau khi nhấn Space).');

  const t0 = performance.now();
  const log = [];
  const ts = () => (performance.now() - t0).toFixed(0).padStart(6);
  const box = doc.querySelector('#kanaText').closest('[id]').parentElement || doc.body;

  // Ghi lại mọi thay đổi chữ trong vùng gõ
  new doc.defaultView.MutationObserver(() => {
    const snap = [...box.querySelectorAll('[id]')]
      .filter(e => e.querySelector('span'))
      .map(e => `#${e.id}=[${[...e.querySelectorAll('span')].map(s => (s.className ? s.className + ':' : '') + s.textContent).join(' | ')}]`)
      .join('  ');
    log.push(`${ts()} DOM ${snap}`);
  }).observe(box, { subtree: true, childList: true, characterData: true, attributes: true });

  // Ghi lại phím gửi đi
  ['keydown'].forEach(t => doc.addEventListener(t, e => log.push(`${ts()} KEY ${e.key} trusted=${e.isTrusted}`), true));

  window.etDump = () => {
    const out = 'HTML:\n' + box.outerHTML.slice(0, 4000) + '\n\nLOG:\n' + log.slice(0, 400).join('\n');
    console.log(out);
    try { copy(out); console.log('>> Đã copy vào clipboard, dán gửi lại.'); } catch (e) {}
  };
  console.log('[diag] đang ghi. Chạy auto type, đợi 2 câu, rồi gõ etDump()');
})();
