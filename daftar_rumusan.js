// ==========================================
// DAFTAR FILE JSON RUMUSAN DATA
// Jika ingin menambah data baru di kemudian hari, 
// cukup tambahkan nama filenya di dalam array ini.
// ==========================================
const LIST_FILE_RUMUSAN = [
    'json/rumusan_data.json',
    'json/rumusan_data2.json',
    'json/rumusan_data3.json',
    'json/rumusan_data4.json'
];

// Fungsi otomatis untuk mengambil & menggabungkan semua data dari file JSON di atas
async function muatSemuaDataRumusan() {
    try {
        const daftarJanji = LIST_FILE_RUMUSAN.map(file => 
            fetch(file)
                .then(res => {
                    if (!res.ok) throw new Error(`Gagal memuat ${file}`);
                    return res.json();
                })
                .catch(err => {
                    console.error(err);
                    return []; // Jika file tidak ditemukan, tidak bikin crash
                })
        );
        
        const hasilGabungan = await Promise.all(daftarJanji);
        // Menggabungkan semua array dari tiap file JSON menjadi satu array
        return hasilGabungan.flat();
    } catch (error) {
        console.error("Gagal menggabungkan data rumusan:", error);
        return [];
    }
}
