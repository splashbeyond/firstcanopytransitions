document.querySelectorAll('.criterion').forEach(item => item.addEventListener('click', () => {
  const willOpen = !item.classList.contains('is-open');
  document.querySelectorAll('.criterion').forEach(other => {
    other.classList.remove('is-open');
    other.setAttribute('aria-expanded', 'false');
  });
  if (willOpen) {
    item.classList.add('is-open');
    item.setAttribute('aria-expanded', 'true');
  }
}));

const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
const mobileHero = window.matchMedia('(max-width: 600px)');
const heroVideo = document.querySelector('.hero-video');

function syncHeroMotion() {
  if (reducedMotion.matches || mobileHero.matches) heroVideo?.pause();
  else heroVideo?.play().catch(() => {});
}

syncHeroMotion();
reducedMotion.addEventListener?.('change', syncHeroMotion);
mobileHero.addEventListener?.('change', syncHeroMotion);

let isResettingHeroVideo = false;
function resetHeroVideoLoop() {
  if (!heroVideo || isResettingHeroVideo || !Number.isFinite(heroVideo.duration)) return;
  if (heroVideo.duration - heroVideo.currentTime > .45) return;
  isResettingHeroVideo = true;
  heroVideo.classList.add('is-looping');
  window.setTimeout(() => {
    heroVideo.currentTime = .04;
    heroVideo.play().catch(() => {});
  }, 180);
}

heroVideo?.addEventListener('timeupdate', resetHeroVideoLoop);
heroVideo?.addEventListener('seeked', () => window.requestAnimationFrame(() => {
  heroVideo.classList.remove('is-looping');
  isResettingHeroVideo = false;
}));

const menuToggle = document.querySelector('.menu-toggle');
const mobileMenu = document.querySelector('.mobile-menu');

function setMobileMenu(open) {
  menuToggle?.setAttribute('aria-expanded', String(open));
  menuToggle?.setAttribute('aria-label', open ? 'Close navigation menu' : 'Open navigation menu');
  mobileMenu?.setAttribute('aria-hidden', String(!open));
  mobileMenu?.classList.toggle('is-open', open);
}

menuToggle?.addEventListener('click', () => setMobileMenu(menuToggle.getAttribute('aria-expanded') !== 'true'));
mobileMenu?.querySelectorAll('a').forEach(link => link.addEventListener('click', () => setMobileMenu(false)));
document.addEventListener('keydown', event => {
  if (event.key === 'Escape' && menuToggle?.getAttribute('aria-expanded') === 'true') {
    setMobileMenu(false);
    menuToggle.focus();
  }
});
document.addEventListener('click', event => {
  if (menuToggle?.getAttribute('aria-expanded') !== 'true') return;
  if (!mobileMenu.contains(event.target) && !menuToggle.contains(event.target)) setMobileMenu(false);
});

const steps = [
  ['01 / CONNECT', 'PRIVATE AND EXPLORATORY', 'Start with a private call.', 'We explain why we contacted you, tell you about the buyer, and answer your questions. No documents or commitment are required.', 0],
  ['02 / YOUR GOALS', 'WHAT MATTERS TO YOU', 'Tell us what you want from a sale.', 'We listen to your goals for price, timing, family, employees, and your role after a sale.', .34],
  ['03 / DECIDE', 'NO OBLIGATION', 'Decide whether to meet the buyer.', 'We help you understand the opportunity. You choose what to share and whether another conversation makes sense.', .67],
  ['04 / MEET BUYER', 'ONLY WITH PERMISSION', 'Speak directly with the buyer.', 'If you want to continue, we make the introduction and give both sides the context needed for a useful conversation.', 1]
];

const tabs = document.querySelectorAll('[role="tab"]');
const route = document.querySelector('.route');
const routeDot = document.querySelector('.route-dot');
const processCard = document.querySelector('.process-card');
const stepChecklist = document.querySelector('#step-checklist');
let currentRouteProgress = 0;
let routeAnimation;

function placeRouteDot(progress) {
  const point = route.getPointAtLength(route.getTotalLength() * progress);
  routeDot.setAttribute('cx', point.x);
  routeDot.setAttribute('cy', point.y);
}

function animateRouteDot(to) {
  cancelAnimationFrame(routeAnimation);
  if (reducedMotion.matches) {
    currentRouteProgress = to;
    placeRouteDot(to);
    return;
  }
  const from = currentRouteProgress;
  const started = performance.now();
  const tick = now => {
    const elapsed = Math.min((now - started) / 420, 1);
    const eased = 1 - Math.pow(1 - elapsed, 3);
    currentRouteProgress = from + (to - from) * eased;
    placeRouteDot(currentRouteProgress);
    if (elapsed < 1) routeAnimation = requestAnimationFrame(tick);
  };
  routeAnimation = requestAnimationFrame(tick);
}

