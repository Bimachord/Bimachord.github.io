document.addEventListener('DOMContentLoaded', function () {
    const myList = document.getElementById('myList');
    const myInput = document.getElementById('myInput');

    // 1. Styling UI
    myList.className = 'absolute z-10 w-full mt-1 bg-gray-700 border border-blue-500 rounded-lg shadow-2xl max-h-80 overflow-y-auto';
    myList.style.display = 'none';

    // 2. Data Master (Statis)
    let names = [
        { name: "Nangi Dana Tambora", page: "/lagu/nangi-dana-tambora.html" },
        { name: "Sapa Moti Malingi", page: "/lagu/sapa-moti-malingi.html" },
        { name: "Pasole", page: "/lagu/pasole.html" },
        { name: "Pasapu Monca", page: "/lagu/pasapu-monca.html"},
        { name: "Nahu Ma Mbali", page: "/lagu/nahu-mambali.html"},
        { name: "Malingi", page: "/lagu/malingi.html"},
        { name: "Nggahi rawi pahu", page: "/lagu/ngahi-rawi-pahu.html"},
        { name: "Tambulate", page: "/lagu/tambulate.html"},
        { name: "Janji Da Ule", page: "/lagu/janji-da-ule.html"},
        { name: "Amancawa", page: "/lagu/amancawa.html"},
        { name: "Sodi Angi", page: "/lagu/sodi-angi.html"},
        { name: "Putri Mambora", page: "/lagu/putri-mambora.html"},
        { name: "Mori Kese", page: "/lagu/mori-kese.html"},
        { name: "Waa Ndampa", page: "/lagu/waa-ndampa.html"}
    ];

    // 3. Fungsi Render & Klik
    function renderList(dataToRender) {
        myList.innerHTML = ''; // Reset list
        
        if (dataToRender.length === 0) {
            myList.style.display = 'none';
            return;
        }

        dataToRender.forEach(function (item) {
            const listItem = document.createElement('li');
            listItem.className = 'px-4 py-2 text-white cursor-pointer hover:bg-blue-600 transition duration-150 flex items-center space-x-3 border-b border-gray-600 last:border-b-0';
            listItem.innerHTML = `<i class="fas fa-music text-amber-400"></i> <span>${item.name}</span>`;
            
            // INI KUNCINYA: Event klik dipasang langsung saat elemen dibuat
            listItem.addEventListener('mousedown', function () {
                window.location.href = item.page;
            });

            myList.appendChild(listItem);
        });
        
        myList.style.display = 'block';
    }

    // 4. Ambil data dari API Laravel
    fetch('https://backend-bimachord.vercel.app/api/songs')
        .then(response => response.json())
        .then(result => {
            if (result.status === 'success') {
                const apiNames = result.data.map(song => ({
                    name: song.title,
                    page: "lirik.html?slug=" + song.slug
                }));
                names = [...names, ...apiNames]; // Gabung data
                console.log("Bimachord API Synced!");
            }
        })
        .catch(err => console.error("API Offline:", err));

    // 5. Logika Pencarian
    myInput.addEventListener('input', function() {
        const filter = this.value.toLowerCase().trim();
        
        if (filter === '') {
            myList.style.display = 'none';
            return;
        }

        const filteredData = names.filter(item => 
            item.name.toLowerCase().includes(filter)
        );

        renderList(filteredData);
    });

    // 6. Handle Blur (Tutup dropdown)
    myInput.addEventListener('blur', function () {
        // Pakai timeout sedikit agar event klik sempat jalan duluan
        setTimeout(() => {
            myList.style.display = 'none';
        }, 200); 
    });

    // 4. Event Listener Klik pada Item Daftar (LOGIC TIDAK BERUBAH)
    var listItems = document.querySelectorAll('#myList li');
    listItems.forEach(function (item) {
        item.addEventListener('click', function () {
            var halaman = this.getAttribute('data-halaman');
            window.location.href = halaman;
        });
    });
});

// 5. Fungsi Pencarian (LOGIC TIDAK BERUBAH)
function searchFunction() {
    var input, filter, ul, li, i, txtValue;
    input = document.getElementById('myInput');
    filter = input.value.toUpperCase();
    ul = document.getElementById('myList');
    li = ul.getElementsByTagName('li');

    ul.style.display = 'block';

    var found = false;
    for (i = 0; i < li.length; i++) {
        var span = li[i].querySelector('span'); 
        txtValue = span ? span.textContent || span.innerText : li[i].textContent || li[i].innerText;
        
        if (txtValue.toUpperCase().indexOf(filter) > -1) {
            li[i].style.display = 'flex'; 
            found = true;
        } else {
            li[i].style.display = 'none';
        }
    }

    if (filter.trim() === '' || !found && filter.trim() !== '') {
        ul.style.display = 'none';
    }
}

