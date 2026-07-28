document.addEventListener('DOMContentLoaded', () => {
    const urlParams = new URLSearchParams(window.location.search);
    let currentPage = parseInt(urlParams.get('hal')) || 1;
    const TOTAL_PAGES = 604;
    const FOLDER_GAMBAR = "images_quran/";

    const currentImg = document.getElementById('currentImg');
    const overlayImg = document.getElementById('overlayImg');
    const flipOverlay = document.getElementById('flipOverlay');
    const viewerTitle = document.getElementById('viewerTitle');

    // Elemen Tombol Kunci & Navigasi
    const btnLockPage = document.getElementById('btnLockPage');
    const lockIcon = document.getElementById('lockIcon');
    const btnNextPage = document.getElementById('btnNextPage');
    const btnPrevPage = document.getElementById('btnPrevPage');

    // Elemen Fitur Lompat Halaman
    const gotoInput = document.getElementById('goto-page-input');
    const btnConfirmJump = document.getElementById('btnConfirmJump');

    let isAnimating = false;
    let isLocked = false; // State status gembok

    // Set Tampilan Awal
    updatePageDisplay(currentPage);

    function updatePageDisplay(pageNumber) {
        currentImg.src = `${FOLDER_GAMBAR}${pageNumber}.jpg`;
        viewerTitle.textContent = `Halaman ${pageNumber}`;
    }

    // --- LOGIKA GEMBOK / KUNCI HALAMAN ---
    btnLockPage.addEventListener('click', () => {
        isLocked = !isLocked; // Toggle status terkunci

        if (isLocked) {
            btnLockPage.classList.add('locked');
            lockIcon.className = 'fa-solid fa-lock'; // Ganti ikon ke Gembok Tertutup
            btnNextPage.disabled = true;
            btnPrevPage.disabled = true;
        } else {
            btnLockPage.classList.remove('locked');
            lockIcon.className = 'fa-solid fa-lock-open'; // Ganti ikon ke Gembok Terbuka
            btnNextPage.disabled = false;
            btnPrevPage.disabled = false;
        }
    });

    // --- LOGIKA LOMPAT HALAMAN ---
    function eksekusiLompat() {
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
        if (isLocked || currentPage >= TOTAL_PAGES || isAnimating) return; // Abaikan jika terkunci
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
        if (isLocked || currentPage <= 1 || isAnimating) return; // Abaikan jika terkunci
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
        if (isLocked) return; // Matikan deteksi usap jika gembok aktif
        touchStartX = e.changedTouches[0].screenX;
    });

    cardContainer.addEventListener('touchend', (e) => {
        if (isLocked) return; // Matikan deteksi usap jika gembok aktif
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
