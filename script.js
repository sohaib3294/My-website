const toggle = document.querySelector('.menu-toggle');
const nav = document.querySelector('.nav-links');
const navBackdrop = document.querySelector('#navBackdrop');
const applyNowBtn = document.querySelector('#applyNowBtn');
const applyModal = document.querySelector('#applyModal');
const closeApplyModal = document.querySelector('#closeApplyModal');
const brandAnthem = document.querySelector('#brandAnthem');
const hero = document.querySelector('.hero');
const heroParallaxItems = document.querySelectorAll('.hero-top-left-img, .hero-right-center-img');
const quickActionsToggle = document.querySelector('#quickActionsToggle');
const quickActionsDrawer = document.querySelector('#quickActionsDrawer');

const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const isMobilePerformanceMode = window.matchMedia('(max-width: 768px), (pointer: coarse)').matches;
const prefersReducedData = Boolean(navigator.connection && navigator.connection.saveData);
const isLightMotionMode = isMobilePerformanceMode || prefersReducedMotion;
const shouldLimitHeavyMedia = isLightMotionMode || prefersReducedData;
const hasFinePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
const isDesktopWide = window.innerWidth >= 1280;
const desktopMotionScale = isDesktopWide ? 0.45 : 0.3;

const heroGifSources = [
  'images/pakistan-army-pak-army.gif',
  'images/pakistan-air-force-paf.gif',
  'images/pakistan-navy.gif'
];

const trackEvent = (eventName, eventData = {}) => {
  if (Array.isArray(window.dataLayer)) {
    window.dataLayer.push({ event: eventName, ...eventData });
  }
};

const sendFormByEmail = (form, formType) => {
  const recipient = 'ijazpasha@gmail.com';
  const formData = new FormData(form);
  const details = [];

  for (const [key, value] of formData.entries()) {
    const label = key.charAt(0).toUpperCase() + key.slice(1);
    details.push(`${label}: ${value}`);
  }

  const subject = encodeURIComponent(`${formType} Submission - Pasha Cadet Academy`);
  const body = encodeURIComponent([
    `A new ${formType.toLowerCase()} was submitted from the website.`,
    '',
    ...details,
    '',
    'Submitted from Pasha Cadet Academy website.'
  ].join('\n'));

  window.location.href = `mailto:${recipient}?subject=${subject}&body=${body}`;
};

const closeNavMenu = () => {
  if (nav) {
    nav.classList.remove('active');
  }
  if (navBackdrop) {
    navBackdrop.classList.remove('active');
  }
};

if (toggle && nav) {
  toggle.addEventListener('click', () => {
    nav.classList.toggle('active');
    if (navBackdrop) {
      navBackdrop.classList.toggle('active');
    }
  });
}

if (navBackdrop) {
  navBackdrop.addEventListener('click', closeNavMenu);
}

document.querySelectorAll('.nav-links a').forEach((link) => {
  link.addEventListener('click', () => {
    if (window.innerWidth <= 768) {
      closeNavMenu();
    }
  });
});

if (applyNowBtn && applyModal && closeApplyModal) {
  const openModal = () => {
    trackEvent('cta_click', { cta: 'apply_now' });
    applyModal.classList.add('active');
    applyModal.setAttribute('aria-hidden', 'false');
    document.body.classList.add('modal-open');
  };

  const closeModal = () => {
    applyModal.classList.remove('active');
    applyModal.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('modal-open');
  };

  applyNowBtn.addEventListener('click', openModal);
  closeApplyModal.addEventListener('click', closeModal);

  applyModal.addEventListener('click', (event) => {
    if (event.target === applyModal) {
      closeModal();
    }
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && applyModal.classList.contains('active')) {
      closeModal();
    }
  });
}

