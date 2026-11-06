(function () {
  'use strict';
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return [].slice.call((r || document).querySelectorAll(s)); };

  /* Mobile menu */
  var burger = $('#burger'), links = $('#navLinks');
  if (burger && links) {
    burger.addEventListener('click', function () {
      var open = links.classList.toggle('open');
      burger.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    links.addEventListener('click', function (e) {
      if (e.target.tagName === 'A') { links.classList.remove('open'); burger.setAttribute('aria-expanded', 'false'); }
    });
  }

  /* Booking form (home page only) */
  var form = $('#bookingForm');
  if (form) {
    var sel = $('#f-pkg');
    var pick = function (text) {
      if (!sel || !text) { return; }
      for (var i = 0; i < sel.options.length; i++) {
        if (sel.options[i].text === text) { sel.selectedIndex = i; break; }
      }
    };
    $$('[data-pkg]').forEach(function (a) {
      a.addEventListener('click', function () { pick(a.getAttribute('data-pkg')); });
    });
    // Links from other pages: /?package=little-diggers#book
    var map = {
      'little-diggers': 'Little Diggers Farm (ages 3-6)',
      'pro-operators': 'Pro Operators Site (ages 6+)',
      'corporate': 'Corporate / adult event',
      'festival': 'Festival or public event'
    };
    var m = /[?&]package=([a-z-]+)/.exec(location.search);
    if (m && map[m[1]]) { pick(map[m[1]]); }

    var dateInput = $('#f-date');
    if (dateInput) {
      var d = new Date();
      dateInput.min = d.getFullYear() + '-' + ('0' + (d.getMonth() + 1)).slice(-2) + '-' + ('0' + d.getDate()).slice(-2);
    }

    var err = $('#formErr');
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var btn = $('#sendBtn');
      btn.disabled = true; btn.textContent = 'Sending...';
      if (err) { err.hidden = true; }
      var data = new URLSearchParams(new FormData(form)).toString();
      fetch('/', { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body: data })
        .then(function (r) {
          if (!r.ok) { throw new Error('bad status'); }
          window.location.href = '/thank-you/';
        })
        .catch(function () {
          btn.disabled = false; btn.textContent = 'Send my enquiry';
          if (err) { err.hidden = false; err.focus(); }
        });
    });
  }

  /* Fleet showcase: all machines are in the HTML, this just shows one at a time */
  var stage = $('#fleetStage');
  if (stage) {
    var panels = $$('.fleet-panel', stage), thumbs = $$('#fThumbs button'), cur = 0, x0 = null;
    var show = function (i, quiet) {
      cur = (i + panels.length) % panels.length;
      panels.forEach(function (p, k) { p.hidden = (k !== cur); });
      thumbs.forEach(function (b, k) {
        b.setAttribute('aria-pressed', k === cur ? 'true' : 'false');
        b.tabIndex = k === cur ? 0 : -1;
      });
      var img = $('img', panels[cur]);
      if (img && img.loading === 'lazy') { img.loading = 'eager'; }
      if (!quiet && thumbs[cur] && thumbs[cur].scrollIntoView) {
        try { thumbs[cur].scrollIntoView({ block: 'nearest', inline: 'center', behavior: 'smooth' }); } catch (e) {}
      }
    };
    $('#fPrev').addEventListener('click', function () { show(cur - 1); });
    $('#fNext').addEventListener('click', function () { show(cur + 1); });
    thumbs.forEach(function (b, k) { b.addEventListener('click', function () { show(k); }); });
    $('#fThumbs').addEventListener('keydown', function (e) {
      if (e.key === 'ArrowRight') { show(cur + 1); thumbs[cur].focus(); }
      if (e.key === 'ArrowLeft') { show(cur - 1); thumbs[cur].focus(); }
    });
    stage.addEventListener('touchstart', function (e) { x0 = e.touches[0].clientX; }, { passive: true });
    stage.addEventListener('touchend', function (e) {
      if (x0 === null) { return; }
      var dx = e.changedTouches[0].clientX - x0;
      if (Math.abs(dx) > 50) { show(cur + (dx < 0 ? 1 : -1)); }
      x0 = null;
    });
    show(0, true);
  }
})();
