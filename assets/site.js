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

  /* Fleet carousel: native swipe/scroll; arrows just move one card at a time */
var track = $('#fleetTrack');
if (track) {
var prev = $('#fPrev'), next = $('#fNext');
var step = function () {
var c = $('.fleet-card', track);
return c ? c.getBoundingClientRect().width + 18 : 280;
};
var sync = function () {
if (!prev || !next) { return; }
prev.disabled = track.scrollLeft < 8;
next.disabled = track.scrollLeft + track.clientWidth > track.scrollWidth - 8;
};
var go = function (dir) {
var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
track.scrollBy({ left: dir * step(), behavior: reduce ? 'auto' : 'smooth' });
};
if (prev) { prev.addEventListener('click', function () { go(-1); }); }
if (next) { next.addEventListener('click', function () { go(1); }); }
track.addEventListener('scroll', function () { window.requestAnimationFrame(sync); }, { passive: true });
track.addEventListener('keydown', function (e) {
if (e.key === 'ArrowRight') { go(1); }
if (e.key === 'ArrowLeft') { go(-1); }
});
window.addEventListener('resize', sync);
sync();
}
})();