if (brandAnthem) {
  const phrases = (brandAnthem.dataset.phrases || '')
    .split('|')
    .map((phrase) => phrase.trim())
    .filter(Boolean);
  let anthemIndex = 0;

  const renderAnthem = () => {
    if (phrases.length === 0) {
      return;
    }

    brandAnthem.classList.add('fade-out');
    window.setTimeout(() => {
      brandAnthem.textContent = phrases[anthemIndex];
      brandAnthem.classList.remove('fade-out');
      anthemIndex = (anthemIndex + 1) % phrases.length;
    }, 220);
  };

  renderAnthem();
  window.setInterval(renderAnthem, 3600);
}

if (hero) {
  const heroGifTransitionLayer = !shouldLimitHeavyMedia ? document.createElement('div') : null;
  if (heroGifTransitionLayer) {
    heroGifTransitionLayer.className = 'hero-bg-fader';
    hero.prepend(heroGifTransitionLayer);
  }

  const heroGifBackground = (source) =>
    `linear-gradient(145deg, rgba(2,6,23,0.66), rgba(2,6,23,0.45)), url('${source}')`;

  let heroGifIndex = 0;
  const heroGifHoldMs = 11000;
  const heroGifFadeMs = shouldLimitHeavyMedia ? 0 : 1000;

  const applyHeroGif = (source) => {
    hero.style.backgroundImage = heroGifBackground(source);
  };

  if (shouldLimitHeavyMedia) {
    applyHeroGif('images/project.jpg');
  } else {
    applyHeroGif(heroGifSources[heroGifIndex]);

    const cycleHeroGif = () => {
      const nextIndex = (heroGifIndex + 1) % heroGifSources.length;
      const nextSource = heroGifSources[nextIndex];

      if (heroGifTransitionLayer) {
        heroGifTransitionLayer.style.backgroundImage = heroGifBackground(nextSource);
        heroGifTransitionLayer.classList.add('visible');
      }

      window.setTimeout(() => {
        applyHeroGif(nextSource);
        if (heroGifTransitionLayer) {
          heroGifTransitionLayer.classList.remove('visible');
        }

        heroGifIndex = nextIndex;
        window.setTimeout(cycleHeroGif, heroGifHoldMs);
      }, heroGifFadeMs);
    };

    window.setTimeout(cycleHeroGif, heroGifHoldMs);
  }
}

const updateAmbientPointer = (x, y) => {
  const xPercent = Math.max(0, Math.min(100, (x / window.innerWidth) * 100));
  const yPercent = Math.max(0, Math.min(100, (y / window.innerHeight) * 100));
  document.documentElement.style.setProperty('--bg-x', `${xPercent}%`);
  document.documentElement.style.setProperty('--bg-y', `${yPercent}%`);
};

let pointerX = window.innerWidth / 2;
let pointerY = window.innerHeight / 2;
let ticking = false;

const updateParallax = () => {
  if (!hero) {
    ticking = false;
    return;
  }

  const rect = hero.getBoundingClientRect();
  const xRatio = (pointerX - rect.left) / rect.width - 0.5;
  const yRatio = (pointerY - rect.top) / rect.height - 0.5;

  heroParallaxItems.forEach((item, index) => {
    const depth = (index === 0 ? 10 : 6) * desktopMotionScale;
    const shiftX = xRatio * depth;
    const shiftY = yRatio * depth;

    if (item.classList.contains('hero-right-center-img')) {
      item.style.transform = `translateX(-50%) translate(${shiftX}px, ${shiftY}px)`;
    } else {
      item.style.transform = `translate(${shiftX}px, ${shiftY}px)`;
    }
  });

  ticking = false;
};

if (!isLightMotionMode) {
  window.addEventListener('pointermove', (event) => {
    pointerX = event.clientX;
    pointerY = event.clientY;
    updateAmbientPointer(pointerX, pointerY);

    if (!ticking) {
      window.requestAnimationFrame(updateParallax);
      ticking = true;
    }
  });
}

