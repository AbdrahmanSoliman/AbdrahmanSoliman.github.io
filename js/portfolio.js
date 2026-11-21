(() => {
    'use strict';

    const { profile, projects } = window.PORTFOLIO;
    const root = document.documentElement;
    const view = root.dataset.view || 'home';
    const stage = document.getElementById('stage');
    const sidebar = document.getElementById('sidebar');

    // phones in either orientation (a landscape phone is wider than 900px)
    const mobileQuery = window.matchMedia('(max-width: 900px), (pointer: coarse) and (max-height: 620px)');
    const hoverQuery = window.matchMedia('(hover: hover) and (pointer: fine)');

    const ICON = {
        prev: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M19 12H5M11 6l-6 6 6 6"/></svg>',
        next: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg>',
        out: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 16 16 8M9 8h7v7"/></svg>',
        close: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18"/></svg>',
        moon: '<svg class="icon-moon" viewBox="0 0 24 24" aria-hidden="true"><path d="M19.6 14.6A8 8 0 0 1 9.4 4.4a8 8 0 1 0 10.2 10.2Z"/></svg>',
        sun: '<svg class="icon-sun" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="4"/><path d="M12 2.6v2.2M12 19.2v2.2M2.6 12h2.2M19.2 12h2.2M5.4 5.4 7 7M17 17l1.6 1.6M5.4 18.6 7 17M17 7l1.6-1.6"/></svg>'
    };

    // red-pen marks, deliberately a little uneven
    const INK = {
        underline: '<svg class="scribble" viewBox="0 0 200 12" preserveAspectRatio="none" aria-hidden="true"><path pathLength="1" d="M2 8.5c18-2.6 41-4.4 66-4.6 31-.3 54 1.6 83 .9 17-.4 30-1.6 47-3.4"/></svg>',
        loop: '<svg class="loop" viewBox="0 0 60 30" preserveAspectRatio="none" aria-hidden="true"><path pathLength="1" d="M38 2.6C22 1.4 5.2 5.4 2.6 13.6.6 21.6 12.4 27.8 30 27.4c16.6-.4 27.8-5.2 27.4-13C57 6.4 46.2 3 33.6 3.2 25 3.4 17.6 5 12.4 7.8"/></svg>'
    };

    // a stable, slightly crooked hang for each frame
    const tiltFor = (title) => {
        let h = 0;
        for (const c of title) h = (h * 31 + c.charCodeAt(0)) | 0;
        const t = ((Math.abs(h) % 1000) / 1000) * 2 - 1;
        return (Math.sign(t) * (0.3 + Math.abs(t) * 0.5)).toFixed(2) + 'deg';
    };

    const pad2 = (n) => String(n).padStart(2, '0');
    const el = (tag, className, html) => {
        const node = document.createElement(tag);
        if (className) node.className = className;
        if (html !== undefined) node.innerHTML = html;
        return node;
    };
    const escapeHtml = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

    /* ------------------------------------------------------------------
     * Motion preference (sidebar toggle, defaults to the OS setting)
     * ------------------------------------------------------------------ */
    const MOTION_KEY = 'portfolio-animations';
    const motionListeners = new Set();
    let motion = (() => {
        try {
            const saved = localStorage.getItem(MOTION_KEY);
            if (saved !== null) return saved === 'true';
        } catch (e) { /* storage unavailable */ }
        return !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    })();

    function setMotion(on, persist) {
        motion = on;
        root.classList.toggle('no-motion', !on);
        if (persist) {
            try { localStorage.setItem(MOTION_KEY, String(on)); } catch (e) { /* ignore */ }
        }
        motionListeners.forEach((fn) => fn(on));
    }
    setMotion(motion, false);

    /* ------------------------------------------------------------------
     * Theme: light by default; dark only when chosen (the inline script in
     * each page's head applies a saved choice before first paint)
     * ------------------------------------------------------------------ */
    const THEME_KEY = 'portfolio-theme';
    const themeMeta = document.querySelector('meta[name="theme-color"]');

    function syncTheme() {
        const dark = root.dataset.theme === 'dark';
        if (themeMeta) themeMeta.content = getComputedStyle(root).getPropertyValue('--paper').trim();
        document.querySelectorAll('.theme-toggle').forEach((btn) => {
            btn.setAttribute('aria-pressed', String(dark));
            btn.setAttribute('aria-label', dark ? 'Switch to light mode' : 'Switch to dark mode');
            btn.title = dark ? 'Light mode' : 'Dark mode';
        });
    }

    function setTheme(dark) {
        try { localStorage.setItem(THEME_KEY, dark ? 'dark' : 'light'); } catch (e) { /* ignore */ }
        const apply = () => {
            if (dark) root.dataset.theme = 'dark';
            else delete root.dataset.theme;
            syncTheme();
        };
        if (motion && document.startViewTransition) document.startViewTransition(apply);
        else apply();
    }

    /* ------------------------------------------------------------------
     * Shared animation clock (drives the auto-advance timers)
     * ------------------------------------------------------------------ */
    const tickers = new Set();
    let lastTime = performance.now();
    function frame(now) {
        const dt = Math.min(now - lastTime, 100);
        lastTime = now;
        tickers.forEach((fn) => fn(dt));
        requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);

    let modalOpen = false;

    /* ------------------------------------------------------------------
     * Sidebar
     * ------------------------------------------------------------------ */
    function renderSidebar() {
        const links = profile.links.map((l) => {
            const external = !l.url.startsWith('mailto:');
            return `<li><a href="${escapeHtml(l.url)}"${external ? ' target="_blank" rel="noopener noreferrer"' : ''}>${escapeHtml(l.label)}${ICON.out}</a></li>`;
        }).join('');

        sidebar.innerHTML = `
            <div class="sidebar-inner">
                <header class="intro">
                    <p class="role">${escapeHtml(profile.role)}</p>
                    <h1 class="name">${profile.name.map((n, i) => `<span class="line" style="--i:${i}"><span>${escapeHtml(n)}</span></span>`).join('')}</h1>
                </header>
                <div class="about" id="sidebar-about">
                    <div class="about-inner">
                        <div class="bio">${profile.bio.map((p) => `<p>${p}</p>`).join('')}</div>
                        <section class="side-block">
                            <h2 class="label">Core tech</h2>
                            <ul class="skill-list">${profile.skills.map((s) => `<li>${escapeHtml(s)}</li>`).join('')}</ul>
                        </section>
                    </div>
                </div>
                <nav class="side-block contact-block" aria-label="Contact">
                    <h2 class="label">Contact</h2>
                    <ul class="contact-list">${links}</ul>
                </nav>
                <button class="about-toggle" type="button" aria-expanded="false" aria-controls="sidebar-about">
                    <span>About &amp; core tech</span>
                    <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 5.5v13M5.5 12h13"/></svg>
                </button>
            </div>
            <footer class="sidebar-foot">
                <div class="foot-controls">
                    <label class="motion-toggle">
                        <input type="checkbox" ${motion ? 'checked' : ''}>
                        <span class="switch" aria-hidden="true"></span>
                        <span>Motion</span>
                    </label>
                    <button class="theme-toggle" type="button">${ICON.moon}${ICON.sun}</button>
                </div>
                <span class="copyright">&copy; ${new Date().getFullYear()}</span>
            </footer>`;

        const marked = sidebar.querySelectorAll('.bio em');
        if (marked.length) {
            const em = marked[marked.length - 1];
            em.classList.add('is-marked');
            em.insertAdjacentHTML('beforeend', INK.underline);
        }

        // on phones the bio and tech list fold away behind one line
        const aboutBtn = sidebar.querySelector('.about-toggle');
        aboutBtn.addEventListener('click', () => {
            const open = aboutBtn.getAttribute('aria-expanded') !== 'true';
            aboutBtn.setAttribute('aria-expanded', String(open));
            sidebar.classList.toggle('is-about-open', open);
        });

        const toggle = sidebar.querySelector('.motion-toggle input');
        toggle.addEventListener('change', () => setMotion(toggle.checked, true));

        const themeBtn = sidebar.querySelector('.theme-toggle');
        themeBtn.addEventListener('click', () => setTheme(root.dataset.theme !== 'dark'));
        syncTheme();
    }

    /* ------------------------------------------------------------------
     * Project card
     * ------------------------------------------------------------------ */
    function posterFor(p) {
        if (p.poster) return p.poster;
        if (p.youtube) return `https://img.youtube.com/vi/${p.youtube}/maxresdefault.jpg`;
        return '';
    }

    function buildCard(p) {
        const card = el('article', 'card');
        card.innerHTML = `
            <div class="card-frame">
                <div class="card-screen">
                    <img class="card-poster" alt="" decoding="async">
                    <video class="card-video" muted loop playsinline preload="none"></video>
                </div>
            </div>
            <div class="card-label">
                <div class="card-head">
                    <h3 class="card-title">${escapeHtml(p.title)}</h3>
                    <span class="card-tags">${p.tags.map(escapeHtml).join('<i>/</i>')}</span>
                </div>
                <p class="card-summary">${escapeHtml(p.summary)}</p>
            </div>`;

        const img = card.querySelector('.card-poster');
        img.addEventListener('load', () => {
            // YouTube serves a 120px grey placeholder when no max-res thumbnail exists
            if (img.naturalWidth <= 120 && img.src.includes('maxresdefault')) {
                img.src = img.src.replace('maxresdefault', 'hqdefault');
                return;
            }
            card.classList.add('has-poster');
        });
        img.src = posterFor(p);

        const video = card.querySelector('.card-video');
        // only reveal once frames are really flowing, and only if still wanted
        video.addEventListener('playing', () => { if (card._wantsPreview) card.classList.add('is-playing'); });
        card._project = p;
        card.style.setProperty('--tilt', tiltFor(p.title));
        return card;
    }

    // A clip is only fetched once the pointer actually settles on a card:
    // sweeping across the row on the way somewhere else downloads nothing.
    const PREVIEW_INTENT_MS = 120;
    const PREVIEW_FADE_MS = 380; // matches .card-video's opacity transition

    function playPreview(card) {
        const p = card._project;
        const video = card.querySelector('.card-video');
        if (!p.preview || !video) return;
        clearTimeout(card._pauseTimer);
        card._wantsPreview = true;
        if (!video.paused) {
            // still fading out from a moment ago: just bring it back
            card.classList.add('is-playing');
            return;
        }
        if (card._intentTimer) return;
        card._intentTimer = setTimeout(() => {
            card._intentTimer = null;
            if (!card._wantsPreview) return;
            if (!video.getAttribute('src')) video.src = p.preview;
            const attempt = video.play();
            if (attempt) attempt.catch(() => { });
        }, PREVIEW_INTENT_MS);
    }

    function stopPreview(card) {
        const video = card.querySelector('.card-video');
        card._wantsPreview = false;
        clearTimeout(card._intentTimer);
        card._intentTimer = null;
        card.classList.remove('is-playing');
        if (!video || video.paused) return;
        // keep it moving while it fades, then pause: no frozen frame on the way out
        clearTimeout(card._pauseTimer);
        card._pauseTimer = setTimeout(() => {
            if (!card._wantsPreview) video.pause();
        }, PREVIEW_FADE_MS);
    }

    /* ------------------------------------------------------------------
     * Project panel (modal)
     * ------------------------------------------------------------------ */
    const modal = el('div', 'modal');
    modal.setAttribute('role', 'dialog');
    modal.setAttribute('aria-modal', 'true');
    modal.setAttribute('aria-labelledby', 'modal-title');
    modal.innerHTML = `
        <div class="modal-scrim" data-close></div>
        <div class="modal-sheet">
            <button class="modal-close" type="button" aria-label="Close" data-close>${ICON.close}</button>
            <div class="modal-body"></div>
        </div>`;
    document.body.appendChild(modal);
    const modalBody = modal.querySelector('.modal-body');
    let lastFocus = null;
    let closeTimer = null;

    function openProject(p) {
        clearTimeout(closeTimer);
        lastFocus = document.activeElement;
        const kind = p.type === 'game' ? 'Game' : 'Simulation';
        const features = (p.features || []).map((f) => `<li>${escapeHtml(f)}</li>`).join('');
        const links = (p.links || []).map((l) =>
            `<a class="text-link" href="${escapeHtml(l.url)}" target="_blank" rel="noopener noreferrer">${escapeHtml(l.label)}${ICON.out}</a>`).join('');

        modalBody.innerHTML = `
            <div class="modal-media">
                <div class="frame"><div class="frame-screen" id="modal-screen"></div></div>
            </div>
            <div class="modal-info">
                <p class="eyebrow">${kind}<span>${p.tags.map(escapeHtml).join(' / ')}</span></p>
                <h2 class="modal-title" id="modal-title">${escapeHtml(p.title)}</h2>
                <p class="modal-summary">${escapeHtml(p.summary)}</p>
                ${features ? `<h3 class="label">Key technical features</h3><ul class="feature-list">${features}</ul>` : ''}
                ${links ? `<div class="modal-links">${links}</div>` : ''}
            </div>`;

        const screen = modalBody.querySelector('#modal-screen');
        const mountVideo = () => {
            if (!modal.classList.contains('is-open')) return;
            if (p.youtube) {
                screen.innerHTML = `<iframe src="https://www.youtube-nocookie.com/embed/${p.youtube}?autoplay=1&rel=0&modestbranding=1&playsinline=1" title="${escapeHtml(p.title)} video" allow="autoplay; encrypted-media; picture-in-picture; fullscreen" allowfullscreen></iframe>`;
            } else if (p.preview) {
                screen.innerHTML = `<video src="${escapeHtml(p.preview)}" poster="${escapeHtml(posterFor(p))}" autoplay muted loop playsinline controls></video>`;
            }
        };
        if (posterFor(p)) screen.style.backgroundImage = `url("${posterFor(p)}")`;

        // nothing behind the panel keeps decoding video while it is open
        document.querySelectorAll('.card').forEach((c) => { if (c.querySelector('.card-video')) stopPreview(c); });

        modal.classList.add('is-open');
        document.body.classList.add('modal-open');
        modalOpen = true;
        modal.querySelector('.modal-close').focus({ preventScroll: true });
        setTimeout(mountVideo, motion ? 320 : 0);
    }

    function closeProject() {
        if (!modalOpen) return;
        modal.classList.remove('is-open');
        document.body.classList.remove('modal-open');
        modalOpen = false;
        // stop the video right away, clear the rest once the sheet has faded
        const screen = modalBody.querySelector('#modal-screen');
        if (screen) screen.innerHTML = '';
        closeTimer = setTimeout(() => { modalBody.innerHTML = ''; }, 400);
        if (lastFocus && lastFocus.focus) lastFocus.focus({ preventScroll: true });
    }

    modal.addEventListener('click', (e) => {
        if (e.target.closest('[data-close]')) closeProject();
    });
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') closeProject();
        if (e.key === 'Tab' && modalOpen) {
            const focusable = modal.querySelectorAll('button, a[href], iframe, video[controls]');
            if (!focusable.length) return;
            const first = focusable[0];
            const last = focusable[focusable.length - 1];
            if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
            else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
        }
    });

    /* ------------------------------------------------------------------
     * Swipe helper
     * ------------------------------------------------------------------ */
    function onSwipe(target, axis, handler) {
        let start = null;
        target.addEventListener('pointerdown', (e) => {
            if (e.pointerType === 'mouse') return;
            start = { x: e.clientX, y: e.clientY };
        });
        target.addEventListener('pointerup', (e) => {
            if (!start) return;
            const dx = e.clientX - start.x;
            const dy = e.clientY - start.y;
            start = null;
            const main = axis === 'x' ? dx : dy;
            const cross = axis === 'x' ? dy : dx;
            if (Math.abs(main) > 40 && Math.abs(main) > Math.abs(cross) * 1.2) {
                target._swiped = true;
                setTimeout(() => { target._swiped = false; }, 60);
                handler(main < 0 ? 1 : -1);
            }
        });
        target.addEventListener('pointercancel', () => { start = null; });
    }

    /* ------------------------------------------------------------------
     * Carousel row (home)
     * ------------------------------------------------------------------ */
    class Carousel {
        constructor({ title, items, genres, selected = [], interval, delay }) {
            this.all = items;
            this.items = items;
            this.genres = genres.filter((g) => items.some((p) => p.genres.includes(g)));
            this.active = new Set(this.genres);
            this.interval = interval;
            this.elapsed = -delay;
            this.pos = 0;
            this.hovered = false;
            this.focused = false;

            this.el = el('section', 'row');
            this.el.setAttribute('aria-label', title);
            this.el.innerHTML = `
                <header class="row-head">
                    <h2 class="row-title">${escapeHtml(title)}</h2>
                    <div class="chips" role="group" aria-label="Filter ${escapeHtml(title.toLowerCase())}"></div>
                    <div class="row-controls">
                        <div class="counter" aria-live="polite">
                            <span class="counter-current">01</span>
                            <span class="counter-track"><span class="counter-fill"></span></span>
                            <span class="counter-total">01</span>
                        </div>
                        <button class="arrow" type="button" data-step="-1" aria-label="Previous ${escapeHtml(title.toLowerCase())}">${ICON.prev}</button>
                        <button class="arrow" type="button" data-step="1" aria-label="Next ${escapeHtml(title.toLowerCase())}">${ICON.next}</button>
                    </div>
                </header>
                <div class="rail" tabindex="0" aria-roledescription="carousel"></div>`;

            this.rail = this.el.querySelector('.rail');
            this.fill = this.el.querySelector('.counter-fill');
            this.current = this.el.querySelector('.counter-current');
            this.total = this.el.querySelector('.counter-total');

            this.renderChips();
            this.select(selected, false);
            this.bind();
            this.build();
            tickers.add((dt) => this.tick(dt));
        }

        renderChips() {
            const wrap = this.el.querySelector('.chips');
            if (this.genres.length < 2) { wrap.remove(); return; }
            wrap.innerHTML = this.genres.map((g) => {
                const count = this.all.filter((p) => p.genres.includes(g)).length;
                return `<button class="chip" type="button" data-genre="${g}" aria-pressed="true"><span class="chip-text">${g}<span class="chip-count">${count}</span></span>${INK.loop}</button>`;
            }).join('');
            wrap.addEventListener('click', (e) => {
                const chip = e.target.closest('.chip');
                if (!chip) return;
                const g = chip.dataset.genre;
                if (this.active.has(g)) {
                    if (this.active.size === 1) {
                        chip.classList.remove('is-refused');
                        void chip.offsetWidth;
                        chip.classList.add('is-refused');
                        return;
                    }
                    this.active.delete(g);
                } else {
                    this.active.add(g);
                }
                chip.setAttribute('aria-pressed', String(this.active.has(g)));
                this.applyFilter();
            });
        }

        /* preselect genres (from the URL hash). Only the ones this row carries
           count; a row with none of them keeps every genre on. */
        select(wanted, animate) {
            const pick = this.genres.filter((g) => wanted.includes(g));
            const next = new Set(pick.length ? pick : this.genres);
            const same = next.size === this.active.size && [...next].every((g) => this.active.has(g));
            this.active = next;
            this.el.querySelectorAll('.chip').forEach((chip) => {
                chip.setAttribute('aria-pressed', String(next.has(chip.dataset.genre)));
            });
            if (!animate) this.items = this.filtered();
            else if (!same) this.applyFilter();
        }

        filtered() {
            return this.all.filter((p) => p.genres.some((g) => this.active.has(g)));
        }

        applyFilter() {
            this.items = this.filtered();
            if (!motion) { this.build(); return; }
            this.rail.classList.add('is-swapping');
            clearTimeout(this.swapTimer);
            this.swapTimer = setTimeout(() => {
                this.build();
                requestAnimationFrame(() => this.rail.classList.remove('is-swapping'));
            }, 220);
        }

        build() {
            this.stopAll();
            const n = this.items.length;
            this.loop = n >= 3;
            const copies = this.loop ? Math.ceil(5 / n) : 1;
            this.slots = [];
            this.rail.innerHTML = '';
            this.rail.classList.add('is-building');
            for (let c = 0; c < copies; c++) {
                this.items.forEach((p, i) => {
                    const card = buildCard(p);
                    card._index = i;
                    if (c > 0) card.setAttribute('aria-hidden', 'true');
                    this.rail.appendChild(card);
                    this.slots.push(card);
                });
            }
            this.pos = 0;
            this.elapsed = Math.min(this.elapsed, 0);
            this.total.textContent = pad2(n);
            this.el.classList.toggle('is-single', n <= 1);
            this.layout();
            // place cards without animating, then re-enable transitions
            void this.rail.offsetWidth;
            this.rail.classList.remove('is-building');
        }

        offsetOf(j) {
            const m = this.slots.length;
            if (!this.loop) return j - this.pos;
            let d = ((j - this.pos) % m + m) % m;
            if (d > m / 2) d -= m;
            return d;
        }

        layout() {
            this.slots.forEach((card, j) => {
                const d = this.offsetOf(j);
                const clamped = Math.max(-2, Math.min(2, d));
                card.style.setProperty('--off', clamped);
                card.classList.toggle('is-active', d === 0);
                card.classList.toggle('is-near', Math.abs(d) === 1);
                card.classList.toggle('is-far', Math.abs(d) >= 2);
                card.tabIndex = d === 0 ? 0 : -1;
                if (d === 0) {
                    card.setAttribute('role', 'button');
                    card.setAttribute('aria-label', `Open ${card._project.title}`);
                } else {
                    card.removeAttribute('role');
                    card.removeAttribute('aria-label');
                    stopPreview(card);
                }
            });
            const n = this.items.length;
            const index = n ? ((this.pos % n) + n) % n : 0;
            this.current.textContent = pad2(n ? index + 1 : 0);
        }

        go(step) {
            const n = this.items.length;
            if (n <= 1) return;
            if (this.loop) this.pos += step;
            else this.pos = ((this.pos + step) % n + n) % n;
            this.elapsed = 0;
            this.layout();
            if (this.hovered && this.pointer) this.syncPreview(this.pointer);
        }

        activeCard() {
            return this.slots.find((c) => c.classList.contains('is-active'));
        }

        stopAll() {
            (this.slots || []).forEach(stopPreview);
        }

        syncPreview(point) {
            if (!hoverQuery.matches) return;
            const hit = document.elementFromPoint(point.x, point.y);
            const card = hit && hit.closest('.card.is-active');
            const active = this.activeCard();
            if (card && card === active) playPreview(card);
            else if (active) stopPreview(active);
        }

        bind() {
            this.el.querySelectorAll('.arrow').forEach((btn) =>
                btn.addEventListener('click', () => this.go(Number(btn.dataset.step))));

            this.el.addEventListener('pointerenter', (e) => { if (e.pointerType === 'mouse') this.hovered = true; });
            this.el.addEventListener('pointerleave', () => {
                this.hovered = false;
                this.pointer = null;
                const active = this.activeCard();
                if (active) stopPreview(active);
            });
            this.rail.addEventListener('pointermove', (e) => {
                if (e.pointerType !== 'mouse') return;
                this.pointer = { x: e.clientX, y: e.clientY };
                // high-rate mice fire far more often than frames: hit-test once per frame
                if (this._syncQueued) return;
                this._syncQueued = true;
                requestAnimationFrame(() => {
                    this._syncQueued = false;
                    if (this.pointer) this.syncPreview(this.pointer);
                });
            });

            this.el.addEventListener('focusin', () => { this.focused = true; });
            this.el.addEventListener('focusout', (e) => {
                if (!this.el.contains(e.relatedTarget)) this.focused = false;
            });

            this.rail.addEventListener('click', (e) => {
                if (this.rail._swiped) return;
                const card = e.target.closest('.card');
                if (!card) return;
                if (card.classList.contains('is-active')) openProject(card._project);
                else if (card.classList.contains('is-near')) this.go(Number(card.style.getPropertyValue('--off')));
            });

            this.rail.addEventListener('keydown', (e) => {
                if (e.key === 'ArrowRight') { e.preventDefault(); this.go(1); }
                else if (e.key === 'ArrowLeft') { e.preventDefault(); this.go(-1); }
                else if ((e.key === 'Enter' || e.key === ' ') && e.target.classList.contains('card')) {
                    e.preventDefault();
                    openProject(e.target._project);
                }
            });

            let wheelLock = false;
            this.rail.addEventListener('wheel', (e) => {
                if (Math.abs(e.deltaX) < Math.abs(e.deltaY) || Math.abs(e.deltaX) < 25) return;
                e.preventDefault();
                if (wheelLock) return;
                wheelLock = true;
                this.go(e.deltaX > 0 ? 1 : -1);
                setTimeout(() => { wheelLock = false; }, 650);
            }, { passive: false });

            onSwipe(this.rail, 'x', (step) => this.go(step));
        }

        paused() {
            return !motion || modalOpen || document.hidden || this.hovered || this.focused || this.items.length <= 1;
        }

        tick(dt) {
            if (this.paused()) {
                if (!motion) this.fill.style.transform = 'scaleX(0)';
                return;
            }
            this.elapsed += dt;
            if (this.elapsed >= this.interval) {
                this.go(1);
            }
            this.fill.style.transform = `scaleX(${Math.max(0, this.elapsed / this.interval)})`;
        }
    }

    /* #xr, #3D, #2d, #xr&3d … → ['XR'], ['3D'], ['2D'], ['XR', '3D'] */
    function hashGenres() {
        let h = location.hash.slice(1);
        try { h = decodeURIComponent(h); } catch (e) { /* keep it raw */ }
        return h.toUpperCase().split(/[\s&+,;|=\/]+/).filter(Boolean);
    }

    function renderHome() {
        stage.classList.add('stage-home');
        const sims = projects.filter((p) => p.type === 'simulation');
        const games = projects.filter((p) => p.type === 'game');
        const selected = hashGenres();
        const rows = [
            new Carousel({ title: 'Simulations', items: sims, genres: ['XR', '3D', '2D'], selected, interval: 7000, delay: 0 }),
            new Carousel({ title: 'Games', items: games, genres: ['XR', '3D', '2D'], selected, interval: 7000, delay: 3500 })
        ];
        rows.forEach((r) => stage.appendChild(r.el));
        window.addEventListener('hashchange', () => {
            const wanted = hashGenres();
            rows.forEach((r) => r.select(wanted, true));
        });
    }

    /* ------------------------------------------------------------------
     * Focused pager (/xr, /simulations, /games) — three at a time, staggered
     * ------------------------------------------------------------------ */
    const ROUTES = {
        xr: {
            title: 'XR & Simulations',
            docTitle: 'XR & Simulations | Abdelrahman Soliman',
            items: () => [
                ...projects.filter((p) => p.type === 'simulation'),
                ...projects.filter((p) => p.type === 'game' && p.genres.includes('XR'))
            ]
        },
        simulations: {
            title: 'Simulations',
            docTitle: 'Simulations | Abdelrahman Soliman',
            items: () => projects.filter((p) => p.type === 'simulation')
        },
        games: {
            title: 'Games',
            docTitle: 'Games | Abdelrahman Soliman',
            items: () => projects.filter((p) => p.type === 'game')
        }
    };

    function renderPager(route) {
        const items = route.items();
        document.title = route.docTitle;
        stage.classList.add('stage-pager');
        stage.innerHTML = `
            <header class="page-head">
                <h2 class="page-title">${escapeHtml(route.title)}</h2>
                <span class="page-count">${pad2(items.length)} projects</span>
                <a class="text-link back-link" href="/">All work${ICON.next}</a>
            </header>
            <div class="pager">
                <div class="pager-track"></div>
            </div>
            <nav class="pager-dots" aria-label="Pages"></nav>`;

        const pager = stage.querySelector('.pager');
        const track = stage.querySelector('.pager-track');
        const dots = stage.querySelector('.pager-dots');
        const INTERVAL = 8000;
        let page = 0;
        let pages = 0;
        let elapsed = 0;
        let hovered = false;
        let wheelLock = false;

        function build() {
            const perPage = mobileQuery.matches ? items.length : 3;
            pages = Math.ceil(items.length / perPage);
            track.innerHTML = '';
            dots.innerHTML = '';
            for (let i = 0; i < pages; i++) {
                const slide = el('div', 'slide');
                items.slice(i * perPage, (i + 1) * perPage).forEach((p, k) => {
                    const card = buildCard(p);
                    card.style.setProperty('--k', k);
                    card.tabIndex = 0;
                    card.setAttribute('role', 'button');
                    card.setAttribute('aria-label', `Open ${p.title}`);
                    slide.appendChild(card);
                });
                track.appendChild(slide);
                const dot = el('button', 'dot');
                dot.type = 'button';
                dot.setAttribute('aria-label', `Page ${i + 1}`);
                dot.addEventListener('click', () => goTo(i));
                dots.appendChild(dot);
            }
            stage.classList.toggle('is-single-page', pages <= 1);
            goTo(Math.min(page, pages - 1), true);
        }

        function goTo(i, instant) {
            page = (i + pages) % pages;
            elapsed = 0;
            track.style.transform = mobileQuery.matches ? '' : `translateY(${-page * 100}%)`;
            track.querySelectorAll('.slide').forEach((s, k) => {
                const current = k === page;
                s.classList.toggle('is-current', current);
                s.inert = !current && !mobileQuery.matches;
                if (!current) s.querySelectorAll('.card').forEach(stopPreview);
            });
            dots.querySelectorAll('.dot').forEach((d, k) => d.setAttribute('aria-current', k === page ? 'true' : 'false'));
            if (instant) track.classList.add('is-instant');
            void track.offsetWidth;
            track.classList.remove('is-instant');
        }

        track.addEventListener('click', (e) => {
            const card = e.target.closest('.card');
            if (card) openProject(card._project);
        });
        track.addEventListener('keydown', (e) => {
            if ((e.key === 'Enter' || e.key === ' ') && e.target.classList.contains('card')) {
                e.preventDefault();
                openProject(e.target._project);
            }
        });
        track.addEventListener('pointerover', (e) => {
            if (!hoverQuery.matches) return;
            const card = e.target.closest('.card');
            if (card) playPreview(card);
        });
        track.addEventListener('pointerout', (e) => {
            const card = e.target.closest('.card');
            if (card && !card.contains(e.relatedTarget)) stopPreview(card);
        });

        stage.addEventListener('pointerenter', (e) => { if (e.pointerType === 'mouse') hovered = true; });
        stage.addEventListener('pointerleave', () => { hovered = false; });

        pager.addEventListener('wheel', (e) => {
            if (mobileQuery.matches || modalOpen) return;
            e.preventDefault();
            if (wheelLock || Math.abs(e.deltaY) < 25) return;
            const nextPage = page + (e.deltaY > 0 ? 1 : -1);
            if (nextPage < 0 || nextPage >= pages) return;
            wheelLock = true;
            goTo(nextPage);
            setTimeout(() => { wheelLock = false; }, 900);
        }, { passive: false });

        document.addEventListener('keydown', (e) => {
            if (modalOpen || mobileQuery.matches) return;
            if (['ArrowDown', 'PageDown'].includes(e.key) && page < pages - 1) { e.preventDefault(); goTo(page + 1); }
            if (['ArrowUp', 'PageUp'].includes(e.key) && page > 0) { e.preventDefault(); goTo(page - 1); }
        });

        onSwipe(pager, 'y', (step) => {
            if (mobileQuery.matches) return;
            const nextPage = page + step;
            if (nextPage >= 0 && nextPage < pages) goTo(nextPage);
        });

        tickers.add((dt) => {
            if (!motion || modalOpen || document.hidden || hovered || pages <= 1 || mobileQuery.matches) return;
            elapsed += dt;
            if (elapsed >= INTERVAL) goTo(page + 1);
        });

        mobileQuery.addEventListener('change', build);
        build();
    }

    /* ------------------------------------------------------------------
     * Boot
     * ------------------------------------------------------------------ */
    renderSidebar();
    if (ROUTES[view]) renderPager(ROUTES[view]);
    else renderHome();
    requestAnimationFrame(() => root.classList.add('is-ready'));
    setTimeout(() => root.classList.add('is-settled'), 2600);
})();
