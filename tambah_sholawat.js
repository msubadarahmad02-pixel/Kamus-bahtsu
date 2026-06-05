function hasilJSON() {
    const idInput = document.getElementById('id_sholawat').value;
    const judulText = document.getElementById('judul').value;
    const lirikText = document.getElementById('lirik').value;
    const audioText = document.getElementById('audio').value;

    if (!idInput || !judulText || !lirikText || !audioText) {
        showAlert("isi semua kolomnya dulu nduk");
        return;
    }

    // Menyusun objek sesuai struktur asli data_sholawat.json
    const data = {
        id: parseInt(idInput),
        judul: judulText,
        lirik: lirikText,
        audio_url: audioText
    };
    
    // Memberikan koma di awal string agar mudah di-paste langsung ke file json utama
    document.getElementById('output').value = "\n" + JSON.stringify(data, null, 4);
}

// Fungsi menampilkan pop-up kustom bawaanmu yang elegan
function showAlert(pesan) {
    document.getElementById('modalMessage').innerText = pesan;
    document.getElementById('customAlert').classList.add('show');
}

// Fungsi untuk menutup pop-up
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
        showAlert("yeeeeyy kamu berhasil nduk");
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
    const teksPesan = encodeURIComponent(outputArea.value);
    
    // Membuka HTTPS API WhatsApp via browser/aplikasi HP
    const urlWA = `https://api.whatsapp.com/send?phone=${nomorWA}&text=${teksPesan}`;
    
    window.open(urlWA, '_blank');
}
