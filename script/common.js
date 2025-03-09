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
        mobileMenu.classList.toggle("hidden");
      });
      
      document.addEventListener("click", function(event) {
        if (!menuToggle.contains(event.target) && !mobileMenu.contains(event.target)) {
          if (!mobileMenu.classList.contains("hidden")) {
            mobileMenu.classList.add("hidden");
          }
        }
      });
    }
  });