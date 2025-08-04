// Your web app's Firebase configuration
    var firebaseConfig = {
      apiKey: "AIzaSyCxgwhRJeRailX_oDGp6XrqIAsD6wVilU8",
      authDomain: "userbc-d8204.firebaseapp.com",
      projectId: "userbc-d8204",
      storageBucket: "userbc-d8204.appspot.com",
      messagingSenderId: "941116930960",
      appId: "1:941116930960:web:71d002aabbbedf45a21115",
      measurementId: "G-JQ0SDKH6MT"
    };
    // Initialize Firebase
    // Initialize Firebase
    firebase.initializeApp(firebaseConfig);
    var database = firebase.database();

    // Reference to comments in Firebase
    var commentsRef = database.ref('comments');
    
    // Submit comment form
    document.getElementById('comment-form').addEventListener('submit', function(event) {
      event.preventDefault();
      var comment = document.getElementById('comment').value;

      // Check if user is logged in
      var user = firebase.auth().currentUser;
      if (user) {
        // User is logged in, submit comment
        var newCommentRef = commentsRef.push();
        newCommentRef.set({
          username: user.email,
          comment: comment,
          timestamp: new Date().toISOString(),
          likes: 0,
          usersLiked: {},
          replies: {}
        }).then(() => {
          // Clear comment form
          document.getElementById('comment').value = '';
          // Fetch and display comments
          fetchComments();
        }).catch((error) => {
          console.error('Error writing new message to Firebase Database', error);
        });
      } else {
        // User is not logged in, redirect to login page
        window.location.href = 'login.html';
      }
    });

    // Function to handle like

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

  function toggleReplies(commentId) {
    const repliesContainer = document.getElementById(`replies-container-${commentId}`);
    const replyForm = document.getElementById(`reply-form-${commentId}`);
    repliesContainer.classList.toggle('d-none');
    replyForm.classList.toggle('d-none');
    fetchReplies(commentId);
  }

  function submitReply(event, commentId) {
    event.preventDefault();
    const reply = document.getElementById(`reply-input-${commentId}`).value;
    const user = firebase.auth().currentUser;

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
        fetchReplies(commentId);
      });
    } else {
      window.location.href = 'login.html';
    }
  }

  function fetchReplies(commentId) {
    const repliesContainer = document.getElementById(`replies-container-${commentId}`);
    commentsRef.child(commentId).child('replies').on('value', (snapshot) => {
      repliesContainer.innerHTML = '';

      snapshot.forEach((childSnapshot) => {
        const reply = childSnapshot.val();
        const user = firebase.auth().currentUser;
        const liked = user && reply.usersLiked && reply.usersLiked[user.uid];

        const replyElement = document.createElement('div');
        replyElement.className = 'card card-body bg-dark text-light mb-2 ';
        replyElement.innerHTML = `
          <div class="d-flex justify-content-between align-items-center">
            <div>
              <strong class="text-success">${reply.username}</strong>
              <p class="mb-1 small">${reply.comment}</p>
              <small class="text-muted">${new Date(reply.timestamp).toLocaleString()}</small>
            </div>
            <div class="text-end">
              <button class="btn btn-sm btn-outline-primary ${liked ? 'active' : ''}" onclick="handleLike('${childSnapshot.key}', true, '${commentId}')">
                <i class="fa fa-thumbs-up"></i> ${reply.likes || 0}
              </button>
            </div>
          </div>
        `;
        repliesContainer.appendChild(replyElement);
      });
    });
  }

 function fetchComments() {
  commentsRef.on('value', (snapshot) => {
    const container = document.getElementById('comments-container');
    const readMoreBtn = document.getElementById('read-more-btn');
    container.innerHTML = '';

    const allComments = [];
    snapshot.forEach((childSnapshot) => {
      allComments.unshift({ key: childSnapshot.key, ...childSnapshot.val() }); // newest first
    });

    const displayCount = 5;
    const toDisplay = allComments.slice(0, displayCount);

    toDisplay.forEach((comment) => {
      const user = firebase.auth().currentUser;
      const liked = user && comment.usersLiked && comment.usersLiked[user.uid];

      const commentElement = document.createElement('div');
      commentElement.className = 'card mb-3 bg-dark text-light';
      commentElement.id = `comment-${comment.key}`;
      commentElement.innerHTML = `
        <div class="card-body">
          <h6 class="text-success">${comment.username}</h6>
          <p class="card-text small">${comment.comment}</p>
          <div class="d-flex justify-content-between align-items-center">
            <small class="text-muted">${new Date(comment.timestamp).toLocaleString()}</small>
            <div class="btn-group btn-group-sm" role="group">
              <button class="btn btn-outline-primary ${liked ? 'active' : ''}" onclick="handleLike('${comment.key}', false)">
                <i class="fa fa-thumbs-up"></i> ${comment.likes || 0}
              </button>
              <button class="btn btn-outline-secondary" onclick="toggleReplies('${comment.key}')">
                <i class="fa fa-reply"></i> Balas
              </button>
            </div>
          </div>

          <div id="replies-container-${comment.key}" class="mt-3 d-none"></div>

          <form id="reply-form-${comment.key}" class="mt-2 d-none" onsubmit="submitReply(event, '${comment.key}')">
            <div class="mb-2">
              <textarea id="reply-input-${comment.key}" class="form-control form-control-sm" rows="2" placeholder="Tulis balasan..."></textarea>
            </div>
            <button type="submit" class="btn btn-sm btn-success">Kirim</button>
          </form>
        </div>
      `;
      container.appendChild(commentElement);
    });

    // Tampilkan tombol read more hanya jika komentar lebih dari 5
    if (allComments.length > displayCount) {
      readMoreBtn.style.display = 'block';

      // Simpan semua komentar jika nanti ingin tampilkan semuanya saat tombol diklik
      window.remainingComments = allComments.slice(displayCount);
    } else {
      readMoreBtn.style.display = 'none';
    }
  });
}

