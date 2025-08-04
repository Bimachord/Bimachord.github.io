document.addEventListener('DOMContentLoaded', function () {
    var myList = document.getElementById('myList');
    myList.style.display = 'none';
    // daftar lagu
    var names = [
      { name: "Nangi Dana Tambora", page: "/lagu/nangi-dana-tambora.html" },
      { name: "Sapa Moti Malingi", page: "/lagu/sapa-moti-malingi.html" },
      { name: "Pasole", page: "/lagu/pasole.html" },
      { name: "Pasapu Monca", page: "/lagu/pasapu-monca.html"},
      { name: "Nahu Ma Mbali", page: "/lagu/nahu-mambali.html"},
      { name: "Malingi", page: "/lagu/malingi.html"},
      { name: "Nggahi Rawi Pahu", page: "/lagu/ngahi-rawi-pahu.html"},
      { name: "Tambulate", page: "/lagu/tambulate.html"},
      { name: "Janji Da Ule", page: "/lagu/janji-da-ule.html"},
      { name: "Amancawa", page: "/lagu/amancawa.html"},
        { name: "Sodi Angi", page: "/lagu/sodi-angi.html"},
    ];
  

    names.forEach(function (item) {
      var listItem = document.createElement('li');
      listItem.className = 'list-group-item';
      listItem.textContent = item.name;
      listItem.setAttribute('data-halaman', item.page); 
      myList.appendChild(listItem);
    });
  
    document.getElementById('myInput').addEventListener('input', searchFunction);
    document.getElementById('myInput').addEventListener('blur', function () {
      if (this.value.trim() === '') {
        myList.style.display = 'none';
      }
    });
  
    var listItems = document.querySelectorAll('#myList li');
    listItems.forEach(function (item) {
      item.addEventListener('click', function () {

        var halaman = this.getAttribute('data-halaman');
    
        window.location.href = halaman;
      });
    });
  });
  
  function searchFunction() {
    var input, filter, ul, li, i, txtValue;
    input = document.getElementById('myInput');
    filter = input.value.toUpperCase();
    ul = document.getElementById('myList');
    li = ul.getElementsByTagName('li');
  
    ul.style.display = 'block';
  
    for (i = 0; i < li.length; i++) {
      txtValue = li[i].textContent || li[i].innerText;
      if (txtValue.toUpperCase().indexOf(filter) > -1) {
        li[i].style.display = '';
      } else {
        li[i].style.display = 'none';
      }
    }
  
    if (filter.trim() === '') {
      ul.style.display = 'none';
    }
  }

// random link
async function loadLinkKomponen() {
  const res = await fetch('/components/lirik.html');
  const html = await res.text();
  const container = document.getElementById('link-komponen');
  container.innerHTML = html;

   // Tunggu sampai isi dimasukkan, lalu jalankan script
  const allLinks = Array.from(container.querySelectorAll('#all-links .content-divider'));
  const shuffled = allLinks.sort(() => Math.random() - 0.5);
  const selected = shuffled.slice(0, 4);
  const target = container.querySelector('#random-links');
  selected.forEach(link => {
    target.appendChild(link.cloneNode(true));
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

