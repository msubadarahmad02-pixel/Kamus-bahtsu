// 1. DEKLARASI DAFTAR KITAB & FILE DATABASE
const daftarKitab = {
    bajuri: { nama: "باجوري٢", file: "kitab_bajuri.json", data: [] },
    sarqowi: { nama: "شرقاوي٢", file: "kitab_sarqowi.json", data: [] }
};

// 2. MEMUAT SEMUA DATA JSON SAAT APLIKASI DI AWALI
async function loadSemuaKitab() {
    for (let kunci in daftarKitab) {
        try {
            const response = await fetch(daftarKitab[kunci].file);
            daftarKitab[kunci].data = await response.json();
        } catch (error) {
            console.error(`Gagal memuat JSON ${daftarKitab[kunci].nama}:`, error);
        }
    }
    tampilkanHalamanAwal();
}
loadSemuaKitab();

// 3. FUNGSI BANTUAN (HELPER) UNTUK MEMBUAT ELEMEN HASIL (Menghindari Kode Double)
function buatElemenHasil(kunciKitab, kitab, item, kataKunci = "", regexPencari = null) {
    const elemenHasil = document.createElement('div');
    elemenHasil.className = 'result-item';
    
    let teksGabungan = `${item.matan} ${item.syarah}`;
    let teksPreview = teksGabungan;

    // Jika ada kata kunci pencarian, beri highlight (mark)
    if (kataKunci !== "" && regexPencari) {
        teksPreview = teksGabungan.replace(regexPencari, match => `<mark>${match}</mark>`);
    }

    elemenHasil.innerHTML = `
        <div class="result-header-wrapper">
            <div class="badge-group">
                <span class="kitab-badge">${kitab.nama}</span>
                <button class="btn-toggle-detail">▼</button>
                <span class="page-badge">ص ${item.halaman}</span>
            </div>
            <button class="btn-baca-full-screen">📖 Lihat Penuh</button>
        </div>
        <p class="teks-arab-hasil">${teksPreview}</p>
    `;
    
    const pTeks = elemenHasil.querySelector('.teks-arab-hasil');
    const btnPanah = elemenHasil.querySelector('.btn-toggle-detail');
    const btnFull = elemenHasil.querySelector('.btn-baca-full-screen');

    // Fungsi untuk buka/tutup teks
    const toggleTeks = function(e) {
        if(e) e.stopPropagation();
        pTeks.classList.toggle('buka-penuh');
        btnPanah.classList.toggle('terbuka');
    };

    btnPanah.onclick = toggleTeks;
    elemenHasil.onclick = toggleTeks;

    btnFull.onclick = function(e) {
        e.stopPropagation();
        bukaLayarBaruKitab(kunciKitab, item.halaman, kataKunci);
    };

    return elemenHasil;
}

// 4. KODE UNTUK HALAMAN AWAL
function tampilkanHalamanAwal() {
    const pilihanKitab = document.getElementById('kitab-select').value;
    const containerHasil = document.getElementById('results-container');
    const inputPencarian = document.getElementById('search-input');
    
    if (inputPencarian.value.trim() !== "") return;

    containerHasil.innerHTML = "";
    containerHasil.classList.remove('placeholder-text');

    const kitabYangDitampilkan = (pilihanKitab === "semua") ? Object.keys(daftarKitab) : [pilihanKitab];

    kitabYangDitampilkan.forEach(kunciKitab => {
        const kitab = daftarKitab[kunciKitab];
        
        if (kitab.data && kitab.data.length > 0) {
            const itemAwal = kitab.data[0]; // Ambil halaman pertama saja sebagai perwakilan
            const elemenHasil = buatElemenHasil(kunciKitab, kitab, itemAwal);
            containerHasil.appendChild(elemenHasil);
        }
    });

    if (containerHasil.innerHTML === "") {
        containerHasil.innerHTML = "Tidak ada data halaman kitab.";
        containerHasil.classList.add('placeholder-text');
    }
}

// 5. FUNGSI PEMBERSIH HARAKAT AGAR PENCARIAN FLEKSIBEL
function hilangkanHarakat(teks) {
    return teks.replace(/[\u064B-\u0652]/g, "");
}

// 6. MEMBUAT POLA REGEX ARAB (MENCARI KATA GUNDUL PADA TEKS BERHARAKAT)
function buatPolaRegexArab(kataKunci) {
    const kataKunciGundul = hilangkanHarakat(kataKunci);
    const pola = kataKunciGundul.split("").map(huruf => {
        return huruf.replace(/[\u0600-\u06FF]/, `${huruf}[\\u064B-\\u0652]*`);
    }).join("");
    return new RegExp(pola, "gi");
}

