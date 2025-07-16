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
        
        // Ambil root chord (contoh: A, A#, Am, A#m) dan sisanya
        let match = currentChord.match(/^([A-G][#b]?m?)(.*)$/);
        if (!match) return;

        let baseChord = match[1]; // A, Am, A#, A#m
        let suffix = match[2];    // 7, maj7, /G, dll

        // Ubah enharmonic (misalnya Db -> C#)
        const enharmonics = { "Db": "C#", "Eb": "D#", "Gb": "F#", "Ab": "G#", "Bb": "A#" };
        if (baseChord in enharmonics) baseChord = enharmonics[baseChord];

        let index = chords.indexOf(baseChord.replace("m", "")); // Index hanya root major
        if (index !== -1) {
            let isMinor = baseChord.includes("m");
            let newIndex = (index + step + chords.length) % chords.length;
            let newBaseChord = chords[newIndex] + (isMinor ? "m" : "");
            let newChord = newBaseChord + suffix;

            el.innerText = newChord;
            el.setAttribute("onclick", `showChordImage('${newBaseChord}')`);
        }
    });
}

function showChordImage(chord) {
    // Ambil root chord dengan optional minor (A, Am, A#, A#m)
    let match = chord.match(/^([A-G][#b]?m?)/);
    if (!match) return;

    let baseChord = match[1]; // contoh: F#m
    let imageUrl = `/assets/chord/${baseChord}.jpg`;

    document.getElementById("chordTitle").innerText = `Chord ${baseChord}`;
    document.getElementById("chordImage").src = imageUrl;
    document.getElementById("chordModal").style.display = "flex";
}

        function closeModal() {
            document.getElementById("chordModal").style.display = "none";
        }

