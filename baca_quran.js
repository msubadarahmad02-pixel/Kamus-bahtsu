// ==========================================
// KONFIGURASI SERVING GAMBAR DARI GITHUB RELEASES
// ==========================================
const BASE_URL_GAMBAR = "https://github.com/msubadarahmad02-pixel/Kamus-bahtsu/releases/download/v1.0/";

document.addEventListener('DOMContentLoaded', () => {
    const urlParams = new URLSearchParams(window.location.search);
    let currentPage = parseInt(urlParams.get('hal')) || 1;
    const TOTAL_PAGES = 604;

    const currentImg = document.getElementById('currentImg');
    const overlayImg = document.getElementById('overlayImg');
    const flipOverlay = document.getElementById('flipOverlay');
    const viewerTitle = document.getElementById('viewerTitle');

    // Elemen Tombol Kunci, Bookmark, & Navigasi
    const btnLockPage = document.getElementById('btnLockPage');
    const lockIcon = document.getElementById('lockIcon');
    const btnBookmarkPage = document.getElementById('btnBookmarkPage');
    const bookmarkIcon = document.getElementById('bookmarkIcon');
    const btnNextPage = document.getElementById('btnNextPage');
    const btnPrevPage = document.getElementById('btnPrevPage');

    // Elemen Fitur Lompat Halaman
    const gotoInput = document.getElementById('goto-page-input');
    const btnConfirmJump = document.getElementById('btnConfirmJump');

    // Elemen Fitur Zoom
    const flipViewport = document.getElementById('flipViewport');
    const btnZoomIn = document.getElementById('btnZoomIn');
    const btnZoomOut = document.getElementById('btnZoomOut');

    let isAnimating = false;
    let isLocked = false;

    // Variabel Zoom
    let zoomLevel = 1;
    const ZOOM_STEP = 0.25;
    const MAX_ZOOM = 2.5;
    const MIN_ZOOM = 1;

    // --- LOGIKA ZOOM PRESISI ---
    function applyZoom() {
        if (!flipViewport) return;
        
        flipViewport.style.transform = `scale(${zoomLevel})`;

        if (zoomLevel > 1) {
            const extraHeight = flipViewport.offsetHeight * (zoomLevel - 1);
            const extraWidth = flipViewport.offsetWidth * (zoomLevel - 1);
            
            flipViewport.style.marginTop = `${(extraHeight / 2) + 10}px`;
            flipViewport.style.marginBottom = `${(extraHeight / 2) + 20}px`;
            flipViewport.style.marginLeft = `${(extraWidth / 2) + 20}px`;
            flipViewport.style.marginRight = `${(extraWidth / 2) + 20}px`;
        } else {
            flipViewport.style.marginTop = '0px';
            flipViewport.style.marginBottom = '0px';
            flipViewport.style.marginLeft = 'auto';
            flipViewport.style.marginRight = 'auto';
        }
    }

    function resetZoom() {
        zoomLevel = 1;
        applyZoom();
    }

    // Event Listener Zoom In & Out
    if (btnZoomIn) {
        btnZoomIn.addEventListener('click', (e) => {
            e.preventDefault();
            if (zoomLevel < MAX_ZOOM) {
                zoomLevel += ZOOM_STEP;
                applyZoom();
            }
        });
    }

    if (btnZoomOut) {
        btnZoomOut.addEventListener('click', (e) => {
            e.preventDefault();
            if (zoomLevel > MIN_ZOOM) {
                zoomLevel -= ZOOM_STEP;
                applyZoom();
            }
        });
    }

    // --- UPDATE TAMPILAN HALAMAN ---
    function updatePageDisplay(pageNumber) {
        resetZoom(); // Reset Zoom otomatis saat pindah halaman

        if (currentImg) {
            currentImg.src = `${BASE_URL_GAMBAR}${pageNumber}.jpg`;
        }
        if (viewerTitle) {
            viewerTitle.textContent = `Halaman ${pageNumber}`;
        }
        checkBookmarkState(pageNumber);

        // Preload 1 halaman depan & belakang
        for (let i = 1; i <= 1; i++) {
            if (pageNumber + i <= TOTAL_PAGES) {
                new Image().src = `${BASE_URL_GAMBAR}${pageNumber + i}.jpg`;
            }
            if (pageNumber - i >= 1) {
                new Image().src = `${BASE_URL_GAMBAR}${pageNumber - i}.jpg`;
            }
        }
    }

    // --- LOGIKA BOOKMARK ---
    function getBookmarks() {
        return JSON.parse(localStorage.getItem('quran_page_bookmarks') || '[]');
    }

    function checkBookmarkState(pageNumber) {
        if (!btnBookmarkPage || !bookmarkIcon) return;
        const bookmarks = getBookmarks();
        if (bookmarks.includes(pageNumber)) {
            btnBookmarkPage.classList.add('bookmarked');
            bookmarkIcon.className = 'fa-solid fa-bookmark';
        } else {
            btnBookmarkPage.classList.remove('bookmarked');
            bookmarkIcon.className = 'fa-regular fa-bookmark';
        }
    }

    if (btnBookmarkPage) {
        btnBookmarkPage.addEventListener('click', () => {
            let bookmarks = getBookmarks();
            if (bookmarks.includes(currentPage)) {
                bookmarks = bookmarks.filter(p => p !== currentPage);
            } else {
                bookmarks.push(currentPage);
            }
            localStorage.setItem('quran_page_bookmarks', JSON.stringify(bookmarks));
            checkBookmarkState(currentPage);
        });
    }

    // --- LOGIKA GEMBOK HALAMAN ---
    if (btnLockPage) {
        btnLockPage.addEventListener('click', () => {
            isLocked = !isLocked;

            if (isLocked) {
                btnLockPage.classList.add('locked');
                if (lockIcon) lockIcon.className = 'fa-solid fa-lock';
                if (btnNextPage) btnNextPage.disabled = true;
                if (btnPrevPage) btnPrevPage.disabled = true;
            } else {
                btnLockPage.classList.remove('locked');
                if (lockIcon) lockIcon.className = 'fa-solid fa-lock-open';
                if (btnNextPage) btnNextPage.disabled = false;
                if (btnPrevPage) btnPrevPage.disabled = false;
            }
        });
    }

    // --- LOGIKA LOMPAT HALAMAN ---
    function eksekusiLompat() {
        if (!gotoInput) return;
        let val = gotoInput.value.trim();
        if (!val) return;

        let halTarget = parseInt(val);
        
        if (halTarget > TOTAL_PAGES) halTarget = TOTAL_PAGES;
        if (halTarget < 1) halTarget = 1;

        currentPage = halTarget;
        updatePageDisplay(currentPage);
        
        gotoInput.value = "";
        gotoInput.blur();
    }

    if (gotoInput) {
        gotoInput.addEventListener('input', (e) => {
            if (e.target.value.length > 3) {
                e.target.value = e.target.value.slice(0, 3);
            }
        });
        gotoInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') eksekusiLompat();
        });
    }

    if (btnConfirmJump) {
        btnConfirmJump.addEventListener('click', eksekusiLompat);
    }

    // --- NAVIGASI FLIPBOOK ---
    function nextPage() {
        if (isLocked || currentPage >= TOTAL_PAGES || isAnimating) return;
        isAnimating = true;

        const nextpageNum = currentPage + 1;
        const tempImg = new Image();
        tempImg.src = `${BASE_URL_GAMBAR}${nextpageNum}.jpg`;

        tempImg.onload = () => {
            if (overlayImg) overlayImg.src = `${BASE_URL_GAMBAR}${currentPage}.jpg`;
            
            currentPage = nextpageNum;
            updatePageDisplay(currentPage);

            if (flipOverlay) {
                flipOverlay.className = 'flip-overlay turning-next';
                setTimeout(() => {
                    flipOverlay.className = 'flip-overlay';
                    isAnimating = false;
                }, 500);
            } else {
                isAnimating = false;
            }
        };

        tempImg.onerror = () => {
            currentPage = nextpageNum;
            updatePageDisplay(currentPage);
            isAnimating = false;
        };
    }

    function prevPage() {
        if (isLocked || currentPage <= 1 || isAnimating) return;
        isAnimating = true;

        const prevpageNum = currentPage - 1;
        const tempImg = new Image();
        tempImg.src = `${BASE_URL_GAMBAR}${prevpageNum}.jpg`;

        tempImg.onload = () => {
            if (overlayImg) overlayImg.src = `${BASE_URL_GAMBAR}${prevpageNum}.jpg`;

            if (flipOverlay) {
                flipOverlay.className = 'flip-overlay turning-prev';
                setTimeout(() => {
                    currentPage = prevpageNum;
                    updatePageDisplay(currentPage);
                    flipOverlay.className = 'flip-overlay';
                    isAnimating = false;
                }, 500);
            } else {
                currentPage = prevpageNum;
                updatePageDisplay(currentPage);
                isAnimating = false;
            }
        };

        tempImg.onerror = () => {
            currentPage = prevpageNum;
            updatePageDisplay(currentPage);
            isAnimating = false;
        };
    }

    if (btnNextPage) btnNextPage.addEventListener('click', nextPage);
    if (btnPrevPage) btnPrevPage.addEventListener('click', prevPage);

    // --- FITUR USAP (SWIPE) ---
    let touchStartX = 0;
    let touchEndX = 0;
    const cardContainer = document.getElementById('quranCard');

    if (cardContainer) {
        cardContainer.addEventListener('touchstart', (e) => {
            if (isLocked || zoomLevel > 1) return;
            touchStartX = e.changedTouches[0].screenX;
        }, { passive: true });

        cardContainer.addEventListener('touchend', (e) => {
            if (isLocked || zoomLevel > 1) return;
            touchEndX = e.changedTouches[0].screenX;
            handleSwipe();
        }, { passive: true });
    }

    function handleSwipe() {
        if (isLocked || zoomLevel > 1) return; // Nonaktifkan swipe jika layar di-zoom
        const swipeThreshold = 40;
        
        if (touchEndX < touchStartX - swipeThreshold) {
            prevPage();
        } else if (touchEndX > touchStartX + swipeThreshold) {
            nextPage();
        }
    }

    // Set Tampilan Pertama Kali
    updatePageDisplay(currentPage);
});
