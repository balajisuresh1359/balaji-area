document.addEventListener("DOMContentLoaded", () => {
    const toggleButtons = document.querySelectorAll('#theme-toggle, #theme-toggle-mobile');
    const body = document.body;
    
    if (localStorage.getItem('theme') === 'dark') {
      body.classList.add('dark');
      toggleButtons.forEach(button => {
        button.textContent = '☀️';
      });
    }
    
    toggleButtons.forEach(button => {
      button.addEventListener('click', () => {
        body.classList.toggle('dark');
        localStorage.setItem('theme', body.classList.contains('dark') ? 'dark' : 'light');
        
        const newIcon = body.classList.contains('dark') ? '☀️' : '🌙';
        toggleButtons.forEach(btn => {
          btn.textContent = newIcon;
        });
      });
    });
    
    const menuToggle = document.getElementById("menu-toggle");
    const mobileMenu = document.getElementById("mobile-menu");
    
    if (menuToggle && mobileMenu) {
      menuToggle.addEventListener("click", function() {
        mobileMenu.classList.toggle("active");
      });
      
      document.addEventListener("click", function(event) {
        if (!menuToggle.contains(event.target) && !mobileMenu.contains(event.target)) {
          if (mobileMenu.classList.contains("active")) {
            mobileMenu.classList.remove("active");
          }
        }
      });
    }
    
    // Create modal if it doesn't exist
    let zoomModal = document.getElementById('image-zoom-modal');
    if (!zoomModal) {
      zoomModal = document.createElement('div');
      zoomModal.id = 'image-zoom-modal';
      zoomModal.className = 'image-zoom-modal';
      const zoomImg = document.createElement('img');
      zoomImg.id = 'zoomed-image';
      zoomModal.appendChild(zoomImg);
      document.body.appendChild(zoomModal);
    }

    const zoomedImage = document.getElementById('zoomed-image');
    let currentScale = 1;
    let currentTranslateX = 0;
    let currentTranslateY = 0;
    let isDragging = false;
    let startX = 0;
    let startY = 0;
    let initialDistance = 0;
    let initialScale = 1;

    // Get all images except those with no-zoom class, icons, and very small images
    // Exclude images that are explicitly marked or are very small (likely icons)
    const allImages = document.querySelectorAll('img');
    const images = Array.from(allImages).filter(img => {
      // Skip if has no-zoom class
      if (img.classList.contains('no-zoom')) return false;
      
      // Skip if it's an icon (check src or class)
      if (img.src.includes('icon') || img.src.includes('Icon') || 
          img.classList.contains('icon') || img.parentElement?.classList.contains('icon')) {
        return false;
      }
      
      // Skip very small images (likely icons or decorative elements)
      const width = img.naturalWidth || img.width || img.offsetWidth;
      const height = img.naturalHeight || img.height || img.offsetHeight;
      if (width && height && (width < 50 || height < 50)) return false;
      
      // Skip if inside a link (to avoid interfering with navigation)
      // But allow if the image itself is the main content
      const parentLink = img.closest('a');
      if (parentLink && parentLink.children.length === 1 && parentLink.children[0] === img) {
        return false; // Image is the only child of a link
      }
      
      return true;
    });
    
    // Function to update image transform
    function updateTransform() {
      zoomedImage.style.transform = `translate(${currentTranslateX}px, ${currentTranslateY}px) scale(${currentScale})`;
    }

    // Function to reset zoom
    function resetZoom() {
      currentScale = 1;
      currentTranslateX = 0;
      currentTranslateY = 0;
      updateTransform();
    }

    // Function to open modal
    function openModal(imgSrc, imgAlt) {
      zoomedImage.src = imgSrc;
      zoomedImage.alt = imgAlt || '';
      zoomModal.classList.add('active');
      body.classList.add('modal-open');
      resetZoom();
    }

    // Function to close modal
    function closeModal() {
      zoomModal.classList.remove('active');
      body.classList.remove('modal-open');
      resetZoom();
    }

    // Add click handlers to all images
    images.forEach(img => {
      // Skip if image is inside a link
      if (img.closest('a')) {
        return;
      }
      
      img.addEventListener('click', function(e) {
        e.preventDefault();
        e.stopPropagation();
        openModal(this.src, this.alt);
      });
    });

    // Close modal when clicking outside image
    zoomModal.addEventListener('click', function(e) {
      if (e.target === zoomModal) {
        closeModal();
      }
    });

    // Double tap on image to close (mobile-friendly)
    let tapTimer = null;
    zoomedImage.addEventListener('click', function(e) {
      if (currentScale <= 1.1) {
        // Only close on double tap if not zoomed
        if (tapTimer === null) {
          tapTimer = setTimeout(() => {
            tapTimer = null;
          }, 300);
        } else {
          clearTimeout(tapTimer);
          tapTimer = null;
          closeModal();
        }
      }
    });

    // Keyboard support
    document.addEventListener('keydown', function(e) {
      if (zoomModal.classList.contains('active')) {
        if (e.key === 'Escape') {
          closeModal();
        }
      }
    });

    // Mouse wheel zoom
    zoomedImage.addEventListener('wheel', function(e) {
      if (!zoomModal.classList.contains('active')) return;
      
      e.preventDefault();
      const delta = e.deltaY > 0 ? 0.9 : 1.1;
      currentScale = Math.max(0.5, Math.min(5, currentScale * delta));
      updateTransform();
    });

    // Mouse drag to pan
    zoomedImage.addEventListener('mousedown', function(e) {
      if (currentScale > 1) {
        isDragging = true;
        startX = e.clientX - currentTranslateX;
        startY = e.clientY - currentTranslateY;
        zoomedImage.style.cursor = 'grabbing';
      }
    });

    document.addEventListener('mousemove', function(e) {
      if (isDragging && currentScale > 1) {
        currentTranslateX = e.clientX - startX;
        currentTranslateY = e.clientY - startY;
        updateTransform();
      }
    });

    document.addEventListener('mouseup', function() {
      isDragging = false;
      zoomedImage.style.cursor = currentScale > 1 ? 'grab' : 'default';
    });

    // Touch events for pinch-to-zoom and pan
    let touches = [];
    
    zoomedImage.addEventListener('touchstart', function(e) {
      if (e.touches.length === 1) {
        // Single touch - prepare for pan
        const touch = e.touches[0];
        startX = touch.clientX - currentTranslateX;
        startY = touch.clientY - currentTranslateY;
        isDragging = true;
      } else if (e.touches.length === 2) {
        // Two touches - prepare for pinch
        e.preventDefault();
        touches = Array.from(e.touches);
        const touch1 = touches[0];
        const touch2 = touches[1];
        initialDistance = Math.hypot(
          touch2.clientX - touch1.clientX,
          touch2.clientY - touch1.clientY
        );
        initialScale = currentScale;
        isDragging = false;
      }
    }, { passive: false });

    zoomedImage.addEventListener('touchmove', function(e) {
      if (e.touches.length === 1 && isDragging && currentScale > 1) {
        // Single touch pan
        e.preventDefault();
        const touch = e.touches[0];
        currentTranslateX = touch.clientX - startX;
        currentTranslateY = touch.clientY - startY;
        updateTransform();
      } else if (e.touches.length === 2) {
        // Two touch pinch zoom
        e.preventDefault();
        touches = Array.from(e.touches);
        const touch1 = touches[0];
        const touch2 = touches[1];
        const currentDistance = Math.hypot(
          touch2.clientX - touch1.clientX,
          touch2.clientY - touch1.clientY
        );
        const scaleChange = currentDistance / initialDistance;
        currentScale = Math.max(0.5, Math.min(5, initialScale * scaleChange));
        
        // Calculate center point for zoom
        const centerX = (touch1.clientX + touch2.clientX) / 2;
        const centerY = (touch1.clientY + touch2.clientY) / 2;
        
        // Adjust translate to zoom towards center
        const rect = zoomedImage.getBoundingClientRect();
        const imgCenterX = rect.left + rect.width / 2;
        const imgCenterY = rect.top + rect.height / 2;
        
        const offsetX = centerX - imgCenterX;
        const offsetY = centerY - imgCenterY;
        
        currentTranslateX += offsetX * (scaleChange - 1);
        currentTranslateY += offsetY * (scaleChange - 1);
        
        updateTransform();
      }
    }, { passive: false });

    zoomedImage.addEventListener('touchend', function(e) {
      if (e.touches.length === 0) {
        isDragging = false;
        touches = [];
      } else if (e.touches.length === 1) {
        // One touch remaining - switch to pan mode
        const touch = e.touches[0];
        startX = touch.clientX - currentTranslateX;
        startY = touch.clientY - currentTranslateY;
        isDragging = true;
      }
    });

    // Constrain image within viewport when zoomed
    function constrainImage() {
      if (currentScale <= 1) {
        currentTranslateX = 0;
        currentTranslateY = 0;
        updateTransform();
        return;
      }

      const rect = zoomedImage.getBoundingClientRect();
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;
      
      const maxX = (rect.width - viewportWidth) / 2;
      const maxY = (rect.height - viewportHeight) / 2;
      
      currentTranslateX = Math.max(-maxX, Math.min(maxX, currentTranslateX));
      currentTranslateY = Math.max(-maxY, Math.min(maxY, currentTranslateY));
      
      updateTransform();
    }

    // Update constraints on resize
    window.addEventListener('resize', constrainImage);
    
    // Constrain after zoom
    const originalUpdateTransform = updateTransform;
    updateTransform = function() {
      originalUpdateTransform();
      requestAnimationFrame(constrainImage);
    };
  });