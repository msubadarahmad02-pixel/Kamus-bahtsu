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

    // 2. MEMUAT DATA JSON & RENDER SLIDE
    async function loadSholawat() {
        try {
            const response = await fetch('Data_sholawat.json');
            sholawatData = await response.json();
            
            slidesWrapper.innerHTML = ''; // Bersihkan wrapper sebelum mengisi

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
        
        } catch (error) {
            console.error("Gagal memuat data sholawat:", error);
            if (titleElement) titleElement.textContent = "Gagal memuat lirik.";
        }
    }
    
    // 3. UPDATE JUDUL
    function updateTitle(index) {
        if (sholawatData[index] && titleElement) {
            titleElement.textContent = sholawatData[index].judul;
        }
    }

    // 4. DETEKSI SLIDE AKTIF SAAT SCROLL
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

            // Hentikan pemutaran jika berpindah slide
            if (!audioPlayer.paused) {
                audioPlayer.pause();
                playPauseButton.innerHTML = "▶️";
            }
        }
    }

    // 5. FITUR CARI ID MODAL
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

    // 6. KONTROL AUDIO
    if (playPauseButton && audioPlayer) {
        playPauseButton.addEventListener('click', () => {
            const slides = document.querySelectorAll('.lyric-slide');
            const currentActiveSlide = slides[activeSlideIndex];
            const audioUrl = currentActiveSlide ? currentActiveSlide.getAttribute('data-audio-url') : null;

            if (!audioUrl) {
                alert("Audio tidak tersedia untuk slide ini.");
                return;
            }
            
            // Konfirmasi path audio
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
