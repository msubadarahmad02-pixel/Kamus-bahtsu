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

// === 2. PEMANTAU ANIMASI SCROLL (INTERSECTION OBSERVER) ===
const noteObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      const randomDelay = Math.floor(Math.random() * 150);
      setTimeout(() => {
        entry.target.classList.add('visible');
      }, randomDelay);
    } else {
      entry.target.classList.remove('visible');
    }
  });
}, { threshold: 0.15 });

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

  if (text === '') {
    showAlert('Tulis sesuatu dulu');
    return;
  }

  const newNote = {
    text: text,
    color: colors[Math.floor(Math.random() * colors.length)],
    rotation: (Math.random() * 12 - 6).toFixed(1)
  };

  const { error } = await supabaseClient.from('notes').insert([newNote]);

  if (error) {
    console.error('Gagal menyimpan:', error);
    showAlert('Terjadi kesalahan saat menempel pesan!');
  } else {
    input.value = '';
  }
}

// === 5. RENDER KERTAS DENGAN ANIMASI & EFEK SOBEKAN ===
function renderNote(noteData) {
  const board = document.getElementById('madingBoard');

  // Mencegah duplikasi rendering jika ID sudah tampil di mading
  if (document.querySelector(`[data-id="${noteData.id}"]`)) return;

  const noteEl = document.createElement('div');
  
  // Pola Sobekan Acak (rip-pattern-1 s/d rip-pattern-4)
  const randomRipPattern = 'rip-pattern-' + (Math.floor(Math.random() * 4) + 1);
  
  // Variasi Animasi Scroll Acak
  const animList = ['anim-slide-up', 'anim-slide-down', 'anim-slide-left', 'anim-slide-right', 'anim-spin', 'anim-flip'];
  const randomAnim = animList[Math.floor(Math.random() * animList.length)];
  
  noteEl.className = `note ${randomRipPattern} ${randomAnim}`;
  noteEl.setAttribute('data-id', noteData.id);
  noteEl.style.backgroundColor = noteData.color;
  
  const rotation = noteData.rotation || (Math.random() * 12 - 6).toFixed(1);
  noteEl.style.setProperty('--note-rotate', `${rotation}deg`);

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
  
  if (password === 'alhamdulillah') { 
    if (isSelectMode) {
      const selectedNotes = document.querySelectorAll('.note.selected');
      const idsToDelete = Array.from(selectedNotes).map(el => el.getAttribute('data-id'));
      
      const { error } = await supabaseClient
        .from('notes')
        .delete()
        .in('id', idsToDelete);

      if (!error) {
        selectedNotes.forEach(note => note.remove());
        showAlert(`${idsToDelete.length} pesan berhasil dihapus!`);
        toggleSelectMode();
      } else {
        showAlert('Gagal menghapus pesan dari server!');
      }
    } else if (targetNoteElement) {
      const idToDelete = targetNoteElement.getAttribute('data-id');
      const { error } = await supabaseClient
        .from('notes')
        .delete()
        .eq('id', idToDelete);

      if (!error) {
        targetNoteElement.remove();
        showAlert('Pesan berhasil dihapus!');
      } else {
        showAlert('Gagal menghapus pesan!');
      }
    }
    closeAdminModal();
  } else {
    closeAdminModal();
    showAlert('Kata sandi salah!');
  }
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