// 7. KODE UNTUK PENCARIAN TEKS
function cariTeks() {
    const kataKunci = document.getElementById('search-input').value.trim();
    const pilihanKitab = document.getElementById('kitab-select').value;
    const containerHasil = document.getElementById('results-container');
    
    containerHasil.innerHTML = "";
    containerHasil.classList.remove('placeholder-text');
    
    if (kataKunci === "") {
        tampilkanHalamanAwal();
        return;
    }

    let hasilDitemukan = false;
    const kitabYangDicari = (pilihanKitab === "semua") ? Object.keys(daftarKitab) : [pilihanKitab];
    const regexPencari = /[\u0600-\u06FF]/.test(kataKunci) ? buatPolaRegexArab(kataKunci) : new RegExp(kataKunci, "gi");

    kitabYangDicari.forEach(kunciKitab => {
        const kitab = daftarKitab[kunciKitab];
        
        kitab.data.forEach(item => {
            const cocokMatan = regexPencari.test(item.matan);
            regexPencari.lastIndex = 0; // Reset index regex setelah test
            const cocokSyarah = regexPencari.test(item.syarah);
            regexPencari.lastIndex = 0; // Reset index regex setelah test

            if (cocokMatan || cocokSyarah) {
                hasilDitemukan = true;
                // Panggil Helper Function di sini
                const elemenHasil = buatElemenHasil(kunciKitab, kitab, item, kataKunci, regexPencari);
                containerHasil.appendChild(elemenHasil);
            }
        });
    });

    if (!hasilDitemukan) {
        containerHasil.innerHTML = "Teks tidak ditemukan.";
        containerHasil.classList.add('placeholder-text');
    }
}

function bukaLayarBaruKitab(kunciKitab, halamanTarget, kataKunci) {
    const kitab = daftarKitab[kunciKitab];
    const searchPage = document.getElementById('search-page');
    const readerPage = document.getElementById('reader-page');
    const readerContent = document.getElementById('reader-content');
    const headerTitle = document.getElementById('active-book-title');
    
    // Ambil elemen badge total halaman yang baru
    const totalPageBadge = document.getElementById('total-page-badge');

    headerTitle.innerText = kitab.nama;
    readerContent.innerHTML = ""; 

    // Hitung total halaman berdasarkan panjang data array kitab
    if (kitab.data && kitab.data.length > 0) {
        // Jika nomor halaman di database tidak urut dari 1, ambil angka halaman terakhir
        const halamanTerakhir = kitab.data[kitab.data.length - 1].halaman;
        totalPageBadge.innerText = halamanTerakhir;
    } else {
        totalPageBadge.innerText = "0";
    }

    const regexPencari = (kataKunci !== "") 
        ? (/[\u0600-\u06FF]/.test(kataKunci) ? buatPolaRegexArab(kataKunci) : new RegExp(kataKunci, "gi"))
        : null;

    kitab.data.forEach(item => {
        const divHalaman = document.createElement('div');
        divHalaman.className = 'halaman-box';
        divHalaman.id = `page-target-${item.halaman}`;
        
        const matanFinal = regexPencari ? item.matan.replace(regexPencari, match => `<mark>${match}</mark>`) : item.matan;
        const syarahFinal = regexPencari ? item.syarah.replace(regexPencari, match => `<mark>${match}</mark>`) : item.syarah;

        const halamanArab = konversiKeAngkaArab(item.halaman);

        divHalaman.innerHTML = `
            <div class="blok-matan">${matanFinal}</div>
            <hr class="garis-pemisah-kitab">
            <div class="blok-syarah">${syarahFinal}</div>
            <span class="nomor-halaman-footer">ـ ${halamanArab} ـ</span>
            <hr class="garis-pembatas">
        `;

        readerContent.appendChild(divHalaman);
    });

    searchPage.style.display = "none";
    readerPage.style.display = "flex";

    setTimeout(() => {
        const elemenTarget = document.getElementById(`page-target-${halamanTarget}`);
        if (elemenTarget) {
            elemenTarget.scrollIntoView({ behavior: 'auto', block: 'center' });
            
            if (kataKunci !== "") {
                elemenTarget.style.backgroundColor = "#ebdcb9";
                setTimeout(() => {
                    elemenTarget.style.backgroundColor = "transparent";
                }, 2000);
            }
        }
    }, 100);
}


// 9. FUNGSI UNTUK MENUTUP LAYAR BACA DAN KEMBALI KE PENCARIAN
function tutupReader() {
    document.getElementById('search-page').style.display = "block";
    document.getElementById('reader-page').style.display = "none";
    tampilkanHalamanAwal();
}

