document.addEventListener('DOMContentLoaded', () => {
    const slidesContainer = document.querySelector('.lyrics-container');
    const slidesWrapper = document.getElementById('slides-wrapper');
    const playPauseButton = document.getElementById('play-pause-button');
    const audioPlayer = document.getElementById('audio-player');
    const titleElement = document.getElementById('page-title');
    const backButton = document.getElementById('back-to-home');
    
    let activeSlideIndex = 0;
    let sholawatData = [];

    // Navigasi tombol kembali
    if (backButton) {
        backButton.addEventListener('click', () => {
            window.location.href = 'index.html';
        });
    }

    // FUNGSI UTAMA: MEMUAT DAN MERENDER DATA
    async function loadSholawat() {
        try {
            const response = await fetch('data_memori_kanza.json');
            sholawatData = await response.json();
            
            sholawatData.forEach((item) => {
                const slide = document.createElement('div');
                slide.className = 'lyric-slide';
                slide.setAttribute('data-audio-url', item.audio_url);
                slide.setAttribute('data-judul', item.judul);

                // Render Gambar (Pastikan di JSON menggunakan key "image_url")
                if (item.image_url) {
                    const img = document.createElement('img');
                    img.src = item.image_url;
                    img.className = 'slide-image';
                    slide.appendChild(img);
                }

                // Render Teks Lirik/Pesan
                const textDiv = document.createElement('pre');
                textDiv.className = 'lyric-text';
                textDiv.textContent = item.lirik;
                
                slide.appendChild(textDiv);
                slidesWrapper.appendChild(slide);
            });

            // Set judul pertama kali
            if (sholawatData.length > 0) {
                updateTitle(0);
            }

            // Aktifkan pendeteksi scroll
            slidesContainer.addEventListener('scroll', handleScroll);
        
        } catch (error) {
            console.error("Gagal memuat data:", error);
            if (titleElement) titleElement.textContent = "Gagal memuat data.";
        }
    }
    
    // Memperbarui Judul di Header
    function updateTitle(index) {
        if (sholawatData[index] && titleElement) {
            titleElement.textContent = sholawatData[index].judul;
        }
    }

    // Deteksi slide yang sedang tampil saat digeser
    function handleScroll() {
        const scrollPosition = slidesContainer.scrollLeft;
        const slideWidth = slidesContainer.offsetWidth;
        const newIndex = Math.round(scrollPosition / slideWidth);

        if (newIndex !== activeSlideIndex) {
            activeSlideIndex = newIndex;
            updateTitle(activeSlideIndex);
            
            // Opsional: Berhenti putar musik jika geser slide (jika diinginkan)
            // audioPlayer.pause();
            // playPauseButton.innerHTML = "▶️";
        }
    }

    // Kontrol Play/Pause Audio
    playPauseButton.addEventListener('click', () => {
        const slides = document.querySelectorAll('.lyric-slide');
        const currentActiveSlide = slides[activeSlideIndex];
        const audioUrl = currentActiveSlide ? currentActiveSlide.getAttribute('data-audio-url') : null;

        if (!audioUrl) {
            alert("Rekaman suara tidak tersedia untuk bagian ini.");
            return;
        }
        
        // Jika audio baru atau sedang berhenti
        if (audioPlayer.paused || !audioPlayer.src.includes(audioUrl)) {
            audioPlayer.src = audioUrl; 
            audioPlayer.play()
                .then(() => playPauseButton.innerHTML = "⏸️")
                .catch(error => console.error("Error playing audio:", error));
        } else {
            audioPlayer.pause();
            playPauseButton.innerHTML = "▶️";
        }
    });

    audioPlayer.addEventListener('ended', () => {
        playPauseButton.innerHTML = "▶️";
    });

    // --- FITUR ZOOM FOTO (MODAL) ---
    const modal = document.getElementById('image-modal');
    const modalImg = document.getElementById('img-zoom');
    const closeModal = document.querySelector('.close-modal');

    // Menggunakan event delegation agar gambar dinamis bisa diklik
    if (slidesWrapper) {
        slidesWrapper.addEventListener('click', (e) => {
            if (e.target.classList.contains('slide-image')) {
                modal.style.display = "block";
                modalImg.src = e.target.src;
            }
        });
    }

    if (closeModal) {
        closeModal.onclick = () => modal.style.display = "none";
    }

    window.onclick = (e) => {
        if (e.target === modal) modal.style.display = "none";
    };

    // Jalankan pemuatan data
    loadSholawat();
});

// FUNGSI ANIMASI BUNGA (Di luar DOMContentLoaded)
function createFlowers() {
    const container = document.getElementById('flower-container');
    if (!container) return;
    
    const flowerCount = 15;
    for (let i = 0; i < flowerCount; i++) {
        const flower = document.createElement('div');
        flower.className = 'flower';
        
        const size = Math.random() * 10 + 10 + 'px';
        flower.style.width = size;
        flower.style.height = size;
        flower.style.left = Math.random() * 100 + 'vw';
        flower.style.animationDuration = Math.random() * 3 + 4 + 's';
        flower.style.animationDelay = Math.random() * 5 + 's';
        
        container.appendChild(flower);
    }
}

createFlowers();
