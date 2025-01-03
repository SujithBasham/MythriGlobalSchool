document.addEventListener("DOMContentLoaded", () => {
  const links = document.querySelectorAll('.nav-link, .dropdown-item');
  const contentDiv = document.getElementById('content');

  links.forEach(link => {
      link.addEventListener('click', (event) => {
          event.preventDefault(); // Prevent default link behavior
          const page = link.getAttribute('data-page');

          if (page) {
              fetch(page)
                  .then(response => {
                      if (!response.ok) {
                          throw new Error(`Failed to load ${page}`);
                      }
                      return response.text();
                  })
                  .then(html => {
                      contentDiv.innerHTML = html; // Load the content
                  })
                  .catch(err => {
                      contentDiv.innerHTML = `<p class="text-danger">Error loading content. Please try again later.</p>`;
                      console.error(err);
                  });
          }
      });
  });
});
