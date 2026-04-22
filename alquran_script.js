document.addEventListener('DOMContentLoaded', () => {
    const container = document.querySelector('.container');
    const contentWrapper = document.createElement('div');
    contentWrapper.id = 'content-wrapper';
    
    // Pindahkan elemen yang ada ke dalam wrapper agar rapi
    const title = document.querySelector('.title');
    container.appendChild(contentWrapper);

    // Fungsi untuk memuat data dari JSON
    fetch('Alquran_data.json')
        .then(response => response.json())
        .then(data => {
            renderAyats(data);
        })
        .catch(error => console.error('Gagal memuat data:', error));

    function renderAyats(ayats) {
        ayats.forEach((ayat, index) => {
            const section = document.createElement('div');
            section.className = 'ayat-section';
            section.innerHTML = `
                <div class="media-container">
                    <img src="${ayat.image_url}" alt="Ilustrasi" class="display-image" onerror="this.src='img/bg1.jpg'">
                    <h2 class="surah-title">${ayat.surah_title}</h2>
                </div>
                
                <div class="text-container">
                    <p class="arabic-text" dir="rtl">${ayat.arabic}</p>
                    <p class="translation-text">${ayat.translation || 'Terjemahan tidak tersedia.'}</p>
                    
                    <button class="copy-button" onclick="copyText(this)">
                        <i class="fas fa-copy"></i> Salin Teks
                    </button>
                </div>

                <div class="audio-player-container">
                    <audio id="audio-${index}" src="${ayat.audio_url}" preload="none"></audio>
                    <button class="play-pause-button" onclick="toggleAudio(${index}, this)">
                        <i class="fas fa-play"></i> Play Qiroah
                    </button>
                    <span class="audio-status">Siap diputar</span>
                </div>
                <hr class="separator">
            `;
            container.appendChild(section);
        });
    }
});

// Fungsi Global untuk Kontrol Audio
function toggleAudio(id, btn) {
    const audio = document.getElementById(`audio-${id}`);
    const status = btn.nextElementSibling;
    
    // Matikan semua audio lain yang sedang putar (optional)
    document.querySelectorAll('audio').forEach(a => {
        if (a.id !== `audio-${id}`) a.pause();
    });

    if (audio.paused) {
        audio.play();
        btn.innerHTML = '<i class="fas fa-pause"></i> Pause';
        status.textContent = 'Memutar...';
    } else {
        audio.pause();
        btn.innerHTML = '<i class="fas fa-play"></i> Play Qiroah';
        status.textContent = 'Dijeda';
    }
}

// Fungsi Global untuk Salin Teks
async function copyText(btn) {
    const container = btn.closest('.text-container');
    const arabic = container.querySelector('.arabic-text').innerText;
    const translation = container.querySelector('.translation-text').innerText;
    const textToCopy = `${arabic}\n\n[Terjemahan]\n${translation}`;

    try {
        await navigator.clipboard.writeText(textToCopy);
        const nav = document.getElementById('copyNotification');
        nav.classList.add('show');
        setTimeout(() => nav.classList.remove('show'), 2000);
    } catch (err) {
        alert('Gagal menyalin teks.');
    }
}