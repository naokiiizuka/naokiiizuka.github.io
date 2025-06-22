// Ensure DOM is fully loaded before executing scripts
document.addEventListener("DOMContentLoaded", () => {
  // --- Hamburger menu functionality START ---
  const mobileMenuButton = document.getElementById("mobile-menu-button");
  const mobileMenu = document.getElementById("mobile-menu");
  const mobileMenuIcon = document.getElementById("mobile-menu-icon");

  mobileMenuButton.addEventListener("click", () => {
    mobileMenu.classList.toggle("hidden");
    mobileMenuIcon.textContent = mobileMenu.classList.contains("hidden") ? "menu" : "close";
  });

  document.querySelectorAll("#mobile-menu a").forEach((link) => {
    link.addEventListener("click", () => {
      mobileMenu.classList.add("hidden");
      mobileMenuIcon.textContent = "menu";
    });
  });
  // --- Hamburger menu functionality END ---

  // --- Scroll to top button functionality START ---
  const logoLink = document.getElementById("logo-link");
  const backToTopButton = document.getElementById("back-to-top");

  // Smooth scroll to top when logo is clicked
  logoLink.addEventListener("click", (e) => {
    e.preventDefault();
    window.scrollTo({ top: 0, behavior: "smooth" });
  });

  // Show/hide back-to-top button based on scroll position
  window.addEventListener("scroll", () => {
    if (window.scrollY > 200) {
      backToTopButton.classList.remove("hidden");
    } else {
      backToTopButton.classList.add("hidden");
    }
  });

  // Smooth scroll to top when back-to-top button is clicked
  backToTopButton.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });
  // --- Scroll to top button functionality END ---

  // --- Gallery Lightbox functionality START ---
  const galleryImages = Array.from(document.querySelectorAll("#gallery .grid > div > img"));
  const lightboxOverlay = document.getElementById("lightbox-overlay");
  const lightboxContent = document.getElementById("lightbox-content");
  const lightboxImage = document.getElementById("lightbox-image");
  const lightboxCloseButton = document.getElementById("lightbox-close");
  const lightboxPrevButton = document.getElementById("lightbox-prev");
  const lightboxNextButton = document.getElementById("lightbox-next");

  const ARROW_HORIZONTAL_OFFSET = 24; // Distance of navigation arrows from screen edge

  let currentGalleryImageIndex = 0; // Renamed to avoid conflict with hero slider index
  let startX = 0; // For swipe
  let startY = 0; // For swipe
  const SWIPE_THRESHOLD = 50; // Minimum swipe distance to trigger navigation

  /**
   * Sets the image and adjusts its size within the lightbox.
   * @param {number} index - The index of the image to display.
   */
  const setLightboxImageAndSize = (index) => {
    currentGalleryImageIndex = (index + galleryImages.length) % galleryImages.length; // Loop through images

    const imageToLoad = galleryImages[currentGalleryImageIndex].dataset.originalSrc || galleryImages[currentGalleryImageIndex].src;

    // Hide image before loading new one to prevent visual glitches
    lightboxImage.style.opacity = "0";

    // Reset sizes for recalculation
    lightboxContent.style.width = "";
    lightboxContent.style.height = "";
    lightboxImage.style.maxWidth = "100%";
    lightboxImage.style.maxHeight = "100%";

    lightboxImage.onload = () => {
      // Calculate available space for the lightbox content, considering margins
      const overallHorizontalMargin = window.innerWidth > 768 ? 64 : 32; // Desktop vs Mobile margin
      const overallVerticalMargin = window.innerHeight > 768 ? 64 : 32;

      const availableViewportWidth = window.innerWidth - overallHorizontalMargin;
      const availableViewportHeight = window.innerHeight - overallVerticalMargin;

      const imageNaturalWidth = lightboxImage.naturalWidth;
      const imageNaturalHeight = lightboxImage.naturalHeight;
      const imageAspectRatio = imageNaturalWidth / imageNaturalHeight;

      let targetImageWidth, targetImageHeight;

      // Adjust available width for mobile to account for arrow buttons
      let maxImageWidthForContent = availableViewportWidth;
      if (window.innerWidth <= 768) {
        maxImageWidthForContent = window.innerWidth - ARROW_HORIZONTAL_OFFSET * 2;
      }

      // Determine target dimensions maintaining aspect ratio
      if (imageAspectRatio > maxImageWidthForContent / availableViewportHeight) {
        // Image is wider than available content area ratio
        targetImageWidth = maxImageWidthForContent;
        targetImageHeight = maxImageWidthForContent / imageAspectRatio;
      } else {
        // Image is taller than available content area ratio
        targetImageHeight = availableViewportHeight;
        targetImageWidth = availableViewportHeight * imageAspectRatio;
      }

      // Ensure target dimensions do not exceed the image's natural dimensions
      if (targetImageWidth > imageNaturalWidth) targetImageWidth = imageNaturalWidth;
      if (targetImageHeight > imageNaturalHeight) targetImageHeight = imageNaturalHeight;

      // Apply calculated dimensions to the lightbox content container
      lightboxContent.style.width = `${targetImageWidth}px`;
      lightboxContent.style.height = `${targetImageHeight}px`;

      // Show image after it's loaded and sized
      lightboxImage.style.opacity = "1";
    };

    lightboxImage.onerror = () => {
      console.error("Failed to load image:", imageToLoad);
      // Optional: Add error handling like displaying a broken image icon or message
    };

    // Set the src to trigger image load
    lightboxImage.src = imageToLoad;
  };

  // Add click listeners to gallery images to open lightbox
  galleryImages.forEach((img, index) => {
    img.addEventListener("click", function () {
      setLightboxImageAndSize(index);
      lightboxOverlay.classList.add("active");
      document.body.style.overflow = "hidden"; // Prevent background scrolling
    });
  });

  // Close lightbox function
  const closeLightbox = () => {
    lightboxOverlay.classList.remove("active");
    document.body.style.overflow = ""; // Restore background scrolling
    // Reset lightbox content dimensions when closed to avoid layout issues for next open
    lightboxContent.style.width = "";
    lightboxContent.style.height = "";
    lightboxImage.style.opacity = "1"; // Ensure it's visible if opened again
  };

  // Add click listener to close button
  lightboxCloseButton.addEventListener("click", closeLightbox);

  // Close lightbox if clicking on the overlay itself (outside the image)
  lightboxOverlay.addEventListener("click", function (event) {
    if (event.target === lightboxOverlay) {
      closeLightbox();
    }
  });

  // Navigation button click listeners
  lightboxPrevButton.addEventListener("click", (event) => {
    event.stopPropagation(); // Prevent closing lightbox if clicking button triggers overlay click
    setLightboxImageAndSize(currentGalleryImageIndex - 1);
  });

  lightboxNextButton.addEventListener("click", (event) => {
    event.stopPropagation(); // Prevent closing lightbox if clicking button triggers overlay click
    setLightboxImageAndSize(currentGalleryImageIndex + 1);
  });

  // Recalculate lightbox size on window resize if active
  window.addEventListener("resize", () => {
    if (lightboxOverlay.classList.contains("active")) {
      setLightboxImageAndSize(currentGalleryImageIndex);
    }
  });

  // Swipe functionality for Lightbox (mobile only)
  lightboxOverlay.addEventListener("touchstart", (e) => {
    if (window.innerWidth <= 768 && e.touches.length === 1) {
      startX = e.touches[0].clientX;
      startY = e.touches[0].clientY;
    }
  });

  lightboxOverlay.addEventListener(
    "touchmove",
    (e) => {
      if (window.innerWidth <= 768 && e.touches.length === 1) {
        const currentX = e.touches[0].clientX;
        const currentY = e.touches[0].clientY;
        const diffX = startX - currentX;
        const diffY = startY - currentY;

        // Prevent vertical scrolling while performing horizontal swipe
        if (Math.abs(diffY) > Math.abs(diffX)) {
          e.preventDefault();
        }
      }
    },
    { passive: false } // Use passive: false to allow preventDefault
  );

  lightboxOverlay.addEventListener("touchend", (e) => {
    if (window.innerWidth <= 768) {
      const endX = e.changedTouches[0].clientX;
      const diffX = startX - endX;

      if (diffX > SWIPE_THRESHOLD) {
        // Swipe left (to next image)
        setLightboxImageAndSize(currentGalleryImageIndex + 1);
      } else if (diffX < -SWIPE_THRESHOLD) {
        // Swipe right (to previous image)
        setLightboxImageAndSize(currentGalleryImageIndex - 1);
      }
    }
  });
  // --- Gallery Lightbox functionality END ---

  // --- Hero Slider functionality START ---
  const heroSlides = document.querySelectorAll(".hero-slide");
  const heroSliderDotsContainer = document.getElementById("hero-slider-dots");

  // Check if essential slider elements exist before proceeding
  if (heroSlides.length === 0 || !heroSliderDotsContainer) {
    console.warn("Hero slider elements not found. Skipping slider initialization.");
    return; // Exit if elements are missing
  }

  let currentSlideIndex = 0;
  let slideInterval;
  const slideDuration = 5000; // Time in milliseconds for each slide

  /**
   * Creates dot navigation elements based on the number of slides.
   */
  const createDots = () => {
    heroSlides.forEach((_, index) => {
      const dot = document.createElement("div");
      dot.classList.add("hero-slider-dot");
      if (index === 0) {
        dot.classList.add("active"); // Activate the first dot
      }
      dot.addEventListener("click", () => {
        goToSlide(index); // Navigate to the clicked slide
      });
      heroSliderDotsContainer.appendChild(dot);
    });
  };

  /**
   * Displays the specified slide and updates dot navigation.
   * @param {number} index - The index of the slide to display.
   */
  const goToSlide = (index) => {
    // Deactivate current slide and dot
    heroSlides[currentSlideIndex].classList.remove("active");
    const dots = heroSliderDotsContainer.querySelectorAll(".hero-slider-dot");
    dots[currentSlideIndex].classList.remove("active");

    // Calculate new slide index with looping
    currentSlideIndex = (index + heroSlides.length) % heroSlides.length;

    // Activate new slide and dot
    heroSlides[currentSlideIndex].classList.add("active");
    dots[currentSlideIndex].classList.add("active");

    resetSlideInterval(); // Reset auto-slide timer after manual interaction or slide change
  };

  /**
   * Starts the automatic slide transition interval.
   */
  const startSlideInterval = () => {
    slideInterval = setInterval(() => {
      goToSlide(currentSlideIndex + 1); // Go to the next slide
    }, slideDuration);
  };

  /**
   * Clears and restarts the automatic slide transition interval.
   */
  const resetSlideInterval = () => {
    clearInterval(slideInterval); // Clear existing interval
    startSlideInterval(); // Start a new one
  };

  // Initialize the hero slider
  createDots(); // Generate navigation dots
  goToSlide(0); // Display the first slide initially
  startSlideInterval(); // Start automatic slide transitions
  // --- Hero Slider functionality END ---
});
