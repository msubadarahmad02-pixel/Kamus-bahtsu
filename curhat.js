// === 1. KONFIGURASI SUPABASE ===
const SUPABASE_URL = 'https://jmvirawieydobodmzjmr.supabase.co';
const SUPABASE_KEY = 'sb_publishable_WHi_gB94h-yd8WFHo0MnIg_0dYcOS-Y';
const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// Total 40 Variasi Warna Kertas Pastel
const colors = [
  '#ffff88', '#ff7eb9', '#7afcff', '#ff65a3', '#96ceb4', 
  '#ffeaa7', '#fab1a0', '#fd79a8', '#a29bfe', '#55efc4',
  '#ffb3ba', '#ffdfba', '#ffffba', '#baffc9', '#bae1ff', 
  '#e8dff5', '#fce1e4', '#fcf4dd', '#ddedf4', '#e8e8e8', 
  '#d0f4de', '#a9def9', '#e4c1f9', '#fbf8cc', '#fde2e4', 
  '#ffcad4', '#b5e2fa', '#edafb8', '#f7d6e0', '#f2b5d4', 
  '#d8e2dc', '#ffe5ec', '#fb6f92', '#c8e6c9', '#bbdefb', 
  '#e1bee7', '#fff9c4', '#ffe0b2', '#d7ccc8', '#cfd8dc'
];

let isSelectMode = false;
let targetNoteElement = null;
let selectedFile = null;

// === 1. KUMPULAN ANIMASI (CUKUP TULIS 1 KALI) ===
const animClasses = [
  'anim-top', 'anim-bottom', 'anim-left', 'anim-right',
  'anim-top-left', 'anim-top-right', 'anim-bottom-left', 'anim-bottom-right',
  'anim-zoom-rotate', 'anim-flip-x', 'anim-flip-y', 'anim-super-bounce'
];

function getRandomAnimClass() {
  return animClasses[Math.floor(Math.random() * animClasses.length)];
}

// === 2. PEMANTAU ANIMASI SCROLL (PAKAI DELAY AGAR TIDAK BLANK) ===
const noteObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    const noteEl = entry.target;
    
    if (entry.isIntersecting) {
      if (!noteEl.classList.contains('visible')) {
        animClasses.forEach(cls => noteEl.classList.remove(cls));
        noteEl.classList.add(getRandomAnimClass());

        setTimeout(() => {
          noteEl.classList.add('visible');
        }, 50);
      }
    } else {
      noteEl.classList.remove('visible');
    }
  });
}, { threshold: 0.1 });

// Fungsi untuk memuat pratinjau foto dan menyimpan file aslinya
function previewImage(event) {
  const file = event.target.files[0];
  if (!file) return;

  selectedFile = file; // Simpan file asli untuk di-upload ke Storage

  const reader = new FileReader();
  reader.onload = function(e) {
    document.getElementById('imagePreview').src = e.target.result;
    document.getElementById('imagePreviewContainer').style.display = 'inline-block';
  };
  reader.readAsDataURL(file);
}

// Fungsi untuk membatalkan/menghapus pratinjau foto
function removePreview() {
  selectedFile = null;
  document.getElementById('imageInput').value = '';
  document.getElementById('imagePreviewContainer').style.display = 'none';
}


// === 3. TOGGLE MODE PILIH & CENTANG BANYAK ===
function toggleSelectMode() {
  isSelectMode = !isSelectMode;
  const board = document.getElementById('madingBoard');
  const btn = document.getElementById('selectModeBtn');
  const actionBtn = document.getElementById('deleteSelectedBtn');

  if (isSelectMode) {
    board.classList.add('is-select-mode');
    btn.classList.add('active');
    actionBtn.style.display = 'block';
  } else {
    board.classList.remove('is-select-mode');
    btn.classList.remove('active');
    actionBtn.style.display = 'none';

    document.querySelectorAll('.note').forEach(note => {
      note.classList.remove('selected');
      const chk = note.querySelector('.select-checkbox');
      if (chk) chk.checked = false;
    });
    updateSelectedCount();
  }
}

function updateSelectedCount() {
  const count = document.querySelectorAll('.select-checkbox:checked').length;
  document.getElementById('selectedCount').textContent = count;
}

