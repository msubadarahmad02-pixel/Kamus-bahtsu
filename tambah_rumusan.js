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

    // Validasi sederhana agar data utama tidak kosong
    if (!data.id || !data.judul_pendek) {
        alert("Mohon isi ID dan Judul Pendek terlebih dahulu!");
        return;
    }

    // Tampilkan hasil format JSON di textarea output
    document.getElementById('output').value = JSON.stringify(data, null, 2);
}

function copyToClipboard() {
    const outputArea = document.getElementById('output');
    if (outputArea.value === "") {
        alert("Generate JSON dulu sebelum menyalin!");
        return;
    }
    
    outputArea.select();
    outputArea.setSelectionRange(0, 99999); // Untuk mendukung perangkat mobile/tablet
    
    navigator.clipboard.writeText(outputArea.value).then(() => {
        alert("JSON berhasil disalin! Tinggal kamu paste ke file .json kamu.");
    }).catch(err => {
        alert("Gagal menyalin text: ", err);
    });
}