// random link
async function loadLinkKomponen() {
    // 1. Ambil dan masukkan HTML komponen
    const res = await fetch('/components/lirik.html');
    const html = await res.text();
    const container = document.getElementById('link-komponen');
    container.innerHTML = html;

    // 2. Ambil semua elemen tautan (a) di dalam #all-links
    // Kita target langsung tag <a> karena kita sudah mengubah struktur HTML.
    const allLinks = Array.from(container.querySelectorAll('#all-links a'));

    // 3. Acak dan pilih 4 tautan
    const shuffled = allLinks.sort(() => Math.random() - 0.5);
    const selected = shuffled.slice(0, 4);

    // 4. Masukkan tautan yang dipilih ke dalam #random-links
    const target = container.querySelector('#random-links');

    // Kosongkan target (hanya jika diperlukan, tapi ini praktik yang baik)
    target.innerHTML = ''; 

    selected.forEach(link => {
        // Kita cloneNode(true) untuk menyalin tautan dan semua attributenya
        const clonedLink = link.cloneNode(true);
        
        // Opsional: Hapus margin bawah (mb-2) pada tautan yang akan dimasukkan ke grid
        // Karena #random-links menggunakan grid gap-3, margin mungkin berlebihan.
        clonedLink.classList.remove('mb-2'); 
        
        target.appendChild(clonedLink);
    });
}

loadLinkKomponen();

async function loadNavbarKomponen() {
  try {
    const res = await fetch('/components/navbar.html');
    
    if (!res.ok) {
      throw new Error(`Gagal memuat komponen: ${res.status}`);
    }

    const html = await res.text();
    const container = document.getElementById('Navbar-komponen');

    if (container) {
      container.innerHTML = html;
    } else {
      console.warn('Elemen dengan id "link-komponen" tidak ditemukan.');
    }
  } catch (error) {
    console.error('Terjadi kesalahan saat memuat komponen:', error);
  }
}

loadNavbarKomponen();

async function loadFooterKomponen() {
  try {
    const res = await fetch('/components/footer.html');
    
    if (!res.ok) {
      throw new Error(`Gagal memuat komponen: ${res.status}`);
    }

    const html = await res.text();
    const container = document.getElementById('Footer-komponen');

    if (container) {
      container.innerHTML = html;
    } else {
      console.warn('Elemen dengan id "link-komponen" tidak ditemukan.');
    }
  } catch (error) {
    console.error('Terjadi kesalahan saat memuat komponen:', error);
  }
}

loadFooterKomponen();

async function loadBottomBarKomponen() {
  try {
    const res = await fetch('/components/bottombar.html');
    
    if (!res.ok) {
      throw new Error(`Gagal memuat komponen: ${res.status}`);
    }

    const html = await res.text();
    const container = document.getElementById('BottomBar-komponen');

    if (container) {
      container.innerHTML = html;
    } else {
      console.warn('Elemen dengan id "link-komponen" tidak ditemukan.');
    }
  } catch (error) {
    console.error('Terjadi kesalahan saat memuat komponen:', error);
  }
}

loadBottomBarKomponen();

  // Firebase config kamu

  // Cek status login dari localStorage
  document.addEventListener('DOMContentLoaded', function () {
    const logoutItem = document.getElementById('logout-nav-item');
    const token = localStorage.getItem('login_token');

    if (token) {
      logoutItem.style.display = 'block';
    } else {
      logoutItem.style.display = 'none';
    }
  });

 function handleLogout() {
    firebase.auth().signOut().then(() => {
      // Hapus data dari localStorage
      localStorage.removeItem('login_token');

      alert("Berhasil logout!");
      window.location.href = "/"; // Ganti sesuai halaman login kamu
    }).catch((error) => {
      console.error("Gagal logout:", error);
      alert("Gagal logout: " + error.message);
    });
  }

function goToInput() {
    const input = document.getElementById("myInput");
    if (input) {
      input.scrollIntoView({ behavior: "smooth", block: "center" });
      input.focus(); // Fokus langsung ke input
    }
  }