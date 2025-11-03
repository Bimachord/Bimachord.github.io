// ///////////////////////////////////////////////////////////////////////////
// FIREBASE CONFIGURATION DAN INITIALIZATION (LOGIC TIDAK BERUBAH)
// ///////////////////////////////////////////////////////////////////////////
var firebaseConfig = {
   apiKey: "AIzaSyCxgwhRJeRailX_oDGp6XrqIAsD6wVilU8",
   authDomain: "userbc-d8204.firebaseapp.com",
   projectId: "userbc-d8204",
   storageBucket: "userbc-d8204.appspot.com",
   messagingSenderId: "941116930960",
   appId: "1:941116930960:web:71d002aabbbedf45a21115",
   measurementId: "G-JQ0SDKH6MT"
};
firebase.initializeApp(firebaseConfig);
var database = firebase.database();
var commentsRef = database.ref('comments');

// ///////////////////////////////////////////////////////////////////////////
// GLOBAL STATE UNTUK PAGINATION BALASAN (LOGIC TIDAK BERUBAH)
// ///////////////////////////////////////////////////////////////////////////
// Menyimpan jumlah balasan yang sudah ditampilkan per ID komentar.
window.replyPageCounters = {};
// Jumlah balasan yang ditampilkan per klik.
window.replyDisplayLimit = 3;


// ///////////////////////////////////////////////////////////////////////////
// UTILITY FUNCTION (LOGIC TIDAK BERUBAH)
// ///////////////////////////////////////////////////////////////////////////

// Utility: buat elemen aman dari XSS (Hanya untuk teks biasa, bukan untuk HTML)
function createSafeElement(tag, className, text) {
   const el = document.createElement(tag);
   if (className) el.className = className;
   if (text !== undefined) el.textContent = text;
   return el;
}

// ///////////////////////////////////////////////////////////////////////////
// MAIN LOGIC FUNCTIONS (LOGIC TIDAK BERUBAH)
// ///////////////////////////////////////////////////////////////////////////

// Submit komentar
document.getElementById('comment-form').addEventListener('submit', function(event) {
   event.preventDefault();
   var comment = document.getElementById('comment').value.trim();

   if (!comment) {
     alert("Komentar tidak boleh kosong.");
     return;
   }

   var user = firebase.auth().currentUser;
   if (user) {
     var newCommentRef = commentsRef.push();
     newCommentRef.set({
       username: user.email,
       comment: comment,
       timestamp: new Date().toISOString(),
       likes: 0,
       usersLiked: {},
       replies: {}
     }).then(() => {
       document.getElementById('comment').value = '';
       fetchComments();
     }).catch((error) => {
       console.error('Error writing new message to Firebase Database', error);
     });
   } else {
     window.location.href = 'login.html';
   }
});

// Handle like
function handleLike(commentId, isReply, parentId = null) {
   const user = firebase.auth().currentUser;
   if (user) {
     const commentRef = isReply
       ? commentsRef.child(parentId).child('replies').child(commentId)
       : commentsRef.child(commentId);

     commentRef.once('value', (snapshot) => {
       const data = snapshot.val();
       const updates = {};

       if (!data.usersLiked || !data.usersLiked[user.uid]) {
         updates['/likes'] = (data.likes || 0) + 1;
         updates[`/usersLiked/${user.uid}`] = true;
       } else {
         updates['/likes'] = (data.likes || 0) - 1;
         updates[`/usersLiked/${user.uid}`] = null;
       }

       commentRef.update(updates);
     });
   } else {
     window.location.href = 'login.html';
   }
}

// Toggle balasan
function toggleReplies(commentId) {
   const repliesContainer = document.getElementById(`replies-container-${commentId}`);
   const replyForm = document.getElementById(`reply-form-${commentId}`);
   
   repliesContainer.classList.toggle('hidden');
   replyForm.classList.toggle('hidden');
   
   // Reset counter saat membuka/menutup
   if (!repliesContainer.classList.contains('hidden')) {
       window.replyPageCounters[commentId] = window.replyDisplayLimit;
   } else {
       delete window.replyPageCounters[commentId];
   }

   fetchReplies(commentId);
}

