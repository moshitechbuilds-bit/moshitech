// Portfolio Marquee - Preload images for smooth scrolling
const portfolioCards = document.querySelectorAll('.portfolio-card img');
if (portfolioCards.length > 0) {
  // Preload all portfolio images for smooth scrolling
  portfolioCards.forEach((img) => {
    const imageLoader = new Image();
    imageLoader.src = img.src;
  });
}

// Navigation toggle
const navToggle = document.querySelector(".nav-toggle");
const navMenu = document.getElementById("nav-menu");
const navLinks = document.querySelectorAll('.primary-nav a[href^="#"]');

if (navToggle && navMenu) {
  navToggle.addEventListener("click", () => {
    const expanded = navToggle.getAttribute("aria-expanded") === "true";
    navToggle.setAttribute("aria-expanded", String(!expanded));
    navMenu.classList.toggle("open");
  });

  navMenu.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      navMenu.classList.remove("open");
      navToggle.setAttribute("aria-expanded", "false");
    });
  });
}

// Highlight active navigation link
const sections = document.querySelectorAll("section[id]");

const setActiveLink = (id) => {
  navLinks.forEach((link) => {
    if (!link.getAttribute("href")) return;
    const targetId = link.getAttribute("href").replace("#", "");
    if (targetId === id) {
      link.classList.add("active");
    } else {
      link.classList.remove("active");
    }
  });
};

const navObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        setActiveLink(entry.target.id);
      }
    });
  },
  {
    threshold: 0.35,
    rootMargin: "-45% 0px -45% 0px",
  },
);

sections.forEach((section) => navObserver.observe(section));

navLinks.forEach((link) => {
  link.addEventListener("click", () => {
    const targetId = link.getAttribute("href").replace("#", "");
    setActiveLink(targetId);
  });
});

// Beginner plan promo countdown
const timerDisplay = document.getElementById("beginner-timer");
if (timerDisplay) {
  const PROMO_DURATION = 60 * 60 * 1000; // 1 hour
  const STORAGE_KEY = "beginnerPromoExpiry";

  const getPromoExpiry = () => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored && Number(stored) > Date.now()) {
      return Number(stored);
    }
    const newExpiry = Date.now() + PROMO_DURATION;
    localStorage.setItem(STORAGE_KEY, newExpiry);
    return newExpiry;
  };

  let promoExpiry = getPromoExpiry();

  const formatTime = (milliseconds) => {
    const totalSeconds = Math.max(Math.floor(milliseconds / 1000), 0);
    const minutes = String(Math.floor(totalSeconds / 60)).padStart(2, "0");
    const seconds = String(totalSeconds % 60).padStart(2, "0");
    return `${minutes}:${seconds}`;
  };

  const updatePromoTimer = () => {
    const remaining = promoExpiry - Date.now();
    if (remaining <= 0) {
      promoExpiry = Date.now() + PROMO_DURATION;
      localStorage.setItem(STORAGE_KEY, promoExpiry);
    }
    timerDisplay.textContent = formatTime(promoExpiry - Date.now());
  };

  updatePromoTimer();
  setInterval(updatePromoTimer, 1000);
}

// Smooth scroll for anchor links
document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
  anchor.addEventListener("click", function (e) {
    const href = this.getAttribute("href");
    if (href === "#" || href === "") return;
    
    e.preventDefault();
    const target = document.querySelector(href);
    if (target) {
      target.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  });
});

// Intersection Observer for scroll animations
const observerOptions = {
  threshold: 0.1,
  rootMargin: "0px 0px -50px 0px",
};

const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add("visible");
      observer.unobserve(entry.target);
    }
  });
}, observerOptions);

document.querySelectorAll("[data-animate]").forEach((el) => {
  observer.observe(el);
});

// Animated counter for statistics
function animateCounter(element, target, duration = 2000) {
  // Handle special cases like "99+" and "+"
  const targetText = element.getAttribute("data-target");
  if (targetText && targetText.includes("+")) {
    const numValue = parseInt(targetText);
    if (!isNaN(numValue)) {
      target = numValue;
    } else {
      // If it's just "+", don't animate
      return;
    }
  }
  
  const start = 0;
  const increment = target / (duration / 16);
  let current = start;

  const timer = setInterval(() => {
    current += increment;
    if (current >= target) {
      // Preserve original format
      if (targetText && targetText.includes("+")) {
        element.textContent = targetText;
      } else {
        element.textContent = Math.floor(target);
      }
      clearInterval(timer);
    } else {
      element.textContent = Math.floor(current);
    }
  }, 16);
}

// Observe stat numbers and animate when visible
const statObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting && !entry.target.classList.contains("animated")) {
        const target = parseInt(entry.target.getAttribute("data-target"));
        animateCounter(entry.target, target);
        entry.target.classList.add("animated");
        statObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.5 }
);

