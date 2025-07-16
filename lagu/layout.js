document.addEventListener('DOMContentLoaded', function () {
  const galleries = document.querySelectorAll('.gallery');

  galleries.forEach(function (gallery) {
    gallery.addEventListener('click', function (event) {
      if (event.target.tagName === 'IMG') {
        const largeImagePath = event.target.getAttribute('data-large');
        showLargeImage(largeImagePath);
      }
    });
  });

  const largeImageContainer = document.createElement('div');
  largeImageContainer.classList.add('large-image-container');
  document.body.appendChild(largeImageContainer);

  largeImageContainer.addEventListener('click', function () {
    hideLargeImage();
  });

  function showLargeImage(path) {
    const largeImage = document.createElement('img');
    largeImage.classList.add('large-image');
    largeImage.src = path;
    largeImageContainer.innerHTML = '';
    largeImageContainer.appendChild(largeImage);
    largeImageContainer.style.display = 'flex';
  }

  function hideLargeImage() {
    largeImageContainer.style.display = 'none';
  }
});
