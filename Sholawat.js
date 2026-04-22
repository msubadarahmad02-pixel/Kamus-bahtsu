document.addEventListener('DOMContentLoaded', () => {
    const slidesContainer = document.querySelector('.lyrics-container');
    const slidesWrapper = document.getElementById('slides-wrapper');
    const playPauseButton = document.getElementById('play-pause-button');
    const audioPlayer = document.getElementById('audio-player');
    const titleElement = document.getElementById('page-title'); // Ambil elemen judul
    const backButton = document.getElementById('back-to-home');
    
    let activeSlideIndex = 0;
    let sholawatData = []; // Untuk menyimpan data yang dimuat dari JSON
    
    if (backButton) {
        backButton.addEventListener('click', () => {
            window.location.href = 'index.html';
        });
    }
    

    // FUNGSI UTAMA: MEMUAT DAN MERENDER DATA SHOLAWAT
    async function loadSholawat() {
        try {
            const response = await fetch('Data_sholawat.json');
            sholawatData = await response.json();
            
            sholawatData.forEach((item, index) => {
                const slide = document.createElement('div');
                slide.className = 'lyric-slide';
                // Menyimpan data yang diperlukan (URL audio dan Judul) di elemen slide
                slide.setAttribute('data-audio-url', item.audio_url);
                slide.setAttribute('data-judul', item.judul); 
                
                const textDiv = document.createElement('pre');
                textDiv.className = 'lyric-text';
                textDiv.textContent = item.lirik;
                
                slide.appendChild(textDiv);
                slidesWrapper.appendChild(slide);
            });
            
            // Inisialisasi Judul Awal
            if (sholawatData.length > 0) {
                updateTitle(0);
            }

            // Setelah semua slide dimuat, inisialisasi event listener scroll
            slidesContainer.addEventListener('scroll', handleScroll);
        
        } catch (error) {
            console.error("Gagal memuat data sholawat:", error);
            titleElement.textContent = "Gagal memuat lirik.";
        }
    }
    
    // FUNGSI BARU: MEMPERBARUI JUDUL DI BAGIAN ATAS
    function updateTitle(index) {
        if (sholawatData[index]) {
            titleElement.textContent = sholawatData[index].judul;
        }
    }

    // FUNGSI 1: MENDETEKSI SLIDE YANG AKTIF DAN MEMPERBARUI JUDUL
    function handleScroll() {
        const scrollPosition = slidesContainer.scrollLeft;
        const slideWidth = slidesContainer.offsetWidth;

        // Menghitung index slide yang paling dekat atau yang sedang dilihat
        const newIndex = Math.round(scrollPosition / slideWidth);

        // Perbarui activeSlideIndex dan Judul jika ada perubahan posisi slide
        if (newIndex !== activeSlideIndex) {
            activeSlideIndex = newIndex;
            updateTitle(activeSlideIndex); // Panggil fungsi updateTitle
            
        }
    }

    // FUNGSI 2: MENGONTROL PEMUTAR AUDIO 
    playPauseButton.addEventListener('click', () => {
        const slides = document.querySelectorAll('.lyric-slide');

        const currentActiveSlide = slides[activeSlideIndex];
        const audioUrl = currentActiveSlide ? currentActiveSlide.getAttribute('data-audio-url') : null;

        if (!audioUrl) {
            console.error("URL audio tidak ditemukan.");
            alert("Rekaman tidak tersedia.");
            return;
        }
        
        // Logika Play/Pause
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

    // FUNGSI 3: MENGATUR ULANG TOMBOL KETIKA AUDIO SELESAI
    audioPlayer.addEventListener('ended', () => {
        playPauseButton.innerHTML = "▶️";
    });

    // Panggil fungsi pemuatan saat DOM siap
    loadSholawat();
});