/* ==========================================================
   China Tiesiju Civil Engineering Group Co. Ltd. Sucursal del Perú – interacciones y animaciones
   ========================================================== */
(() => {
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const finePointer = matchMedia('(hover: hover) and (pointer: fine)').matches;
  const hasGSAP = typeof window.gsap !== 'undefined' && typeof window.ScrollTrigger !== 'undefined';

  // Formulario: reemplazar por el endpoint real (Formspree, backend propio, etc.)
  const CONTACT_ENDPOINT = '';

  if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
  if (!location.hash) window.scrollTo(0, 0);

  $('#year').textContent = new Date().getFullYear();
  $$('.mmenu__nav a').forEach((a, i) => a.style.setProperty('--i', i + 1));

  /* ---------- Split text ---------- */
  $$('.split').forEach(el => {
    const walk = node => {
      [...node.childNodes].forEach(n => {
        if (n.nodeType === 3) {
          const frag = document.createDocumentFragment();
          n.textContent.split(/(\s+)/).forEach(part => {
            if (!part) return;
            if (/^\s+$/.test(part)) { frag.append(' '); return; }
            const w = document.createElement('span'); w.className = 'w';
            const wi = document.createElement('span'); wi.className = 'wi'; wi.textContent = part;
            w.append(wi); frag.append(w);
          });
          n.replaceWith(frag);
        } else if (n.nodeType === 1) walk(n);
      });
    };
    walk(el);
  });

  /* ---------- Smooth scroll (Lenis) ---------- */
  let lenis = null;
  if (window.Lenis && !reduced) {
    lenis = new Lenis({ duration: 1.15, easing: t => Math.min(1, 1.001 - Math.pow(2, -10 * t)) });
    window.lenis = lenis;
    if (hasGSAP) {
      lenis.on('scroll', ScrollTrigger.update);
      gsap.ticker.add(t => lenis.raf(t * 1000));
      gsap.ticker.lagSmoothing(0);
    } else {
      const raf = t => { lenis.raf(t); requestAnimationFrame(raf); };
      requestAnimationFrame(raf);
    }
  }
  const scrollTo = target => {
    const el = typeof target === 'string' ? $(target) : target;
    if (!el) return;
    lenis ? lenis.scrollTo(el, { offset: -70 }) : el.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth' });
  };
  $$('a[href^="#"]').forEach(a => a.addEventListener('click', e => {
    const id = a.getAttribute('href');
    if (id.length < 2 || a.dataset.modal) return;
    e.preventDefault();
    closeMenu();
    scrollTo(id);
  }));

  /* ---------- Header ---------- */
  const header = $('#header');
  let lastY = 0;
  const onScroll = () => {
    const y = window.scrollY;
    header.classList.toggle('is-scrolled', y > 40);
    header.classList.toggle('is-hidden', y > lastY && y > 500 && !document.body.classList.contains('menu-open'));
    lastY = y;
    const max = document.documentElement.scrollHeight - innerHeight;
    $('.scroll-progress span').style.transform = `scaleX(${max > 0 ? y / max : 0})`;
  };
  addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // Enlace activo en navegación
  const navLinks = $$('.nav a');
  const io = new IntersectionObserver(entries => {
    entries.forEach(en => {
      if (en.isIntersecting) navLinks.forEach(a => a.classList.toggle('is-active', a.getAttribute('href') === '#' + en.target.id));
    });
  }, { rootMargin: '-45% 0px -50% 0px' });
  navLinks.forEach(a => { const s = $(a.getAttribute('href')); s && io.observe(s); });

  /* ---------- Mobile menu ---------- */
  const burger = $('.burger');
  function closeMenu() {
    document.body.classList.remove('menu-open');
    burger.setAttribute('aria-expanded', 'false');
    $('.mmenu').setAttribute('aria-hidden', 'true');
    lenis && lenis.start();
  }
  burger.addEventListener('click', () => {
    const open = document.body.classList.toggle('menu-open');
    burger.setAttribute('aria-expanded', String(open));
    $('.mmenu').setAttribute('aria-hidden', String(!open));
    open ? lenis && lenis.stop() : lenis && lenis.start();
  });

  /* ---------- Hero slider ---------- */
  const slides = $$('.hero__slide');
  const dots = $$('.hero__pager button');
  let cur = 0, timer;
  const go = i => {
    slides[cur].classList.remove('is-active'); dots[cur].classList.remove('is-active');
    cur = (i + slides.length) % slides.length;
    slides[cur].classList.add('is-active');
    void dots[cur].offsetWidth; // reinicia la animación de la barra
    dots[cur].classList.add('is-active');
    clearInterval(timer); timer = setInterval(() => go(cur + 1), 6000);
  };
  dots.forEach((d, i) => d.addEventListener('click', () => go(i)));
  timer = setInterval(() => go(cur + 1), 6000);

  /* ---------- Hero: líneas topográficas animadas ---------- */
  const canvas = $('.hero__topo');
  if (canvas && !reduced) {
    const ctx = canvas.getContext('2d');
    let w, h, dpr, t = 0, visible = true;
    const resize = () => {
      dpr = Math.min(devicePixelRatio || 1, 2);
      w = canvas.clientWidth; h = canvas.clientHeight;
      canvas.width = w * dpr; canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize(); addEventListener('resize', resize);
    new IntersectionObserver(([e]) => { visible = e.isIntersecting; }).observe(canvas);
    const noise = (x, y) => Math.sin(x * 1.7 + y * .6) * .5 + Math.sin(x * .9 - y * 1.3 + 1.7) * .35 + Math.sin(x * 2.9 + y * 2.1 + 4.2) * .15;
    let mx = .7, my = .5;
    addEventListener('pointermove', e => { mx = e.clientX / innerWidth; my = e.clientY / innerHeight; }, { passive: true });
    const draw = () => {
      requestAnimationFrame(draw);
      if (!visible) return;
      t += .0025;
      ctx.clearRect(0, 0, w, h);
      const lines = 34, step = 14;
      for (let i = 0; i < lines; i++) {
        const base = (i / lines) * h * 1.2 - h * .1;
        ctx.beginPath();
        for (let x = 0; x <= w + step; x += step) {
          const nx = x / w, ny = i / lines;
          const d = Math.hypot(nx - mx, ny - my);
          const bump = Math.exp(-d * d * 18) * 40;
          const y = base + noise(nx * 3 + t, ny * 3 - t * .6) * 38 - bump;
          x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
        }
        const a = .05 + (i % 5 === 0 ? .14 : .05);
        ctx.strokeStyle = i % 5 === 0 ? `rgba(255,140,80,${a})` : `rgba(120,190,255,${a})`;
        ctx.lineWidth = i % 5 === 0 ? 1.2 : .8;
        ctx.stroke();
      }
    };
    draw();
  }

  /* ---------- Cursor personalizado ---------- */
  if (finePointer && !reduced) {
    const cursor = $('.cursor'), dot = $('.cursor__dot'), ring = $('.cursor__ring'), label = $('.cursor__label');
    let x = innerWidth / 2, y = innerHeight / 2, rx = x, ry = y;
    document.addEventListener('pointerleave', () => cursor.classList.remove('is-on'));
    addEventListener('pointermove', e => { cursor.classList.add('is-on'); x = e.clientX; y = e.clientY; dot.style.transform = `translate(${x}px,${y}px) translate(-50%,-50%)`; }, { passive: true });
    const loop = () => { rx += (x - rx) * .16; ry += (y - ry) * .16; ring.style.transform = `translate(${rx}px,${ry}px) translate(-50%,-50%)`; requestAnimationFrame(loop); };
    loop();
    document.addEventListener('pointerover', e => {
      const v = e.target.closest('[data-cursor], .panel, .card');
      const l = e.target.closest('a, button, input, textarea, select, label');
      cursor.classList.toggle('is-view', !!v);
      cursor.classList.toggle('is-hover', !v && !!l);
      if (v) label.textContent = v.dataset.cursor || 'Ver';
    });
  }

  /* ---------- Botones magnéticos ---------- */
  if (finePointer && !reduced) {
    $$('.magnetic').forEach(el => {
      el.addEventListener('pointermove', e => {
        const r = el.getBoundingClientRect();
        const dx = e.clientX - (r.left + r.width / 2), dy = e.clientY - (r.top + r.height / 2);
        el.style.transform = `translate(${dx * .25}px, ${dy * .35}px)`;
      });
      el.addEventListener('pointerleave', () => {
        el.style.transition = 'transform .6s cubic-bezier(.22,1,.36,1)';
        el.style.transform = '';
        setTimeout(() => (el.style.transition = ''), 600);
      });
    });

    /* Tarjetas 3D */
    $$('.tilt').forEach(el => {
      el.addEventListener('pointermove', e => {
        const r = el.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width - .5, py = (e.clientY - r.top) / r.height - .5;
        el.style.transform = `rotateY(${px * 10}deg) rotateX(${-py * 10}deg) translateY(-6px)`;
      });
      el.addEventListener('pointerleave', () => {
        el.style.transition = 'transform .8s cubic-bezier(.22,1,.36,1), box-shadow .5s';
        el.style.transform = '';
        setTimeout(() => (el.style.transition = ''), 800);
      });
    });
  }

  /* Brillo que sigue al puntero */
  $$('.glow').forEach(el => el.addEventListener('pointermove', e => {
    const r = el.getBoundingClientRect();
    el.style.setProperty('--mx', `${e.clientX - r.left}px`);
    el.style.setProperty('--my', `${e.clientY - r.top}px`);
  }));

  /* ---------- Proceso: paso activo ---------- */
  const steps = $$('.step'), stepImgs = $$('.process__visual img'), stepsList = $('.steps');
  const stepIO = new IntersectionObserver(entries => {
    entries.forEach(en => {
      if (!en.isIntersecting) return;
      const i = steps.indexOf(en.target);
      steps.forEach((s, k) => s.classList.toggle('is-active', k === i));
      stepImgs.forEach((im, k) => im.classList.toggle('is-active', k === i));
    });
  }, { rootMargin: '-45% 0px -45% 0px' });
  steps.forEach(s => stepIO.observe(s));
  addEventListener('scroll', () => {
    const r = stepsList.getBoundingClientRect();
    const p = Math.min(1, Math.max(0, (innerHeight * .5 - r.top) / r.height));
    stepsList.style.setProperty('--prog', `${p * 100}%`);
  }, { passive: true });

  /* ---------- Lightbox ---------- */
  const lb = $('.lightbox'), lbImg = $('.lightbox img'), lbCap = $('.lightbox figcaption');
  const items = $$('.masonry__item');
  let li = 0;
  const showLB = i => {
    li = (i + items.length) % items.length;
    const it = items[li];
    lbImg.src = it.getAttribute('href'); lbImg.alt = $('img', it).alt; lbCap.textContent = $('span', it).textContent;
  };
  const openLayer = el => { el.classList.add('is-open'); el.setAttribute('aria-hidden', 'false'); lenis && lenis.stop(); };
  const closeLayer = el => { el.classList.remove('is-open'); el.setAttribute('aria-hidden', 'true'); lenis && lenis.start(); };
  items.forEach((it, i) => it.addEventListener('click', e => { e.preventDefault(); showLB(i); openLayer(lb); }));
  $('.lightbox__close').addEventListener('click', () => closeLayer(lb));
  $('.lightbox__prev').addEventListener('click', () => showLB(li - 1));
  $('.lightbox__next').addEventListener('click', () => showLB(li + 1));
  lb.addEventListener('click', e => { if (e.target === lb) closeLayer(lb); });

  /* ---------- Modales legales ---------- */
  $$('[data-modal]').forEach(a => a.addEventListener('click', e => { e.preventDefault(); openLayer($('#modal-' + a.dataset.modal)); }));
  $$('.modal').forEach(m => {
    m.addEventListener('click', e => { if (e.target === m || e.target.closest('.modal__close')) closeLayer(m); });
  });
  addEventListener('keydown', e => {
    if (e.key === 'Escape') { $$('.lightbox.is-open, .modal.is-open').forEach(closeLayer); closeMenu(); }
    if (lb.classList.contains('is-open')) { if (e.key === 'ArrowLeft') showLB(li - 1); if (e.key === 'ArrowRight') showLB(li + 1); }
  });

  /* ---------- Formulario ---------- */
  const form = $('#contactForm'), status = $('.form__status', form);
  form.addEventListener('submit', async e => {
    e.preventDefault();
    let ok = true;
    $$('[required]', form).forEach(f => {
      const wrap = f.closest('.field, .check');
      const valid = f.type === 'checkbox' ? f.checked : f.checkValidity() && f.value.trim() !== '';
      wrap.classList.toggle('is-invalid', !valid);
      if (!valid) ok = false;
    });
    if (!ok) { status.className = 'form__status err'; status.textContent = 'Por favor complete los campos obligatorios.'; return; }
    const btn = $('button[type=submit] span', form);
    btn.textContent = 'Enviando…';
    try {
      if (CONTACT_ENDPOINT) {
        const res = await fetch(CONTACT_ENDPOINT, { method: 'POST', body: new FormData(form), headers: { Accept: 'application/json' } });
        if (!res.ok) throw new Error();
      } else {
        await new Promise(r => setTimeout(r, 900)); // demo sin backend
      }
      form.reset();
      status.className = 'form__status ok';
      status.textContent = '¡Gracias! Hemos recibido su mensaje y le responderemos a la brevedad.';
    } catch {
      status.className = 'form__status err';
      status.textContent = 'No se pudo enviar el mensaje. Inténtelo nuevamente.';
    }
    btn.textContent = 'Enviar mensaje';
  });
  $$('input, textarea, select', form).forEach(f => f.addEventListener('input', () => f.closest('.field, .check')?.classList.remove('is-invalid')));

  /* ---------- Animaciones GSAP ---------- */
  const count = (el, dur = 2.2) => {
    const end = +el.dataset.count, suf = el.dataset.suffix || '';
    const fmt = n => Math.round(n).toLocaleString('es-PE').replace(/,/g, ' ') + suf;
    if (!hasGSAP || reduced) { el.textContent = fmt(end); return; }
    const o = { v: 0 };
    gsap.to(o, { v: end, duration: dur, ease: 'power3.out', onUpdate: () => (el.textContent = fmt(o.v)) });
  };

  const preloader = $('.preloader');
  const startPage = () => {
    document.body.classList.remove('is-loading');
    if (!hasGSAP || reduced) {
      preloader.remove();
      $$('[data-count]').forEach(el => count(el));
      return;
    }
    const tl = gsap.timeline();
    tl.to(preloader, { yPercent: -100, duration: 1, ease: 'expo.inOut', onComplete: () => preloader.remove() })
      .from('.hero__slide.is-active', { scale: 1.4, duration: 2, ease: 'expo.out' }, '-=.6')
      .from('.header__inner', { y: -40, opacity: 0, duration: .9, ease: 'expo.out', clearProps: 'all' }, '-=1.6')
      .from('.hero__eyebrow', { y: 20, opacity: 0, duration: .8, ease: 'expo.out' }, '-=1.4')
      .from('.hero__title .wi', { yPercent: 110, rotate: 4, duration: 1.2, stagger: .06, ease: 'expo.out' }, '-=1.3')
      .from('.hero__lead, .hero__actions > *', { y: 30, opacity: 0, duration: 1, stagger: .1, ease: 'expo.out' }, '-=1')
      .from('.hero__meta > *', { y: 30, opacity: 0, duration: .9, stagger: .08, ease: 'expo.out' }, '-=.8');
  };

  // Preloader: progreso real de carga de imágenes
  if (preloader) {
    document.body.classList.add('is-loading');
    const imgs = $$('img').filter(i => i.loading !== 'lazy').concat(slides.map(s => {
      const im = new Image(); im.src = getComputedStyle(s).backgroundImage.slice(5, -2).replace(/"/g, ''); return im;
    }));
    const bar = $('.preloader__bar span'), cnt = $('.preloader__count');
    let loaded = 0, shown = 0, done = false;
    const total = imgs.length;
    const tick = () => { loaded++; };
    imgs.forEach(im => (im.complete ? tick() : (im.addEventListener('load', tick), im.addEventListener('error', tick))));
    const finish = () => { if (done) return; done = true; startPage(); };
    const anim = () => {
      const target = (loaded / total) * 100;
      shown += (target - shown) * .12 + .4;
      shown = Math.min(shown, target, 100);
      bar.style.width = shown + '%'; cnt.textContent = Math.round(shown) + '%';
      if (shown >= 99.5) { bar.style.width = '100%'; cnt.textContent = '100%'; setTimeout(finish, 250); return; }
      requestAnimationFrame(anim);
    };
    anim();
    setTimeout(finish, 6000); // por si alguna imagen tarda demasiado
  }

  if (!hasGSAP || reduced) return;

  gsap.registerPlugin(ScrollTrigger);

  // Títulos con texto dividido (excepto el hero)
  $$('.split').filter(el => !el.classList.contains('hero__title')).forEach(el => {
    gsap.from($$('.wi', el), {
      yPercent: 110, rotate: 3, duration: 1.1, stagger: .04, ease: 'expo.out',
      scrollTrigger: { trigger: el, start: 'top 85%' }
    });
  });

  // Revelados genéricos
  $$('.reveal').forEach(el => gsap.from(el, { y: 40, opacity: 0, duration: 1.1, ease: 'expo.out', scrollTrigger: { trigger: el, start: 'top 88%' } }));
  $$('.reveal-stagger').forEach(el => gsap.from(el.children, { y: 24, opacity: 0, duration: .9, stagger: .08, ease: 'expo.out', scrollTrigger: { trigger: el, start: 'top 88%' } }));
  $$('.eyebrow').forEach(el => gsap.from(el, { x: -20, opacity: 0, duration: .9, ease: 'expo.out', scrollTrigger: { trigger: el, start: 'top 90%' } }));

  // Imágenes con clip-path
  $$('.reveal-img').forEach(el => {
    gsap.fromTo(el, { clipPath: 'inset(100% 0 0 0)' }, { clipPath: 'inset(0% 0 0 0)', duration: 1.5, ease: 'expo.inOut', scrollTrigger: { trigger: el, start: 'top 85%' } });
    gsap.from($('img', el), { scale: 1.3, duration: 2, ease: 'expo.out', scrollTrigger: { trigger: el, start: 'top 85%' } });
  });

  // Parallax
  $$('[data-speed]').forEach(el => gsap.to(el, {
    y: () => +el.dataset.speed * 400, ease: 'none',
    scrollTrigger: { trigger: el.parentElement, start: 'top bottom', end: 'bottom top', scrub: true }
  }));
  gsap.to('.hero__content', { yPercent: 30, opacity: 0, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } });
  gsap.to('.hero__slides', { yPercent: 18, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } });
  ['.stats__bg', '.cta__bg'].forEach(s => gsap.fromTo(s, { yPercent: -12 }, { yPercent: 12, ease: 'none', scrollTrigger: { trigger: $(s).parentElement, start: 'top bottom', end: 'bottom top', scrub: true } }));

  // Contadores
  gsap.from('.stat', { y: 40, opacity: 0, duration: 1, stagger: .08, ease: 'expo.out', scrollTrigger: { trigger: '.stats', start: 'top 75%', onEnter: () => $$('[data-count]').forEach(el => count(el)), once: true } });

  // Tarjetas de servicios
  ScrollTrigger.batch('.card', {
    start: 'top 90%',
    onEnter: batch => gsap.from(batch, { y: 80, opacity: 0, duration: 1.1, stagger: .1, ease: 'expo.out', clearProps: 'transform,opacity' })
  });
  gsap.from('.services', { borderRadius: '120px 120px 0 0', ease: 'none', scrollTrigger: { trigger: '.services', start: 'top bottom', end: 'top 40%', scrub: true } });

  // Valores y galería
  gsap.from('.value', { y: 60, opacity: 0, duration: 1, stagger: .1, ease: 'expo.out', scrollTrigger: { trigger: '.values__grid', start: 'top 85%' } });
  ScrollTrigger.batch('.masonry__item', {
    start: 'top 92%',
    onEnter: b => gsap.fromTo(b, { clipPath: 'inset(0 0 100% 0)' }, { clipPath: 'inset(0 0 0% 0)', duration: 1.2, stagger: .08, ease: 'expo.inOut' })
  });

  // Mapa: arcos dibujándose
  gsap.to('.map__arcs path', { strokeDashoffset: 0, duration: 2, stagger: .25, ease: 'power2.inOut', scrollTrigger: { trigger: '.map', start: 'top 70%' } });
  gsap.from('.map__list li', { x: 30, opacity: 0, duration: .8, stagger: .07, ease: 'expo.out', scrollTrigger: { trigger: '.map', start: 'top 70%' } });

  // CTA y footer
  gsap.from('.cta p, .cta .btn', { y: 30, opacity: 0, duration: 1, stagger: .12, ease: 'expo.out', scrollTrigger: { trigger: '.cta', start: 'top 70%' } });
  gsap.from('.footer__big', { yPercent: 60, opacity: 0, duration: 1.4, ease: 'expo.out', scrollTrigger: { trigger: '.footer', start: 'top 85%' } });

  // Scroll horizontal fijado (solo escritorio)
  ScrollTrigger.matchMedia({
    '(min-width: 861px)': () => {
      const track = $('.hscroll__track');
      const dist = () => track.scrollWidth - innerWidth;
      const tween = gsap.to(track, {
        x: () => -dist(), ease: 'none',
        scrollTrigger: { trigger: '.hscroll', pin: '.hscroll__pin', start: 'top top', end: () => '+=' + dist(), scrub: 1, invalidateOnRefresh: true }
      });
      $$('.panel img').forEach(img => gsap.fromTo(img, { xPercent: -6 }, {
        xPercent: 6, ease: 'none',
        scrollTrigger: { trigger: img.parentElement, containerAnimation: tween, start: 'left right', end: 'right left', scrub: true }
      }));
    }
  });

  addEventListener('load', () => ScrollTrigger.refresh());
})();
