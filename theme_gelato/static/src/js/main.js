/** @odoo-module **/
import publicWidget from "@web/legacy/js/public/public_widget";
import { rpc } from "@web/core/network/rpc";

publicWidget.registry.GlHeroSlider = publicWidget.Widget.extend({
    selector: '.gl-hero',
    disabledInEditableMode: true,

    start() {
        this._super(...arguments);
        this.current = 0;
        this.timer = null;
        const intervalAttr = this.el.dataset.glInterval;
        this.INTERVAL = intervalAttr ? parseInt(intervalAttr, 10) : 6000;

        this._cleanSavedState();
        return this._loadSlides();
    },

    _cleanSavedState() {
        this.el.classList.add('gl-no-transition');
        this.el.classList.remove('gl-loaded');
        const bg = this.el.querySelector('.gl-hero-bg');
        const content = this.el.querySelector('.gl-hero-slides-wrap');
        const nav = this.el.querySelector('.gl-hero-slide-nav');
        if (bg) bg.innerHTML = '';
        if (content) content.innerHTML = '';
        if (nav) nav.innerHTML = '';
    },

    destroy() {
        clearInterval(this.timer);
        if (this._observer) {
            this._observer.disconnect();
        }
        const bg = this.el.querySelector('.gl-hero-bg');
        const content = this.el.querySelector('.gl-hero-slides-wrap');
        const nav = this.el.querySelector('.gl-hero-slide-nav');
        if (bg) bg.innerHTML = '';
        if (content) content.innerHTML = '';
        if (nav) nav.innerHTML = '';
        this.el.classList.remove('gl-loaded', 'gl-no-transition');
        this._super(...arguments);
    },

    async _loadSlides() {
        let slides;
        try {
            slides = await rpc('/theme_gelato/hero_slides', {});
        } catch {
            return;
        }
        if (!slides || !slides.length) {
            return;
        }

        this._renderSlides(slides);
        this.total = slides.length;
        this._buildDots();
        const firstSlide = this.contentSlides[0];
        if (firstSlide) {
            firstSlide.classList.add('gl-initial');
            firstSlide.addEventListener('animationend', () => {
                firstSlide.classList.remove('gl-initial');
            }, { once: true });
        }
        requestAnimationFrame(() => {
            this.el.classList.remove('gl-no-transition');
            this.el.classList.add('gl-loaded');
        });

        this._observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((e) => {
                    if (e.isIntersecting) {
                        this._resetTimer();
                    } else {
                        clearInterval(this.timer);
                    }
                });
            },
            { threshold: 0.3 },
        );
        this._observer.observe(this.el);
        this._resetTimer();
    },

    _renderSlides(slides) {
        const bgContainer = this.el.querySelector('.gl-hero-bg');
        const contentContainer = this.el.querySelector('.gl-hero-slides-wrap');

        // Clear existing (prevents duplicates on re-init)
        bgContainer.innerHTML = '';
        contentContainer.innerHTML = '';

        slides.forEach((slide, i) => {
            // Background slide
            const bgDiv = document.createElement('div');
            bgDiv.className = 'gl-hero-bg-slide' + (i === 0 ? ' active' : '');
            bgDiv.dataset.slide = i;
            if (slide.image_url) {
                bgDiv.style.backgroundImage = `url('${slide.image_url}')`;
            }
            bgContainer.appendChild(bgDiv);

            // Content slide
            const content = document.createElement('div');
            content.className = 'gl-hero-slide-content' + (i === 0 ? ' active' : '');
            content.dataset.slide = i;

            let html = `<div class="gl-hero-badge">${this._esc(slide.name)}</div>`;
            html += `<h2 class="gl-hero-headline">${this._esc(slide.headline)}<br/>`;
            if (slide.headline_accent) {
                html += `<span class="gl-accent">${this._esc(slide.headline_accent)}</span>`;
            }
            html += '</h2>';
            if (slide.subtitle) {
                html += `<p class="gl-hero-sub">${this._esc(slide.subtitle)}</p>`;
            }
            if (slide.button_text) {
                html += `<div class="gl-hero-cta">
                    <a href="${this._esc(slide.button_url)}" class="gl-btn-hero gl-btn-hero-primary">
                        ${this._esc(slide.button_text)}
                        <svg viewBox="0 0 24 24"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                    </a>
                </div>`;
            }
            content.innerHTML = html;
            contentContainer.appendChild(content);
        });

        this.bgSlides = [...bgContainer.querySelectorAll('.gl-hero-bg-slide')];
        this.contentSlides = [...contentContainer.querySelectorAll('.gl-hero-slide-content')];
    },

    _esc(str) {
        const el = document.createElement('span');
        el.textContent = str;
        return el.innerHTML;
    },

    _buildDots() {
        const navContainer = this.el.querySelector('.gl-hero-slide-nav');
        if (!navContainer) {
            return;
        }
        navContainer.innerHTML = '';
        for (let i = 0; i < this.total; i++) {
            const dot = document.createElement('div');
            dot.className = 'gl-hero-slide-dot' + (i === 0 ? ' active' : '');
            dot.dataset.slide = i;
            dot.addEventListener('click', () => this._goTo(i));
            navContainer.appendChild(dot);
        }
        this.dots = [...navContainer.querySelectorAll('.gl-hero-slide-dot')];
    },

    _goTo(index) {
        if (index === this.current) {
            return;
        }
        this.bgSlides[this.current].classList.remove('active');
        this.contentSlides[this.current].classList.remove('active');
        this.dots[this.current].classList.remove('active');
        this.dots[this.current].classList.add('done');

        this.current = ((index % this.total) + this.total) % this.total;

        this.dots.forEach((d, i) => {
            d.classList.remove('active', 'done');
            if (i < this.current) {
                d.classList.add('done');
            }
        });

        this.bgSlides[this.current].classList.add('active');
        this.contentSlides[this.current].classList.add('active');
        this.dots[this.current].classList.add('active');
        this._resetTimer();
    },

    _next() {
        this._goTo((this.current + 1) % this.total);
    },

    _resetTimer() {
        clearInterval(this.timer);
        this.timer = setInterval(() => this._next(), this.INTERVAL);
    },
});