// Submit balasan
function submitReply(event, commentId) {
   event.preventDefault();
   const reply = document.getElementById(`reply-input-${commentId}`).value.trim();
   const user = firebase.auth().currentUser;

   if (!reply) {
     alert("Balasan tidak boleh kosong.");
     return;
   }

   if (user) {
     const replyData = {
       username: user.email,
       comment: reply,
       timestamp: new Date().toISOString(),
       likes: 0,
       usersLiked: {}
     };

     const repliesRef = commentsRef.child(commentId).child('replies').push();
     repliesRef.set(replyData).then(() => {
       document.getElementById(`reply-input-${commentId}`).value = '';
       
       // Tingkatkan counter agar balasan baru otomatis tampil (jika kita ingin balasan baru tetap muncul di akhir)
       window.replyPageCounters[commentId] = (window.replyPageCounters[commentId] || window.replyDisplayLimit) + 1;

       fetchReplies(commentId);
       fetchComments(); 
     });
   } else {
     window.location.href = 'login.html';
   }
}

// Load 3 balasan berikutnya
function loadMoreReplies(commentId) {
    window.replyPageCounters[commentId] += window.replyDisplayLimit;
    fetchReplies(commentId, true);
}


// ///////////////////////////////////////////////////////////////////////////
// RENDERING AND DISPLAY
// ///////////////////////////////////////////////////////////////////////////

// Ambil balasan (DENGAN PAGINATION DAN URUTAN TERTUA DI ATAS)
function fetchReplies(commentId, isLoadMore = false) {
    const repliesContainer = document.getElementById(`replies-container-${commentId}`);
    
    if (!window.replyPageCounters[commentId] && !isLoadMore) {
        window.replyPageCounters[commentId] = window.replyDisplayLimit;
    }
    const currentLimit = window.replyPageCounters[commentId];

    commentsRef.child(commentId).child('replies').on('value', (snapshot) => {
        repliesContainer.innerHTML = '';
        
        const allReplies = [];
        snapshot.forEach((childSnapshot) => {
             // CUKUP PUSH SAJA. Data dari Firebase akan berurutan berdasarkan waktu push (tertua di atas)
             // Jika ingin mengurutkan berdasarkan timestamp secara eksplisit:
             // allReplies.push({ key: childSnapshot.key, ...childSnapshot.val(), timestamp: new Date(childSnapshot.val().timestamp).getTime() });
             allReplies.push({ key: childSnapshot.key, ...childSnapshot.val() });
        });
        
        // JIKA INGIN URUTAN TERTUA DI ATAS, KITA TIDAK PERLU REVERSE() atau UNSHIFT.
        // CUKUP SORTING BERDASARKAN TIMESTAMP (waktu terlama -> waktu terbaru)
        allReplies.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

        const totalReplies = allReplies.length;
        
        // Tentukan Balasan mana yang akan ditampilkan (karena urutan tertua di atas, kita ambil slice dari akhir)
        const startIndex = Math.max(0, totalReplies - currentLimit);
        const repliesToDisplay = allReplies.slice(startIndex, totalReplies);
        
        
        // 1. Render balasan yang ditampilkan
        repliesToDisplay.forEach((reply) => {
            const user = firebase.auth().currentUser;
            const liked = user && reply.usersLiked && reply.usersLiked[user.uid];

            const replyElement = createSafeElement('div', 'flex mb-3 items-start'); 
            
            // Ikon Pengguna Balasan
            const avatar = document.createElement('div');
            avatar.className = 'w-8 h-8 rounded-full bg-gray-600 flex items-center justify-center text-xs text-blue-400 font-bold flex-shrink-0';
            avatar.innerHTML = `<i class="fas fa-user-circle"></i>`;
            replyElement.appendChild(avatar);

            const content = document.createElement('div');
            content.className = 'ml-3 p-3 bg-gray-700 rounded-xl flex-grow';

            // Header Balasan
            const header = createSafeElement('div', 'flex items-center justify-between mb-1');
            const username = createSafeElement('strong', 'text-green-400 text-sm font-semibold mr-2', reply.username);
            header.appendChild(username);
            
            const likeBtn = document.createElement('button');
            const likedClass = liked ? 'text-blue-400' : 'text-gray-400 hover:text-blue-300';
            likeBtn.className = `text-xs ${likedClass} transition-colors duration-150`;
            likeBtn.innerHTML = `<i class="fa fa-thumbs-up mr-1"></i> ${reply.likes || 0}`;
            likeBtn.onclick = () => handleLike(reply.key, true, commentId);
            header.appendChild(likeBtn);

            // Konten Balasan
            content.appendChild(header);
            content.appendChild(createSafeElement('p', 'text-gray-200 text-sm mt-0', reply.comment));

            // Footer Mini Balasan (Waktu + Tombol Balas Jenjang)
            const miniFooter = createSafeElement('div', 'flex items-center space-x-3 mt-1');
            miniFooter.appendChild(createSafeElement('small', 'text-gray-400 text-xs', new Date(reply.timestamp).toLocaleString()));
            
            const nestedReplyBtn = document.createElement('button');
            nestedReplyBtn.className = 'text-blue-400 text-xs font-semibold hover:text-blue-300 transition-colors';
            nestedReplyBtn.textContent = 'Balas';
            nestedReplyBtn.onclick = () => {
                document.getElementById(`replies-container-${commentId}`).classList.add('hidden');
                document.getElementById(`reply-form-${commentId}`).classList.remove('hidden');
                document.getElementById(`reply-input-${commentId}`).focus();
            };
            miniFooter.appendChild(nestedReplyBtn);
            
            content.appendChild(miniFooter);
            replyElement.appendChild(content);

            repliesContainer.appendChild(replyElement);
        });

        // 2. Render tombol 'Tampilkan Lebih Banyak' jika ada balasan yang tersembunyi
        if (totalReplies > currentLimit) {
            const remaining = totalReplies - currentLimit;
            const loadMoreBtn = document.createElement('button');
            loadMoreBtn.className = 'text-blue-400 text-sm font-semibold hover:text-blue-300 transition-colors mt-2 p-2 rounded-md';
            loadMoreBtn.innerHTML = `<i class="fas fa-sync-alt mr-2"></i> Tampilkan ${Math.min(remaining, window.replyDisplayLimit)} balasan sebelumnya`; // Mengganti 'lainnya' menjadi 'sebelumnya'
            loadMoreBtn.onclick = () => loadMoreReplies(commentId);
            // Tombol Tampilkan Lebih Banyak harus diletakkan sebelum balasan jika urutan tertua di atas
            repliesContainer.prepend(loadMoreBtn); 
        }
    });
}

