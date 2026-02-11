document.addEventListener("DOMContentLoaded", () => {
  // Fade IN when page loads
  document.body.classList.add("fade-in");

  // Intercept link clicks for fade OUT
  document.querySelectorAll("a").forEach(link => {
    const href = link.getAttribute("href");

    // Only apply to internal page links (not #anchors)
    if (href && !href.startsWith("#") && !href.startsWith("http")) {
      link.addEventListener("click", e => {
        e.preventDefault();
        document.body.classList.remove("fade-in");
        document.body.classList.add("fade-out");

        setTimeout(() => {
          window.location.href = href;
        }, 300); // match CSS duration
      });
    }
  })
});

const form = document.getElementById('contactForm');

    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();

            const formData = new FormData(form);
            const data = Object.fromEntries(formData.entries());

            try {
                const res = await fetch('/contact', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(data)
                });

                const result = await res.json();

                if (result.success) {
                    alert("Enquiry sent! We will contact you soon.");
                    form.reset();
                }
            } catch (err) {
                alert("Something went wrong. Please try again.");
                console.error(err);
            }
        });
    }

window.addEventListener('scroll', () => {
    const navbar = document.querySelector('.navbar');
    if (!navbar) return;

    const hero = document.querySelector('.hero') || document.querySelector('.about-hero');
    let triggerHeight = 500; // fallback

    if (hero) {
        // trigger when we've scrolled past the hero
        triggerHeight = hero.offsetHeight - navbar.offsetHeight;
    }

    if (window.scrollY > triggerHeight) {
        navbar.classList.add('scrolled');
    } else {
        navbar.classList.remove('scrolled');
    }
});


const logo = document.getElementById('logo');

logo.addEventListener('click', () => {
  window.scrollTo({
    top: 0,
    behavior: 'smooth'
  });
});