// === 4. SIMPAN CURHATAN BARU KE SUPABASE ===
async function addNote() {
  const input = document.getElementById('noteInput');
  const text = input.value.trim();

  // Validasi: Harus isi teks atau pilih foto
  if (text === '' && !selectedFile) {
    showAlert('Tulis sesuatu atau pilih foto terlebih dahulu!');
    return;
  }

  let imageUrl = null;

  // Jika ada file yang dipilih, upload dulu ke Supabase Storage
  if (selectedFile) {
    // Buat nama file unik berdasarkan waktu agar tidak bentrok
    const fileExt = selectedFile.name.split('.').pop();
    const fileName = `${Date.now()}_${Math.random().toString(36).substring(2, 9)}.${fileExt}`;
    const filePath = `${fileName}`;

    const { data: uploadData, error: uploadError } = await supabaseClient.storage
      .from('mading-images')
      .upload(filePath, selectedFile);

    if (uploadError) {
      console.error('Gagal mengunggah gambar:', uploadError);
      showAlert('Gagal mengunggah foto ke penyimpanan!');
      return;
    }

    // Ambil Public URL dari file yang baru diunggah
    const { data: publicURLData } = supabaseClient.storage
      .from('mading-images')
      .getPublicUrl(filePath);

    imageUrl = publicURLData.publicUrl;
  }

  // Simpan data catatan beserta URL gambar ke tabel database
  const newNote = {
    text: text,
    image_url: imageUrl,
    color: colors[Math.floor(Math.random() * colors.length)],
    rotation: (Math.random() * 12 - 6).toFixed(1)
  };

  const { error } = await supabaseClient.from('notes').insert([newNote]);

  if (error) {
    console.error('Gagal menyimpan:', error);
    showAlert('Terjadi kesalahan saat menempel pesan!');
  } else {
    input.value = '';
    removePreview(); // Bersihkan preview dan reset file
  }
}


// === 5. RENDER KERTAS DENGAN ANIMASI & EFEK SOBEKAN ===
function renderNote(noteData) {
  const board = document.getElementById('madingBoard');

  if (document.querySelector(`[data-id="${noteData.id}"]`)) return;

  const noteEl = document.createElement('div');
  
  const randomRipPattern = 'rip-pattern-' + (Math.floor(Math.random() * 4) + 1);
  
  // BERUBAH DI SINI: Memasang pola sobekan & animasi acak baru
  noteEl.className = `note ${randomRipPattern} ${getRandomAnimClass()}`;
  noteEl.setAttribute('data-id', noteData.id);
  noteEl.style.backgroundColor = noteData.color;
  
  const rotation = noteData.rotation || (Math.random() * 12 - 6).toFixed(1);
  noteEl.style.setProperty('--note-rotate', `${rotation}deg`);

  // Tombol Copy di Pojok Kanan Atas
  const copyBtn = document.createElement('button');
  copyBtn.className = 'copy-btn';
  copyBtn.title = 'Salin Teks';
  copyBtn.innerHTML = 'x'; // Ikon Copy
  copyBtn.onclick = (e) => {
    e.stopPropagation();
    copyNoteText(noteData.text, copyBtn);
  };
  noteEl.appendChild(copyBtn);

    // Menampilkan Gambar/Foto jika ada di catatan
  if (noteData.image_url) {
    const imgEl = document.createElement('img');
    imgEl.src = noteData.image_url;
    imgEl.className = 'note-img';
    noteEl.appendChild(imgEl);
  }


  // Teks Curhatan (Format Enter Tetap Ke Bawah)
  const textContent = document.createElement('p');
  textContent.innerHTML = noteData.text.replace(/\n/g, '<br>');
  noteEl.appendChild(textContent);

  // Checkbox Centang (Mode Hapus Banyak)
  const chk = document.createElement('input');
  chk.type = 'checkbox';
  chk.className = 'select-checkbox';
  chk.onclick = (e) => {
    e.stopPropagation();
    noteEl.classList.toggle('selected', chk.checked);
    updateSelectedCount();
  };
  noteEl.appendChild(chk);

  // Tempel ke Papan Mading & Daftarkan ke Observer
  board.prepend(noteEl);
  noteObserver.observe(noteEl);
}

// === FUNGSI SALIN TEKS (COPY) ===
function copyNoteText(text, btnElement) {
  navigator.clipboard.writeText(text).then(() => {
    const originalIcon = btnElement.innerHTML;
    btnElement.innerHTML = 'x'; // Berubah jadi centang saat berhasil disalin
    setTimeout(() => {
      btnElement.innerHTML = originalIcon;
    }, 1500);
  }).catch(err => {
    console.error('Gagal menyalin teks: ', err);
  });
}

// === 6. AMBIL SEMUA DATA SAAT AWAL DIMUAT ===
async function loadNotes() {
  const { data, error } = await supabaseClient
    .from('notes')
    .select('*')
    .order('created_at', { ascending: true });

  if (error) {
    console.error('Gagal mengambil data:', error);
    return;
  }

  document.getElementById('madingBoard').innerHTML = '';
  data.forEach(note => renderNote(note));
}