document.querySelectorAll(".stat-number").forEach((stat) => {
  statObserver.observe(stat);
});

// Animate chart percentage
const chartPercentage = document.querySelector(".chart-percentage");
if (chartPercentage) {
  const chartObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting && !entry.target.classList.contains("animated")) {
          const target = parseInt(entry.target.getAttribute("data-target"));
          animateCounter(entry.target, target);
          entry.target.classList.add("animated");
          chartObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.5 }
  );
  chartObserver.observe(chartPercentage);
}

// Animate progress bars
const progressBars = document.querySelectorAll(".stat-fill");
if (progressBars.length > 0) {
  const barObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const width = entry.target.getAttribute("data-width");
          entry.target.style.setProperty("--target-width", `${width}%`);
          entry.target.classList.add("animated");
          barObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.5 }
  );
  progressBars.forEach((bar) => {
    barObserver.observe(bar);
  });
}

// Form submission handler - Formspree
const contactForm = document.getElementById("contact-form");
const formMessage = document.getElementById("form-message");

function showFormMessage(message, type = "success") {
  if (formMessage) {
    formMessage.textContent = message;
    formMessage.className = `form-message ${type}`;
    formMessage.style.display = "block";
    
    setTimeout(() => {
      formMessage.style.display = "none";
    }, 5000);
  }
}

if (contactForm) {
  contactForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    
    const submitButton = document.getElementById("contact-submit");
    const originalText = submitButton.innerHTML;
    
    // Disable button and show loading state
    submitButton.disabled = true;
    submitButton.innerHTML = "<span>Sending...</span>";
    
    try {
      // Get form data
      const formData = new FormData(contactForm);

      // Submit to Formspree (use the form's action URL)
      const response = await fetch(contactForm.action, {
        method: "POST",
        headers: { Accept: "application/json" },
        body: formData,
      });

      if (response.ok) {
        // Success
        submitButton.innerHTML = "<span>✓ Message Sent!</span>";
        submitButton.style.background = "linear-gradient(120deg, #43d9ad, #33d0ff)";
        showFormMessage("Message sent! You will get an email or message shortly. Thanks!", "success");

        // Reset form after 3 seconds
        setTimeout(() => {
          contactForm.reset();
          submitButton.innerHTML = originalText;
          submitButton.style.background = "";
          submitButton.disabled = false;
        }, 3000);
      } else {
        throw new Error("Failed to send message. Please try again.");
      }
    } catch (error) {
      console.error("Form submission failed:", error);

      // Show error message
      showFormMessage("Error: Failed to send message. Please try again or contact us directly at moshitechbuilds@gmail.com", "error");

      submitButton.innerHTML = originalText;
      submitButton.disabled = false;
    }
  });
}

// Add hover effects to cards
document.querySelectorAll(".benefit-card, .plan-card, .testimonial-card").forEach((card) => {
  card.addEventListener("mouseenter", function () {
    this.style.transition = "all 300ms ease";
  });
});

// Dynamic year
const year = document.getElementById("year");
if (year) {
  year.textContent = new Date().getFullYear();
}

// Add parallax effect to hero visual (subtle)
window.addEventListener("scroll", () => {
  const heroVisual = document.querySelector(".hero__visual");
  if (heroVisual) {
    const scrolled = window.pageYOffset;
    const rate = scrolled * 0.3;
    heroVisual.style.transform = `translateY(${rate}px)`;
  }
});

// Carousel functionality with infinite scroll
const carouselTrack = document.getElementById("carousel-track");
const carouselItems = document.querySelectorAll(".carousel-item");
const prevBtn = document.querySelector(".carousel-prev");
const nextBtn = document.querySelector(".carousel-next");
const dots = document.querySelectorAll(".dot");

let currentIndex = 0;
let autoScrollInterval;
let isScrolling = false;
const totalItems = carouselItems.length;
const scrollDelay = 3000; // 3 seconds between auto-scrolls

// Clone items for infinite scroll
function setupInfiniteScroll() {
  if (!carouselTrack || totalItems === 0) return;
  
  // Clone first few items to end
  const firstThree = Array.from(carouselItems).slice(0, 3);
  firstThree.forEach((item) => {
    const clone = item.cloneNode(true);
    clone.classList.add("clone");
    carouselTrack.appendChild(clone);
  });
  
  // Clone last few items to beginning
  const lastThree = Array.from(carouselItems).slice(-3);
  lastThree.reverse().forEach((item) => {
    const clone = item.cloneNode(true);
    clone.classList.add("clone");
    carouselTrack.insertBefore(clone, carouselTrack.firstChild);
  });
  
  // Scroll to first real item
  const itemWidth = carouselItems[0].offsetWidth + 24;
  carouselTrack.scrollLeft = 3 * itemWidth;
}

