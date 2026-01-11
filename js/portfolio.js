document.addEventListener('DOMContentLoaded', () => {
    const slider = document.getElementById('project-slider');
    const cards = Array.from(slider.querySelectorAll('.project-card'));
    const modal = document.getElementById('project-modal');
    const modalBody = modal.querySelector('.modal-body');
    const buttons = document.querySelectorAll('.filter-btn');
    const animToggle = document.getElementById('anim-toggle');
    const dotsContainer = document.getElementById('pagination-dots');

    let currentSlide = 0;
    let totalSlides = 0;
    let isScrolling = false;

    // Auto-slide functionality
    let autoSlideTimer = null;
    const AUTO_SLIDE_INTERVAL = 5000; // 5 seconds
    const isMobile = window.matchMedia('(max-width: 1000px)').matches;

    // --- 0. ANIMATION TOGGLE SETTINGS ---
    const updateAnimState = () => {
        const isEnabled = animToggle.checked;
        document.body.classList.toggle('animations-disabled', !isEnabled);
        localStorage.setItem('portfolio-animations', isEnabled);
    };

    const savedAnim = localStorage.getItem('portfolio-animations');
    if (savedAnim !== null) {
        animToggle.checked = savedAnim === 'true';
        updateAnimState();
    }
    if (animToggle) animToggle.addEventListener('change', updateAnimState);

    // --- 0.5 FOG OF WAR OBSERVER ---
    const fogObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (!animToggle.checked) {
                entry.target.classList.remove('fog-locked');
                entry.target.classList.add('revealed');
                return;
            }
            if (entry.isIntersecting) {
                setTimeout(() => {
                    entry.target.classList.add('revealed');
                    entry.target.classList.remove('fog-locked');
                }, 150);
                fogObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.2 });

    // --- 1. SLIDER INITIALIZATION ---
    function initSlider() {
        const visibleCards = cards.filter(c => c.style.display !== 'none');
        slider.innerHTML = '';

        // On mobile, we want all cards in one vertical flow
        const cardsPerSlide = isMobile ? visibleCards.length : 3;
        totalSlides = Math.ceil(visibleCards.length / cardsPerSlide);

        for (let i = 0; i < totalSlides; i++) {
            const slide = document.createElement('div');
            slide.className = 'project-slide';
            const chunk = visibleCards.slice(i * cardsPerSlide, (i + 1) * cardsPerSlide);

            chunk.forEach(card => {
                const slot = document.createElement('div');
                slot.className = 'card-slot';
                slot.appendChild(card);
                slide.appendChild(slot);

                // Reset reveal status for re-observe
                card.classList.remove('revealed');
                card.classList.add('fog-locked');
                fogObserver.observe(card);
            });
            slider.appendChild(slide);
        }

        currentSlide = 0;
        updateSlider();
        initDots();
    }

    function updateSlider() {
        slider.style.transform = `translateY(-${currentSlide * 100}%)`;
        updateDots();
    }

    function initDots() {
        dotsContainer.innerHTML = '';
        for (let i = 0; i < totalSlides; i++) {
            const dot = document.createElement('button');
            dot.className = 'dot';
            dot.addEventListener('click', () => {
                currentSlide = i;
                updateSlider();
                resetAutoSlide(); // Reset timer on manual interaction
            });
            dotsContainer.appendChild(dot);
        }
        updateDots();
        startAutoSlide(); // Start auto-slide after initialization
    }

    function updateDots() {
        const dots = dotsContainer.querySelectorAll('.dot');
        dots.forEach((dot, i) => {
            dot.classList.toggle('active', i === currentSlide);
        });
    }

    // --- AUTO-SLIDE FUNCTIONS ---
    function startAutoSlide() {
        // Don't auto-slide on mobile or if there's only one slide
        if (isMobile || totalSlides <= 1) return;

        stopAutoSlide(); // Clear any existing timer

        autoSlideTimer = setTimeout(() => {
            // Move to next slide (loop back to start if at end)
            currentSlide = (currentSlide + 1) % totalSlides;
            updateSlider();
            startAutoSlide(); // Restart timer for next slide
        }, AUTO_SLIDE_INTERVAL);
    }

    function stopAutoSlide() {
        if (autoSlideTimer) {
            clearTimeout(autoSlideTimer);
            autoSlideTimer = null;
        }
    }

    function resetAutoSlide() {
        stopAutoSlide();
        startAutoSlide();
    }

    // --- 2. NAVIGATION (Scroll) ---
    const mainContent = document.querySelector('.main-content');
    if (mainContent) {
        mainContent.addEventListener('wheel', (e) => {
            if (isScrolling) return;
            if (Math.abs(e.deltaY) < 30) return;

            if (e.deltaY > 0 && currentSlide < totalSlides - 1) {
                currentSlide++;
                lockScroll();
            } else if (e.deltaY < 0 && currentSlide > 0) {
                currentSlide--;
                lockScroll();
            }
        }, { passive: true });
    }

    function lockScroll() {
        isScrolling = true;
        updateSlider();
        resetAutoSlide(); // Reset timer on manual scroll
        setTimeout(() => { isScrolling = false; }, 850);
    }

    // --- 3. FILTERING ---
    buttons.forEach(btn => {
        btn.addEventListener('click', () => {
            buttons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            const filterValue = btn.dataset.filter;

            cards.forEach(card => {
                const categories = (card.getAttribute('data-category') || '').split(' ');
                if (filterValue === 'all' || categories.includes(filterValue)) {
                    card.style.display = 'block';
                } else {
                    card.style.display = 'none';
                }
            });

            initSlider();
        });
    });

    // --- 4. CARD INTERACTIONS ---
    cards.forEach(card => {
        const videoUrl = card.dataset.videoUrl;
        const previewImg = card.querySelector('.card-preview-img');
        const previewVideo = card.querySelector('.card-preview-video');

        card.addEventListener('mouseenter', () => {
            if (previewImg && previewImg.dataset.gif) {
                previewImg.src = previewImg.dataset.gif;
            }
            if (previewVideo) {
                if (!previewVideo.src && previewVideo.dataset.src) {
                    previewVideo.src = previewVideo.dataset.src;
                }
                previewVideo.play().catch(e => { });
            }
            stopAutoSlide(); // Pause auto-slide when hovering over card
        });

        card.addEventListener('mouseleave', () => {
            if (previewImg && previewImg.dataset.static) {
                previewImg.src = previewImg.dataset.static;
            }
            if (previewVideo) {
                previewVideo.pause();
                previewVideo.removeAttribute('src'); // Unload video
                previewVideo.load(); // Force poster to show
            }
            startAutoSlide(); // Resume auto-slide when leaving card
        });

        card.addEventListener('click', () => {
            const rect = card.getBoundingClientRect();
            modal.style.setProperty('--origin-x', `${rect.left + rect.width / 2}px`);
            modal.style.setProperty('--origin-y', `${rect.top + rect.height / 2}px`);

            const openModal = () => {
                const title = card.querySelector('h3').innerText;
                const desc = card.querySelector('.description').innerText;
                const tags = Array.from(card.querySelectorAll('.tag')).map(t => t.innerText);
                const tagsHtml = tags.map(t => `<span class='tag'>${t}</span>`).join('');
                const links = card.dataset.links ? card.dataset.links.split(';').map(l => l.trim()).filter(l => l) : [];
                const features = card.dataset.features ? card.dataset.features.split('|').map(f => f.trim()).filter(f => f) : [];

                const videoHeight = isMobile ? '200px' : '380px';
                const videoPlaceholder = videoUrl ? `<div id="modal-video-placeholder" class='media-frame' style='border-radius: 12px; height: 100%; min-height: ${videoHeight}; background: #000; display: flex; align-items: center; justify-content: center;'></div>` : '';

                let featuresHtml = '';
                if (features.length > 0) {
                    const listItems = features.map(f => `<li>${f}</li>`).join('');
                    featuresHtml = `
                      <div style='background: rgba(255,255,255,0.03); padding: 1.5rem; border-radius: 12px; margin-bottom: 1.5rem;'>
                         <h4 style='text-transform: uppercase; letter-spacing: 0.1em; font-size: 0.75rem; color: var(--accent); margin-top: 0;'>Key technical features</h4>
                         <ul style='color: var(--text-main); line-height: 1.8; padding-left: 1.2rem; font-size: 0.95rem; margin-bottom: 0;'>
                            ${listItems}
                         </ul>
                      </div>
                    `;
                }

                let buttonsHtml = '';
                if (links.length > 0) {
                    buttonsHtml += `<div class='social-actions' style='margin-top: 1.5rem; padding-top: 1.5rem; border-top: 1px solid var(--border);'>`;
                    links.forEach(link => {
                        const [label, url] = link.split('|').map(s => s.trim());
                        if (label && url) {
                            const isPlaceholder = url === '#';
                            buttonsHtml += `<a href='${url}' class='btn-subtle' ${isPlaceholder ? "onclick='event.preventDefault()'" : "target='_blank' rel='noopener noreferrer'"}>${label}</a>`;
                        }
                    });
                    buttonsHtml += `</div>`;
                }

                modalBody.innerHTML = `
                  <div class='modal-grid'>
                      <div class='modal-media'>
                          <div style="margin-bottom: 1.5rem;">
                               <h2 style='font-family: var(--font-display); font-size: 2.5rem; margin: 0; color: white;'>${title}</h2>
                          </div>
                          ${videoPlaceholder}
                      </div>
                      <div class='modal-info'>
                          <div class='tags-wrapper' style='margin-bottom: 1rem; justify-content: flex-start;'>${tagsHtml}</div>
                          <p style='color: var(--text-muted); line-height: 1.6; font-size: 1.1rem; margin-bottom: 1.5rem;'>${desc}</p>
                          ${featuresHtml}
                          ${buttonsHtml}
                      </div>
                  </div>
                `;
                modal.classList.add('active');

                const loadVideo = () => {
                    const placeholder = document.getElementById('modal-video-placeholder');
                    if (!placeholder || !videoUrl) return;
                    if (videoUrl.includes('youtube.com') || videoUrl.includes('youtu.be')) {
                        const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
                        const match = videoUrl.match(regExp);
                        const videoId = (match && match[2].length === 11) ? match[2] : null;

                        placeholder.innerHTML = `<iframe src='https://www.youtube.com/embed/${videoId}?autoplay=1&mute=0&rel=0&modestbranding=1' allow='autoplay; encrypted-media' allowfullscreen style='width:100%; height:100%; border:none; border-radius:12px;'></iframe>`;
                    } else {
                        placeholder.innerHTML = `<video src='${videoUrl}' controls autoplay style='width:100%; height:100%; border-radius:12px;'></video>`;
                    }
                };
                setTimeout(loadVideo, animToggle.checked ? 400 : 0);
            };

            if (animToggle.checked) {
                card.classList.add('opening');
                setTimeout(() => { card.classList.remove('opening'); openModal(); }, 450);
            } else openModal();
        });
    });

    modal.addEventListener('click', (e) => {
        if (e.target === modal || e.target.classList.contains('modal-close')) modal.classList.remove('active');
    });

    // Startup
    const activeBtn = document.querySelector('.filter-btn.active');
    if (activeBtn) activeBtn.click();
    else initSlider();
});