function showAllComments() {
  const container = document.getElementById('comments-container');
  const readMoreBtn = document.getElementById('read-more-btn');
  
  if (!window.remainingComments) return;

  window.remainingComments.forEach((comment) => {
    const user = firebase.auth().currentUser;
    const liked = user && comment.usersLiked && comment.usersLiked[user.uid];

    const commentElement = document.createElement('div');
    commentElement.className = 'card mb-3 bg-dark text-light';
    commentElement.id = `comment-${comment.key}`;
    commentElement.innerHTML = `
      <div class="card-body">
        <h6 class="text-success">${comment.username}</h6>
        <p class="card-text small">${comment.comment}</p>
        <div class="d-flex justify-content-between align-items-center">
          <small class="text-muted">${new Date(comment.timestamp).toLocaleString()}</small>
          <div class="btn-group btn-group-sm" role="group">
            <button class="btn btn-outline-primary ${liked ? 'active' : ''}" onclick="handleLike('${comment.key}', false)">
              <i class="fa fa-thumbs-up"></i> ${comment.likes || 0}
            </button>
            <button class="btn btn-outline-secondary" onclick="toggleReplies('${comment.key}')">
              <i class="fa fa-reply"></i> Balas
            </button>
          </div>
        </div>

        <div id="replies-container-${comment.key}" class="mt-3 d-none"></div>

        <form id="reply-form-${comment.key}" class="mt-2 d-none" onsubmit="submitReply(event, '${comment.key}')">
          <div class="mb-2">
            <textarea id="reply-input-${comment.key}" class="form-control form-control-sm" rows="2" placeholder="Tulis balasan..."></textarea>
          </div>
          <button type="submit" class="btn btn-sm btn-success">Kirim</button>
        </form>
      </div>
    `;
    container.appendChild(commentElement);
  });

  readMoreBtn.style.display = 'none';
}

window.onload = () => fetchComments();
