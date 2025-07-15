let isScrolling = false;
let scrollInterval;

function scrollPage() {
    if (!isScrolling) {
        isScrolling = true;
        scrollInterval = setInterval(() => {
            window.scrollBy({
                top: window.innerHeight / 170, // Menggulir setengah ketinggian jendela untuk pengguliran yang lebih lambat
                behavior: 'smooth'
            });
        }, 500); // Ubah nilai interval berdasarkan preferensi pengguliran Anda
    } else {
        isScrolling = false;
        clearInterval(scrollInterval);
    }
}
function showElement() {
    let el = document.getElementById("scroll-icon");
    el.style.display = el.style.display === "flex" ? "none" : "flex";
}

        const chords = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
        let autoScrollActive = false;
        

        function transpose(step) {
            document.querySelectorAll('.chord').forEach(el => {
                let currentChord = el.innerText.trim();
                let baseChord = currentChord.match(/[A-G]#?/)[0];
                let suffix = currentChord.replace(baseChord, "");
                let index = chords.indexOf(baseChord);
                
                if (index !== -1) {
                    let newIndex = (index + step + chords.length) % chords.length;
                    el.innerText = chords[newIndex] + suffix;
                    el.setAttribute("onclick", `showChordImage('${chords[newIndex]}')`);
                }
            });
        }

    

        function showChordImage(chord) {
            let imageUrl = `/assets/chord/${chord}.jpg`;
            document.getElementById("chordTitle").innerText = `Chord ${chord}`;
            document.getElementById("chordImage").src = imageUrl;
            document.getElementById("chordModal").style.display = "flex";
        }

        function closeModal() {
            document.getElementById("chordModal").style.display = "none";
        }