if (route && routeDot) placeRouteDot(0);
tabs.forEach(tab => tab.addEventListener('click', () => {
  tabs.forEach(item => item.setAttribute('aria-selected', 'false'));
  tab.setAttribute('aria-selected', 'true');
  const index = Number(tab.dataset.step);
  const step = steps[index];
  animateRouteDot(step[4]);
  processCard.classList.add('is-changing');
  const updateContent = () => {
    document.querySelector('#step-kicker').textContent = step[0];
    document.querySelector('#step-progress').textContent = step[1];
    document.querySelector('#step-title').textContent = step[2];
    document.querySelector('#step-copy').textContent = step[3];
    stepChecklist.hidden = index !== 0;
    processCard.classList.remove('is-changing');
  };
  if (reducedMotion.matches) updateContent();
  else window.setTimeout(updateContent, 130);
}));

const revealItems = document.querySelectorAll('.reveal, .reveal-group');
if ('IntersectionObserver' in window && !reducedMotion.matches) {
  const observer = new IntersectionObserver(entries => entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    entry.target.classList.add('is-visible');
    observer.unobserve(entry.target);
  }), { threshold: .12, rootMargin: '0px 0px -40px' });
  revealItems.forEach(item => observer.observe(item));
} else {
  revealItems.forEach(item => item.classList.add('is-visible'));
}

const conversationForm = document.querySelector('#conversation-form');
const bookingStep = document.querySelector('#booking-step');
const bookingSuccess = document.querySelector('#booking-success');
const openCalendarButton = document.querySelector('#open-calendar');
const conversationSection = document.querySelector('#conversation');
const formNote = document.querySelector('#form-note');
let bookingUrl = 'https://calendly.com/davis-firstcanopy/confidential-transition-conversation?primary_color=17352d';

function setIntakeProgress(step) {
  document.querySelectorAll('[data-intake-progress]').forEach(item => item.classList.toggle('is-active', item.dataset.intakeProgress === step));
}

function prepareBookingUrl(name, email) {
  const url = new URL('https://calendly.com/davis-firstcanopy/confidential-transition-conversation');
  url.searchParams.set('primary_color', '17352d');
  url.searchParams.set('name', name);
  url.searchParams.set('email', email);
  url.searchParams.set('utm_source', 'first-canopy-transitions');
  url.searchParams.set('utm_medium', 'owner-conversation');
  bookingUrl = url.toString();
  openCalendarButton.href = bookingUrl;
}

function openCalendlyPopup() {
  if (!window.Calendly?.initPopupWidget) return false;
  window.Calendly.initPopupWidget({ url: bookingUrl });
  return true;
}

conversationForm.addEventListener('submit', event => {
  event.preventDefault();
  const requiredFields = [...conversationForm.querySelectorAll('[required]')];
  requiredFields.forEach(field => field.removeAttribute('aria-invalid'));
  const invalidField = requiredFields.find(field => !field.checkValidity());
  if (invalidField) {
    invalidField.setAttribute('aria-invalid', 'true');
    formNote.textContent = invalidField.type === 'email' ? 'Please enter a valid email address.' : 'Please enter your name before scheduling.';
    invalidField.focus();
    return;
  }
  conversationForm.hidden = true;
  bookingSuccess.hidden = true;
  bookingStep.hidden = false;
  conversationSection.classList.add('is-scheduling');
  setIntakeProgress('schedule');
  prepareBookingUrl(document.querySelector('#full-name').value.trim(), document.querySelector('#email').value.trim());
  openCalendlyPopup();
  document.querySelector('#booking-title').focus();
  bookingStep.scrollIntoView({ behavior: reducedMotion.matches ? 'auto' : 'smooth', block: 'start' });
});

document.querySelector('#booking-back').addEventListener('click', () => {
  bookingStep.hidden = true;
  conversationForm.hidden = false;
  conversationSection.classList.remove('is-scheduling');
  setIntakeProgress('details');
  document.querySelector('#full-name').focus();
});

openCalendarButton.addEventListener('click', event => {
  if (!openCalendlyPopup()) return;
  event.preventDefault();
});

window.addEventListener('message', event => {
  if (event.origin !== 'https://calendly.com' || !event.data?.event?.startsWith('calendly.') || bookingStep.hidden) return;
  if (event.data.event !== 'calendly.event_scheduled') return;
  bookingStep.hidden = true;
  bookingSuccess.hidden = false;
  conversationSection.classList.remove('is-scheduling');
  bookingSuccess.focus();
});