const revealTargets = document.querySelectorAll(
  'section h2, section p, .card, form, .timeline-item, .faq-item, .stat-card, .testimonial-slider, .testimonial-controls, iframe, .gallery-item, .trust-pill'
);
const revealVariants = ['reveal-rise', 'reveal-left', 'reveal-right'];

revealTargets.forEach((item, index) => {
  item.classList.add('reveal-target');
  item.classList.add(revealVariants[index % revealVariants.length]);
  item.style.transitionDelay = isLightMotionMode ? '0ms' : `${Math.min(index * 35, 360)}ms`;
});

if ('IntersectionObserver' in window && !isLightMotionMode) {
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.style.willChange = 'transform, opacity';
        entry.target.classList.add('is-visible');
        window.setTimeout(() => {
          entry.target.style.willChange = 'auto';
        }, 520);
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.14 });

  revealTargets.forEach((item) => revealObserver.observe(item));
} else {
  revealTargets.forEach((item) => item.classList.add('is-visible'));
}

const statNumbers = document.querySelectorAll('.stat-number');
let statsAnimated = false;

const animateCounter = (element, target) => {
  if (isLightMotionMode) {
    element.textContent = target.toString();
    return;
  }

  const duration = 1600;
  const startTime = performance.now();
  const easeOutCubic = (value) => 1 - Math.pow(1 - value, 3);

  const frame = (now) => {
    const progress = Math.min((now - startTime) / duration, 1);
    const eased = easeOutCubic(progress);
    element.textContent = Math.round(target * eased).toString();

    if (progress < 1) {
      window.requestAnimationFrame(frame);
    }
  };

  window.requestAnimationFrame(frame);
};

const statsSection = document.querySelector('#stats');
if (statsSection && statNumbers.length > 0) {
  const statsObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting && !statsAnimated) {
        statNumbers.forEach((item) => {
          const target = Number(item.dataset.target || 0);
          animateCounter(item, target);
        });
        statsAnimated = true;
      }
    });
  }, { threshold: 0.32 });

  statsObserver.observe(statsSection);
}

const testimonialItems = document.querySelectorAll('.testimonial');
const prevTestimonial = document.querySelector('#prevTestimonial');
const nextTestimonial = document.querySelector('#nextTestimonial');
let testimonialIndex = 0;

const setTestimonial = (newIndex) => {
  if (testimonialItems.length === 0) {
    return;
  }

  testimonialItems.forEach((item, index) => {
    item.classList.toggle('active', index === newIndex);
  });
  testimonialIndex = newIndex;
};

if (testimonialItems.length > 0) {
  setTestimonial(0);

  if (prevTestimonial) {
    prevTestimonial.addEventListener('click', () => {
      const nextIndex = (testimonialIndex - 1 + testimonialItems.length) % testimonialItems.length;
      setTestimonial(nextIndex);
    });
  }

  if (nextTestimonial) {
    nextTestimonial.addEventListener('click', () => {
      const nextIndex = (testimonialIndex + 1) % testimonialItems.length;
      setTestimonial(nextIndex);
    });
  }

  window.setInterval(() => {
    const nextIndex = (testimonialIndex + 1) % testimonialItems.length;
    setTestimonial(nextIndex);
  }, 5500);
}

const eligibilityForm = document.querySelector('#eligibilityForm');
const eligibilityResult = document.querySelector('#eligibilityResult');

