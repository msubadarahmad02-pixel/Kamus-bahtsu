function hasilJSON() {
    // Mengambil nilai teks dan mengganti semua enter (\n) menjadi <br>
    const matanText = document.getElementById('matan').value.replace(/\n/g, '<br>');
    const syarahText = document.getElementById('syarah').value.replace(/\n/g, '<br>');

    const data = {
        halaman: parseInt(document.getElementById('halaman').value),
        matan: matanText,
        syarah: syarahText
    };
    
    document.getElementById('output').value = JSON.stringify(data, null, 2);
}


// Fungsi baru untuk menampilkan pop-up kustom yang elegan
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
        showAlert("Generate dulu nduk!"); // Menggunakan pop-up baru
        return;
    }
    outputArea.select();
    outputArea.setSelectionRange(0, 99999);
    navigator.clipboard.writeText(outputArea.value).then(() => {
    // Menggunakan pop-up baru
    }).catch(err => {
        showAlert("Gagal menyalin data.");
    });
}

function sendToWhatsApp() {
    const outputArea = document.getElementById('output');
    if (outputArea.value === "") {
        showAlert("Generate dulu nduk!"); // Menggunakan pop-up baru
        return;
    }

    const nomorWA = "6283833183971"; 
    const teksPesan = encodeURIComponent(outputArea.value);
    
    // Menggunakan HTTPS API agar aman dibuka di web Vercel/Chrome HP kamu
    const urlWA = `https://api.whatsapp.com/send?phone=${nomorWA}&text=${teksPesan}`;
    
    window.open(urlWA, '_blank');
}
