(function () {
  'use strict';

  document.querySelectorAll('[data-current-year], #current-year').forEach(function (node) {
    node.textContent = String(new Date().getFullYear());
  });


  function normalizeLegalFooters() {
    var locale = getLocale();
    var copies = {
      en: { labels: ['Privacy Policy', 'Terms of Use', 'Editorial Policy', 'Credits'], routes: ['/privacy-policy/', '/terms-of-use/', '/editorial-policy/', '/credits/'] },
      pt: { labels: ['Pol\u00edtica de Privacidade', 'Termos de Uso', 'Pol\u00edtica Editorial', 'Cr\u00e9ditos'], routes: ['/pt/politica-de-privacidade/', '/pt/termos-de-uso/', '/pt/politica-editorial/', '/pt/creditos/'] },
      es: { labels: ['Pol\u00edtica de Privacidad', 'T\u00e9rminos de Uso', 'Pol\u00edtica Editorial', 'Cr\u00e9ditos'], routes: ['/es/politica-de-privacidad/', '/es/terminos-de-uso/', '/es/politica-editorial/', '/es/creditos/'] }
    }[locale] || null;
    if (!copies) return;
    document.querySelectorAll('.footer-legal-inline').forEach(function (group) {
      var links = Array.prototype.slice.call(group.querySelectorAll('a.footer-legal-link'));
      if (links.length === 3) {
        var editorial = document.createElement('a');
        var separator = document.createElement('span');
        editorial.className = 'footer-legal-link';
        separator.setAttribute('aria-hidden', 'true');
        separator.textContent = '/';
        group.insertBefore(editorial, links[2]);
        group.insertBefore(separator, links[2]);
        links.splice(2, 0, editorial);
      }
      links.slice(0, 4).forEach(function (link, index) {
        link.textContent = copies.labels[index];
        link.href = addSiteBase(copies.routes[index]);
      });
    });
  }
  normalizeLegalFooters();

  if (window.PkLavcSpotlightNavigation) {
    return;
  }

  // Inline Lucide icons retained from the source component.
  var ICONS = {
    home: '<path d="M3 10.8 12 3l9 7.8" fill="currentColor" stroke="none"></path><path d="M5 10v10h14V10" fill="none"></path><path d="M9 20v-6h6v6" fill="none"></path>',
    user: '<path d="M19 21a7 7 0 0 0-14 0"></path><circle cx="12" cy="7" r="4"></circle>',
    settings: '<circle cx="12" cy="12" r="9"></circle><path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18"></path>'
  };

  // Official Lucide SVG files kept locally so their color remains CSS-editable.
  var ICON_FILES = {
    layers: 'assets/icons/navigation/layers.svg',
    newspaper: 'assets/icons/navigation/newspaper.svg',
    store: 'assets/icons/navigation/store.svg'
  };

  var COPY = {
    en: {
      navigation: 'Primary navigation',
      items: ['Home', 'About', 'Blog', 'Store', 'Language'],
      languageMenu: 'Choose language'
    },
    pt: {
      navigation: 'Navega\u00e7\u00e3o principal',
      items: ['In\u00edcio', 'Sobre', 'Blog', 'Loja', 'Idioma'],
      languageMenu: 'Escolher idioma'
    },
    es: {
      navigation: 'Navegaci\u00f3n principal',
      items: ['Inicio', 'Sobre', 'Blog', 'Tienda', 'Idioma'],
      languageMenu: 'Elegir idioma'
    }
  };

  var LANGUAGES = [
    { locale: 'en', label: 'English' },
    { locale: 'pt', label: 'Portugu\u00eas' },
    { locale: 'es', label: 'Espa\u00f1ol' }
  ];

  var state = {
    navigationObserver: null
  };

  function getSiteBase() {
    if (/^(localhost|127\.0\.0\.1)$/.test(window.location.hostname)) return '/';
    if (document.documentElement.hasAttribute('data-site-base-local')) return '/';
    var base = document.documentElement.getAttribute('data-site-base');
    if (base) return normalizePath(base);

    var path = window.location.pathname || '/';
    var aboutIndex = path.lastIndexOf('/about/');
    var localizedAboutIndex = path.lastIndexOf('/sobre/');
    var aboutStart = Math.max(aboutIndex, localizedAboutIndex);
    if (aboutStart >= 0) return normalizePath(path.slice(0, aboutStart + 1) || '/');

    var blogIndex = path.lastIndexOf('/blog/');
    if (blogIndex >= 0) return normalizePath(path.slice(0, blogIndex + 1) || '/');

    var storeIndex = path.lastIndexOf('/store/');
    if (storeIndex >= 0) return normalizePath(path.slice(0, storeIndex + 1) || '/');
    return '/';
  }

  function addSiteBase(path) {
    var route = normalizePath(path);
    var base = getSiteBase();
    if (base === '/') return route;
    return normalizePath(base + route.replace(/^\//, ''));
  }

  function stripSiteBase(path) {
    var normalized = normalizePath(path);
    var base = getSiteBase();
    if (base === '/' || normalized.indexOf(base) !== 0) return normalized;
    return normalizePath('/' + normalized.slice(base.length));
  }

  function normalizePath(path) {
    var normalized = String(path || '/').replace(/\/index\.html$/i, '/');
    if (normalized.charAt(0) !== '/') normalized = '/' + normalized;
    if (!/\.[a-z0-9]+$/i.test(normalized) && normalized.slice(-1) !== '/') normalized += '/';
    return normalized;
  }

  function getLocale() {
    if (window.PkLavcI18n && typeof window.PkLavcI18n.getCurrentLanguage === 'function') {
      return window.PkLavcI18n.getCurrentLanguage();
    }

    var path = stripSiteBase(normalizePath(window.location.pathname));
    if (/^\/blog\/(?:pt|es)\//.test(path) || /^\/store\/(?:pt|es)\//.test(path)) {
      return path.split('/')[2];
    }
    if (/^\/(?:pt|es)\//.test(path)) return path.split('/')[1];
    return 'en';
  }

  function localizedRoute(route, locale) {
    if (!/^(localhost|127\.0\.0\.1)$/.test(window.location.hostname) && window.PkLavcI18n && typeof window.PkLavcI18n.getLocalizedRoute === 'function') {
      return window.PkLavcI18n.getLocalizedRoute(route, locale);
    }

    if (route === '/') return addSiteBase(locale === 'en' ? '/' : '/' + locale + '/');
    if (route === '/blog/') return addSiteBase(locale === 'en' ? '/blog/' : '/blog/' + locale + '/');
    if (route === '/store/') return addSiteBase(locale === 'en' ? '/store/' : '/store/' + locale + '/');

    var translated = {
      pt: { '/about/': '/pt/sobre/', '/privacy-policy/': '/pt/politica-de-privacidade/', '/terms-of-use/': '/pt/termos-de-uso/', '/editorial-policy/': '/pt/politica-editorial/', '/credits/': '/pt/creditos/' },
      es: { '/about/': '/es/sobre/', '/privacy-policy/': '/es/politica-de-privacidad/', '/terms-of-use/': '/es/terminos-de-uso/', '/editorial-policy/': '/es/politica-editorial/', '/credits/': '/es/creditos/' }
    };

    return addSiteBase(locale === 'en' ? route : translated[locale][route]);
  }

  function getEnglishRoute(path) {
    var routePath = stripSiteBase(normalizePath(path));
    var pairs = [
      ['/pt/sobre/', '/about/'], ['/es/sobre/', '/about/'],
      ['/pt/politica-de-privacidade/', '/privacy-policy/'], ['/es/politica-de-privacidad/', '/privacy-policy/'],
      ['/pt/termos-de-uso/', '/terms-of-use/'], ['/es/terminos-de-uso/', '/terms-of-use/'],
      ['/pt/politica-editorial/', '/editorial-policy/'], ['/es/politica-editorial/', '/editorial-policy/'],
      ['/pt/creditos/', '/credits/'], ['/es/creditos/', '/credits/']
    ];
    for (var index = 0; index < pairs.length; index += 1) {
      if (routePath === pairs[index][0]) return pairs[index][1];
    }
    return routePath;
  }
  function getActiveIndex(path) {
    var routePath = stripSiteBase(normalizePath(path));
    if (window.PkLavcI18n && typeof window.PkLavcI18n.getEnglishRoute === 'function') {
      routePath = normalizePath(window.PkLavcI18n.getEnglishRoute(addSiteBase(routePath)));
      routePath = stripSiteBase(routePath);
    }
    if (document.documentElement.hasAttribute('data-blog-navigation') && routePath === '/') return 2;
    var section = routePath.split('/').filter(Boolean)[0] || '';
    if (section === 'blog') return 2;
    if (section === 'store') return 3;
    if (['about', 'sobre', 'resume', 'uses', 'now', 'certifications', 'visitors', 'visitantes'].indexOf(section) !== -1) return 1;
    return 0;
  }

  function createIcon(markup) {
    return '<svg class="spotlight-navigation-icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false">' + markup + '</svg>';
  }

  function appendCurrentLocation(targetPath) {
    return targetPath + String(window.location.search || '') + String(window.location.hash || '');
  }

  function getLanguageTarget(locale) {
    var i18n = window.PkLavcI18n;

    if (i18n && typeof i18n.getEnglishRoute === 'function' && typeof i18n.getLocalizedRoute === 'function') {
      return appendCurrentLocation(i18n.getLocalizedRoute(i18n.getEnglishRoute(window.location.pathname), locale));
    }

    var currentRoute = stripSiteBase(normalizePath(window.location.pathname));
    var legalRoutes = ['/privacy-policy/', '/terms-of-use/', '/editorial-policy/', '/credits/'];
    var localizedLegalRoutes = locale === 'pt'
      ? ['/pt/politica-de-privacidade/', '/pt/termos-de-uso/', '/pt/politica-editorial/', '/pt/creditos/']
      : ['/es/politica-de-privacidad/', '/es/terminos-de-uso/', '/es/politica-editorial/', '/es/creditos/'];
    var englishLegalRoute = currentRoute;
    for (var i = 0; i < localizedLegalRoutes.length; i += 1) {
      if (currentRoute === localizedLegalRoutes[i]) englishLegalRoute = legalRoutes[i];
    }
    return appendCurrentLocation(localizedRoute(englishLegalRoute, locale));
  }

  function setCurrentItem(items, activeIndex) {
    items.forEach(function (item, index) {
      item.classList.toggle('is-active', index === activeIndex);

      if (index === activeIndex) {
        item.setAttribute('aria-current', 'page');
      } else {
        item.removeAttribute('aria-current');
      }
    });
  }

  function updateIndicator(nav, item) {
    if (!item) return;

    var icon = item.querySelector('.spotlight-navigation-icon');
    if (!icon) return;

    var navRect = nav.getBoundingClientRect();
    var isCompact = window.innerWidth <= 620;
    var indicatorWidth = isCompact ? (window.innerWidth <= 360 ? 44 : 48) : item.getBoundingClientRect().width;
    var itemRect = item.getBoundingClientRect();
    var iconRect = icon.getBoundingClientRect();
    var indicatorLeft = isCompact
      ? iconRect.left - navRect.left + (iconRect.width / 2) - (indicatorWidth / 2)
      : itemRect.left - navRect.left;

    nav.style.setProperty('--spotlight-indicator-left', indicatorLeft + 'px');
    nav.style.setProperty('--spotlight-indicator-width', indicatorWidth + 'px');
    nav.style.setProperty('--spotlight-item-left', (itemRect.left - navRect.left) + 'px');
  }

  function setPresentedItem(nav, items, presentedIndex, animate) {
    nav.style.setProperty('--spotlight-active-index', String(presentedIndex));
    nav.classList.toggle('is-moving', animate === true);

    items.forEach(function (item, index) {
      var isPresented = index === presentedIndex;
      item.style.setProperty('--spotlight-opacity', '1');
      item.classList.toggle('is-presented', isPresented && animate !== true);
    });

    updateIndicator(nav, items[presentedIndex]);
    if (animate === true) {
      window.setTimeout(function () {
        if (!nav.isConnected || Number(nav.style.getPropertyValue('--spotlight-active-index')) !== presentedIndex) return;
        nav.classList.remove('is-moving');
        items[presentedIndex].classList.add('is-presented');
      }, 420);
    }
  }

  function createNavigation() {
    if (document.getElementById('spotlight-navigation')) return;

    var locale = getLocale();
    var copy = COPY[locale] || COPY.en;
    var activeIndex = getActiveIndex(window.location.pathname);
    var definitions = [
      { icon: ICONS.home, route: '/' },
      { icon: ICONS.user, route: '/about/' },
      { iconFile: ICON_FILES.newspaper, route: '/blog/' },
      { iconFile: ICON_FILES.store, route: '/store/' },
      { icon: ICONS.settings, action: 'language' }
    ];
    var shell = document.createElement('div');
    var nav = document.createElement('nav');

    shell.className = 'spotlight-navigation-shell';
    shell.id = 'spotlight-navigation-shell';
    nav.className = 'spotlight-navigation';
    nav.id = 'spotlight-navigation';
    nav.setAttribute('aria-label', copy.navigation);

    definitions.forEach(function (definition, index) {
      var control = document.createElement(definition.action ? 'button' : 'a');
      control.className = 'spotlight-navigation-item';

      if (definition.action) {
        control.type = 'button';
        control.dataset.spotlightAction = definition.action;
        control.setAttribute('aria-haspopup', 'menu');
        control.setAttribute('aria-expanded', 'false');
        control.setAttribute('aria-controls', 'spotlight-language-menu');
      } else {
        control.href = localizedRoute(definition.route, locale);
      }

      control.setAttribute('aria-label', copy.items[index]);
      control.dataset.spotlightIndex = String(index);

      if (definition.iconFile) {
        var iconMask = document.createElement('span');
        iconMask.className = 'spotlight-navigation-icon spotlight-navigation-icon-mask';
        iconMask.setAttribute('aria-hidden', 'true');
        iconMask.style.setProperty('--spotlight-icon-url', 'url("' + addSiteBase('/' + definition.iconFile) + '")');
        control.appendChild(iconMask);
      } else {
        control.innerHTML = createIcon(definition.icon);
      }

      var label = document.createElement('span');
      label.className = 'spotlight-navigation-label';
      label.setAttribute('aria-hidden', 'true');
      label.textContent = copy.items[index];
      control.appendChild(label);
      nav.appendChild(control);
    });

    shell.appendChild(nav);
    document.body.appendChild(shell);
    document.body.classList.add('spotlight-navigation-enabled');

    var items = Array.prototype.slice.call(nav.querySelectorAll('.spotlight-navigation-item'));
    var languageIndex = definitions.length - 1;
    var languageButton = items[languageIndex];
    var presentedIndex = activeIndex;
    setCurrentItem(items, activeIndex);
    setPresentedItem(nav, items, presentedIndex);

    function present(index, animate) {
      presentedIndex = index;
      setPresentedItem(nav, items, presentedIndex, animate);
    }

    var languageMenu = document.createElement('div');
    languageMenu.className = 'spotlight-language-menu';
    languageMenu.id = 'spotlight-language-menu';
    languageMenu.setAttribute('role', 'menu');
    languageMenu.setAttribute('aria-label', copy.languageMenu);
    languageMenu.hidden = true;

    LANGUAGES.forEach(function (language) {
      var option = document.createElement('a');
      var isCurrent = language.locale === locale;
      option.className = 'spotlight-language-option';
      option.href = getLanguageTarget(language.locale);
      option.textContent = language.label;
      option.setAttribute('role', 'menuitem');
      option.dataset.languageOption = language.locale;
      option.classList.toggle('is-current-language', isCurrent);

      if (isCurrent) option.setAttribute('aria-current', 'true');

      option.addEventListener('click', function (event) {
        var i18n = window.PkLavcI18n;
        if (i18n && typeof i18n.setStoredLanguage === 'function') {
          i18n.setStoredLanguage(language.locale);
        }

        if (language.locale === locale) {
          event.preventDefault();
          setLanguageMenuOpen(false);
          languageButton.focus();
          return;
        }

        if (i18n && typeof i18n.getEnglishRoute === 'function' && typeof i18n.resolveLocalizedRoute === 'function') {
          event.preventDefault();
          i18n.resolveLocalizedRoute(i18n.getEnglishRoute(window.location.pathname), language.locale).then(function (targetPath) {
            window.location.assign(appendCurrentLocation(targetPath));
          });
        }
      });

      languageMenu.appendChild(option);
    });

    shell.insertBefore(languageMenu, nav);

    function setLanguageMenuOpen(shouldOpen) {
      shell.classList.toggle('is-language-menu-open', shouldOpen);
      document.body.classList.toggle('spotlight-language-menu-open', shouldOpen);
      languageMenu.hidden = !shouldOpen;
      languageButton.setAttribute('aria-expanded', shouldOpen ? 'true' : 'false');
      present(shouldOpen ? languageIndex : activeIndex, true);
    }

    languageButton.addEventListener('click', function (event) {
      event.preventDefault();
      event.stopPropagation();
      setLanguageMenuOpen(languageMenu.hidden);
    });

    items.forEach(function (item, index) {
      item.addEventListener('pointerenter', function () {
        present(index, true);
      });
      item.addEventListener('focus', function () {
        present(index, true);
      });
    });

    nav.addEventListener('pointerleave', function () {
      present(languageMenu.hidden ? activeIndex : languageIndex, true);
    });

    nav.addEventListener('focusout', function (event) {
      if (!nav.contains(event.relatedTarget)) present(languageMenu.hidden ? activeIndex : languageIndex, true);
    });

    document.addEventListener('click', function (event) {
      if (!languageMenu.hidden && !shell.contains(event.target)) {
        setLanguageMenuOpen(false);
      }
    });

    document.addEventListener('keydown', function (event) {
      if (event.key === 'Escape' && !languageMenu.hidden) {
        setLanguageMenuOpen(false);
        languageButton.focus();
      }
    });

    window.addEventListener('resize', function () {
      updateIndicator(nav, items[presentedIndex]);
    }, { passive: true });

    window.addEventListener('load', function () {
      updateIndicator(nav, items[presentedIndex]);
    }, { once: true });

    if ('ResizeObserver' in window) {
      state.navigationObserver = new ResizeObserver(function () {
        updateIndicator(nav, items[presentedIndex]);
      });
      state.navigationObserver.observe(nav);
      items.forEach(function (item) {
        state.navigationObserver.observe(item);
      });
    }
  }

  function init() {
    createNavigation();
  }

  window.PkLavcSpotlightNavigation = {
    init: init
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init, { once: true });
  } else {
    init();
  }
}());