if (eligibilityForm && eligibilityResult) {
  eligibilityForm.addEventListener('submit', (event) => {
    event.preventDefault();

    const age = document.querySelector('#eligibilityAge')?.value;
    const education = document.querySelector('#eligibilityClass')?.value;
    const fitness = document.querySelector('#eligibilityFitness')?.value;

    if (!age || !education || !fitness) {
      eligibilityResult.textContent = 'Please complete all fields before checking eligibility.';
      eligibilityResult.classList.add('active');
      return;
    }

    let recommendation = 'Start with foundation classes for confidence, academics, and fitness.';

    if (age === 'mid' && (education === 'matric' || education === 'inter') && (fitness === 'regular' || fitness === 'advanced')) {
      recommendation = 'Great fit for ISSB focused preparation with interview and physical modules.';
    }

    if (age === 'adult' && education === 'inter' && fitness === 'advanced') {
      recommendation = 'Strong candidate profile for intensive ISSB fast-track preparation.';
    }

    if (age === 'under' || education === 'middle') {
      recommendation = 'Recommended: Cadet College entry preparation and gradual personality development track.';
    }

    eligibilityResult.textContent = recommendation;
    eligibilityResult.classList.add('active');
  });
}

const faqQuestions = document.querySelectorAll('.faq-question');
faqQuestions.forEach((button) => {
  button.addEventListener('click', () => {
    const item = button.closest('.faq-item');
    if (!item) {
      return;
    }

    const isActive = item.classList.contains('active');
    faqQuestions.forEach((q) => {
      q.setAttribute('aria-expanded', 'false');
      const parent = q.closest('.faq-item');
      if (parent) {
        parent.classList.remove('active');
      }
    });

    if (!isActive) {
      item.classList.add('active');
      button.setAttribute('aria-expanded', 'true');
    }
  });
});

const showFormMessage = (form, text, type) => {
  let feedback = form.querySelector('.form-feedback');
  if (!feedback) {
    feedback = document.createElement('p');
    feedback.className = 'form-feedback';
    form.appendChild(feedback);
  }

  feedback.className = `form-feedback ${type}`;
  feedback.textContent = text;
};

const validateForms = document.querySelectorAll('.validate-form');
validateForms.forEach((form) => {
  form.addEventListener('submit', (event) => {
    event.preventDefault();

    const requiredFields = form.querySelectorAll('input[required], textarea[required], select[required]');
    let firstInvalid = null;

    requiredFields.forEach((field) => {
      field.classList.remove('is-invalid');
      const value = field.value.trim();

      if (!value) {
        field.classList.add('is-invalid');
        if (!firstInvalid) {
          firstInvalid = field;
        }
        return;
      }

      if (field.type === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
        field.classList.add('is-invalid');
        if (!firstInvalid) {
          firstInvalid = field;
        }
      }

      if ((field.name === 'phone' || field.type === 'tel') && !/^03[0-9]{9}$/.test(value.replace(/\s+/g, ''))) {
        field.classList.add('is-invalid');
        if (!firstInvalid) {
          firstInvalid = field;
        }
      }
    });

    if (firstInvalid) {
      showFormMessage(form, 'Please complete valid information in all required fields.', 'error');
      firstInvalid.focus();
      return;
    }

    const formType = form.dataset.formType || 'Form';
    showFormMessage(form, `${formType} submitted successfully. We will contact you soon.`, 'success');
    trackEvent('form_submit', { form: formType.toLowerCase().replace(/\s+/g, '_') });
    sendFormByEmail(form, formType);
    form.reset();

    if (form.classList.contains('modal-form') && applyModal && applyModal.classList.contains('active')) {
      window.setTimeout(() => {
        applyModal.classList.remove('active');
        applyModal.setAttribute('aria-hidden', 'true');
        document.body.classList.remove('modal-open');
      }, 800);
    }
  });

  form.querySelectorAll('input, textarea, select').forEach((field) => {
    field.addEventListener('input', () => {
      field.classList.remove('is-invalid');
    });

    field.addEventListener('blur', () => {
      if (!field.required) {
        return;
      }
      if (!field.value.trim()) {
        field.classList.add('is-invalid');
      }
    });
  });
});

const preloader = document.querySelector('#preloader');
const loadDelay = isLightMotionMode ? 250 : 1200;

window.addEventListener('load', () => {
  window.setTimeout(() => {
    if (preloader) {
      preloader.classList.add('hidden');
      window.setTimeout(() => {
        preloader.style.display = 'none';
      }, 600);
    }
  }, loadDelay);
});

