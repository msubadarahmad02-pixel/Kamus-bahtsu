let currentPlayingAudio = null;

document.addEventListener('DOMContentLoaded', () => {
    // 1. Fetch data dari lain_lain.json
    fetch('lain_lain.json')
        .then(response => {
            if (!response.ok) throw new Error('Gagal memuat JSON');
            return response.json();
        })
        .then(data => {
            renderPageContent(data);
            initCopyFeature();
        })
        .catch(error => console.error('Error:', error));
});

// 2. Render Komponen HTML secara Dinamis
function renderPageContent(quotes) {
    const sliderWrapper = document.getElementById('title-slides-wrapper');
    const quoteContainer = document.getElementById('quote-container');

    if (!sliderWrapper || !quoteContainer) return;

    sliderWrapper.innerHTML = '';
    quoteContainer.innerHTML = '';

    quotes.forEach((item, index) => {
        // Render Slider Judul
        const slideDiv = document.createElement('div');
        slideDiv.className = 'title-slide';
        slideDiv.setAttribute('data-index', index);
        slideDiv.innerHTML = `<h2 class="title-text">${item.judul}</h2>`;
        sliderWrapper.appendChild(slideDiv);

        // Render Kotak Teks Quote
        const boxDiv = document.createElement('div');
        boxDiv.className = 'memori-text-box';
        boxDiv.setAttribute('data-index', index);

        const arabHTML = item.arab 
            ? `<span class="arabic-quote-text" dir="rtl">${item.arab.replace(/\n/g, '<br>')}</span><br>` 
            : '';
        const indoHTML = `<span class="indo-quote-text">${item.indo.replace(/\n/g, '<br>')}</span>`;
        
        // Render Tombol Audio hanya jika file audio tersedia di JSON
        const audioHTML = item.audio 
            ? `<div class="audio-control-container">
                <i class="fas fa-play-circle play-icon" data-audio-src="${item.audio}"></i>
               </div>` 
            : '';

        // Render Author jika tersedia di JSON
        const authorHTML = item.author 
            ? `<p class="memori-author">- ${item.author}</p>` 
            : '';

        boxDiv.innerHTML = `
            <p class="memori-quote">
                ${arabHTML}
                ${indoHTML}
            </p>
            ${audioHTML}
            ${authorHTML}
        `;

        quoteContainer.appendChild(boxDiv);
    });

    initAudioControl();
    initSliderNavigation();
    initScrollAnimation();
}

// 3. Fungsi Pemutar Audio (Play & Pause)
function initAudioControl() {
    document.querySelectorAll('.play-icon').forEach(icon => {
        icon.addEventListener('click', (e) => {
            e.stopPropagation(); // Mencegah pemicu event copy saat ikon diklik
            toggleAudio(icon);
        });
    });
}

function toggleAudio(iconElement) {
    const audioSrc = iconElement.getAttribute('data-audio-src');
    if (!audioSrc) return;

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

// 4. Animasi Scroll (Intersection Observer) - Bisa Berulang Naik & Turun
function initScrollAnimation() {
    const observerOptions = { 
        root: null, 
        threshold: 0.15 
    };
    
    const textAnimationObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('show-animasi');
            } else {
                entry.target.classList.remove('show-animasi');
            }
        });
    }, observerOptions);

    document.querySelectorAll('.memori-text-box').forEach(box => {
        textAnimationObserver.observe(box);
    });
}


// 5. Navigasi Klik Slider Judul
function initSliderNavigation() {
    const slides = document.querySelectorAll('.title-slide');
    slides.forEach((slide) => {
        slide.addEventListener('click', () => {
            const index = slide.getAttribute('data-index');
            const targetBox = document.querySelector(`.memori-text-box[data-index="${index}"]`);
            
            if (targetBox) {
                targetBox.scrollIntoView({ 
                    behavior: 'smooth', 
                    block: 'center' 
                });
            }
        });
    });
}


// 6. Fitur Copy Teks & Author
//function initCopyFeature() {
   // const quoteContainer = document.getElementById('quote-container');
  //  const notification = document.getElementById('copyNotification');

   // if (!quoteContainer) return;

   // quoteContainer.addEventListener('click', (e) => {
        // Jangan salin jika user mengklik ikon audio
     //   if (e.target.classList.contains('play-icon')) return;

      //  const box = e.target.closest('.memori-text-box');
     //   if (!box) return;

      //  const quoteLines = box.querySelectorAll('.arabic-quote-text, .indo-quote-text');
     //   const authorEl = box.querySelector('.memori-author');

      //  let fullText = "";
     //   quoteLines.forEach(line => {
        //    if (line.textContent.trim()) fullText += line.textContent.trim() + "\n";
    //    });

   //     if (authorEl) fullText += authorEl.textContent.trim();

    //    navigator.clipboard.writeText(fullText.trim()).then(() => {
    //        if ("vibrate" in navigator) navigator.vibrate(100);

      //      if (notification) {
      //          notification.classList.add('show');
         //       setTimeout(() => {
        //            notification.classList.remove('show');
     //           }, 2000);
       //     }
  //      });
  //  });
//}