// Render komentar utama (LOGIC TIDAK BERUBAH)
function renderComment(comment) {
   const user = firebase.auth().currentUser;
   const liked = user && comment.usersLiked && comment.usersLiked[user.uid];
   
   // Hitung jumlah balasan
   const replyCount = comment.replies ? Object.keys(comment.replies).length : 0;
   
   // -- TAMPILAN KOMEN UTAMA --
   const commentElement = createSafeElement('div', 'bg-gray-800 p-5 rounded-xl shadow-2xl mb-4 border border-gray-700 hover:border-blue-500 transition duration-300');
   commentElement.id = `comment-${comment.key}`;

   const body = createSafeElement('div', 'space-y-3'); 
   
   // 1. Perbaikan Username + Icon: Menggunakan innerHTML
   const usernameElement = document.createElement('h6');
   usernameElement.className = 'text-xl font-bold text-green-400 mb-1 flex items-center';
   usernameElement.innerHTML = `<i class="fas fa-user-circle mr-2 text-blue-400"></i> ${comment.username}`;
   body.appendChild(usernameElement);
   
   // Konten Komentar
   body.appendChild(createSafeElement('p', 'text-gray-200 text-base leading-relaxed break-words', comment.comment));

   // -- FOOTER (LIKE, REPLY, TIME) --
   const footer = createSafeElement('div', 'flex justify-between items-center pt-3 border-t border-gray-700 mt-3');
   
   // 2. Perbaikan Waktu + Icon: Menggunakan innerHTML
   const timeElement = document.createElement('small');
   timeElement.className = 'text-gray-400 text-xs flex items-center';
   timeElement.innerHTML = `<i class="far fa-clock mr-1"></i> ${new Date(comment.timestamp).toLocaleString()}`;
   footer.appendChild(timeElement);

   // -- TOMBOL GROUP --
   const btnGroup = createSafeElement('div', 'flex space-x-3'); 
   
   // 1. Tombol Like
   const likeBtn = document.createElement('button');
   const likeClass = liked ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600';
   likeBtn.className = `flex items-center px-3 py-1 text-sm font-semibold rounded-full transition-colors duration-200 ${likeClass}`;
   likeBtn.innerHTML = `<i class="fa fa-thumbs-up mr-2"></i> ${comment.likes || 0}`;
   likeBtn.onclick = () => handleLike(comment.key, false);

   // 2. Tombol Reply
   const replyBtn = document.createElement('button');
   replyBtn.className = 'flex items-center bg-gray-700 text-gray-300 hover:bg-gray-600 px-3 py-1 text-sm font-semibold rounded-full transition-colors duration-200';
   replyBtn.innerHTML = `<i class="fa fa-reply mr-2"></i> Balas`;
   replyBtn.onclick = () => toggleReplies(comment.key);

   // 3. Badge Jumlah Balasan
   const replyBadge = document.createElement('span');
   replyBadge.className = 'bg-purple-600 text-white text-xs font-semibold px-3 py-1 rounded-full flex items-center ml-2 cursor-default';
   replyBadge.innerHTML = `<i class="fas fa-comment-dots mr-2"></i> ${replyCount} Balasan`;
   replyBadge.title = `${replyCount} Balasan`;


   btnGroup.appendChild(likeBtn);
   btnGroup.appendChild(replyBtn);
   
   if (replyCount > 0) {
       btnGroup.appendChild(replyBadge);
   }

   footer.appendChild(btnGroup);
   body.appendChild(footer);

   // Container balasan
   const repliesContainer = document.createElement('div');
   repliesContainer.id = `replies-container-${comment.key}`;
   repliesContainer.className = 'mt-4 pl-4 border-l-4 border-blue-500 hidden';
   body.appendChild(repliesContainer);

   // Form balasan
   const replyForm = document.createElement('form');
   replyForm.id = `reply-form-${comment.key}`;
   replyForm.className = 'mt-4 pt-3 border-t border-gray-700 hidden'; 
   replyForm.onsubmit = (e) => submitReply(e, comment.key);

   const textareaDiv = createSafeElement('div', 'mb-2'); 
   const textarea = document.createElement('textarea');
   textarea.id = `reply-input-${comment.key}`;
   textarea.className = 'w-full p-3 text-sm border border-gray-600 rounded-lg bg-gray-700 text-white placeholder-gray-400 focus:ring-blue-500 focus:border-blue-500'; 
   textarea.rows = 2;
   textarea.placeholder = 'Tulis balasan Anda di sini...'; 
   textareaDiv.appendChild(textarea);

   const sendBtn = createSafeElement('button', 'bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-4 text-sm rounded-lg transition duration-200 float-right', 'Kirim Balasan'); 
   sendBtn.type = 'submit';

   replyForm.appendChild(textareaDiv);
   replyForm.appendChild(sendBtn);

   const clearDiv = createSafeElement('div', 'clearfix');
   replyForm.appendChild(clearDiv);

   body.appendChild(replyForm);
   commentElement.appendChild(body);

   return commentElement;
}

