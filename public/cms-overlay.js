/**
 * GEDECO CMS Inline Editor
 *
 * Visual in-place editor:
 * - Clean green bounding box around every editable element (NO text badges/labels)
 * - Click directly on text to edit in-place with blinking cursor (contenteditable)
 * - Hero banner switcher & editor (Banner 1 & Banner 2) directly on the hero
 * - Click directly on any media to open media picker (choose from library or upload)
 * - Floating save toolbar + parent postMessage bridge
 */
(function () {
  'use strict';

  if (window.__geDecoCmsOverlayLoaded) return;
  window.__geDecoCmsOverlayLoaded = true;

  var params = new URLSearchParams(window.location.search);
  if (params.get('cmsPreview') !== '1') return;

  function norm(str) {
    return String(str || '').replace(/\s+/g, ' ').trim();
  }

  function strip(str) {
    return String(str || '').replace(/[\s\r\n\t\u00a0]+/g, '').toLowerCase();
  }

  function pageKey() {
    var p = window.location.pathname.replace(/\/$/, '').replace(/^\/en/, '') || '/';
    var map = {
      '/': 'home',
      '/gioi-thieu': 'gioi-thieu',
      '/tin-tuc': 'tin-tuc',
      '/san-pham': 'san-pham',
      '/lien-he': 'lien-he',
      '/chinh-sach-hang-chinh-hang': 'chinh-sach-hang-chinh-hang',
      '/huong-dan-mua-hang': 'huong-dan-mua-hang',
      '/giao-hang-va-thanh-toan': 'giao-hang-va-thanh-toan',
      '/doi-tra-va-bao-hanh': 'doi-tra-va-bao-hanh',
    };
    return map[p] || 'home';
  }

  var LOCKED_SECTIONS = ['news', 'products'];
  var LOCKED_OK_FIELDS = ['title', 'heading', 'eyebrow', 'allLabel'];
  function isLocked(row) {
    if (!LOCKED_SECTIONS.includes(row.sectionKey)) return false;
    return !LOCKED_OK_FIELDS.includes(row.fieldKey);
  }

  /* ── State ─────────────────────────────────────────────────── */
  var isEditMode = true;
  var byId = {};
  var annotated = []; // { el, row, origValue, isImg, isBanner }
  var pendingChanges = {}; // id -> { id, value?, imageUrl?, altText?, imageCaption? }
  var styleEl = null;
  var toolbarEl = null;
  var heroBannerBar = null;

  /* ── Inject Styles (No labels/badges, clean frames only) ────── */
  function injectStyles() {
    if (styleEl) return;
    styleEl = document.createElement('style');
    styleEl.textContent = [
      /* Bounding box when edit mode is active: clean green border, NO badges */
      '.cms-edit-active [data-cms-id]{',
      '  position: relative !important;',
      '  outline: 2px solid #0f7040 !important;',
      '  outline-offset: 3px !important;',
      '  cursor: text !important;',
      '  transition: outline .15s, box-shadow .15s !important;',
      '}',
      '.cms-edit-active .eyebrow[data-cms-id]{',
      '  width: fit-content !important;',
      '  display: inline-block !important;',
      '}',
      '.cms-edit-active [data-cms-id]:focus{',
      '  outline: 2.5px solid #0f7040 !important;',
      '  box-shadow: 0 0 0 3px rgba(15,112,64,.25) !important;',
      '}',
      '.cms-edit-active [data-cms-id].cms-dirty{',
      '  outline: 2.5px solid #2563eb !important;',
      '  box-shadow: 0 0 0 3px rgba(37,99,235,.2) !important;',
      '}',
      '.cms-edit-active [data-cms-id].cms-locked{',
      '  outline: 2px dashed #9ca3af !important;',
      '  cursor: not-allowed !important;',
      '}',
      /* Image wrapper and change overlay */
      '.cms-edit-active img[data-cms-id]{',
      '  cursor: pointer !important;',
      '}',
      '.cms-img-btn{',
      '  position: absolute !important;',
      '  top: 8px !important;',
      '  right: 8px !important;',
      '  z-index: 9999 !important;',
      '  background: #0f7040 !important;',
      '  color: #fff !important;',
      '  border: 0 !important;',
      '  border-radius: 6px !important;',
      '  padding: 6px 12px !important;',
      '  font-size: 12px !important;',
      '  font-weight: 700 !important;',
      '  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif !important;',
      '  cursor: pointer !important;',
      '  box-shadow: 0 3px 8px rgba(0,0,0,.25) !important;',
      '  display: flex !important;',
      '  align-items: center !important;',
      '  gap: 5px !important;',
      '  transition: transform .15s, background .15s !important;',
      '}',
      '.cms-img-btn:hover{',
      '  background: #09522d !important;',
      '  transform: scale(1.05) !important;',
      '}',
      /* Hero banner control bar */
      '.cms-hero-banner-bar{',
      '  position: absolute !important;',
      '  top: 76px !important;',
      '  right: 28px !important;',
      '  z-index: 9999 !important;',
      '  display: flex !important;',
      '  align-items: center !important;',
      '  gap: 8px !important;',
      '  background: rgba(15, 112, 64, 0.95) !important;',
      '  backdrop-filter: blur(8px) !important;',
      '  padding: 6px 14px !important;',
      '  border-radius: 999px !important;',
      '  box-shadow: 0 4px 16px rgba(0,0,0,0.3) !important;',
      '  border: 1px solid rgba(255,255,255,0.25) !important;',
      '}',
      '.cms-banner-title{',
      '  color: #fff !important;',
      '  font-size: 12px !important;',
      '  font-weight: 700 !important;',
      '  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif !important;',
      '  margin-right: 4px !important;',
      '}',
      '.cms-banner-btn{',
      '  background: #fff !important;',
      '  color: #0f7040 !important;',
      '  border: 0 !important;',
      '  border-radius: 999px !important;',
      '  padding: 5px 12px !important;',
      '  font-size: 12px !important;',
      '  font-weight: 700 !important;',
      '  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif !important;',
      '  cursor: pointer !important;',
      '  transition: transform .15s, background .15s, color .15s !important;',
      '  display: flex !important;',
      '  align-items: center !important;',
      '  gap: 4px !important;',
      '}',
      '.cms-banner-btn:hover{',
      '  background: #d1fae5 !important;',
      '  transform: scale(1.04) !important;',
      '}',
      '.cms-banner-btn.cms-dirty{',
      '  background: #2563eb !important;',
      '  color: #fff !important;',
      '}',
      /* Floating Toolbar */
      '.cms-float-bar{',
      '  position: fixed !important;',
      '  bottom: 24px !important;',
      '  left: 50% !important;',
      '  transform: translateX(-50%) !important;',
      '  z-index: 999999 !important;',
      '  background: #111827 !important;',
      '  color: #fff !important;',
      '  border-radius: 999px !important;',
      '  padding: 8px 18px !important;',
      '  display: flex !important;',
      '  align-items: center !important;',
      '  gap: 12px !important;',
      '  box-shadow: 0 10px 30px rgba(0,0,0,.4) !important;',
      '  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif !important;',
      '  font-size: 13px !important;',
      '}',
      '.cms-float-badge{',
      '  display: flex !important;',
      '  align-items: center !important;',
      '  gap: 6px !important;',
      '  font-weight: 700 !important;',
      '  color: #34d399 !important;',
      '}',
      '.cms-float-btn{',
      '  border: 0 !important;',
      '  border-radius: 999px !important;',
      '  padding: 7px 16px !important;',
      '  font-size: 13px !important;',
      '  font-weight: 800 !important;',
      '  cursor: pointer !important;',
      '  transition: transform .15s, opacity .15s !important;',
      '}',
      '.cms-float-save{',
      '  background: #0f7040 !important;',
      '  color: #fff !important;',
      '}',
      '.cms-float-save:hover{ background: #13894f !important; transform: translateY(-1px); }',
      '.cms-float-save:disabled{ opacity: .45 !important; cursor: not-allowed !important; transform: none !important; }',
      '.cms-float-toggle{',
      '  background: rgba(255,255,255,.15) !important;',
      '  color: #fff !important;',
      '}',
      '.cms-float-toggle:hover{ background: rgba(255,255,255,.25) !important; }',
      '.cms-float-notice{',
      '  font-size: 12px !important;',
      '  color: #6ee7b7 !important;',
      '}',
    ].join('\n');
    document.head.appendChild(styleEl);
  }

  /* ── Cleanup ───────────────────────────────────────────────── */
  function cleanup() {
    annotated.forEach(function (item) {
      if (item.el) {
        item.el.removeAttribute('data-cms-id');
        item.el.removeAttribute('contenteditable');
        item.el.removeAttribute('spellcheck');
        item.el.removeAttribute('title');
        item.el.classList.remove('cms-locked', 'cms-dirty');
      }
      if (item.btn && item.btn.parentNode) item.btn.parentNode.removeChild(item.btn);
    });
    annotated = [];
    byId = {};
    if (heroBannerBar && heroBannerBar.parentNode) {
      heroBannerBar.parentNode.removeChild(heroBannerBar);
      heroBannerBar = null;
    }
  }

  /* ── Mark Text Element ─────────────────────────────────────── */
  function markTextEl(el, row) {
    if (!el || el.getAttribute('data-cms-id')) return;
    var locked = isLocked(row);
    el.setAttribute('data-cms-id', row.id);
    el.setAttribute('title', row.label || (row.sectionKey + '.' + row.fieldKey));
    if (locked) {
      el.classList.add('cms-locked');
    } else {
      el.setAttribute('contenteditable', 'true');
      el.setAttribute('spellcheck', 'false');
    }
    byId[row.id] = row;
    var item = { el: el, row: row, origValue: el.innerText, isImg: false };
    annotated.push(item);

    // On input: capture value in DB format
    el.addEventListener('input', function () {
      var currentVal = el.innerText.trim();
      el.classList.add('cms-dirty');
      pendingChanges[row.id] = { id: row.id, value: currentVal };
      updateToolbar();
      window.parent.postMessage({
        type: 'gedeco-cms-dirty',
        count: Object.keys(pendingChanges).length,
      }, '*');
    });

    // Prevent navigation if element is inside an <a>
    el.addEventListener('click', function (e) {
      e.stopPropagation();
      var anchor = el.closest('a');
      if (anchor) e.preventDefault();
    });
  }

  /* ── Mark Image Element ────────────────────────────────────── */
  function markImgEl(img, row) {
    if (!img || img.getAttribute('data-cms-id')) return;
    var locked = isLocked(row);
    img.setAttribute('data-cms-id', row.id);
    img.setAttribute('title', row.label || (row.sectionKey + '.' + row.fieldKey));
    if (locked) img.classList.add('cms-locked');
    byId[row.id] = row;

    var btn = null;
    if (!locked && img.parentElement) {
      btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'cms-img-btn';
      btn.innerHTML = '📷 Đổi ảnh';
      btn.setAttribute('data-cms-target-id', row.id);
      
      var parentPos = window.getComputedStyle(img.parentElement).position;
      if (parentPos === 'static') {
        img.parentElement.style.position = 'relative';
      }
      img.parentElement.appendChild(btn);

      btn.addEventListener('click', function (e) {
        e.preventDefault();
        e.stopPropagation();
        triggerMediaPicker(row);
      });
    }

    img.addEventListener('click', function (e) {
      e.preventDefault();
      e.stopPropagation();
      if (!locked) triggerMediaPicker(row);
    });

    var item = { el: img, row: row, origValue: img.src, isImg: true, btn: btn };
    annotated.push(item);
  }

  /* ── Setup Hero Banner Controls ────────────────────────────── */
  function setupHeroBanners(rows) {
    var heroSection = document.querySelector('section.hero');
    if (!heroSection) return;

    var banner1Row = rows.find(function (r) { return r.sectionKey === 'hero' && r.fieldKey === 'banner1'; });
    var banner2Row = rows.find(function (r) { return r.sectionKey === 'hero' && r.fieldKey === 'banner2'; });

    if (!banner1Row && !banner2Row) return;

    if (banner1Row) byId[banner1Row.id] = banner1Row;
    if (banner2Row) byId[banner2Row.id] = banner2Row;

    heroBannerBar = document.createElement('div');
    heroBannerBar.className = 'cms-hero-banner-bar';
    heroBannerBar.innerHTML = [
      '<span class="cms-banner-title">🖼️ Hero Banners:</span>',
      banner1Row ? '<button type="button" class="cms-banner-btn" id="cms-btn-banner-1">📷 Đổi Banner 1</button>' : '',
      banner2Row ? '<button type="button" class="cms-banner-btn" id="cms-btn-banner-2">📷 Đổi Banner 2</button>' : '',
    ].join('');

    heroSection.appendChild(heroBannerBar);

    var btn1 = document.getElementById('cms-btn-banner-1');
    if (btn1 && banner1Row) {
      btn1.onclick = function (e) {
        e.preventDefault();
        e.stopPropagation();
        // Switch to slide 0
        var dots = document.querySelectorAll('.hero-slide-dots button');
        if (dots[0]) dots[0].click();
        triggerMediaPicker(banner1Row);
      };
      annotated.push({ el: heroSection, row: banner1Row, isImg: false, isBanner: true, bannerIndex: 1, btn: btn1 });
    }

    var btn2 = document.getElementById('cms-btn-banner-2');
    if (btn2 && banner2Row) {
      btn2.onclick = function (e) {
        e.preventDefault();
        e.stopPropagation();
        // Switch to slide 1
        var dots = document.querySelectorAll('.hero-slide-dots button');
        if (dots[1]) dots[1].click();
        triggerMediaPicker(banner2Row);
      };
      annotated.push({ el: heroSection, row: banner2Row, isImg: false, isBanner: true, bannerIndex: 2, btn: btn2 });
    }
  }

  /* ── Setup Inner Page Hero Banner ──────────────────────────── */
  function setupInnerHeroBanner(rows) {
    var innerHero = document.querySelector('section.inner-hero');
    if (!innerHero) return;

    var bannerRow = rows.find(function (r) {
      return (r.sectionKey === 'hero' || r.sectionKey === 'intro') &&
        (r.fieldKey === 'image' || r.fieldKey === 'banner' || r.contentType === 'IMAGE');
    });

    if (!bannerRow) return;
    byId[bannerRow.id] = bannerRow;

    var bar = document.createElement('div');
    bar.className = 'cms-hero-banner-bar';
    bar.innerHTML = '<button type="button" class="cms-banner-btn" id="cms-btn-inner-banner">📷 Đổi Banner trang</button>';
    innerHero.appendChild(bar);

    var btn = document.getElementById('cms-btn-inner-banner');
    if (btn) {
      btn.onclick = function (e) {
        e.preventDefault();
        e.stopPropagation();
        triggerMediaPicker(bannerRow);
      };
      annotated.push({ el: innerHero, row: bannerRow, isImg: false, isBanner: true, btn: btn });
    }
  }

  function triggerMediaPicker(row) {
    window.parent.postMessage({
      type: 'gedeco-cms-pick-media',
      id: row.id,
      label: row.label,
      currentUrl: row.imageUrl,
      altText: row.altText,
      caption: row.imageCaption,
      sectionKey: row.sectionKey,
      fieldKey: row.fieldKey,
    }, '*');
  }

  /* ── Annotate ──────────────────────────────────────────────── */
  function annotate(rows) {
    cleanup();
    injectStyles();

    var main = document.querySelector('main') || document.body;
    var allEls = Array.from(main.querySelectorAll('*'));
    var allImgs = Array.from(main.querySelectorAll('img'));

    // 1. Setup Hero Banners (background images)
    setupHeroBanners(rows);
    setupInnerHeroBanner(rows);

    // 2. Direct semantic mappings for high accuracy
    rows.forEach(function (row) {
      var matched = false;

      // Hero Section Elements
      if (row.sectionKey === 'hero') {
        if (row.fieldKey === 'welcome') {
          var welcome = document.querySelector('.hero-welcome');
          if (welcome) { markTextEl(welcome, row); matched = true; }
        } else if (row.fieldKey === 'marqueeText') {
          var marquee = document.querySelector('.home-welcome-marquee span');
          if (marquee) { markTextEl(marquee, row); matched = true; }
        } else if (row.fieldKey === 'title') {
          var h1 = document.querySelector('.hero h1, .hero-content h1, main h1');
          if (h1) { markTextEl(h1, row); matched = true; }
        } else if (row.fieldKey === 'eyebrow') {
          var eb = document.querySelector('.hero .eyebrow, .hero-content .eyebrow');
          if (eb) { markTextEl(eb, row); matched = true; }
        } else if (row.fieldKey === 'copy') {
          var cp = document.querySelector('.hero .hero-copy, .hero-content .hero-copy');
          if (cp) { markTextEl(cp, row); matched = true; }
        } else if (row.fieldKey === 'exploreLabel') {
          var btnEx = document.querySelector('.hero-actions a.button-gold, .hero-actions a:first-child');
          if (btnEx) { markTextEl(btnEx, row); matched = true; }
        } else if (row.fieldKey === 'consultLabel') {
          var btnCs = document.querySelector('.hero-actions a.button-outline, .hero-actions a:last-child');
          if (btnCs) { markTextEl(btnCs, row); matched = true; }
        }
      }

      // Highlights
      if (row.sectionKey === 'highlights') {
        var hlMatch = row.fieldKey.match(/^(\d+)\.(title|body)$/);
        if (hlMatch) {
          var hlIdx = parseInt(hlMatch[1], 10);
          var hlType = hlMatch[2];
          var hlEl = document.querySelector('.hero-highlights > div:nth-child(' + hlIdx + ') ' + (hlType === 'title' ? 'strong' : 'small'));
          if (hlEl) { markTextEl(hlEl, row); matched = true; }
        }
      }

      // About Section
      if (row.sectionKey === 'about') {
        if (row.fieldKey === 'homeTitle') {
          var homeAbH2 = document.querySelector('.about-wide h2');
          if (homeAbH2) { markTextEl(homeAbH2, row); matched = true; }
        } else if (row.fieldKey === 'homeCopy') {
          var homeAbP1 = document.querySelector('.about-wide .about-copy p:nth-of-type(2)');
          if (homeAbP1) { markTextEl(homeAbP1, row); matched = true; }
        } else if (row.fieldKey === 'homeCopy2') {
          var homeAbP2 = document.querySelector('.about-wide .about-copy p:nth-of-type(3)');
          if (homeAbP2) { markTextEl(homeAbP2, row); matched = true; }
        } else if (row.fieldKey === 'homeButtonLabel') {
          var homeAbBtn = document.querySelector('.about-wide a.button');
          if (homeAbBtn) { markTextEl(homeAbBtn, row); matched = true; }
        } else if (row.fieldKey === 'title') {
          var abH2 = document.querySelector('.about h2');
          if (abH2) { markTextEl(abH2, row); matched = true; }
        } else if (row.fieldKey === 'copy') {
          var abP1 = document.querySelector('.about-copy p:nth-of-type(1)');
          if (abP1) { markTextEl(abP1, row); matched = true; }
        } else if (row.fieldKey === 'copy2') {
          var abP2 = document.querySelector('.about-copy p:nth-of-type(2)');
          if (abP2) { markTextEl(abP2, row); matched = true; }
        } else if (row.fieldKey === 'buttonLabel') {
          var abBtn = document.querySelector('.about a.button');
          if (abBtn) { markTextEl(abBtn, row); matched = true; }
        } else if (row.fieldKey === 'image' && row.imageUrl) {
          var abImg = document.querySelector('.about-image img, .about img');
          if (abImg) { markImgEl(abImg, row); matched = true; }
        }
      }

      // Projects Section
      if (row.sectionKey === 'projects') {
        if (row.fieldKey === 'title') {
          var prH2 = document.querySelector('.home-projects h2');
          if (prH2) { markTextEl(prH2, row); matched = true; }
        } else {
          var prMatch = row.fieldKey.match(/^(\d+)\.(title|copy|image)$/);
          if (prMatch) {
            var prIdx = parseInt(prMatch[1], 10);
            var prType = prMatch[2];
            var article = document.querySelector('.home-project-grid article:nth-child(' + prIdx + ')');
            if (article) {
              if (prType === 'title') {
                var tEl = article.querySelector('h3');
                if (tEl) { markTextEl(tEl, row); matched = true; }
              } else if (prType === 'copy') {
                var cEl = article.querySelector('p');
                if (cEl) { markTextEl(cEl, row); matched = true; }
              } else if (prType === 'image') {
                var iEl = article.querySelector('img');
                if (iEl) { markImgEl(iEl, row); matched = true; }
              }
            }
          }
        }
      }

      // Products Section Heading
      if (row.sectionKey === 'products') {
        if (row.fieldKey === 'title') {
          var prodH2 = document.querySelector('.home-products h2');
          if (prodH2) { markTextEl(prodH2, row); matched = true; }
        } else if (row.fieldKey === 'allLabel') {
          var prodAll = document.querySelector('.home-products .partner-head a');
          if (prodAll) { markTextEl(prodAll, row); matched = true; }
        }
      }

      // News Section Heading
      if (row.sectionKey === 'news') {
        if (row.fieldKey === 'title') {
          var newsH2 = document.querySelector('.news .news-intro h2');
          if (newsH2) { markTextEl(newsH2, row); matched = true; }
        } else if (row.fieldKey === 'allLabel') {
          var newsAll = document.querySelector('.news .news-all-link');
          if (newsAll) { markTextEl(newsAll, row); matched = true; }
        }
      }

      // About page redesign: activities and partner/supply network fields.
      if (row.sectionKey === 'activities' && row.fieldKey === 'eyebrow') {
        var actEyebrow = document.querySelector('.about-activities .eyebrow');
        if (actEyebrow) { markTextEl(actEyebrow, row); matched = true; }
      } else if (row.sectionKey === 'activities' && row.fieldKey === 'title') {
        var actTitle = document.querySelector('.about-activities h2');
        if (actTitle) { markTextEl(actTitle, row); matched = true; }
      } else {
        var actMatch = row.sectionKey === 'activities' && row.fieldKey.match(/^(\d+)\.(title|body|image)$/);
        if (actMatch) {
          var actArticle = document.querySelector('.about-activity-grid article:nth-child(' + parseInt(actMatch[1], 10) + ')');
          if (actArticle) {
            if (actMatch[2] === 'title') { var actH3 = actArticle.querySelector('h3'); if (actH3) { markTextEl(actH3, row); matched = true; } }
            if (actMatch[2] === 'body') { var actBody = actArticle.querySelector('div > p:last-child'); if (actBody) { markTextEl(actBody, row); matched = true; } }
            if (actMatch[2] === 'image') { var actImg = actArticle.querySelector('img'); if (actImg) { markImgEl(actImg, row); matched = true; } }
          }
        }
      }
      if (row.sectionKey === 'network') {
        var networkSelector = { eyebrow: '.about-network .eyebrow', title: '.about-network h2', body: '.about-network-grid > div:first-child > p:not(.eyebrow)', step1: '.about-network-steps > div:nth-child(1) span', step2: '.about-network-steps > div:nth-child(2) span', step3: '.about-network-steps > div:nth-child(3) span' }[row.fieldKey];
        var networkEl = networkSelector && document.querySelector(networkSelector);
        if (networkEl) { markTextEl(networkEl, row); matched = true; }
      }

      if (matched) return;

      // 3. General Fallback Matchers for all pages
      if (row.value && row.value.trim()) {
        var needle = norm(row.value);
        var needleClean = strip(row.value);

        // A. Leaf text elements
        allEls.forEach(function (el) {
          if (matched || el.getAttribute('data-cms-id')) return;
          if (el.children.length > 0) return;
          if (norm(el.textContent) === needle || (needleClean && strip(el.textContent) === needleClean)) {
            markTextEl(el, row);
            matched = true;
          }
        });

        // B. Heading or block elements with child tags (<br>, <em>, <strong>, <span>)
        if (!matched && needleClean) {
          allEls.forEach(function (el) {
            if (matched || el.getAttribute('data-cms-id')) return;
            var tag = el.tagName;
            if (/^(H[1-6]|P|SPAN|DIV|STRONG|B|EM|A)$/.test(tag)) {
              var elClean = strip(el.textContent || el.innerText);
              if (elClean === needleClean || (elClean.length > 5 && (elClean.startsWith(needleClean) || needleClean.startsWith(elClean)))) {
                markTextEl(el, row);
                matched = true;
              }
            }
          });
        }
      }

      // 4. Image fallback matcher
      if (!matched && row.imageUrl) {
        var file = row.imageUrl.split('/').pop().split('?')[0];
        allImgs.forEach(function (img) {
          if (img.getAttribute('data-cms-id')) return;
          var src = img.getAttribute('src') || '';
          var alt = norm(img.getAttribute('alt') || '');
          if (src.includes(file) || (row.altText && alt === norm(row.altText))) {
            markImgEl(img, row);
            matched = true;
          }
        });
      }
    });

    setEditMode(isEditMode);
  }

  /* ── Edit Mode Toggle ──────────────────────────────────────── */
  function setEditMode(active) {
    isEditMode = active;
    if (active) {
      document.body.classList.add('cms-edit-active');
    } else {
      document.body.classList.remove('cms-edit-active');
    }
    updateToolbar();
  }

  /* ── Floating Toolbar ──────────────────────────────────────── */
  function createToolbar() {
    if (toolbarEl) return;
    toolbarEl = document.createElement('div');
    toolbarEl.className = 'cms-float-bar';
    document.body.appendChild(toolbarEl);
    updateToolbar();
  }

  function updateToolbar(noticeText) {
    if (!toolbarEl) createToolbar();
    var dirtyCount = Object.keys(pendingChanges).length;
    var html = [
      '<div class="cms-float-badge">',
      isEditMode ? '● Đang sửa trực tiếp' : '○ Chế độ xem',
      '</div>',
      '<button type="button" class="cms-float-btn cms-float-toggle" id="cms-btn-toggle">',
      isEditMode ? 'Tắt khung' : '✏️ Điều chỉnh',
      '</button>',
      '<button type="button" class="cms-float-btn cms-float-save" id="cms-btn-save"' + (dirtyCount === 0 ? ' disabled' : '') + '>',
      dirtyCount > 0 ? '💾 Lưu thay đổi (' + dirtyCount + ')' : '💾 Lưu thay đổi',
      '</button>',
    ];

    if (noticeText) {
      html.push('<span class="cms-float-notice">' + noticeText + '</span>');
    }

    toolbarEl.innerHTML = html.join('');

    var toggleBtn = document.getElementById('cms-btn-toggle');
    if (toggleBtn) {
      toggleBtn.onclick = function () {
        setEditMode(!isEditMode);
        window.parent.postMessage({ type: 'gedeco-cms-mode-changed', active: isEditMode }, '*');
      };
    }

    var saveBtn = document.getElementById('cms-btn-save');
    if (saveBtn) {
      saveBtn.onclick = function () {
        saveChanges();
      };
    }
  }

  /* ── Save Changes to API ───────────────────────────────────── */
  function saveChanges() {
    var changes = Object.values(pendingChanges);
    if (!changes.length) return;

    updateToolbar('Đang lưu...');
    fetch('/api/site-content/inline-save', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pageKey: pageKey(), changes: changes }),
    })
      .then(function (r) { return r.json(); })
      .then(function (res) {
        if (res.ok) {
          pendingChanges = {};
          annotated.forEach(function (item) {
            if (item.el) item.el.classList.remove('cms-dirty');
            if (item.btn) item.btn.classList.remove('cms-dirty');
          });
          updateToolbar('✅ Đã lưu thành công!');
          setTimeout(function () { updateToolbar(); }, 2500);
          window.parent.postMessage({ type: 'gedeco-cms-saved', count: res.savedCount }, '*');
        } else {
          updateToolbar('❌ ' + (res.error || 'Lỗi lưu'));
        }
      })
      .catch(function () {
        updateToolbar('❌ Không thể lưu');
      });
  }

  /* ── Parent Message Listener ───────────────────────────────── */
  window.addEventListener('message', function (e) {
    if (!e.data) return;

    if (e.data.type === 'gedeco-cms-toggle-mode') {
      setEditMode(Boolean(e.data.active));
    }

    if (e.data.type === 'gedeco-cms-trigger-save') {
      saveChanges();
    }

    if (e.data.type === 'gedeco-cms-media-picked' && e.data.id) {
      var rowId = e.data.id;
      var newUrl = e.data.url;

      // 1. Regular <img> replacement
      var imgTarget = annotated.find(function (item) { return item.row.id === rowId && item.isImg; });
      if (imgTarget) {
        imgTarget.el.src = newUrl;
        if (e.data.altText) imgTarget.el.alt = e.data.altText;
        imgTarget.el.classList.add('cms-dirty');
      }

      // 2. Banner / background replacement
      var bannerTarget = annotated.find(function (item) { return item.row.id === rowId && item.isBanner; });
      if (bannerTarget) {
        if (bannerTarget.btn) bannerTarget.btn.classList.add('cms-dirty');
        if (bannerTarget.el) {
          bannerTarget.el.style.backgroundImage = "url('" + newUrl + "')";
        }
      }

      // Stage pending change
      pendingChanges[rowId] = {
        id: rowId,
        imageUrl: newUrl,
        altText: e.data.altText,
        imageCaption: e.data.caption,
      };

      updateToolbar();
      window.parent.postMessage({
        type: 'gedeco-cms-dirty',
        count: Object.keys(pendingChanges).length,
      }, '*');
    }

    if (e.data.type === 'gedeco-cms-refresh') {
      fetchAndAnnotate();
    }
  });

  /* ── Boot ──────────────────────────────────────────────────── */
  function fetchAndAnnotate() {
    var pk = pageKey();
    fetch('/api/site-content/fields?page=' + pk, { cache: 'no-store' })
      .then(function (r) { return r.json(); })
      .then(function (data) {
        var rows = data.rows || [];
        annotate(rows);
        createToolbar();
        window.parent.postMessage({ type: 'gedeco-cms-ready', pageKey: pk, count: rows.length }, '*');
      })
      .catch(function () {
        window.parent.postMessage({ type: 'gedeco-cms-ready', pageKey: pk, count: 0 }, '*');
      });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', fetchAndAnnotate);
  } else {
    fetchAndAnnotate();
  }
})();
