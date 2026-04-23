// lihat_pdf.js
document.addEventListener('DOMContentLoaded', function() {
    let pdfDoc = null,
        pageNum = 1,
        pageRendering = false,
        pageNumPending = null,
        currentScale = 4; // Skala default yang lebih nyaman

    const canvas = document.getElementById('pdf-canvas'),
          ctx = canvas.getContext('2d'),
          spinner = document.getElementById('loading-spinner');

    // Mengambil parameter file dari URL
    const urlParams = new URLSearchParams(window.location.search);
    const pdfPath = urlParams.get('file');

    pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.worker.min.js';

    function showSpinner(show) {
        spinner.style.display = show ? 'block' : 'none';
        canvas.style.opacity = show ? '0.3' : '1';
    }

    function renderPage(num) {
        pageRendering = true;
        showSpinner(true);

        pdfDoc.getPage(num).then(page => {
            const viewport = page.getViewport({ scale: currentScale });
            canvas.height = viewport.height;
            canvas.width = viewport.width;

            const renderContext = { canvasContext: ctx, viewport: viewport };
            const renderTask = page.render(renderContext);

            renderTask.promise.then(() => {
                pageRendering = false;
                showSpinner(false);
                if (pageNumPending !== null) {
                    renderPage(pageNumPending);
                    pageNumPending = null;
                }
                updateUI();
            });
        });
    }

    function updateUI() {
        document.getElementById('pageNumberInput').value = pageNum;
        document.getElementById('pageTotalDisplay').textContent = `/ ${pdfDoc.numPages}`;
        document.getElementById('prev-page').disabled = (pageNum <= 1);
        document.getElementById('next-page').disabled = (pageNum >= pdfDoc.numPages);
        document.getElementById('scale-display').textContent = `${Math.round(currentScale * 100)}%`;
    }

    function queueRenderPage(num) {
        if (pageRendering) pageNumPending = num;
        else renderPage(num);
    }

    // Fitur Fullscreen
    document.getElementById('fullscreen-btn').addEventListener('click', () => {
        const elem = document.getElementById('pdf-main-container');
        if (!document.fullscreenElement) elem.requestFullscreen();
        else document.exitFullscreen();
    });

    // Zoom Events
    document.getElementById('zoom-in').addEventListener('click', () => {
        if (currentScale >= 4) return;
        currentScale += 0.25;
        queueRenderPage(pageNum);
    });

    document.getElementById('zoom-out').addEventListener('click', () => {
        if (currentScale <= 0.5) return;
        currentScale -= 0.25;
        queueRenderPage(pageNum);
    });

    // Navigation Events
    document.getElementById('prev-page').addEventListener('click', () => {
        if (pageNum <= 1) return;
        pageNum--;
        queueRenderPage(pageNum);
    });

    document.getElementById('next-page').addEventListener('click', () => {
        if (pageNum >= pdfDoc.numPages) return;
        pageNum++;
        queueRenderPage(pageNum);
    });

    // Input Halaman
    document.getElementById('pageNumberInput').addEventListener('change', (e) => {
        const val = parseInt(e.target.value);
        if (val > 0 && val <= pdfDoc.numPages) {
            pageNum = val;
            queueRenderPage(pageNum);
        }
    });

    // Load Document
    if (pdfPath) {
        showSpinner(true);
        pdfjsLib.getDocument(pdfPath).promise.then(pdfDoc_ => {
            pdfDoc = pdfDoc_;
            renderPage(pageNum);
        }).catch(err => {
            showSpinner(false);
            document.getElementById('pdf-main-container').innerHTML = 
                `<div style="color:red; margin-top:20px;">Gagal memuat PDF: ${err.message}</div>`;
        });
    }
});

// Mencegah klik kanan untuk mempersulit download manual
document.addEventListener('contextmenu', (e) => {
    e.preventDefault();
}, false);

// Mencegah shortcut keyboard (Ctrl+S atau Ctrl+P)
document.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && (e.key === 's' || e.key === 'p')) {
        e.preventDefault();
        alert('Fitur simpan dan cetak dinonaktifkan.');
    }
});