// Update carousel position
function updateCarousel(smooth = true) {
  if (!carouselTrack || !carouselItems[0] || isScrolling) return;
  
  isScrolling = true;
  const itemWidth = carouselItems[0].offsetWidth + 24; // 24px for gap
  const scrollPosition = (currentIndex + 3) * itemWidth; // +3 for cloned items at start
  
  carouselTrack.scrollTo({
    left: scrollPosition,
    behavior: smooth ? "smooth" : "auto",
  });
  
  updateDots();
  
  setTimeout(() => {
    isScrolling = false;
  }, 500);
}

// Check and reset scroll position for infinite loop
function checkInfiniteScroll() {
  if (!carouselTrack || !carouselItems[0]) return;
  
  const itemWidth = carouselItems[0].offsetWidth + 24;
  const scrollLeft = carouselTrack.scrollLeft;
  const totalWidth = carouselTrack.scrollWidth;
  const visibleWidth = carouselTrack.offsetWidth;
  
  // If scrolled to the end (cloned items), jump to beginning of real items
  if (scrollLeft >= totalWidth - visibleWidth - itemWidth) {
    carouselTrack.scrollLeft = 3 * itemWidth + itemWidth;
    currentIndex = 0;
    updateDots();
  }
  
  // If scrolled to the beginning (cloned items), jump to end of real items
  if (scrollLeft <= itemWidth) {
    carouselTrack.scrollLeft = (totalItems + 2) * itemWidth;
    currentIndex = totalItems - 1;
    updateDots();
  }
  
  // Update current index based on scroll position
  const realScrollLeft = scrollLeft - (3 * itemWidth);
  const newIndex = Math.round(realScrollLeft / itemWidth);
  
  if (newIndex !== currentIndex && newIndex >= 0 && newIndex < totalItems) {
    currentIndex = newIndex;
    updateDots();
  }
}

// Update dot indicators
function updateDots() {
  dots.forEach((dot, index) => {
    dot.classList.toggle("active", index === currentIndex);
  });
}

// Next slide
function nextSlide() {
  currentIndex = (currentIndex + 1) % totalItems;
  updateCarousel();
}

// Previous slide
function prevSlide() {
  currentIndex = (currentIndex - 1 + totalItems) % totalItems;
  updateCarousel();
}

// Auto-scroll functionality
function startAutoScroll() {
  autoScrollInterval = setInterval(() => {
    if (!isScrolling) {
      nextSlide();
    }
  }, scrollDelay);
}

function stopAutoScroll() {
  if (autoScrollInterval) {
    clearInterval(autoScrollInterval);
  }
}

// Initialize carousel
if (carouselTrack && totalItems > 0) {
  // Wait for images to load before setting up infinite scroll
  window.addEventListener("load", () => {
    setupInfiniteScroll();
    startAutoScroll();
  });
  
  // Check infinite scroll on scroll event
  carouselTrack.addEventListener("scroll", () => {
    checkInfiniteScroll();
    stopAutoScroll();
    clearTimeout(window.scrollResumeTimeout);
    window.scrollResumeTimeout = setTimeout(() => {
      startAutoScroll();
    }, 5000);
  });
  
  // Pause auto-scroll on hover
  carouselTrack.addEventListener("mouseenter", stopAutoScroll);
  carouselTrack.addEventListener("mouseleave", () => {
    if (!isScrolling) {
      startAutoScroll();
    }
  });
}

// Next slide button
if (nextBtn) {
  nextBtn.addEventListener("click", () => {
    stopAutoScroll();
    nextSlide();
    setTimeout(startAutoScroll, 5000);
  });
}

// Previous slide button
if (prevBtn) {
  prevBtn.addEventListener("click", () => {
    stopAutoScroll();
    prevSlide();
    setTimeout(startAutoScroll, 5000);
  });
}

// Dot navigation
dots.forEach((dot, index) => {
  dot.addEventListener("click", () => {
    stopAutoScroll();
    currentIndex = index;
    updateCarousel();
    setTimeout(startAutoScroll, 5000);
  });
});

// Touch/swipe support for mobile
let isDown = false;
let startX;
let scrollLeft;

if (carouselTrack) {
  carouselTrack.addEventListener("mousedown", (e) => {
    isDown = true;
    carouselTrack.style.cursor = "grabbing";
    startX = e.pageX - carouselTrack.offsetLeft;
    scrollLeft = carouselTrack.scrollLeft;
  });

  carouselTrack.addEventListener("mouseleave", () => {
    isDown = false;
    carouselTrack.style.cursor = "grab";
  });

  carouselTrack.addEventListener("mouseup", () => {
    isDown = false;
    carouselTrack.style.cursor = "grab";
  });

  carouselTrack.addEventListener("mousemove", (e) => {
    if (!isDown) return;
    e.preventDefault();
    const x = e.pageX - carouselTrack.offsetLeft;
    const walk = (x - startX) * 2;
    carouselTrack.scrollLeft = scrollLeft - walk;
  });
}

