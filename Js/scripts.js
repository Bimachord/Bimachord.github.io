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
