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
