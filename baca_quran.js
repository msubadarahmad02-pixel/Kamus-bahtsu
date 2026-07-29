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

    let isAnimating = false;
    let isLocked = false;

    // Set Tampilan Awal
    updatePageDisplay(currentPage);

    function updatePageDisplay(pageNumber) {
        if (currentImg) {
            currentImg.src = `${BASE_URL_GAMBAR}${pageNumber}.jpg`;
        }
        if (viewerTitle) {
            viewerTitle.textContent = `Halaman ${pageNumber}`;
        }
        checkBookmarkState(pageNumber); // Cek status bookmark
    }

    // --- LOGIKA BOOKMARK / TANDAI HALAMAN ---
    function getBookmarks() {
        return JSON.parse(localStorage.getItem('quran_page_bookmarks') || '[]');
    }

    function checkBookmarkState(pageNumber) {
        if (!btnBookmarkPage || !bookmarkIcon) return;
        const bookmarks = getBookmarks();
        if (bookmarks.includes(pageNumber)) {
            btnBookmarkPage.classList.add('bookmarked');
            bookmarkIcon.className = 'fa-solid fa-bookmark'; // Ikon pita terisi
        } else {
            btnBookmarkPage.classList.remove('bookmarked');
            bookmarkIcon.className = 'fa-regular fa-bookmark'; // Ikon pita garis luar
        }
    }

    if (btnBookmarkPage) {
        btnBookmarkPage.addEventListener('click', () => {
            let bookmarks = getBookmarks();
            if (bookmarks.includes(currentPage)) {
                // Hapus dari penanda
                bookmarks = bookmarks.filter(p => p !== currentPage);
            } else {
                // Tambahkan ke penanda
                bookmarks.push(currentPage);
            }
            localStorage.setItem('quran_page_bookmarks', JSON.stringify(bookmarks));
            checkBookmarkState(currentPage);
        });
    }

    // --- LOGIKA GEMBOK / KUNCI HALAMAN ---
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
        
        if (halTarget > TOTAL_PAGES) {
            halTarget = TOTAL_PAGES;
        } else if (halTarget < 1) {
            halTarget = 1;
        }

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

    // --- NAVIGASI FLIPBOOK (DENGAN PROTEKSI ELEMEN) ---
    function nextPage() {
        if (isLocked || currentPage >= TOTAL_PAGES || isAnimating) return;
        isAnimating = true;

        if (overlayImg) {
            overlayImg.src = `${BASE_URL_GAMBAR}${currentPage}.jpg`;
        }

        currentPage++;
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
    }

    function prevPage() {
        if (isLocked || currentPage <= 1 || isAnimating) return;
        isAnimating = true;

        if (overlayImg) {
            overlayImg.src = `${BASE_URL_GAMBAR}${currentPage}.jpg`;
        }

        currentPage--;
        
        if (flipOverlay) {
            flipOverlay.className = 'flip-overlay turning-prev';
            setTimeout(() => {
                updatePageDisplay(currentPage);
                flipOverlay.className = 'flip-overlay';
                isAnimating = false;
            }, 500);
        } else {
            updatePageDisplay(currentPage);
            isAnimating = false;
        }
    }

    if (btnNextPage) btnNextPage.addEventListener('click', nextPage);
    if (btnPrevPage) btnPrevPage.addEventListener('click', prevPage);

    // --- FITUR USAP (SWIPE UNTUK HP/TABLET) ---
    let touchStartX = 0;
    let touchEndX = 0;
    const cardContainer = document.getElementById('quranCard');

    if (cardContainer) {
        cardContainer.addEventListener('touchstart', (e) => {
            if (isLocked) return;
            touchStartX = e.changedTouches[0].screenX;
        }, { passive: true });

        cardContainer.addEventListener('touchend', (e) => {
            if (isLocked) return;
            touchEndX = e.changedTouches[0].screenX;
            handleSwipe();
        }, { passive: true });
    }

    function handleSwipe() {
        if (isLocked) return;
        const swipeThreshold = 40; // Batas minimal usapan dalam pixel
        if (touchEndX - touchStartX > swipeThreshold) {
            nextPage();
        } else if (touchStartX - touchEndX > swipeThreshold) {
            prevPage();
        }
    }
});
        gotoInput.blur();
    }

    gotoInput.addEventListener('input', (e) => {
        if (e.target.value.length > 3) {
            e.target.value = e.target.value.slice(0, 3);
        }
    });

    btnConfirmJump.addEventListener('click', eksekusiLompat);
    gotoInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') eksekusiLompat();
    });

    // --- NAVIGASI FLIPBOOK ---
    function nextPage() {
        if (isLocked || currentPage >= TOTAL_PAGES || isAnimating) return;
        isAnimating = true;

        overlayImg.src = `${BASE_URL_GAMBAR}${currentPage}.jpg`;

        currentPage++;
        updatePageDisplay(currentPage);

        flipOverlay.className = 'flip-overlay turning-next';

        setTimeout(() => {
            flipOverlay.className = 'flip-overlay';
            isAnimating = false;
        }, 500);
    }

    function prevPage() {
        if (isLocked || currentPage <= 1 || isAnimating) return;
        isAnimating = true;

        currentPage--;
        overlayImg.src = `${BASE_URL_GAMBAR}${currentPage}.jpg`;

        flipOverlay.className = 'flip-overlay turning-prev';

        setTimeout(() => {
            updatePageDisplay(currentPage);
            flipOverlay.className = 'flip-overlay';
            isAnimating = false;
        }, 500);
    }

    btnNextPage.addEventListener('click', nextPage);
    btnPrevPage.addEventListener('click', prevPage);

    // --- FITUR USAP (SWIPE) ---
    let touchStartX = 0;
    let touchEndX = 0;
    const cardContainer = document.getElementById('quranCard');

    if (cardContainer) {
        cardContainer.addEventListener('touchstart', (e) => {
            if (isLocked) return;
            touchStartX = e.changedTouches[0].screenX;
        });

        cardContainer.addEventListener('touchend', (e) => {
            if (isLocked) return;
            touchEndX = e.changedTouches[0].screenX;
            handleSwipe();
        });
    }

    function handleSwipe() {
        if (isLocked) return;
        const swipeThreshold = 40;
        if (touchEndX - touchStartX > swipeThreshold) {
            nextPage();
        } else if (touchStartX - touchEndX > swipeThreshold) {
            prevPage();
        }
    }
});
    btnConfirmJump.addEventListener('click', eksekusiLompat);
    gotoInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') eksekusiLompat();
    });

    // --- NAVIGASI FLIPBOOK ---
    function nextPage() {
        if (isLocked || currentPage >= TOTAL_PAGES || isAnimating) return;
        isAnimating = true;

        overlayImg.src = `${FOLDER_GAMBAR}${currentPage}.jpg`;
        currentPage++;
        updatePageDisplay(currentPage);

        flipOverlay.className = 'flip-overlay turning-next';

        setTimeout(() => {
            flipOverlay.className = 'flip-overlay';
            isAnimating = false;
        }, 500);
    }

    function prevPage() {
        if (isLocked || currentPage <= 1 || isAnimating) return;
        isAnimating = true;

        currentPage--;
        overlayImg.src = `${FOLDER_GAMBAR}${currentPage}.jpg`;

        flipOverlay.className = 'flip-overlay turning-prev';

        setTimeout(() => {
            updatePageDisplay(currentPage);
            flipOverlay.className = 'flip-overlay';
            isAnimating = false;
        }, 500);
    }

    btnNextPage.addEventListener('click', nextPage);
    btnPrevPage.addEventListener('click', prevPage);

    // --- FITUR USAP (SWIPE) ---
    let touchStartX = 0;
    let touchEndX = 0;
    const cardContainer = document.getElementById('quranCard');

    cardContainer.addEventListener('touchstart', (e) => {
        if (isLocked) return;
        touchStartX = e.changedTouches[0].screenX;
    });

    cardContainer.addEventListener('touchend', (e) => {
        if (isLocked) return;
        touchEndX = e.changedTouches[0].screenX;
        handleSwipe();
    });

    function handleSwipe() {
        if (isLocked) return;
        const swipeThreshold = 40;
        if (touchEndX - touchStartX > swipeThreshold) {
            nextPage();
        } else if (touchStartX - touchEndX > swipeThreshold) {
            prevPage();
        }
    }
});