publicWidget.registry.GlFadeUp = publicWidget.Widget.extend({
    selector: '.gl-why',
    disabledInEditableMode: true,

    start() {
        this._super(...arguments);
        this._targets = this.el.querySelectorAll('.gl-fade-up');
        this._observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('gl-visible');
                    }
                });
            },
            { threshold: 0.1 },
        );
        this._targets.forEach((el) => this._observer.observe(el));
    },

    destroy() {
        if (this._observer) {
            this._observer.disconnect();
        }
        this._super(...arguments);
    },
});

publicWidget.registry.GlGallery = publicWidget.Widget.extend({
    selector: '.gl-gallery',
    disabledInEditableMode: true,

    start() {
        this._super(...arguments);
        return this._loadImages();
    },

    async _loadImages() {
        let images;
        try {
            images = await rpc('/theme_gelato/gallery_images', {});
        } catch {
            return;
        }
        if (!images || !images.length) {
            return;
        }

        const grid = this.el.querySelector('.gl-gallery-grid');
        if (!grid) {
            return;
        }
        grid.innerHTML = '';

        images.forEach((img) => {
            const item = document.createElement('div');
            item.className = 'gl-gallery-item';

            const imgEl = document.createElement('img');
            imgEl.src = img.image_url;
            imgEl.alt = img.name;
            imgEl.loading = 'lazy';
            imgEl.decoding = 'async';
            item.appendChild(imgEl);

            const overlay = document.createElement('div');
            overlay.className = 'gl-gallery-item-overlay';
            const span = document.createElement('span');
            span.textContent = img.name;
            overlay.appendChild(span);
            item.appendChild(overlay);

            grid.appendChild(item);
        });
    },
});

publicWidget.registry.GlBodyClass = publicWidget.Widget.extend({
    selector: '#wrapwrap',
    disabledInEditableMode: false,

    start() {
        this._super(...arguments);
        document.body.classList.add('theme_gelato_body');
    },
});

publicWidget.registry.GlSmoothScroll = publicWidget.Widget.extend({
    selector: '#wrapwrap',
    events: {
        'click a[href^="#"]': '_onAnchorClick',
    },

    _onAnchorClick(ev) {
        const href = ev.currentTarget.getAttribute('href');
        if (!href || href === '#') {
            return;
        }
        const target = document.querySelector(href);
        if (target) {
            ev.preventDefault();
            target.scrollIntoView({ behavior: 'smooth' });
        }
    },
});

publicWidget.registry.GlScrollSpy = publicWidget.Widget.extend({
    selector: '#wrapwrap',
    disabledInEditableMode: true,

    start() {
        this._super(...arguments);
        this._navLinks = [...document.querySelectorAll(
            'header .navbar-nav .nav-link[href*="#"], header .navbar-nav a[href*="#"]'
        )];
        if (!this._navLinks.length) {
            return;
        }

        this._sectionMap = new Map();
        for (const link of this._navLinks) {
            const href = link.getAttribute('href');
            const hash = href.includes('#') ? href.split('#')[1] : null;
            if (hash) {
                const section = document.getElementById(hash);
                if (section) {
                    if (!this._sectionMap.has(section)) {
                        this._sectionMap.set(section, []);
                    }
                    this._sectionMap.get(section).push(link);
                }
            }
        }
        if (!this._sectionMap.size) {
            return;
        }

        this._activeLinks = [];
        this._observer = new IntersectionObserver(
            (entries) => this._onIntersect(entries),
            { rootMargin: '-20% 0px -60% 0px' },
        );
        for (const section of this._sectionMap.keys()) {
            this._observer.observe(section);
        }
    },

    destroy() {
        if (this._observer) {
            this._observer.disconnect();
        }
        this._activeLinks.forEach(l => l.classList.remove('gl-scrollspy-active'));
        this._super(...arguments);
    },

    _onIntersect(entries) {
        for (const entry of entries) {
            if (entry.isIntersecting) {
                const links = this._sectionMap.get(entry.target);
                if (!links) continue;
                this._activeLinks.forEach(l => l.classList.remove('gl-scrollspy-active'));
                links.forEach(l => l.classList.add('gl-scrollspy-active'));
                this._activeLinks = links;
            }
        }
    },
});

publicWidget.registry.GlFormFeedback = publicWidget.Widget.extend({
    selector: '.gl-inquiry',
    disabledInEditableMode: true,

    start() {
        this._super(...arguments);
        const params = new URLSearchParams(window.location.search);
        const status = params.get('form');
        if (!status) {
            return;
        }

        const form = this.el.querySelector('.gl-inquiry-form');
        if (!form) {
            return;
        }

        const banner = document.createElement('div');
        banner.className = 'gl-form-feedback gl-form-feedback-' + (status === 'ok' ? 'ok' : 'error');
        banner.textContent = status === 'ok'
            ? 'Děkujeme! Vaše poptávka byla odeslána. Ozveme se vám do 24 hodin.'
            : 'Omlouváme se, při odesílání nastala chyba. Zkuste to prosím znovu.';
        form.prepend(banner);

        this.el.scrollIntoView({ behavior: 'smooth', block: 'center' });

        if (status === 'ok') {
            window.history.replaceState({}, '', window.location.pathname + window.location.hash);
        }
    },
});