// Ambil komentar (LOGIC TIDAK BERUBAH)
function fetchComments() {
   commentsRef.on('value', (snapshot) => {
     const container = document.getElementById('comments-container');
     const readMoreBtn = document.getElementById('read-more-btn');
     container.innerHTML = '';

     const allComments = [];
     snapshot.forEach((childSnapshot) => {
       allComments.unshift({ key: childSnapshot.key, ...childSnapshot.val() });
     });

     const displayCount = 5;
     const toDisplay = allComments.slice(0, displayCount);

     toDisplay.forEach((comment) => {
       container.appendChild(renderComment(comment));
     });

     if (allComments.length > displayCount) {
       readMoreBtn.style.display = 'block';
       readMoreBtn.className = 'w-full bg-gray-700 text-blue-400 hover:bg-gray-600 p-3 rounded-xl font-semibold transition duration-200 mt-4';
       readMoreBtn.innerHTML = `<i class="fas fa-chevron-down mr-2"></i> Tampilkan ${allComments.length - displayCount} Komentar Lainnya`;
       window.remainingComments = allComments.slice(displayCount);
     } else {
       readMoreBtn.style.display = 'none';
     }
   });
}

// Tampilkan semua komentar (LOGIC TIDAK BERUBAH)
function showAllComments() {
   const container = document.getElementById('comments-container');
   const readMoreBtn = document.getElementById('read-more-btn');

   if (!window.remainingComments) return;

   window.remainingComments.forEach((comment) => {
     container.appendChild(renderComment(comment));
   });

   readMoreBtn.style.display = 'none';
}

window.onload = () => fetchComments();