document.addEventListener('DOMContentLoaded', () => {
    // 1. Inisialisasi Elemen DOM
    const slidesContainer = document.querySelector('.lyrics-container');
    const slidesWrapper = document.getElementById('slides-wrapper');
    const playPauseButton = document.getElementById('play-pause-button');
    const audioPlayer = document.getElementById('audio-player');
    const titleElement = document.getElementById('page-title');
    const searchButton = document.getElementById('search-by-id');
    
    let activeSlideIndex = 0;
    let sholawatData = [];

    // Kumpulan 12 Efek Animasi
    const animClasses = [
        'anim-top',
        'anim-bottom',
        'anim-left',
        'anim-right',
        'anim-top-left',
        'anim-top-right',
        'anim-bottom-left',
        'anim-bottom-right',
        'anim-zoom-rotate',
        'anim-flip-x',
        'anim-flip-y',
        'anim-super-bounce'
    ];

    // Fungsi Mengambil Kelas Animasi Acak (Berbeda dari kelas sebelumnya)
    function getRandomAnimClass(currentClass) {
        const available = animClasses.filter(c => c !== currentClass);
        return available[Math.floor(Math.random() * available.length)];
    }

    // 2. MEMUAT DATA JSON & RENDER SLIDE
    async function loadSholawat() {
        try {
            const response = await fetch('data_sholawat.json');
            sholawatData = await response.json();
            
            slidesWrapper.innerHTML = ''; 

            sholawatData.forEach((item) => {
                const slide = document.createElement('div');
                slide.className = 'lyric-slide';
                slide.setAttribute('data-audio-url', item.audio_url);
                slide.setAttribute('data-judul', item.judul); 
                
                const textDiv = document.createElement('pre');
                textDiv.className = 'lyric-text';
                textDiv.textContent = item.lirik;
                
                slide.appendChild(textDiv);
                slidesWrapper.appendChild(slide);
            });
            
            if (sholawatData.length > 0) {
                updateTitle(0);
                const firstSlide = slidesWrapper.querySelector('.lyric-slide');
                if (firstSlide) firstSlide.classList.add('active');
            }

            slidesContainer.addEventListener('scroll', handleScroll);
            
            // Jalankan pengamat animasi dinamis
            initLyricAnimation();
        
        } catch (error) {
            console.error("Gagal memuat data sholawat:", error);
            if (titleElement) titleElement.textContent = "Gagal memuat lirik.";
        }
    }

    // 3. OBSERVER ANIMASI DINAMIS (Acak Setiap Kali Geser)
    function initLyricAnimation() {
        const observerOptions = {
            root: slidesContainer,
            threshold: 0.4
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                const textElement = entry.target.querySelector('.lyric-text');
                if (!textElement) return;

                if (entry.isIntersecting) {
                    // Hapus semua kelas animasi lama
                    animClasses.forEach(cls => textElement.classList.remove(cls));
                    
                    // Pilih & pasang kelas animasi acak baru
                    const newAnim = getRandomAnimClass();
                    textElement.classList.add(newAnim);

                    // Berikan jeda kecil agar Browser membaca perubahan gaya sebelum ditransisikan
                    requestAnimationFrame(() => {
                        textElement.classList.add('show-lyric-anim');
                    });
                } else {
                    // Saat slide keluar layar, reset tampilan agar siap dianimasikan lagi
                    textElement.classList.remove('show-lyric-anim');
                }
            });
        }, observerOptions);

        document.querySelectorAll('.lyric-slide').forEach(slide => {
            observer.observe(slide);
        });
    }

    // 4. UPDATE JUDUL
    function updateTitle(index) {
        if (sholawatData[index] && titleElement) {
            titleElement.textContent = sholawatData[index].judul;
        }
    }

    // 5. DETEKSI SLIDE AKTIF SAAT SCROLL
    function handleScroll() {
        const slideWidth = slidesContainer.offsetWidth;
        if (slideWidth === 0) return;

        const scrollPosition = slidesContainer.scrollLeft;
        const newIndex = Math.round(scrollPosition / slideWidth);
        const slides = document.querySelectorAll('.lyric-slide');

        if (newIndex !== activeSlideIndex && slides[newIndex]) {
            if (slides[activeSlideIndex]) {
                slides[activeSlideIndex].classList.remove('active');
            }

            activeSlideIndex = newIndex;
            updateTitle(activeSlideIndex);
            slides[activeSlideIndex].classList.add('active');
        }
    }

    // 6. FITUR CARI ID MODAL
    const modal = document.getElementById('search-modal');
    const searchInput = document.getElementById('search-input');
    const searchError = document.getElementById('search-error');
    const btnCancel = document.getElementById('modal-cancel');
    const btnSubmit = document.getElementById('modal-submit');

    if (searchButton) {
        searchButton.addEventListener('click', () => {
            if (searchInput) searchInput.value = '';
            if (searchError) searchError.style.display = 'none';
            if (modal) modal.classList.add('active');
            if (searchInput) searchInput.focus();
        });
    }

    const closeModal = () => {
        if (modal) modal.classList.remove('active');
        if (searchError) searchError.style.display = 'none';
    };

    if (btnCancel) btnCancel.addEventListener('click', closeModal);

    function executeSearch() {
        const inputId = searchInput.value.trim();
        if (!inputId) return;

        const targetIndex = sholawatData.findIndex(item => item.id == inputId);

        if (targetIndex !== -1) {
            const slideWidth = slidesContainer.offsetWidth;
            slidesContainer.scrollTo({
                left: targetIndex * slideWidth,
                behavior: 'smooth'
            });
            closeModal();
        } else {
            if (searchError) {
                searchError.textContent = `ID ${inputId} tidak ditemukan!`;
                searchError.style.display = 'block';
            }
        }
    }

    if (btnSubmit) btnSubmit.addEventListener('click', executeSearch);

    if (searchInput) {
        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') executeSearch();
        });
        searchInput.addEventListener('input', () => {
            if (searchError) searchError.style.display = 'none';
        });
    }

    // 7. KONTROL AUDIO (PLAY/PAUSE)
    if (playPauseButton && audioPlayer) {
        playPauseButton.addEventListener('click', () => {
            const slides = document.querySelectorAll('.lyric-slide');
            const currentActiveSlide = slides[activeSlideIndex];
            const audioUrl = currentActiveSlide ? currentActiveSlide.getAttribute('data-audio-url') : null;

            if (!audioUrl) {
                alert("Audio tidak tersedia untuk slide ini.");
                return;
            }
            
            const currentSrc = audioPlayer.src.split('/').pop();
            const targetSrc = audioUrl.split('/').pop();

            if (audioPlayer.paused || currentSrc !== targetSrc) {
                if (currentSrc !== targetSrc) {
                    audioPlayer.src = audioUrl;
                }
                audioPlayer.play()
                    .then(() => { playPauseButton.innerHTML = "⏸️"; })
                    .catch(error => console.error("Gagal memutar audio:", error));
            } else {
                audioPlayer.pause();
                playPauseButton.innerHTML = "▶️";
            }
        });

        audioPlayer.addEventListener('ended', () => {
            playPauseButton.innerHTML = "▶️";
        });
    }

    loadSholawat();
});
