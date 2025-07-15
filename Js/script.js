document.addEventListener('DOMContentLoaded', function () {
    var myList = document.getElementById('myList');
    myList.style.display = 'none';
    // daftar lagu
    var names = [
      { name: "Nangi Dana Tambora", page: "nangi-dana-tambora.html" },
      { name: "Sapa Moti Malingi", page: "sapa-moti-malingi.html" },
      { name: "Pasole", page: "pasole.html" },
      { name: "Pasapu Monca", page: "pasapu-monca.html"},
      { name: "Nahu Ma Mbali", page: "nahu-mambali.html"},
      { name: "Malingi", page: "malingi.html"},
      { name: "Nggahi rawi pahu", page: "ngahi-rawi-pahu.html"},
      { name: "Tambulate", page: "tambulate.html"},
      { name: "Janji Da Ule", page: "janji-da-ule.html"},
      { name: "Amancawa", page: "amancawa.html"},
        { name: "Sodi Angi", page: "sodi-angi.html"},
       
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

  