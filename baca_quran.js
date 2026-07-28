document.addEventListener('DOMContentLoaded', () => {
    const urlParams = new URLSearchParams(window.location.search);
    let currentPage = parseInt(urlParams.get('hal')) || 1;
    const TOTAL_PAGES = 604;
    const FOLDER_GAMBAR = "images_quran/";

    const currentImg = document.getElementById('currentImg');
    const overlayImg = document.getElementById('overlayImg');
    const flipOverlay = document.getElementById('flipOverlay');
    const viewerTitle = document.getElementById('viewerTitle');

    // Elemen Fitur Lompat Halaman
    const gotoInput = document.getElementById('goto-page-input');
    const btnConfirmJump = document.getElementById('btnConfirmJump');

    let isAnimating = false;

    // Set Tampilan Awal
    updatePageDisplay(currentPage);

    function updatePageDisplay(pageNumber) {
        currentImg.src = `${FOLDER_GAMBAR}${pageNumber}.jpg`;
        viewerTitle.textContent = `Halaman ${pageNumber}`;
    }

       // --- LOGIKA LOMPAT HALAMAN HALUS ---
    function eksekusiLompat() {
        let val = gotoInput.value.trim();
        if (!val) return; // Jika kosong, abaikan (tanpa alert)

        let halTarget = parseInt(val);
        
        // Batasi otomatis jika input melampaui 604 atau kurang dari 1
        if (halTarget > TOTAL_PAGES) {
            halTarget = TOTAL_PAGES;
        } else if (halTarget < 1) {
            halTarget = 1;
        }

        currentPage = halTarget;
        updatePageDisplay(currentPage);
        
        gotoInput.value = ""; // Kosongkan input
        gotoInput.blur();     // Sembunyikan keyboard HP
    }

    // Batasi input maksimal 3 digit angka
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
        if (currentPage >= TOTAL_PAGES || isAnimating) return;
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
        if (currentPage <= 1 || isAnimating) return;
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

    document.getElementById('btnNextPage').addEventListener('click', nextPage);
    document.getElementById('btnPrevPage').addEventListener('click', prevPage);

    // Fitur Usap (Swipe)
    let touchStartX = 0;
    let touchEndX = 0;
    const cardContainer = document.getElementById('quranCard');

    cardContainer.addEventListener('touchstart', (e) => {
        touchStartX = e.changedTouches[0].screenX;
    });

    cardContainer.addEventListener('touchend', (e) => {
        touchEndX = e.changedTouches[0].screenX;
        handleSwipe();
    });

    function handleSwipe() {
        const swipeThreshold = 40;
        if (touchEndX - touchStartX > swipeThreshold) {
            nextPage();
        } else if (touchStartX - touchEndX > swipeThreshold) {
            prevPage();
        }
    }
});
