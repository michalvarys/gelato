// Scroll Reveal Animations using Intersection Observer
document.addEventListener("DOMContentLoaded", function() {
  // Select all elements with reveal classes
  const revealElements = document.querySelectorAll('.reveal, .reveal-left, .reveal-right, .reveal-scale, .reveal-stagger');

  if (revealElements.length === 0) return;

  // Check for reduced motion preference
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (prefersReducedMotion) {
    // If user prefers reduced motion, show all elements immediately
    revealElements.forEach(el => el.classList.add('revealed'));
    return;
  }

  // Intersection Observer options
  const observerOptions = {
    root: null, // viewport
    rootMargin: '0px 0px -50px 0px', // trigger slightly before element enters viewport
    threshold: 0.1 // 10% of element visible
  };

  // Callback function
  const revealCallback = (entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('revealed');
        // Stop observing once revealed
        observer.unobserve(entry.target);
      }
    });
  };

  // Create observer
  const observer = new IntersectionObserver(revealCallback, observerOptions);

  // Observe all reveal elements
  revealElements.forEach(el => observer.observe(el));
});