// 10. FUNGSI UNTUK LOMPAT LANGSUNG KE HALAMAN YANG DIINGINKAN
function lompatKeHalaman() {
    const inputHalaman = document.getElementById('goto-page-input');
    const nomorHalaman = inputHalaman.value.trim();

    if (nomorHalaman === "") {
        alert("Masukkan nomor halaman terlebih dahulu!");
        return;
    }

    const elemenTarget = document.getElementById(`page-target-${nomorHalaman}`);

    if (elemenTarget) {
        elemenTarget.scrollIntoView({ behavior: 'smooth', block: 'center' });
        setTimeout(() => {
            elemenTarget.style.backgroundColor = "transparent";
        }, 2000);
        
        inputHalaman.value = "";
    } else {
        alert(`Halaman ${nomorHalaman} tidak ditemukan di kitab ini.`);
    }
}

// 11. FUNGSI MENGUBAH ANGKA LATIN MENJADI ANGKA ARAB
function konversiKeAngkaArab(angka) {
    const angkaArab = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];
    return angka.toString().split('').map(digit => {
        return isNaN(digit) ? digit : angkaArab[parseInt(digit)];
    }).join('');
}
// --- FUNGSI CUSTOM DROPDOWN ---
function toggleDropdown() {
    document.getElementById("custom-options-list").classList.toggle("show");
}

function pilihKitab(nilai, teks) {
    // Ubah nilai input tersembunyi
    document.getElementById("kitab-select").value = nilai;
    // Ubah teks yang tampil di tombol
    document.getElementById("selected-kitab-text").innerText = teks;
    // Tutup dropdown
    document.getElementById("custom-options-list").classList.remove("show");
    
    // Panggil fungsi lama untuk me-refresh daftar kitab
    tampilkanHalamanAwal(); 
}

// Menutup menu dropdown jika area di luarnya di-klik
window.onclick = function(event) {
    if (!event.target.matches('.custom-select-trigger') && !event.target.matches('#selected-kitab-text')) {
        let dropdowns = document.getElementsByClassName("custom-options");
        for (let i = 0; i < dropdowns.length; i++) {
            let openDropdown = dropdowns[i];
            if (openDropdown.classList.contains('show')) {
                openDropdown.classList.remove('show');
            }
        }
    }
}

// --- LOGIKA UTAMA CUSTOM DROPDOWN FILTER & SCROLL ---

function toggleDropdown(event) {
    if (event) event.stopPropagation();
    const dropdownList = document.getElementById("custom-options-list");
    dropdownList.classList.toggle("show");

    // Jika dropdown sedang terbuka, kosongkan input pencarian kitab lama dan fokuskan otomatis
    if (dropdownList.classList.contains("show")) {
        const filterInput = document.getElementById("filter-kitab-input");
        filterInput.value = ""; 
        
        // Kembalikan semua opsi kitab ke tampilan semula (tidak tersembunyi)
        const options = document.getElementsByClassName("custom-option");
        for (let i = 0; i < options.length; i++) {
            options[i].style.display = "";
        }
        
        // Beri delay tipis agar keyboard perangkat mobile siap memfokuskan kolom input
        setTimeout(() => filterInput.focus(), 50);
    }
}

// Fungsi menyaring pilihan kitab berdasarkan ketikan teks secara real-time
function filterPilihanKitab() {
    const input = document.getElementById("filter-kitab-input");
    const filter = input.value.toLowerCase();
    const container = document.getElementById("options-scroll-container");
    const options = container.getElementsByClassName("custom-option");

    for (let i = 0; i < options.length; i++) {
        const txtValue = options[i].textContent || options[i].innerText;
        if (txtValue.toLowerCase().indexOf(filter) > -1) {
            options[i].style.display = "";
        } else {
            options[i].style.display = "none";
        }
    }
}

function pilihKitab(nilai, teks) {
    // Set nilai ke input tersembunyi agar fungsi cariTeks() tetap mendeteksi id terkait
    document.getElementById("kitab-select").value = nilai;
    
    // Perbarui label tombol pemicu utama
    document.getElementById("selected-kitab-text").innerText = teks;
    
    // Tutup menu dropdown
    document.getElementById("custom-options-list").classList.remove("show");
    
    // Panggil penyegaran data bawaan aplikasimu
    tampilkanHalamanAwal(); 
}

// Menutup dropdown secara otomatis jika pengguna menyentuh area mana pun di luar menu
window.addEventListener("click", function(event) {
    const dropdownList = document.getElementById("custom-options-list");
    const trigger = document.querySelector(".custom-select-trigger");
    
    if (dropdownList && dropdownList.classList.contains("show")) {
        if (!trigger.contains(event.target) && event.target.id !== "filter-kitab-input") {
            dropdownList.classList.remove("show");
        }
    }
});
