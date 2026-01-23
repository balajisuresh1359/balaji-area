(function () {
    // Create button element
    const btn = document.createElement('button');
    btn.innerHTML = '↑';
    btn.setAttribute('id', 'scrollToTopBtn');
    btn.setAttribute('aria-label', 'Scroll to top');

    // Add styles
    const style = document.createElement('style');
    style.textContent = `
    #scrollToTopBtn {
      position: fixed;
      bottom: 20px;
      right: 20px;
      width: 50px;
      height: 50px;
      border-radius: 50%;
      background-color: #374151;
      color: white;
      border: 1px solid #4b5563;
      font-size: 24px;
      cursor: pointer;
      opacity: 0;
      visibility: hidden;
      transition: opacity 0.3s ease, visibility 0.3s ease, background-color 0.2s ease;
      z-index: 1000;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
    }
    
    #scrollToTopBtn.show {
      opacity: 1;
      visibility: visible;
    }
    
    #scrollToTopBtn:hover {
      background-color: #4b5563;
    }
    
    #scrollToTopBtn:active {
      transform: scale(0.95);
    }
    
    @media (max-width: 768px) {
      #scrollToTopBtn {
        width: 45px;
        height: 45px;
        bottom: 15px;
        right: 15px;
        font-size: 20px;
      }
    }
  `;

    // Append to document
    document.head.appendChild(style);
    document.body.appendChild(btn);

    // Show/hide button based on scroll position
    window.addEventListener('scroll', function () {
        if (window.pageYOffset > 300) {
            btn.classList.add('show');
        } else {
            btn.classList.remove('show');
        }
    });

    // Scroll to top when clicked
    btn.addEventListener('click', function () {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
})();