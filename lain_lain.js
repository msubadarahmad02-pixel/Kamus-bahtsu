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

// Inisialisasi Event Listener
document.addEventListener('DOMContentLoaded', () => {
    // Listener untuk Ikon Play
    document.querySelectorAll('.play-icon').forEach(icon => {
        icon.addEventListener('click', (e) => {
            e.stopPropagation();
            toggleAudio(icon);
        });
    });

    // Listener untuk Nama Pengarang (Salin Teks)
    document.querySelectorAll('.memori-author').forEach(author => {
        author.addEventListener('click', () => copyQuote(author));
    });
});