// === 7. KONEKSI REALTIME (OTOMATIS MUNCUL/HILANG UNTUK SEMUA USER) ===
function listenToRealtime() {
  supabaseClient
    .channel('public:notes')
    .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'notes' }, payload => {
      renderNote(payload.new);
    })
    .on('postgres_changes', { event: 'DELETE', schema: 'public', table: 'notes' }, payload => {
      const deletedEl = document.querySelector(`[data-id="${payload.old.id}"]`);
      if (deletedEl) deletedEl.remove();
    })
    .subscribe();
}

// === 8. LOGIKA MODAL ADMIN & HAPUS SUPABASE ===
function openDeleteSelectedModal() {
  const count = document.querySelectorAll('.select-checkbox:checked').length;
  if (count === 0) {
    showAlert('Pilih minimal satu kertas yang ingin dihapus!');
    return;
  }
  showAdminModal();
}

function openAdminModal(noteElement) {
  targetNoteElement = noteElement;
  showAdminModal();
}

function showAdminModal() {
  const modal = document.getElementById('adminModal');
  const input = document.getElementById('adminPasswordInput');
  modal.style.display = 'flex';
  input.value = '';
  input.focus();
}

function closeAdminModal() {
  const modal = document.getElementById('adminModal');
  modal.style.display = 'none';
  targetNoteElement = null;
}

async function confirmDelete() {
  const password = document.getElementById('adminPasswordInput').value;
  let notesToDelete = []; // Menyimpan objek { id, image_url }

  if (isSelectMode) {
    const selectedNotes = document.querySelectorAll('.note.selected');
    // Ambil id dan cari image_url dari elemen catatan di layar
    notesToDelete = Array.from(selectedNotes).map(el => {
      const id = el.getAttribute('data-id');
      const imgEl = el.querySelector('.note-img');
      return { id: id, image_url: imgEl ? imgEl.src : null };
    });
  } else if (targetNoteElement) {
    const id = targetNoteElement.getAttribute('data-id');
    const imgEl = targetNoteElement.querySelector('.note-img');
    notesToDelete = [{ id: id, image_url: imgEl ? imgEl.src : null }];
  }

  // JIKA TIDAK ADA YANG DIPILIH
  if (notesToDelete.length === 0) {
    showAlert('Pilih kertas yang ingin dihapus terlebih dahulu!');
    closeAdminModal();
    return;
  }

  const idsToDelete = notesToDelete.map(n => n.id);

  try {
    // 1. Validasi password & hapus data dari database via RPC
    const { data: isSuccess, error } = await supabaseClient.rpc('hapus_note_admin', {
      note_ids: idsToDelete,
      pass_input: password
    });

    if (error) {
      console.error('Error Supabase RPC:', error);
      showAlert('Terjadi kesalahan pada server: ' + error.message);
      closeAdminModal();
      return;
    }

    if (isSuccess) {
      // 2. Jika sandi benar dan database terhapus, bersihkan file gambarnya di Storage
for (const note of notesToDelete) {
  if (note.image_url) {
    try {
      // Mengambil bagian path setelah nama bucket 'mading-images/'
      const urlObj = new URL(note.image_url);
      const pathParts = urlObj.pathname.split('/mading-images/');
      if (pathParts.length > 1) {
        const filePath = decodeURIComponent(pathParts[1]);
        
        await supabaseClient.storage
          .from('mading-images')
          .remove([filePath]);
      }
    } catch (storageErr) {
      console.error('Gagal menghapus file gambar dari storage:', storageErr);
    }
  }
}


      // 3. Hapus elemen dari tampilan layar
      if (isSelectMode) {
        document.querySelectorAll('.note.selected').forEach(note => note.remove());
        toggleSelectMode();
      } else if (targetNoteElement) {
        targetNoteElement.remove();
      }
      showAlert('Pesan berhasil dihapus!');
    } else {
      showAlert('Kata sandi salah!');
    }
  } catch (err) {
    console.error('Catch Error:', err);
    showAlert('Gagal terhubung ke database.');
  }

  closeAdminModal();
}



// === 9. CUSTOM MODAL ALERT ===
function showAlert(message) {
  document.getElementById('alertMessage').textContent = message;
  document.getElementById('alertModal').style.display = 'flex';
}

function closeAlertModal() {
  document.getElementById('alertModal').style.display = 'none';
}

// === 10. INISIALISASI HALAMAN ===
document.addEventListener('DOMContentLoaded', () => {
  loadNotes();
  listenToRealtime();
});
