document.addEventListener('DOMContentLoaded', () => {
    
    // 1. Extended Pinned Scroll & 240FPS LERP Animation for Hero Section
    const header = document.getElementById('header');
    const heroWrapper = document.getElementById('hero');
    const heroSection = document.querySelector('.hero-section');
    const heroBg = document.querySelector('.hero-bg');
    const heroContent = document.querySelector('.hero-content');
    const heroOverlay = document.querySelector('.hero-overlay');

    let targetScrollY = window.scrollY;
    let currentScrollY = window.scrollY;

    // Linear Interpolation helper for 240fps-like butter smoothness with soft inertia
    function lerp(start, end, factor) {
        return start + (end - start) * factor;
    }

    function animateHeroExitLoop() {
        targetScrollY = window.scrollY;

        // Smoothly interpolate current scroll towards target scroll (factor 0.055 = silky inertia)
        currentScrollY = lerp(currentScrollY, targetScrollY, 0.055);

        // Header glassmorphism state
        if (header) {
            if (currentScrollY > 50) {
                header.classList.add('scrolled');
            } else {
                header.classList.remove('scrolled');
            }
        }

        // Extended Pinned Hero Motion (Desktop only > 1199px)
        if (heroWrapper && heroSection && window.innerWidth > 1199) {
            const wrapperHeight = heroWrapper.offsetHeight - window.innerHeight;
            
            if (wrapperHeight > 0) {
                const rawProgress = Math.min(1, Math.max(0, currentScrollY / wrapperHeight));
                const panProgress = Math.min(1, rawProgress / 0.7);

                if (heroBg) {
                    const bgScale = 1 + panProgress * 0.22;
                    const bgTranslateY = panProgress * 160;
                    heroBg.style.transform = `translate3d(0, ${bgTranslateY.toFixed(2)}px, 0) scale(${bgScale.toFixed(4)})`;
                }

                if (heroContent) {
                    const contentOpacity = Math.max(0, 1 - panProgress * 1.25);
                    const contentTranslateY = -panProgress * 95;
                    heroContent.style.opacity = contentOpacity.toFixed(4);
                    heroContent.style.transform = `translate3d(0, ${contentTranslateY.toFixed(2)}px, 0)`;
                }

                if (heroOverlay) {
                    const overlayOpacity = Math.min(0.95, 0.4 + panProgress * 0.55);
                    heroOverlay.style.opacity = overlayOpacity.toFixed(4);
                }

                if (rawProgress > 0.7) {
                    const exitProgress = (rawProgress - 0.7) / 0.3;
                    heroSection.style.opacity = Math.max(0, 1 - exitProgress * 1.5).toFixed(4);
                } else {
                    heroSection.style.opacity = '1';
                }
            }
        } else if (heroSection) {
            // Tablet & Mobile (<= 1199px): Ensure 100% visibility & zero black screen overlay!
            heroSection.style.opacity = '1';
            if (heroContent) {
                heroContent.style.opacity = '1';
                heroContent.style.transform = 'none';
            }
            if (heroBg) {
                heroBg.style.transform = 'none';
            }
        }

        requestAnimationFrame(animateHeroExitLoop);
    }

    // Start continuous 240fps smooth animation loop
    requestAnimationFrame(animateHeroExitLoop);

    // 2. Mobile menu toggle
    const mobileMenuToggle = document.getElementById('mobileMenuToggle');
    const mainNav = document.querySelector('.main-nav');

    if (mobileMenuToggle && mainNav) {
        mobileMenuToggle.addEventListener('click', () => {
            mainNav.classList.toggle('active');
            mobileMenuToggle.classList.toggle('open');
        });

        document.querySelectorAll('.main-nav a').forEach(link => {
            link.addEventListener('click', () => {
                mainNav.classList.remove('active');
                mobileMenuToggle.classList.remove('open');
            });
        });
    }

    // 3. Scroll Reveal Section Transition Animations
    const revealSections = document.querySelectorAll('.reveal-section');
    revealSections.forEach(section => {
        section.classList.add('visible');
        section.style.opacity = '1';
        section.style.transform = 'none';
    });

    // 4. Horizontal Gallery Slider & Carousel
    const galleryTrack = document.getElementById('galleryTrack');
    const galleryPrev = document.getElementById('galleryPrev');
    const galleryNext = document.getElementById('galleryNext');
    const galleryDots = document.getElementById('galleryDots');
    const slides = document.querySelectorAll('.gallery-slide');

    if (galleryTrack && slides.length > 0) {
        let currentIndex = 0;

        function getSlidesPerView() {
            if (window.innerWidth <= 992) return 1;
            return 2;
        }

        function getMaxIndex() {
            return Math.max(0, slides.length - getSlidesPerView());
        }

        function createDots() {
            if (!galleryDots) return;
            galleryDots.innerHTML = '';
            const maxIndex = getMaxIndex();
            
            for (let i = 0; i <= maxIndex; i++) {
                const dot = document.createElement('button');
                dot.className = `slider-dot ${i === currentIndex ? 'active' : ''}`;
                dot.setAttribute('aria-label', `Ir para slide ${i + 1}`);
                dot.addEventListener('click', () => goToSlide(i));
                galleryDots.appendChild(dot);
            }
        }

        function updateSlider() {
            const maxIndex = getMaxIndex();
            if (currentIndex > maxIndex) currentIndex = maxIndex;
            if (currentIndex < 0) currentIndex = 0;

            let offset = 0;
            if (slides.length > 1 && currentIndex > 0 && slides[currentIndex]) {
                offset = slides[currentIndex].offsetLeft - slides[0].offsetLeft;
            }

            galleryTrack.style.transform = `translate3d(-${offset}px, 0, 0)`;

            if (galleryPrev) galleryPrev.disabled = currentIndex === 0;
            if (galleryNext) galleryNext.disabled = currentIndex >= maxIndex;

            // Update Dots
            const dots = document.querySelectorAll('.slider-dot');
            dots.forEach((dot, idx) => {
                if (idx === currentIndex) {
                    dot.classList.add('active');
                } else {
                    dot.classList.remove('active');
                }
            });
        }

        function goToSlide(index) {
            currentIndex = index;
            updateSlider();
        }

        if (galleryPrev) {
            galleryPrev.addEventListener('click', () => {
                if (currentIndex > 0) {
                    currentIndex--;
                    updateSlider();
                }
            });
        }

        if (galleryNext) {
            galleryNext.addEventListener('click', () => {
                if (currentIndex < getMaxIndex()) {
                    currentIndex++;
                    updateSlider();
                }
            });
        }

        // Touch Swipe Handling for Mobile & Tablets
        let startX = 0;
        let isSwiping = false;

        galleryTrack.addEventListener('touchstart', (e) => {
            startX = e.touches[0].clientX;
            isSwiping = true;
        }, { passive: true });

        galleryTrack.addEventListener('touchmove', (e) => {
            if (!isSwiping) return;
        }, { passive: true });

        galleryTrack.addEventListener('touchend', (e) => {
            if (!isSwiping) return;
            const endX = e.changedTouches[0].clientX;
            const diffX = startX - endX;

            if (Math.abs(diffX) > 40) {
                if (diffX > 0 && currentIndex < getMaxIndex()) {
                    currentIndex++;
                } else if (diffX < 0 && currentIndex > 0) {
                    currentIndex--;
                }
                updateSlider();
            }
            isSwiping = false;
        });

        // Initialize Slider & Event Listeners
        createDots();
        updateSlider();

        window.addEventListener('resize', () => {
            createDots();
            updateSlider();
        });
    }

    // 5. FAQ Accordion
    const accordionItems = document.querySelectorAll('.accordion-item');

    accordionItems.forEach(item => {
        const header = item.querySelector('.accordion-header');
        
        header.addEventListener('click', () => {
            const isActive = item.classList.contains('active');
            
            accordionItems.forEach(otherItem => {
                otherItem.classList.remove('active');
            });

            if (!isActive) {
                item.classList.add('active');
            }
        });
    });

    if (accordionItems.length > 0) {
        accordionItems[0].classList.add('active');
    }

    // 6. Booking Form & Mandatory WhatsApp Pop-Up Modal
    const bookingForm = document.getElementById('bookingForm');
    const successModal = document.getElementById('successModal');
    const modalWaBtn = document.getElementById('modalWaBtn');
    const modalSummary = document.getElementById('modalSummary');
    const userCep = document.getElementById('userCep');
    const userAddress = document.getElementById('userAddress');
    const whatsappLocationCheck = document.getElementById('whatsappLocationCheck');
    const bookingType = document.getElementById('bookingType');
    const locationGroup = document.getElementById('locationGroup');
    const option2AddressWrap = document.getElementById('option2AddressWrap');
    const eventMiniMapCol = document.getElementById('eventMiniMapCol');
    const bookingInfoCol = document.getElementById('bookingInfoCol');

    const TATTOO_WHATSAPP_NUMBER = '558586981745';

    // Dynamic View Toggle for Option 1 vs Option 2
    function updateBookingView() {
        if (!bookingType) return;
        const val = bookingType.value;
        if (val === 'option2') {
            // Opção 2: Tattoo Flash para Eventos / No Seu Local
            if (locationGroup) locationGroup.style.display = 'none';
            if (option2AddressWrap) option2AddressWrap.style.display = 'block';
            if (eventMiniMapCol) eventMiniMapCol.style.display = 'block';
            if (bookingInfoCol) bookingInfoCol.style.display = 'none';
        } else {
            // Opção 1 (PADRÃO): Agendar Horário para Tatuar (Estúdio)
            if (locationGroup) locationGroup.style.display = 'block';
            if (option2AddressWrap) option2AddressWrap.style.display = 'none';
            if (eventMiniMapCol) eventMiniMapCol.style.display = 'none';
            if (bookingInfoCol) bookingInfoCol.style.display = 'block';
        }
    }

    if (bookingType) {
        bookingType.addEventListener('change', updateBookingView);
        updateBookingView(); // Ensure Option 1 is pre-selected and rendered by default
    }

    const googleMapIframe = document.getElementById('googleMapIframe');
    const userNumber = document.getElementById('userNumber');
    let mapUpdateTimer = null;

    // Live Map Update Function (Pinpoint exact address dynamically on Option 2)
    function updateLiveMap() {
        if (!googleMapIframe) return;
        const cep = userCep ? userCep.value.trim() : '';
        const address = userAddress ? userAddress.value.trim() : '';
        const number = userNumber ? userNumber.value.trim() : '';

        if (whatsappLocationCheck && whatsappLocationCheck.checked) {
            googleMapIframe.src = `https://maps.google.com/maps?q=Acarau,Amontada,Ceara&t=&z=11&ie=UTF8&iwloc=&output=embed`;
            return;
        }

        let searchQuery = [address, number, cep, 'Ceará, Brasil'].filter(Boolean).join(', ');
        if (!address && !cep) {
            searchQuery = 'Acaraú, Amontada, Ceará';
        }

        googleMapIframe.src = `https://maps.google.com/maps?q=${encodeURIComponent(searchQuery)}&t=&z=15&ie=UTF8&iwloc=&output=embed`;
    }

    function scheduleMapUpdate() {
        clearTimeout(mapUpdateTimer);
        mapUpdateTimer = setTimeout(updateLiveMap, 500); // 500ms debounce
    }

    if (userAddress) userAddress.addEventListener('input', scheduleMapUpdate);
    if (userNumber) userNumber.addEventListener('input', scheduleMapUpdate);

    // ViaCEP API Brazil Auto Lookup
    if (userCep) {
        userCep.addEventListener('input', (e) => {
            let val = e.target.value.replace(/\D/g, '');
            if (val.length > 5) {
                val = val.substring(0, 5) + '-' + val.substring(5, 8);
            }
            e.target.value = val;
            scheduleMapUpdate();
        });

        userCep.addEventListener('blur', () => {
            const rawCep = userCep.value.replace(/\D/g, '');
            if (rawCep.length === 8) {
                fetch(`https://viacep.com.br/ws/${rawCep}/json/`)
                    .then(res => res.json())
                    .then(data => {
                        if (!data.erro && userAddress) {
                            userAddress.value = `${data.logradouro ? data.logradouro + ', ' : ''}${data.bairro ? data.bairro + ' - ' : ''}${data.localidade}/${data.uf}`;
                            updateLiveMap();
                        }
                    })
                    .catch(() => {});
            }
        });
    }

    if (whatsappLocationCheck) {
        whatsappLocationCheck.addEventListener('change', () => {
            if (whatsappLocationCheck.checked) {
                if (userAddress) userAddress.value = 'Combinar endereço exato pelo WhatsApp';
                if (userNumber) userNumber.value = '';
                if (userCep) userCep.value = '';
            } else {
                if (userAddress) userAddress.value = '';
            }
            updateLiveMap();
        });
    }

    if (bookingForm) {
        bookingForm.addEventListener('submit', (e) => {
            e.preventDefault();

            const name = document.getElementById('fullName').value.trim();
            const isOption2 = bookingType && bookingType.value === 'option2';
            const typeText = isOption2 ? '2ª Opção: Tattoo Flash para Eventos / No Seu Local' : '1ª Opção: Agendar Horário para Tatuar (Estúdio)';
            const locationSelect = document.getElementById('userLocation');
            const studioLocation = locationSelect ? locationSelect.value : 'Acaraú - CE (Estúdio Próprio)';
            
            const cep = userCep ? userCep.value.trim() : '';
            const address = userAddress ? userAddress.value.trim() : '';
            const number = userNumber ? userNumber.value.trim() : '';
            const idea = document.getElementById('tattooIdea').value.trim();
            const dateVal = document.getElementById('preferredDate').value;

            let formattedDate = 'A combinar';
            if (dateVal) {
                const parts = dateVal.split('-');
                if (parts.length === 3) {
                    formattedDate = `${parts[2]}/${parts[1]}/${parts[0]}`;
                }
            }

            let fullEventAddress = [address, number, cep ? `(CEP: ${cep})` : ''].filter(Boolean).join(' - ');
            if (whatsappLocationCheck && whatsappLocationCheck.checked) {
                fullEventAddress = 'Combinar local exato pelo WhatsApp';
            } else if (!fullEventAddress) {
                fullEventAddress = 'Combinar local exato pelo WhatsApp';
            }

            let messageText = '';
            if (isOption2) {
                messageText = 
`🔥 *SOLICITAÇÃO DE EVENTO / TATTOO FLASH — CELO TATTOO* 🔥

👤 *Nome do Responsável:* ${name}
📌 *Modalidade:* 2ª Opção: Tattoo Flash para Eventos / No Seu Local
🏡 *Endereço do Evento:* ${fullEventAddress}
💡 *Detalhes do Evento / Tattoo:* ${idea}
📅 *Data Preferida:* ${formattedDate}`;
            } else {
                messageText = 
`🔥 *SOLICITAÇÃO DE AGENDAMENTO — CELO TATTOO* 🔥

👤 *Nome:* ${name}
📌 *Modalidade:* 1ª Opção: Agendar Horário para Tatuar (Estúdio)
📍 *Cidade de Origem (De onde você é):* ${studioLocation}
💡 *Ideia da Tattoo:* ${idea}
📅 *Data Preferida:* ${formattedDate}`;
            }

            const whatsappUrl = `https://api.whatsapp.com/send?phone=${TATTOO_WHATSAPP_NUMBER}&text=${encodeURIComponent(messageText)}`;

            // Populate Modal Summary
            if (isOption2) {
                modalSummary.innerHTML = `
                    <div><strong>Cliente:</strong> ${name}</div>
                    <div><strong>Modalidade:</strong> Tattoo Flash em Evento</div>
                    <div><strong>Endereço:</strong> ${fullEventAddress}</div>
                    <div><strong>Projeto:</strong> ${idea}</div>
                    <div><strong>Data:</strong> ${formattedDate}</div>
                `;
            } else {
                modalSummary.innerHTML = `
                    <div><strong>Cliente:</strong> ${name}</div>
                    <div><strong>Modalidade:</strong> Tatuagem no Estúdio</div>
                    <div><strong>Cidade de Origem:</strong> ${studioLocation}</div>
                    <div><strong>Projeto:</strong> ${idea}</div>
                    <div><strong>Data:</strong> ${formattedDate}</div>
                `;
            }

            modalWaBtn.href = whatsappUrl;

            // Display Mandatory Pop-Up Modal FIRST
            successModal.classList.add('active');

            // Handle Click to open WhatsApp
            modalWaBtn.onclick = () => {
                window.open(whatsappUrl, '_blank');
                successModal.classList.remove('active');
                bookingForm.reset();
                updateBookingView(); // Reset view to Option 1 default
            };
        });
    }

    // 7. Event Video Controls (Click Play, Hide Text on Play, Show Audio Button on Play, Show Play Icon on Pause)
    const eventVideo = document.getElementById('eventVideo');
    const videoPlayBtn = document.getElementById('videoPlayBtn');
    const playText = document.getElementById('playText');
    const videoAudioBtn = document.getElementById('videoAudioBtn');
    const audioIcon = document.getElementById('audioIcon');
    const audioText = document.getElementById('audioText');

    if (eventVideo && videoPlayBtn) {
        eventVideo.muted = true; // Muted by default until user activates audio

        const togglePlay = () => {
            if (eventVideo.paused) {
                eventVideo.play();
                videoPlayBtn.classList.add('playing');
                // Hide "APERTE PARA ASSISTIR" text once played
                if (playText) playText.style.display = 'none';
                // Reveal the "Ativar Som" button in the bottom right after first play
                if (videoAudioBtn) videoAudioBtn.classList.add('show-audio-btn');
            } else {
                eventVideo.pause();
                // When paused, reveal only the central play icon
                videoPlayBtn.classList.remove('playing');
            }
        };

        videoPlayBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            togglePlay();
        });

        eventVideo.addEventListener('click', () => {
            togglePlay();
        });

        eventVideo.addEventListener('ended', () => {
            videoPlayBtn.classList.remove('playing');
        });
    }

    if (videoAudioBtn && eventVideo) {
        videoAudioBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            if (eventVideo.muted) {
                eventVideo.muted = false;
                audioIcon.className = 'fas fa-volume-up';
                audioText.textContent = 'Som Ligado';
                videoAudioBtn.classList.add('audio-active');
            } else {
                eventVideo.muted = true;
                audioIcon.className = 'fas fa-volume-mute';
                audioText.textContent = 'Ativar Som';
                videoAudioBtn.classList.remove('audio-active');
            }
        });
    }

});
