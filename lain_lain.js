let currentPlayingAudio = null;

/**
 * Mengontrol pemutaran audio (Play/Stop)
 */
function toggleAudio(iconElement) {
    const audioSrc = iconElement.getAttribute('data-audio-src');
    if (!audioSrc) return;

    // Membuat ID unik agar tidak bentrok
    const audioId = 'audio_' + audioSrc.replace(/[^a-zA-Z0-9]/g, '_');
    let audio = document.getElementById(audioId);

    if (!audio) {
        audio = new Audio(audioSrc);
        audio.id = audioId;
        document.body.appendChild(audio);

        audio.addEventListener('ended', () => {
            iconElement.classList.replace('fa-pause-circle', 'fa-play-circle');
            iconElement.classList.remove('playing');
            currentPlayingAudio = null;
        });
    }

    if (currentPlayingAudio === audio) {
        audio.pause();
        audio.currentTime = 0;
        currentPlayingAudio = null;
        iconElement.classList.replace('fa-pause-circle', 'fa-play-circle');
        iconElement.classList.remove('playing');
    } else {
        // Matikan audio yang sedang jalan jika ada
        if (currentPlayingAudio) {
            currentPlayingAudio.pause();
            document.querySelectorAll('.play-icon').forEach(icon => {
                icon.classList.replace('fa-pause-circle', 'fa-play-circle');
                icon.classList.remove('playing');
            });
        }

        audio.currentTime = 0;
        audio.play().catch(err => console.error("File audio tidak ditemukan:", err));
        currentPlayingAudio = audio;
        iconElement.classList.replace('fa-play-circle', 'fa-pause-circle');
        iconElement.classList.add('playing');
    }
}


function copyQuote(element) {
    const parent = element.closest('.memori-text-box');
    const quoteLines = parent.querySelectorAll('.arabic-quote-text, .indo-quote-text');
    const author = parent.querySelector('.memori-author').textContent;

    let fullText = "";
    quoteLines.forEach(line => {
        if (line.textContent.trim()) fullText += line.textContent.trim() + "\n";
    });
    fullText += author;

    navigator.clipboard.writeText(fullText.trim()).then(() => {
        // Feedback getaran (opsional)
        if ("vibrate" in navigator) navigator.vibrate(100);

        // --- PENGGANTI ALERT ---
        const notification = document.getElementById('copyNotification');
        notification.classList.add('show');
        
        // Hilangkan notifikasi setelah 2 detik
        setTimeout(() => {
            notification.classList.remove('show');
        }, 2000);
    });
}

// Inisialisasi Event Listener setelah DOM siap
document.addEventListener('DOMContentLoaded', () => {
    
    // 1. Jalankan fungsi utama bawaan kamu terlebih dahulu
    document.querySelectorAll('.play-icon').forEach(icon => {
        icon.addEventListener('click', (e) => {
            e.stopPropagation();
            toggleAudio(icon);
        });
    });

    document.querySelectorAll('.memori-author').forEach(author => {
        author.addEventListener('click', () => copyQuote(author));
    });

    // 2. Jalankan Animasi Scroll (Intersection Observer)
    const observerOptions = {
        root: null,
        threshold: 0.1
    };

    const textAnimationObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('show-animasi');
                observer.unobserve(entry.target); // Animasi cukup sekali saat di-scroll
            }
        });
    }, observerOptions);

    // Daftarkan kotak teks untuk diawasi animasinya
    document.querySelectorAll('.memori-text-box').forEach(box => {
        textAnimationObserver.observe(box);
    });
});
