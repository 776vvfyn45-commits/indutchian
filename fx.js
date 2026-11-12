/* Indutchian motion layer: smooth scroll, reveal-on-scroll, page transitions, parallax.
   Plain JavaScript, no libraries. Add <script src="fx.js"></script> just before </body> on every page.
   If anything fails the site still works normally. */
(function () {
  'use strict';
  var d = document, w = window, root = d.documentElement;
  var reduce = w.matchMedia && w.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var fine = w.matchMedia && w.matchMedia('(hover:hover) and (pointer:fine)').matches;
  if (reduce) return;

  /* ---------- styles ---------- */
  var css = [
    'html.fx-smooth{scroll-behavior:auto !important}',
    /* page curtain */
    '#fx-curtain{position:fixed;inset:0;z-index:99999;background:linear-gradient(160deg,#0a1220,#14213a);display:flex;flex-direction:column;align-items:center;justify-content:center;transform:translateY(0);will-change:transform;pointer-events:all}',
    '#fx-curtain.open{transform:translateY(-100%);transition:transform .95s cubic-bezier(.76,0,.24,1);pointer-events:none}',
    '#fx-curtain.pre{transform:translateY(100%);transition:none}',
    '#fx-curtain.leave{transform:translateY(0);transition:transform .6s cubic-bezier(.76,0,.24,1);pointer-events:all}',
    '#fx-curtain .cw{font-family:"Playfair Display",serif;font-weight:800;font-size:clamp(2.2rem,7vw,4.4rem);color:#FAF3E7;letter-spacing:1px;opacity:0;transform:translateY(14px);animation:fxw .9s .1s cubic-bezier(.2,.8,.2,1) forwards}',
    '#fx-curtain .cl{display:flex;gap:6px;margin-top:10px;opacity:0;animation:fxw .9s .35s cubic-bezier(.2,.8,.2,1) forwards}',
    '#fx-curtain .cl i{display:block;width:84px;height:4px;border-radius:3px}',
    '#fx-curtain .cl i:first-child{background:linear-gradient(90deg,#F26722,#fff,#138808)}',
    '#fx-curtain .cl i:last-child{background:linear-gradient(90deg,#AE1C28,#fff,#21468B)}',
    '#fx-curtain.quick .cw,#fx-curtain.quick .cl{animation-duration:.4s;animation-delay:0s}',
    '@keyframes fxw{to{opacity:1;transform:none}}',
    /* progress bar */
    '#fx-bar{position:fixed;top:0;left:0;height:3px;width:100%;transform-origin:0 50%;transform:scaleX(0);z-index:200;background:linear-gradient(90deg,#F26722,#E6C15C,#E62E8B);pointer-events:none}',
    /* nav */
    'nav{transition:transform .45s cubic-bezier(.2,.7,.2,1),padding .35s,background .35s}',
    'nav.fx-hide{transform:translateY(-110%)}',
    'nav.fx-small{padding-top:10px !important;padding-bottom:10px !important;background:rgba(26,26,46,.94) !important}',
    /* reveal */
    'html.fx-on .rv{opacity:0;transform:translateY(36px);transition:opacity .9s cubic-bezier(.2,.7,.2,1),transform .9s cubic-bezier(.2,.7,.2,1);transition-delay:var(--d,0s)}',
    'html.fx-on .rv.in{opacity:1;transform:none}',
    /* hero words */
    '.fx-w{display:inline-block;overflow:hidden;vertical-align:top;padding-bottom:.14em;margin-bottom:-.14em}',
    '.fx-wi{display:inline-block;transform:translateY(112%);transition:transform 1.05s cubic-bezier(.2,.8,.2,1);transition-delay:var(--d,0s)}',
    '.fx-go .fx-wi{transform:none}',
    /* floating colour blobs */
    '.fx-blob{position:absolute;border-radius:50%;filter:blur(70px);opacity:.38;z-index:1;pointer-events:none;will-change:transform;animation:fxf 16s ease-in-out infinite alternate}',
    '.fx-blob.b1{width:340px;height:340px;background:#F26722;left:-60px;top:8%}',
    '.fx-blob.b2{width:300px;height:300px;background:#138808;right:-40px;top:4%;animation-delay:-5s}',
    '.fx-blob.b3{width:360px;height:360px;background:#21468B;right:8%;bottom:-80px;animation-delay:-9s}',
    '.fx-blob.b4{width:300px;height:300px;background:#AE1C28;left:6%;bottom:-70px;animation-delay:-3s}',
    '@keyframes fxf{0%{transform:translate(0,0) scale(1)}50%{transform:translate(40px,-30px) scale(1.12)}100%{transform:translate(-30px,34px) scale(.94)}}',
    /* ticker */
    '.fx-ticker{background:#14111c;color:#E6C15C;overflow:hidden;white-space:nowrap;padding:16px 0;border-top:1px solid rgba(230,193,92,.25);border-bottom:1px solid rgba(230,193,92,.25)}',
    '.fx-ticker .tk{display:inline-block;animation:fxt 32s linear infinite;font-family:"Anton",sans-serif;letter-spacing:3px;text-transform:uppercase;font-size:1.05rem}',
    '.fx-ticker span{margin:0 22px;opacity:.9}.fx-ticker b{color:#F26722;font-weight:400}',
    '@keyframes fxt{to{transform:translateX(-50%)}}',
    /* tilt */
    '.fx-tilt{transition:transform .25s ease,box-shadow .25s ease;will-change:transform}',
    '@media(max-width:700px){.fx-blob{opacity:.25}}'
  ].join('\n');
  var st = d.createElement('style'); st.textContent = css; d.head.appendChild(st);

  var $ = function (s, c) { return (c || d).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || d).querySelectorAll(s)); };

  /* ---------- page curtain ---------- */
  var curtain = d.createElement('div');
  curtain.id = 'fx-curtain';
  curtain.innerHTML = '<div class="cw">Indutchian</div><div class="cl"><i></i><i></i></div>';
  d.body.appendChild(curtain);
  var arrived = false;
  try { arrived = sessionStorage.getItem('fxSeen') === '1'; sessionStorage.setItem('fxSeen', '1'); } catch (e) {}
  if (arrived) curtain.classList.add('quick');

  var started = false;
  function startPage() {
    if (started) return; started = true;
    curtain.classList.remove('pre', 'leave');
    curtain.classList.add('open');
    setTimeout(runIntro, arrived ? 320 : 520);
  }
  var wait = arrived ? 420 : 1050;
  setTimeout(startPage, wait);
  w.addEventListener('load', function () { setTimeout(startPage, wait); });
  w.addEventListener('pageshow', function (e) { if (e.persisted) { started = false; curtain.classList.remove('leave'); curtain.classList.add('open'); started = true; } });

  /* internal links: curtain wipe, then go */
  d.addEventListener('click', function (e) {
    if (e.defaultPrevented || e.button || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    var a = e.target.closest && e.target.closest('a[href]');
    if (!a || a.target === '_blank' || a.hasAttribute('download')) return;
    var href = a.getAttribute('href');
    if (!href || href.charAt(0) === '#' || /^(mailto|tel|javascript):/i.test(href)) return;
    var url; try { url = new URL(a.href, location.href); } catch (err) { return; }
    if (url.origin !== location.origin) return;
    if (url.pathname === location.pathname && url.hash) return; /* same page anchor: handled below */
    e.preventDefault();
    curtain.classList.remove('open', 'quick');
    curtain.classList.add('pre');
    void curtain.offsetWidth;
    curtain.classList.remove('pre');
    curtain.classList.add('leave');
    setTimeout(function () { location.href = a.href; }, 620);
  });

  /* ---------- reveal on scroll ---------- */
  var REVEAL = ['.story .eyebrow', '.story h2', '.story p', '.split .col', '.services .eyebrow', '.services h2', '.card',
    '.campaigns .eyebrow', '.campaigns h2', '.campaigns .sub', '.campcard', '.career .eyebrow', '.career h2', '.career .intro',
    '.role', '.career .apply', '.contact .eyebrow', '.contact h2', '.contact p', '.contact .form', '.musicsec .inner > *', '.evt',
    '.m-head > *', '.cat-title', '.fcard', '.edate', '.events .container > .eyebrow', '.events h2', '.events .container > p'];
  var HEROIN = ['.hero .tag', '.hero p', '.hero .btn', '.menu-hero .mh-text > *:not(h1)', '.menu-hero .mh-photo', '.ev-hero-inner > *:not(h1)'];
  var io = null, heroEls = [];
  function stagger(el, extra) {
    var p = el.parentNode, i = 0;
    if (p) { var sib = Array.prototype.slice.call(p.children).filter(function (x) { return x.classList.contains('rv'); }); i = Math.max(0, sib.indexOf(el)); }
    el.style.setProperty('--d', ((extra || 0) + (i % 4) * 0.09).toFixed(2) + 's');
  }
  function markReveal() {
    if (!('IntersectionObserver' in w)) return;
    io = new IntersectionObserver(function (es) {
      es.forEach(function (en) {
        if (!en.isIntersecting) return;
        var el = en.target; io.unobserve(el);
        el.classList.add('in');
        setTimeout(function () { el.classList.remove('rv', 'in'); el.style.removeProperty('--d'); }, 1600);
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });
    var seen = [];
    REVEAL.forEach(function (s) {
      $$(s).forEach(function (el) {
        if (seen.indexOf(el) > -1 || el.closest('.slides')) return;
        seen.push(el); el.classList.add('rv');
      });
    });
    seen.forEach(function (el) { stagger(el, 0); });
    root.classList.add('fx-on');
    seen.forEach(function (el) { io.observe(el); });
  }

  /* ---------- hero words ---------- */
  function splitWords(node) {
    Array.prototype.slice.call(node.childNodes).forEach(function (c) {
      if (c.nodeType === 3) {
        var parts = c.nodeValue.split(/(\s+)/), frag = d.createDocumentFragment();
        parts.forEach(function (p) {
          if (!p) return;
          if (/^\s+$/.test(p)) { frag.appendChild(d.createTextNode(' ')); return; }
          var o = d.createElement('span'); o.className = 'fx-w';
          var i = d.createElement('span'); i.className = 'fx-wi'; i.textContent = p;
          o.appendChild(i); frag.appendChild(o);
        });
        node.replaceChild(frag, c);
      } else if (c.nodeType === 1 && c.tagName !== 'BR') { splitWords(c); }
    });
  }
  function prepHero() {
    var h1 = $('.hero h1') || $('.menu-hero h1') || $('.ev-hero-inner h1');
    if (h1) {
      splitWords(h1);
      var k = 0;
      $$('.fx-wi', h1).forEach(function (el) { el.style.setProperty('--d', (k++ * 0.09 + 0.05).toFixed(2) + 's'); });
    }
    HEROIN.forEach(function (s) { $$(s).forEach(function (el) { if (heroEls.indexOf(el) < 0) heroEls.push(el); }); });
    heroEls.forEach(function (el, i) { el.classList.add('rv'); el.style.setProperty('--d', (0.55 + i * 0.12).toFixed(2) + 's'); });
    return h1;
  }
  var heroH1 = null;
  function runIntro() {
    if (heroH1) heroH1.classList.add('fx-go');
    heroEls.forEach(function (el) {
      el.classList.add('in');
      setTimeout(function () { el.classList.remove('rv', 'in'); el.style.removeProperty('--d'); }, 2200);
    });
  }

  /* ---------- floating blobs ---------- */
  function addBlobs() {
    var host = $('.hero') || $('.menu-hero') || $('.ev-hero');
    if (!host) return;
    if (getComputedStyle(host).position === 'static') host.style.position = 'relative';
    ['b1', 'b2', 'b3', 'b4'].forEach(function (c) { var b = d.createElement('div'); b.className = 'fx-blob ' + c; host.insertBefore(b, host.firstChild); });
  }

  /* ---------- ticker (home page only) ---------- */
  function addTicker() {
    var slider = $('#worlds');
    if (!slider) return;
    var items = ['Samosa', 'Bitterballen', 'Masala', 'Stroopwafel', 'Chaat', 'Kaassoufflé', 'Gulab Jamun', 'Appeltaart', 'Biryani', 'Kroket'];
    var one = items.map(function (t) { return '<span>' + t + '</span><b>✦</b>'; }).join('');
    var t = d.createElement('div'); t.className = 'fx-ticker'; t.setAttribute('aria-hidden', 'true');
    t.innerHTML = '<div class="tk">' + one + one + one + one + '</div>';
    slider.parentNode.insertBefore(t, slider.nextSibling);
  }

  /* ---------- smooth scroll (inertia) ---------- */
  var cur = w.pageYOffset, target = cur, raf = 0, active = false;
  function maxY() { return Math.max(0, root.scrollHeight - w.innerHeight); }
  function tick() {
    var diff = target - cur;
    if (Math.abs(diff) < 0.4) { cur = target; w.scrollTo(0, cur); active = false; raf = 0; return; }
    cur += diff * 0.1;
    w.scrollTo(0, cur);
    raf = requestAnimationFrame(tick);
  }
  function go(y) { target = Math.max(0, Math.min(maxY(), y)); if (!active) { active = true; cur = w.pageYOffset; raf = requestAnimationFrame(tick); } }
  function smoothScroll() {
    root.classList.add('fx-smooth');
    if (!fine) return;
    w.addEventListener('wheel', function (e) {
      if (e.ctrlKey || e.defaultPrevented) return;
      var el = e.target, scrollable = false;
      while (el && el !== d.body) {
        if (el.nodeType === 1) { var cs = getComputedStyle(el); if ((cs.overflowY === 'auto' || cs.overflowY === 'scroll') && el.scrollHeight > el.clientHeight + 2) { scrollable = true; break; } }
        el = el.parentNode;
      }
      if (scrollable) return;
      e.preventDefault();
      var dy = e.deltaY * (e.deltaMode === 1 ? 32 : e.deltaMode === 2 ? w.innerHeight : 1);
      if (!active) { cur = w.pageYOffset; target = cur; }
      go(target + dy * 1.0);
    }, { passive: false });
    w.addEventListener('scroll', function () { if (!active) { cur = w.pageYOffset; target = cur; } }, { passive: true });
    w.addEventListener('keydown', function () { active = false; cancelAnimationFrame(raf); cur = target = w.pageYOffset; });
    w.addEventListener('mousedown', function () { active = false; cancelAnimationFrame(raf); cur = target = w.pageYOffset; });
  }
  /* in-page anchors: eased scroll with nav offset */
  d.addEventListener('click', function (e) {
    var a = e.target.closest && e.target.closest('a[href^="#"]');
    if (!a) return;
    var id = a.getAttribute('href').slice(1);
    if (!id) { e.preventDefault(); easeTo(0); return; }
    var t = d.getElementById(id);
    if (!t) return;
    e.preventDefault();
    easeTo(t.getBoundingClientRect().top + w.pageYOffset - 70);
    try { history.pushState(null, '', '#' + id); } catch (err) {}
  });
  function easeTo(y) {
    if (fine) { go(y); return; }
    var from = w.pageYOffset, to = Math.max(0, Math.min(maxY(), y)), t0 = performance.now(), dur = 900;
    function step(t) {
      var p = Math.min(1, (t - t0) / dur), e = p < .5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2;
      w.scrollTo(0, from + (to - from) * e);
      if (p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  /* ---------- scroll effects: progress bar, nav, parallax ---------- */
  var bar = d.createElement('div'); bar.id = 'fx-bar'; d.body.appendChild(bar);
  var nav = $('nav'), lastY = w.pageYOffset, ticking = false;
  var parHero = $('.hero .inner') || $('.menu-hero .mh-row') || $('.ev-hero-inner');
  var parPhoto = $('.food-photo .pw');
  function onScroll() {
    var y = w.pageYOffset, m = maxY();
    bar.style.transform = 'scaleX(' + (m ? Math.min(1, y / m) : 0) + ')';
    if (nav) {
      nav.classList.toggle('fx-small', y > 40);
      if (y > lastY + 4 && y > 160) nav.classList.add('fx-hide');
      else if (y < lastY - 4 || y < 100) nav.classList.remove('fx-hide');
    }
    lastY = y;
    if (parHero && y < w.innerHeight * 1.2) {
      parHero.style.transform = 'translate3d(0,' + (y * 0.22).toFixed(1) + 'px,0)';
      parHero.style.opacity = Math.max(0, 1 - y / (w.innerHeight * 0.85)).toFixed(3);
    }
    if (parPhoto) {
      var r = parPhoto.getBoundingClientRect();
      if (r.top < w.innerHeight && r.bottom > 0) parPhoto.style.transform = 'translate3d(0,' + (((r.top + r.height / 2) - w.innerHeight / 2) * -0.06).toFixed(1) + 'px,0)';
    }
    ticking = false;
  }
  w.addEventListener('scroll', function () { if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } }, { passive: true });
  w.addEventListener('resize', onScroll);

  /* ---------- card tilt ---------- */
  function tilt() {
    if (!fine) return;
    $$('.card, .campcard, .role, .evt, .fcard, .edate').forEach(function (el) {
      el.classList.add('fx-tilt');
      el.addEventListener('mousemove', function (e) {
        if (el.classList.contains('rv')) return;
        var r = el.getBoundingClientRect(), px = (e.clientX - r.left) / r.width - 0.5, py = (e.clientY - r.top) / r.height - 0.5;
        el.style.transform = 'perspective(900px) rotateX(' + (-py * 7).toFixed(2) + 'deg) rotateY(' + (px * 9).toFixed(2) + 'deg) translateY(-5px)';
      });
      el.addEventListener('mouseleave', function () { el.style.transform = ''; });
    });
  }

  /* ---------- go ---------- */
  try {
    heroH1 = prepHero();
    markReveal();
    addBlobs();
    addTicker();
    smoothScroll();
    tilt();
    onScroll();
  } catch (err) {
    /* never block the site */
    root.classList.remove('fx-on');
    $$('.rv').forEach(function (el) { el.classList.remove('rv'); });
    curtain.className = 'open';
    if (w.console) console.warn('fx failed', err);
  }
})();
