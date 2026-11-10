// e-typing auto type — dán vào DevTools Console (F12) khi đang ở trang luyện gõ.
// Dừng: gõ  etStop()  trong console.
(() => {
  const DELAY = 50; // ms giữa các phím

  // ---------- Bảng kana -> romaji ----------
  const R = {
    あ:'a',い:'i',う:'u',え:'e',お:'o',
    か:'ka',き:'ki',く:'ku',け:'ke',こ:'ko',
    さ:'sa',し:'si',す:'su',せ:'se',そ:'so',
    た:'ta',ち:'ti',つ:'tu',て:'te',と:'to',
    な:'na',に:'ni',ぬ:'nu',ね:'ne',の:'no',
    は:'ha',ひ:'hi',ふ:'hu',へ:'he',ほ:'ho',
    ま:'ma',み:'mi',む:'mu',め:'me',も:'mo',
    や:'ya',ゆ:'yu',よ:'yo',
    ら:'ra',り:'ri',る:'ru',れ:'re',ろ:'ro',
    わ:'wa',を:'wo',ん:'nn',
    が:'ga',ぎ:'gi',ぐ:'gu',げ:'ge',ご:'go',
    ざ:'za',じ:'zi',ず:'zu',ぜ:'ze',ぞ:'zo',
    だ:'da',ぢ:'di',づ:'du',で:'de',ど:'do',
    ば:'ba',び:'bi',ぶ:'bu',べ:'be',ぼ:'bo',
    ぱ:'pa',ぴ:'pi',ぷ:'pu',ぺ:'pe',ぽ:'po',
    ゔ:'vu',
    ぁ:'xa',ぃ:'xi',ぅ:'xu',ぇ:'xe',ぉ:'xo',
    ゃ:'xya',ゅ:'xyu',ょ:'xyo',っ:'xtu',ゎ:'xwa',
    'ー':'-','、':',','。':'.','！':'!','？':'?','　':' ',
    '，':',','．':'.','「':'[','」':']','・':'/',
  };
  // Âm ghép (kya, sha, ...)
  const R2 = {
    きゃ:'kya',きゅ:'kyu',きょ:'kyo',しゃ:'sya',しゅ:'syu',しょ:'syo',
    ちゃ:'tya',ちゅ:'tyu',ちょ:'tyo',にゃ:'nya',にゅ:'nyu',にょ:'nyo',
    ひゃ:'hya',ひゅ:'hyu',ひょ:'hyo',みゃ:'mya',みゅ:'myu',みょ:'myo',
    りゃ:'rya',りゅ:'ryu',りょ:'ryo',ぎゃ:'gya',ぎゅ:'gyu',ぎょ:'gyo',
    じゃ:'zya',じゅ:'zyu',じょ:'zyo',ぢゃ:'dya',ぢゅ:'dyu',ぢょ:'dyo',
    びゃ:'bya',びゅ:'byu',びょ:'byo',ぴゃ:'pya',ぴゅ:'pyu',ぴょ:'pyo',
    しぇ:'sye',ちぇ:'tye',じぇ:'zye',てぃ:'thi',でぃ:'dhi',でゅ:'dhu',
    ふぁ:'fa',ふぃ:'fi',ふぇ:'fe',ふぉ:'fo',うぃ:'wi',うぇ:'we',
    ゔぁ:'va',ゔぃ:'vi',ゔぇ:'ve',ゔぉ:'vo',とぅ:'twu',どぅ:'dwu',
  };
  const toHira = s => s.replace(/[ァ-ヶ]/g, c => String.fromCharCode(c.charCodeAt(0) - 0x60));

  // Đơn vị kana đầu tiên -> [romaji, số ký tự kana đã dùng]
  function unit(s) {
    if (!s) return ['', 0];
    if (s[0] === 'っ' && s.length > 1) {
      const [r, n] = unit(s.slice(1));
      if (/^[bcdfghjkmpqrstvwxyz]/.test(r)) return [r[0] + r, n + 1];
      return ['xtu', 1];
    }
    if (R2[s.slice(0, 2)]) return [R2[s.slice(0, 2)], 2];
    if (R[s[0]] !== undefined) return [R[s[0]], 1];
    return [s[0].toLowerCase(), 1]; // chữ/số ASCII giữ nguyên
  }
  // Cả câu kana -> romaji
  function toRoma(kana) {
    let s = toHira(kana), out = '';
    while (s) { const [r, n] = unit(s); out += r; s = s.slice(n); }
    return out;
  }

  // ---------- Tìm DOM ----------
  function getDoc() {
    const has = d => d.querySelector('#kanaText, #sentenceText');
    if (has(document)) return document;
    for (const f of document.querySelectorAll('iframe')) {
      try { const d = f.contentDocument; if (d && has(d)) return d; } catch (e) {}
    }
    return null;
  }

  // Phần chưa gõ = các span không có class "entered"
  function restOf(el) {
    if (!el) return null;
    const spans = [...el.querySelectorAll('span')];
    if (!spans.length) return el.textContent;
    return spans.filter(s => !s.classList.contains('entered')).map(s => s.textContent).join('');
  }

  // ---------- Gửi phím ----------
  function keyInfo(ch) {
    if (ch === ' ') return { code: 'Space', keyCode: 32 };
    const map = { '-': [189,'Minus'], ',': [188,'Comma'], '.': [190,'Period'], '/': [191,'Slash'],
                  '?': [191,'Slash'], '!': [49,'Digit1'], "'": [222,'Quote'], '[': [219,'BracketLeft'], ']': [221,'BracketRight'] };
    if (map[ch]) return { keyCode: map[ch][0], code: map[ch][1] };
    const up = ch.toUpperCase();
    return { keyCode: up.charCodeAt(0), code: /[A-Z]/.test(up) ? 'Key' + up : /[0-9]/.test(ch) ? 'Digit' + ch : '' };
  }
  function fire(doc, type, ch) {
    const { code, keyCode } = keyInfo(ch);
    const kc = type === 'keypress' ? ch.charCodeAt(0) : keyCode;
    const ev = new doc.defaultView.KeyboardEvent(type, { key: ch, code, bubbles: true, cancelable: true });
    Object.defineProperty(ev, 'keyCode', { get: () => kc });
    Object.defineProperty(ev, 'which', { get: () => kc });
    Object.defineProperty(ev, 'charCode', { get: () => (type === 'keypress' ? kc : 0) });
    (doc.activeElement || doc.body).dispatchEvent(ev);
  }
  const press = (doc, ch) => ['keydown', 'keypress', 'keyup'].forEach(t => fire(doc, t, ch));
  const sleep = ms => new Promise(r => setTimeout(r, ms));

  // ---------- Vòng lặp ----------
  const SENTENCE_PAUSE = 300; // ms nghỉ khi sang câu mới
  const MAX_WAIT = 1500;      // ms tối đa chờ app nhận phím
  const DEBUG = false;

  let running = true;
  window.etStop = () => { running = false; console.log('[e-typing] stopped'); };

  const part = (el, entered) => {
    if (!el) return '';
    return [...el.querySelectorAll('span')]
      .filter(s => s.classList.contains('entered') === entered)
      .map(s => s.textContent).join('');
  };

  let lastKana = '', roma = '';

  (async function loop() {
    console.log('[e-typing] auto type started. etStop() để dừng.');
    while (running) {
      const doc = getDoc();
      if (!doc) { await sleep(300); continue; }

      const kanaEl = doc.querySelector('#kanaText');
      const sentEl = doc.querySelector('#sentenceText');
      const kanaFull = kanaEl ? kanaEl.textContent : '';

      // Câu mới: tự tính romaji cả câu từ kana
      if (kanaFull && kanaFull !== lastKana) {
        lastKana = kanaFull;
        roma = toRoma(kanaFull);
        if (DEBUG) console.log('[e-typing] new sentence:', kanaFull, '->', roma);
        await sleep(SENTENCE_PAUSE);
        continue;
      }

      const typed = part(sentEl, true);   // romaji đã gõ (app hiển thị)
      const shown = part(sentEl, false);  // romaji còn lại (đầu câu app để trống)
      // Ưu tiên romaji app hiển thị; nếu chưa hiện thì dùng romaji tự tính
      const next = shown ? shown[0] : (kanaFull ? roma[typed.length] : '');

      if (next) {
        if (DEBUG) console.log('[e-typing] typed=', typed, 'next=', next);
        press(doc, next.toLowerCase());
        // Chờ app ghi nhận phím (entered dài thêm) rồi mới gõ tiếp
        const t0 = Date.now();
        while (running && part(sentEl, true) === typed && sentEl.isConnected && Date.now() - t0 < MAX_WAIT) await sleep(5);
        await sleep(DELAY);
      } else {
        // không có chữ: có thể đang ở màn hình bắt đầu -> nhấn Space
        const start = doc.querySelector('#start_msg, #start_view');
        if (start && start.offsetParent !== null) press(doc, ' ');
        await sleep(300);
      }
    }
  })();
})();