const scrollProgress = document.querySelector('#scrollProgress');
if (scrollProgress) {
  window.addEventListener('scroll', () => {
    const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
    const scrolled = maxScroll > 0 ? (window.scrollY / maxScroll) * 100 : 0;
    scrollProgress.style.width = `${scrolled}%`;
  });
}

if (!isLightMotionMode && hasFinePointer) {
  document.querySelectorAll('.btn, .card, .trust-pill').forEach((element) => {
    element.addEventListener('mouseenter', () => {
      element.classList.add('is-animating');
    });

    element.addEventListener('mouseleave', () => {
      element.classList.remove('is-animating');
    });
  });
}

const magneticButtons = document.querySelectorAll('.btn-primary');
let mouseX = 0;
let mouseY = 0;

if (!isLightMotionMode && hasFinePointer && !isDesktopWide) {
  document.addEventListener('mousemove', (event) => {
    mouseX = event.clientX;
    mouseY = event.clientY;
  });

  magneticButtons.forEach((btn) => {
    const updateMagnet = () => {
      const rect = btn.getBoundingClientRect();
      const btnX = rect.left + rect.width / 2;
      const btnY = rect.top + rect.height / 2;
      const distance = Math.sqrt(Math.pow(mouseX - btnX, 2) + Math.pow(mouseY - btnY, 2));

      if (distance < 200) {
        const angle = Math.atan2(mouseY - btnY, mouseX - btnX);
        const strength = (200 - distance) / 200;
        const moveX = Math.cos(angle) * strength * 6;
        const moveY = Math.sin(angle) * strength * 6;
        btn.style.transform = `translate(${moveX}px, ${moveY}px)`;
      } else {
        btn.style.transform = 'translate(0, 0)';
      }
    };

    btn.addEventListener('mouseenter', updateMagnet);
    btn.addEventListener('mousemove', updateMagnet);
    btn.addEventListener('mouseleave', () => {
      btn.style.transform = 'translate(0, 0)';
    });
  });
}

const tiltCards = document.querySelectorAll('.card');
if (!isLightMotionMode && hasFinePointer && !isDesktopWide) {
  tiltCards.forEach((card) => {
    card.addEventListener('mousemove', (event) => {
      const rect = card.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;

      const rotateX = (y - centerY) / 18;
      const rotateY = (centerX - x) / 18;

      card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
      card.style.setProperty('--glow-x', `${(x / rect.width) * 100}%`);
      card.style.setProperty('--glow-y', `${(y / rect.height) * 100}%`);
    });

    card.addEventListener('mouseleave', () => {
      card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0)';
      card.style.setProperty('--glow-x', '50%');
      card.style.setProperty('--glow-y', '35%');
    });
  });
}

if (quickActionsToggle && quickActionsDrawer) {
  quickActionsToggle.addEventListener('click', () => {
    const isActive = quickActionsDrawer.classList.toggle('active');
    quickActionsDrawer.setAttribute('aria-hidden', isActive ? 'false' : 'true');
  });

  document.addEventListener('click', (event) => {
    if (!quickActionsDrawer.contains(event.target) && event.target !== quickActionsToggle) {
      quickActionsDrawer.classList.remove('active');
      quickActionsDrawer.setAttribute('aria-hidden', 'true');
    }
  });
}

const createMicroSound = (type) => {
  const AudioContextClass = window.AudioContext || window.webkitAudioContext;
  if (!AudioContextClass) {
    return;
  }

  const audioContext = new AudioContextClass();
  const oscillator = audioContext.createOscillator();
  const gainNode = audioContext.createGain();

  oscillator.connect(gainNode);
  gainNode.connect(audioContext.destination);

  if (type === 'click') {
    oscillator.frequency.value = 520;
    gainNode.gain.setValueAtTime(0.04, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.1);
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.1);
  } else if (type === 'hover') {
    oscillator.frequency.value = 680;
    gainNode.gain.setValueAtTime(0.02, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.08);
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.08);
  }
};

