document.addEventListener('DOMContentLoaded', () => {
    // 1. Inisialisasi Elemen DOM
    const slidesContainer = document.querySelector('.lyrics-container');
    const slidesWrapper = document.getElementById('slides-wrapper');
    const playPauseButton = document.getElementById('play-pause-button');
    const audioPlayer = document.getElementById('audio-player');
    const titleElement = document.getElementById('page-title');
    const searchButton = document.getElementById('search-by-id'); // Tombol pencarian ID
    
    let activeSlideIndex = 0;
    let sholawatData = []; // Menyimpan data JSON

    // 2. FUNGSI UTAMA: MEMUAT DATA JSON & RENDER SLIDE
    async function loadSholawat() {
        try {
            const response = await fetch('Data_sholawat.json');
            sholawatData = await response.json();
            
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
            
            // Set Judul & Aktifkan Slide Pertama saat Awal Muat
            if (sholawatData.length > 0) {
                updateTitle(0);
                const firstSlide = slidesWrapper.querySelector('.lyric-slide');
                if (firstSlide) firstSlide.classList.add('active');
            }

            // Pasang event listener scroll setelah slide siap
            slidesContainer.addEventListener('scroll', handleScroll);
        
        } catch (error) {
            console.error("Gagal memuat data sholawat:", error);
            titleElement.textContent = "Gagal memuat lirik.";
        }
    }
    
    // 3. FUNGSI UPDATE JUDUL
    function updateTitle(index) {
        if (sholawatData[index]) {
            titleElement.textContent = sholawatData[index].judul;
        }
    }

    // 4. FUNGSI MENDETEKSI SLIDE AKTIF SAAT DI-SCROLL
    function handleScroll() {
        const scrollPosition = slidesContainer.scrollLeft;
        const slideWidth = slidesContainer.offsetWidth;
        const newIndex = Math.round(scrollPosition / slideWidth);
        const slides = document.querySelectorAll('.lyric-slide');

        if (newIndex !== activeSlideIndex) {
            // Lepas kelas active dari slide lama
            if (slides[activeSlideIndex]) {
                slides[activeSlideIndex].classList.remove('active');
            }

            activeSlideIndex = newIndex;
            updateTitle(activeSlideIndex);
            
            // Tambah kelas active ke slide baru untuk efek animasi
            if (slides[activeSlideIndex]) {
                slides[activeSlideIndex].classList.add('active');
            }
        }
    }

    // 5. FITUR CARI & LONCAT BERDASARKAN ID (SEARCH BUTTON)
    if (searchButton) {
        searchButton.addEventListener('click', () => {
            const inputId = prompt("Masukkan Nomor ID Sholawat (misal: 1, 2, 3...):");
            
            if (!inputId) return; // Jika klik batal/kosong

            const targetIndex = sholawatData.findIndex(item => item.id == inputId.trim());

            if (targetIndex !== -1) {
                const slideWidth = slidesContainer.offsetWidth;
                
                // Meluncur halus ke slide pilihan
                slidesContainer.scrollTo({
                    left: targetIndex * slideWidth,
                    behavior: 'smooth'
                });
            } else {
                alert(`Sholawat dengan ID ${inputId} tidak ditemukan!`);
            }
        });
    }

    // 6. KONTROL PEMUTAR AUDIO (PLAY/PAUSE)
    playPauseButton.addEventListener('click', () => {
        const slides = document.querySelectorAll('.lyric-slide');
        const currentActiveSlide = slides[activeSlideIndex];
        const audioUrl = currentActiveSlide ? currentActiveSlide.getAttribute('data-audio-url') : null;

        if (!audioUrl) {
            alert("Audio tidak tersedia untuk slide ini.");
            return;
        }
        
        if (audioPlayer.paused || audioPlayer.src.split('/').pop() !== audioUrl.split('/').pop()) {
            audioPlayer.src = audioUrl; 
            audioPlayer.play()
                .then(() => playPauseButton.innerHTML = "⏸️")
                .catch(error => console.error("Gagal memutar audio:", error));
        } else {
            audioPlayer.pause();
            playPauseButton.innerHTML = "▶️";
        }
    });

    // Reset tombol jika audio selesai diputar
    audioPlayer.addEventListener('ended', () => {
        playPauseButton.innerHTML = "▶️";
    });

    // Jalankan Pemuatan Data
    loadSholawat();
});
