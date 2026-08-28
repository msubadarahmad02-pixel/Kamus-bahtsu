let currentPlayingAudio = null;
let globalQuotesData = [];

document.addEventListener('DOMContentLoaded', () => {
    fetch('lain_lain.json')
        .then(response => {
            if (!response.ok) throw new Error('Gagal memuat JSON');
            return response.json();
        })
        .then(data => {
            globalQuotesData = data;
            renderPageContent(data);
            initCopyFeature();
            initSearchFeature();
        })
        .catch(error => console.error('Error:', error));
});

function renderPageContent(quotes) {
    const sliderWrapper = document.getElementById('title-slides-wrapper');
    const quoteContainer = document.getElementById('quote-container');

    if (!sliderWrapper || !quoteContainer) return;

    sliderWrapper.innerHTML = '';
    quoteContainer.innerHTML = '';

    quotes.forEach((item, index) => {
        const slideDiv = document.createElement('div');
        slideDiv.className = 'title-slide';
        slideDiv.setAttribute('data-index', index);
        slideDiv.innerHTML = `<h2 class="title-text">${item.judul}</h2>`;
        sliderWrapper.appendChild(slideDiv);

        const boxDiv = document.createElement('div');
        boxDiv.className = 'memori-text-box';
        boxDiv.setAttribute('data-index', index);

        const arabHTML = item.arab 
            ? `<span class="arabic-quote-text" dir="rtl">${item.arab.replace(/\n/g, '<br>')}</span><br>` 
            : '';
        const indoHTML = item.indo 
            ? `<span class="indo-quote-text">${item.indo.replace(/\n/g, '<br>')}</span>` 
            : '';
        
        const audioHTML = item.audio 
            ? `<div class="audio-control-container">
                <i class="fas fa-play-circle play-icon" data-audio-src="${item.audio}"></i>
               </div>` 
            : '';

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

function hilangkanHarakat(teks) {
    if (!teks) return '';
    return teks.replace(/[\u064B-\u0652]/g, "");
}

function initSearchFeature() {
    const openBtn = document.getElementById('open-search-btn');
    const modal = document.getElementById('search-modal');
    const cancelBtn = document.getElementById('modal-cancel');
    const submitBtn = document.getElementById('modal-submit');
    const searchInput = document.getElementById('search-input');
    const searchError = document.getElementById('search-error');

    if (!openBtn || !modal) return;

    openBtn.addEventListener('click', () => {
        modal.classList.add('active');
        searchInput.value = '';
        if (searchError) searchError.style.display = 'none';
        setTimeout(() => searchInput.focus(), 100);
    });

    const closeModal = () => {
        modal.classList.remove('active');
    };

    cancelBtn.addEventListener('click', closeModal);
    modal.addEventListener('click', (e) => {
        if (e.target === modal) closeModal();
    });

    const executeSearch = () => {
        const keyword = searchInput.value.trim();
        if (!keyword) return;

        const keywordGundul = hilangkanHarakat(keyword).toLowerCase();

        const targetIndex = globalQuotesData.findIndex(item => {
            const idCocok = item.id.toString() === keyword;
            const judulCocok = hilangkanHarakat(item.judul).toLowerCase().includes(keywordGundul);
            const arabCocok = hilangkanHarakat(item.arab).toLowerCase().includes(keywordGundul);
            const indoCocok = item.indo.toLowerCase().includes(keywordGundul);
            const authorCocok = hilangkanHarakat(item.author).toLowerCase().includes(keywordGundul);

            return idCocok || judulCocok || arabCocok || indoCocok || authorCocok;
        });

        if (targetIndex !== -1) {
            const targetBox = document.querySelector(`.memori-text-box[data-index="${targetIndex}"]`);
            if (targetBox) {
                targetBox.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
            closeModal();
        } else {
            if (searchError) {
                searchError.textContent = `"${keyword}" tidak ditemukan!`;
                searchError.style.display = 'block';
            }
        }
    };

    submitBtn.addEventListener('click', executeSearch);
    searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') executeSearch();
    });
}

function initAudioControl() {
    document.querySelectorAll('.play-icon').forEach(icon => {
        icon.addEventListener('click', (e) => {
            e.stopPropagation();
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

function initCopyFeature() {
    const quoteContainer = document.getElementById('quote-container');
    const notification = document.getElementById('copyNotification');

    if (!quoteContainer) return;

    quoteContainer.addEventListener('click', (e) => {
        const box = e.target.closest('.memori-text-box');
        if (!box || e.target.classList.contains('play-icon')) return;

        const quoteElem = box.querySelector('.memori-quote');
        const authorElem = box.querySelector('.memori-author');

        let textToCopy = quoteElem ? quoteElem.innerText.trim() : '';
        if (authorElem) {
            textToCopy += `\n\n${authorElem.innerText.trim()}`;
        }

        if (navigator.clipboard && window.isSecureContext) {
            navigator.clipboard.writeText(textToCopy).then(() => showNotification());
        } else {
            const textArea = document.createElement("textarea");
            textArea.value = textToCopy;
            document.body.appendChild(textArea);
            textArea.select();
            try {
                document.execCommand('copy');
                showNotification();
            } catch (err) {
                console.error('Gagal menyalin: ', err);
            }
            document.body.removeChild(textArea);
        }
    });

    function showNotification() {
        if (!notification) return;
        notification.classList.add('show');
        setTimeout(() => {
            notification.classList.remove('show');
        }, 2000);
    }
}
     