if (!isLightMotionMode) {
  document.querySelectorAll('.btn, .faq-question, a[href*="wa.me"]').forEach((element) => {
    element.addEventListener('click', () => {
      try {
        createMicroSound('click');
      } catch (error) {
      }
    });

    element.addEventListener('mouseenter', () => {
      try {
        createMicroSound('hover');
      } catch (error) {
      }
    });
  });
}

const pageTransitionLinks = document.querySelectorAll('a[href*="information.html"], a[href*="issb.html"], a[href*="roadmap.html"], a[href*="index.html"]');
pageTransitionLinks.forEach((link) => {
  link.addEventListener('click', (event) => {
    if (!link.target || link.target !== '_blank') {
      event.preventDefault();
      const href = link.getAttribute('href');
      if (!href) {
        return;
      }

      document.body.style.opacity = '0';
      document.body.style.transition = 'opacity 0.4s ease';
      window.setTimeout(() => {
        window.location.href = href;
      }, 400);
    }
  });
});

document.querySelectorAll('[data-track], a[href*="wa.me"], a[href*="roadmap.html"]').forEach((element) => {
  element.addEventListener('click', () => {
    const label = element.dataset.track || element.getAttribute('href') || 'unknown';
    trackEvent('link_click', { label });
  });
});

const backToTopButton = document.createElement('button');
backToTopButton.type = 'button';
backToTopButton.className = 'back-to-top';
backToTopButton.setAttribute('aria-label', 'Back to top');
backToTopButton.textContent = '↑';
document.body.appendChild(backToTopButton);

backToTopButton.addEventListener('click', () => {
  window.scrollTo({ top: 0, behavior: isLightMotionMode ? 'auto' : 'smooth' });
});

const navLinks = Array.from(document.querySelectorAll('.nav-links a[href^="#"]'));
const sectionMap = navLinks
  .map((link) => {
    const targetId = link.getAttribute('href')?.slice(1);
    const target = targetId ? document.getElementById(targetId) : null;
    return target ? { link, target } : null;
  })
  .filter(Boolean);

const currentPageNavLinks = Array.from(document.querySelectorAll('.nav-links a[href$="information.html"], .nav-links a[href$="issb.html"], .nav-links a[href$="roadmap.html"]'));

const highlightCurrentPageLink = () => {
  if (sectionMap.length > 0) {
    return;
  }

  const currentPath = window.location.pathname.split('/').pop() || 'index.html';
  currentPageNavLinks.forEach((link) => {
    const href = link.getAttribute('href') || '';
    const isActive = href.endsWith(currentPath);
    link.classList.toggle('active', isActive);
    if (isActive) {
      link.setAttribute('aria-current', 'page');
    } else {
      link.removeAttribute('aria-current');
    }
  });
};

const updateNavState = () => {
  const scrollY = window.scrollY || window.pageYOffset;
  const showBackToTop = scrollY > 700;
  backToTopButton.classList.toggle('visible', showBackToTop);

  let activeSectionId = 'home';

  sectionMap.forEach(({ target }) => {
    const top = target.getBoundingClientRect().top + window.scrollY;
    if (scrollY + 120 >= top) {
      activeSectionId = target.id;
    }
  });

  navLinks.forEach((link) => {
    const targetId = link.getAttribute('href')?.slice(1);
    const isActive = targetId === activeSectionId;
    link.classList.toggle('active', isActive);
    if (isActive) {
      link.setAttribute('aria-current', 'page');
    } else {
      link.removeAttribute('aria-current');
    }
  });
};

window.addEventListener('scroll', updateNavState, { passive: true });
window.addEventListener('load', updateNavState);
updateNavState();
highlightCurrentPageLink();
