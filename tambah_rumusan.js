function hasilJSON() {
    // Mengambil input teks referensi dan memisahnya berdasarkan baris baru (Enter)
    const referensiRaw = document.getElementById('referensi').value;
    const referensiArray = referensiRaw.split('\n')
                                     .map(item => item.trim())
                                     .filter(item => item.length > 0); // Menghapus baris kosong

    // Merakit object sesuai struktur rumusan_data.json
    const data = {
        id: document.getElementById('id').value.trim(),
        kategori: document.getElementById('kategori').value.trim(),
        judul_pendek: document.getElementById('judul_pendek').value.trim(),
        deskripsi: document.getElementById('deskripsi').value.trim(),
        pertanyaan: document.getElementById('pertanyaan').value.trim(),
        jawaban: document.getElementById('jawaban').value.trim(),
        referensi: referensiArray
    };

    // Validasi ID dan Judul Pendek sudah dihapus di sini
    // Langsung tampilkan hasil format JSON di textarea output
    document.getElementById('output').value = JSON.stringify(data, null, 2);
}

// Fungsi pengontrol Tampilan Pop-Up Kustom
function showAlert(pesan) {
    document.getElementById('modalMessage').innerText = pesan;
    document.getElementById('customAlert').classList.add('show');
}

function closeAlert() {
    document.getElementById('customAlert').classList.remove('show');
}

function copyToClipboard() {
    const outputArea = document.getElementById('output');
    if (outputArea.value === "") {
        showAlert("Generate dulu nduk!"); 
        return;
    }
    
    outputArea.select();
    outputArea.setSelectionRange(0, 99999); 
    
    navigator.clipboard.writeText(outputArea.value).then(() => {
        // Alert berhasil disalin telah dihapus agar proses berjalan silent
    }).catch(err => {
        showAlert("Gagal menyalin data.");
    });
}

function sendToWhatsApp() {
    const outputArea = document.getElementById('output');
    if (outputArea.value === "") {
        showAlert("Generate dulu nduk!"); 
        return;
    }

    const nomorWA = "6283833183971"; 
    
    // Langsung mengambil nilai output JSON tanpa teks pengantar
    const teksPesan = encodeURIComponent(outputArea.value);
    
    const urlWA = `https://api.whatsapp.com/send?phone=${nomorWA}&text=${teksPesan}`;
    
    window.open(urlWA, '_blank');
}

// --- FUNGSI AUTO GENERATE ID ---
function updateID() {
    const kategori = document.getElementById('kategori').value;
    const judulPendek = document.getElementById('judul_pendek').value;

    // Gabungkan Kategori dan Judul Pendek
    let gabungan = (kategori + " " + judulPendek).trim();

    // 1. Ubah ke huruf kecil semua (.toLowerCase())
    // 2. Ganti spasi (atau spasi ganda) menjadi underscore (_)
    // 3. Hapus karakter khusus selain huruf, angka, dan underscore
    let idOtomatis = gabungan
        .toLowerCase()
        .replace(/\s+/g, '_')        // ganti spasi dengan _
        .replace(/[^a-z0-9_]/g, '');  // hapus tanda baca seperti ?, !, koma, dll.

    document.getElementById('id').value = idOtomatis;
}

// Jalankan fungsi otomatis saat pengikut mengetik di Kategori atau Judul Pendek
document.getElementById('kategori').addEventListener('input', updateID);
document.getElementById('judul_pendek').addEventListener('input', updateID);

