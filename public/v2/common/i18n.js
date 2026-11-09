(() => {
  const langs = [
    ['en-GB', 'English'],
    ['af-ZA', 'Afrikaans'],
    ['es-ES', 'Español'],
    ['fr-FR', 'Français'],
    ['pl-PL', 'Polski']
  ];
  const supported = new Map(langs.map(([code]) => [code.toLowerCase(), code]));
  const primary = value => {
    if (!value) return null;
    const exact = supported.get(String(value).toLowerCase());
    if (exact) return exact;
    return ({ af: 'af-ZA', es: 'es-ES', fr: 'fr-FR', pl: 'pl-PL', en: 'en-GB' })[String(value).split('-')[0].toLowerCase()] || null;
  };
  const params = new URLSearchParams(location.search);
  let stored = null;
  try { stored = localStorage.getItem('i18nextLng'); } catch {}
  const requested = primary(params.get('lang'));
  if (requested) {
    try { localStorage.setItem('i18nextLng', requested); } catch {}
  }
  const lang = requested || primary(stored) || (navigator.languages || []).map(primary).find(Boolean) || 'en-GB';
  const pluralRules = new Intl.PluralRules(lang);
  let locale = { ui: {} };

  document.documentElement.lang = lang;

  const copy = {
    'switch.language': 'Language',
    'switch.close': 'Close language menu',
    'home.nav.aria': 'Choose a path',
    'home.enter.sound': 'Enter with sound',
    'home.enter.silence': 'Enter in silence',
    'home.silence': 'Silence',
    'home.sounding': 'Sounding',
    'home.credits': 'Credits',
    'home.credits.aria': 'Credits',
    'home.hint': 'drift through the dark · click to light a candle',
    'home.portal.river.title': 'The River of Time',
    'home.portal.river.description': "Watch composers' lives braid together, and see history shake them.",
    'home.portal.hall.title': 'The Concert Hall',
    'home.portal.hall.description': 'Take your seat as the players walk on. Every era, instrument and voice, from a candlelit chapel to the modern stage.',
    'home.portal.lexicon.title': 'The Lexicon',
    'home.portal.lexicon.description': 'Allegro, pizzicato, crescendo: the words of music, heard as well as read.',
    'home.title': 'Requiem of Everything',
    'home.subtitle': 'Six centuries of music, drawn in light.',
    'home.invitation': 'Come in — the hall is already tuning.',
    'home.credits.title': 'Credits',
    'home.credits.shader': 'Nothing on this page is a picture. The light, the haze and the slow procession of embers come from one fragment shader.',
    'home.credits.sound': 'The chords are played live from sampled instruments, in a concert hall that is only an equation.',
    'home.credits.drift': 'Drift through the dark and the',
    'home.credits.answers': 'answers you. Click anywhere to light a',
    'home.credits.choir': 'and the choir will sing for it.',
    'home.credits.creator': 'Creator · vision · curation',
    'home.credits.firstEdition': 'The first edition',
    'home.credits.rebuild': 'The rebuild · light, sound & prototypes',
    'home.credits.samples': 'Samples: MusyngKite soundfont via',
    'home.credits.lighting': 'Lighting inspired by',
    'home.credits.biographies': 'Biographies courtesy of Wikipedia contributors.',
    'home.credits.orchestral': '(CC BY-SA 3.0). Orchestral samples: VSCO 2 Community Edition (Versilian Studios, CC0). Choir, harpsichord and celesta samples: Sonatina Symphonic Orchestra (Mattias Westlund, CC Sampling Plus 1.0).',
    'nav.home': 'Requiem of Everything, home',
    'nav.home.title': 'Home',
    'nav.river': 'River of Time',
    'nav.hall': 'Concert Hall',
    'nav.lexicon': 'Lexicon',
    'nav.menu': 'Menu',
    'river.title': 'The River of Time',
    'river.region.americas': 'Americas',
    'river.region.british-isles': 'British Isles',
    'river.region.nordic': 'Nordic',
    'river.region.russia': 'Russia',
    'river.region.central-europe': 'Central Europe',
    'river.region.german-lands': 'German lands',
    'river.region.france': 'France',
    'river.region.iberia': 'Iberia',
    'river.region.italy': 'Italy',
    'river.subtitle': 'Every thread is a life. Thick where the music poured out, bright when the world was listening.',
    'river.find.placeholder': 'Find a composer…',
    'river.find.aria': 'Find a composer',
    'river.find.clear': 'Clear composer search',
    'river.find.clear.title': 'Clear search',
    'river.find.matches': 'Composer matches',
    'river.find.empty': 'No composer by that name',
    'river.sounding': 'Sounding',
    'river.silence': 'Silence',
    'river.events.lifetime': 'In their lifetime',
    'river.listen': 'Listen on Spotify',
    'river.more': '↓ scroll for more',
    'river.close': 'click outside to close',
    'river.legend.music': 'Music written',
    'river.legend.standing': 'Public standing',
    'river.legend.world': 'The world',
    'river.event.war': 'War',
    'river.event.revolution': 'Revolution',
    'river.event.politics': 'Politics',
    'river.event.invention': 'Invention',
    'river.event.science': 'Science',
    'river.event.faith': 'Faith',
    'river.event.cultural': 'Culture',
    'river.event.literary': 'Literature',
    'river.event.natural-disaster': 'Natural disaster',
    'river.event.contemporary': 'Contemporary',
    'river.hint': 'scroll to zoom · drag to travel · click a thread to open a life · hover a country or event to light its composers',
    'river.life.estimated': 'Sketch estimated from works in our catalogue',
    'river.zoom.range': '{start} — {end}',
    'river.tooltip.years': '{count} year',
    'river.tooltip.years_one': '{count} year',
    'river.tooltip.years_other': '{count} years',
    'river.tooltip.country': 'Country',
    'river.tooltip.pin': 'click to pin',
    'river.tooltip.unpin': 'click to unpin',
    'river.tooltip.composers_one': '{count} composer in view lived or worked here',
    'river.tooltip.composers_other': '{count} composers in view lived or worked here',
    'hall.sounding': 'Sounding',
    'hall.silence': 'Silence',
    'hall.hint.one': 'click a section or the podium to meet them',
    'hall.hint.two': 'change the era to watch the players walk off and on',
    'hall.baton': 'Raise the baton',
    'hall.about': 'About this era',
    'hall.composer.select': 'Choose a composer',
    'hall.instrument.select': 'Choose an instrument or voice',
    'hall.share': 'Share this view',
    'hall.card.throughEras': 'Through the eras',
    'hall.card.onStageNow': 'on stage now',
    'hall.card.greatPlayers': 'Great players',
    'hall.card.greatest': 'Widely called the greatest',
    'hall.card.hearShine': 'Hear it shine',
    'hall.card.hearAlone': 'Hear it alone',
    'hall.card.listen': 'Listen on Spotify',
    'hall.tooltip.clickMeet': 'click to meet',
    'hall.tooltip.composer': 'click to meet the composer',
    'hall.tooltip.podium': 'pick a composer or piece below',
    'hall.tooltip.podiumTitle': 'The podium',
    'hall.tooltip.player_one': '{count} player',
    'hall.tooltip.player_other': '{count} players',
    'hall.tooltip.family': '{family} · click to meet',
    'hall.share.copied': 'Link copied',
    'hall.share.copy': 'Copy link',
    'hall.about.close': 'Close',
    'hall.filter.composer': 'Composer…',
    'hall.filter.instrument': 'Instrument or voice…',
    'hall.family.strings': 'Strings',
    'hall.family.winds': 'Woodwinds',
    'hall.family.brass': 'Brass',
    'hall.family.percussion': 'Percussion',
    'hall.family.keyboards': 'Keyboards',
    'hall.family.voices': 'Voices',
    'hall.prominence.none': 'No',
    'hall.prominence.primary': 'Primary',
    'hall.prominence.secondary': 'Secondary',
    'hall.prominence.occasional': 'Occasional',
    'hall.prominence.rare': 'Rare',
    'hall.performers_one': '{count} performer on stage',
    'hall.performers_few': '{count} performers on stage',
    'hall.performers_many': '{count} performers on stage',
    'hall.performers_other': '{count} performers on stage',
    'hall.composer.label': 'Composer ·',
    'hall.composer.orchestra': '{name}’s orchestra',
    'hall.composer.lead': 'The {era} era, as {composer} knew it',
    'hall.composers.ofEra': 'Composers of this era ·',
    'hall.card.range': 'Range {range}',
    'hall.card.works': 'Works to hear',
    'hall.card.followLife': 'Follow the life in the River of Time',
    'hall.card.seatOrchestra': 'Seat their orchestra',
    'hall.about.less': 'Less',
    'hall.era.renaissance': 'Renaissance',
    'hall.era.baroque': 'Baroque',
    'hall.era.classical': 'Classical',
    'hall.era.romantic': 'Romantic',
    'hall.era.modern': 'Modern',
    'lexicon.title': 'THE LEXICON',
    'lexicon.subtitle': 'the words of music, heard as well as read · drag to turn, scroll to fly closer',
    'lexicon.search.placeholder': 'find a word…',
    'lexicon.search.aria': 'Find a word',
    'lexicon.group.all': 'All words',
    'lexicon.group.tempo': 'Speed',
    'lexicon.group.dyn': 'Loud & soft',
    'lexicon.group.play': 'Ways of playing',
    'lexicon.group.tex': 'Sound & texture',
    'lexicon.group.form': 'Shapes of music',
    'lexicon.group.genre': 'Kinds of music',
    'lexicon.group.voice': 'Voices & words',
    'lexicon.group.dance': 'Dances & characters',
    'lexicon.group.people': 'People & the concert',
    'lexicon.term.tookShape': 'Took shape in the {eras} era',
    'lexicon.term.hearIn': 'Hear it in',
    'lexicon.term.hear': 'Hear it',
    'lexicon.term.hearAgain': 'Hear it again',
    'lexicon.term.tuning': 'Tuning…',
    'lexicon.term.listen': 'Listen on Spotify',
    'lexicon.term.rollPrompt': 'press “Hear it” and watch the notes',
    'lexicon.term.seeHall': 'See it in the Concert Hall',
    'lexicon.rotate': 'Please rotate your device to landscape',
    'lexicon.tip.drag': 'drag to turn',
    'lexicon.tip.zoom': 'scroll to fly closer',
    'common.loading': 'Loading…'
  };

  const t = (key, vars = {}) => {
    const count = vars.count;
    const plural = count === undefined ? null : pluralRules.select(Number(count));
    const value = plural && (locale.ui[`${key}_${plural}`] ?? locale.ui[`${key}_other`] ?? copy[`${key}_${plural}`] ?? copy[`${key}_other`])
      || locale.ui[key] || copy[key] || key;
    return String(value).replace(/\{([\w.]+)\}/g, (_, name) => {
      const replacement = name === 'count' ? count : vars[name];
      return replacement === undefined ? `{${name}}` : String(replacement);
    });
  };

  function sourceForPage() {
    const page = location.pathname.split('/').pop();
    const required = ['ROE_DATA'];
    if (page === 'river.html' || page === 'hall.html') required.push('ROE_LIVES');
    if (page === 'hall.html') required.push('ROE_INSTR_EXTRA', 'ROE_INSTR_ERAS', 'ROE_HALL');
    if (page === 'terms.html') required.push('ROE_TERMS_BASE', 'ROE_TERMS_NEW', 'ROE_TERMS_MAP');
    return required;
  }

  function waitForPageData() {
    const names = sourceForPage();
    return new Promise(resolve => {
      const check = () => names.every(name => window[name] !== undefined) ? resolve() : setTimeout(check, 0);
      check();
    });
  }

  function loadLocale() {
    if (lang === 'en-GB') return Promise.resolve({ lang, ui: {} });
    window.ROE_LOCALE = null;
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = new URL(`locales/${lang}.js`, document.currentScript.src).href;
      script.onload = () => resolve(window.ROE_LOCALE || { lang, ui: {} });
      script.onerror = () => reject(new Error(`Could not load locale ${lang}`));
      document.head.append(script);
    });
  }

  function translateNav() {
    const nav = document.querySelector('.sigil');
    if (!nav) return;
    const home = nav.querySelector('.mark');
    if (home) {
      home.setAttribute('aria-label', t('nav.home'));
      home.title = t('nav.home.title');
    }
    const labels = { 'river.html': t('nav.river'), 'hall.html': t('nav.hall'), 'terms.html': t('nav.lexicon') };
    for (const link of nav.querySelectorAll('a:not(.mark)')) {
      const page = link.getAttribute('href');
      if (Object.hasOwn(labels, page)) link.textContent = labels[page];
    }
    const burger = nav.querySelector('.sigil-burger');
    if (!burger) return;
    burger.setAttribute('aria-label', t('nav.menu'));
    burger.title = t('nav.menu');
    const setOpen = open => {
      nav.classList.toggle('open', open);
      burger.setAttribute('aria-expanded', String(open));
    };
    burger.addEventListener('click', () => setOpen(!nav.classList.contains('open')));
    nav.addEventListener('keydown', event => {
      if (event.key === 'Escape' && nav.classList.contains('open')) { event.stopPropagation(); setOpen(false); burger.focus(); }
    });
    nav.addEventListener('focusout', event => { if (!nav.contains(event.relatedTarget)) setOpen(false); });
    document.addEventListener('pointerdown', event => { if (!nav.contains(event.target)) setOpen(false); });
  }

  function mergeRecords(records, translations) {
    if (!Array.isArray(records)) return;
    for (const record of records) {
      if (Object.hasOwn(record, 'nationality')) record.nationalityKey ??= record.nationality;
      const translated = translations?.[record.id];
      if (translated) Object.assign(record, translated);
    }
  }

  function applyTranslations() {
    const data = window.ROE_DATA;
    const translation = locale || {};
    for (const namespace of ['composers', 'compositions', 'eras', 'events', 'instruments']) {
      mergeRecords(data[namespace], translation[namespace]);
    }

    const lives = translation.lives || {};
    for (const [id, translated] of Object.entries(lives)) {
      const life = window.ROE_LIVES?.[id];
      if (!life) continue;
      for (const [field, index] of [['pts', 3], ['links', 'text'], ['after', 2]]) {
        const values = translated[field];
        if (!Array.isArray(values)) continue;
        const items = life[field] || [];
        values.forEach((value, i) => {
          if (typeof value !== 'string' || !value || !items[i]) return;
          if (index === 'text') items[i].text = value;
          else items[i][index] = value;
        });
      }
      if (translated.note) life.note = translated.note;
    }

    const extra = translation.instrumentExtra || {};
    for (const [id, translated] of Object.entries(extra)) {
      const target = window.ROE_INSTR_EXTRA?.[id];
      if (!target) continue;
      if (translated.showcase) Object.assign(target.showcase || {}, translated.showcase);
      if (Array.isArray(translated.greats)) translated.greats.forEach((item, i) => {
        if (item && target.greats?.[i]) Object.assign(target.greats[i], item);
      });
      if (translated.goat) Object.assign(target.goat || {}, translated.goat);
    }

    for (const [id, eras] of Object.entries(translation.instrumentEras || {})) {
      const target = window.ROE_INSTR_ERAS?.[id];
      if (target) Object.assign(target, eras);
    }

    const hall = translation.hall || {};
    for (const [id, fields] of Object.entries(hall.eras || {})) {
      const target = window.ROE_HALL?.L?.[id];
      if (target) Object.assign(target, fields);
    }
    for (const [id, fields] of Object.entries(hall.pieces || {})) {
      const target = window.ROE_HALL?.PIECES?.find(piece => piece.id === id);
      if (target) Object.assign(target, fields);
    }
    for (const [id, label] of Object.entries(hall.sections || {})) {
      const target = window.ROE_HALL?.S?.[id];
      if (target && typeof label === 'string') target[0] = label;
    }
    for (const [id, label] of Object.entries(hall.shortSections || {})) {
      const target = window.ROE_HALL?.S?.[id];
      if (target?.length > 7 && typeof label === 'string') target[7] = label;
    }

    const terms = translation.terms || {};
    const baseFields = { term: ['term'], shortDefinition: ['short', 'shortDefinition'], longDefinition: ['long', 'longDefinition'] };
    for (const term of window.ROE_TERMS_BASE || []) {
      const translated = terms[term.id];
      if (!translated) continue;
      for (const [field, sources] of Object.entries(baseFields)) {
        const value = sources.map(source => translated[source]).find(value => value !== undefined);
        if (value !== undefined) term[field] = value;
      }
    }
    for (const term of window.ROE_TERMS_NEW || []) {
      const translated = terms[term.id];
      if (translated) Object.assign(term, translated);
    }
  }

  function installSwitcher() {
    if (document.getElementById('roe-language')) return;
    const root = document.createElement('div');
    root.id = 'roe-language';
    root.className = 'roe-language';
    root.innerHTML = `<button class="btn roe-language-toggle" type="button" aria-label="${t('switch.language')}" aria-haspopup="listbox" aria-expanded="false"></button><div class="roe-language-menu reliquary" role="listbox" aria-label="${t('switch.language')}" hidden></div>`;
    const toggle = root.querySelector('button');
    const menu = root.querySelector('[role=listbox]');
    const current = langs.find(([code]) => code === lang);
    toggle.textContent = current[1];
    langs.forEach(([code, nativeName]) => {
      const option = document.createElement('button');
      option.type = 'button';
      option.className = 'roe-language-option';
      option.setAttribute('role', 'option');
      option.setAttribute('aria-selected', String(code === lang));
      option.textContent = nativeName;
      option.addEventListener('click', () => setLang(code));
      menu.append(option);
    });

    const soundControl = document.querySelector('#bSound, #bSilence');
    const homeSwitcher = soundControl?.parentElement?.id === 'ui';
    document.body.append(root);
    const position = () => {
      if (homeSwitcher) {
        root.style.right = '18px';
        root.style.top = '14px';
      } else if (soundControl) {
        const rect = soundControl.getBoundingClientRect();
        root.style.right = `${Math.max(12, innerWidth - rect.left + 8)}px`;
        root.style.top = `${Math.max(8, rect.top)}px`;
      } else {
        root.style.right = '18px';
        root.style.top = '14px';
      }
    };
    position();
    addEventListener('resize', position);

    const setOpen = open => {
      menu.hidden = !open;
      toggle.setAttribute('aria-expanded', String(open));
      if (open) menu.querySelector('[aria-selected=true]')?.focus();
    };
    toggle.addEventListener('pointerdown', event => event.stopPropagation());
    menu.addEventListener('pointerdown', event => event.stopPropagation());
    toggle.addEventListener('click', () => setOpen(menu.hidden));
    menu.addEventListener('keydown', event => {
      if (event.key === 'Escape') { setOpen(false); toggle.focus(); }
      if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
        event.preventDefault();
        const options = [...menu.querySelectorAll('[role=option]')];
        const currentIndex = options.indexOf(document.activeElement);
        const nextIndex = (currentIndex + (event.key === 'ArrowDown' ? 1 : -1) + options.length) % options.length;
        options[nextIndex].focus();
      }
    });
    document.addEventListener('pointerdown', event => { if (!root.contains(event.target)) setOpen(false); });
  }

  const ready = Promise.all([loadLocale(), waitForPageData()]).then(([loaded]) => {
    locale = loaded || { ui: {} };
    applyTranslations();
    translateNav();
    installSwitcher();
    return window.ROE_I18N;
  });

  function setLang(code) {
    const normalized = primary(code);
    if (!normalized) return;
    try { localStorage.setItem('i18nextLng', normalized); } catch {}
    const next = new URL(location.href);
    next.searchParams.set('lang', normalized);
    location.assign(`${next.pathname}${next.search}${next.hash}`);
  }

  const style = document.createElement('style');
  style.textContent = `
    .roe-language{z-index:1000;position:fixed;top:14px;display:flex;gap:6px;align-items:center}
    #ui .roe-language{position:relative;top:auto;right:auto}
    .roe-language-toggle{white-space:nowrap;min-width:88px}
    .roe-language-menu{position:absolute;top:calc(100% + 6px);right:0;min-width:120px;padding:5px;display:flex;flex-direction:column;gap:3px}
    .roe-language-menu[hidden]{display:none}
    .roe-language-option{border:1px solid transparent;background:transparent;color:var(--mist,#e6d8bd);font:inherit;text-align:left;padding:6px 9px;cursor:pointer}
    .roe-language-option:hover,.roe-language-option:focus-visible,.roe-language-option[aria-selected=true]{border-color:var(--gold-faint,rgba(201,165,92,.3));background:rgba(239,212,151,.08);color:#fff2d6;outline:none}
    #ui .roe-language-menu{top:auto;bottom:calc(100% + 6px)}
    @media(max-height:500px){.roe-language{top:8px}.roe-language-toggle{min-width:0;padding:5px 8px}.roe-language-menu{max-height:calc(100vh - 48px);overflow:auto}}
  `;
  document.head.append(style);

  window.ROE_I18N = { lang, langs, ready, t, setLang };
})();
