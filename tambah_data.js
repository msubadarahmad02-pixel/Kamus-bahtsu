function hasilJSON() {
    const data = {
        halaman: parseInt(document.getElementById('halaman').value),
        matan: document.getElementById('matan').value,
        syarah: document.getElementById('syarah').value
    };
    document.getElementById('output').value = JSON.stringify(data, null, 2);
}

function copyToClipboard() {
    const outputArea = document.getElementById('output');
    if (outputArea.value === "") {
        alert("Generate JSON dulu!");
        return;
    }
    outputArea.select();
    outputArea.setSelectionRange(0, 99999);
    navigator.clipboard.writeText(outputArea.value).then(() => {
        alert("Berhasil disalin!");
    }).catch(err => {
        alert("Gagal menyalin: ", err);
    });
}

function sendToWhatsApp() {
    const outputArea = document.getElementById('output');
    if (outputArea.value === "") {
        alert("Generate JSON dulu!");
        return;
    }

    // GANTI NOMOR DI BAWAH INI DENGAN NOMOR WA SERVER / ADMIN
    const nomorWA = "6283833183971"; // Sudah disesuaikan dengan screenshot kamu
    
    // Mengubah teks JSON menjadi format url-safe
    const teksPesan = encodeURIComponent(outputArea.value);
    
    // MENGGUNAKAN PROTOKOL DIRECT APP LINK (whatsapp://)
    const urlWA = `whatsapp://send?phone=${nomorWA}&text=${teksPesan}`;
    
    // Alihkan halaman window saat ini agar Acode langsung memicu aplikasi luar (WhatsApp)
    window.location.href = urlWA;
}

