
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
  firebase.initializeApp(firebaseConfig);
  var database = firebase.database();
  var commentsRef = database.ref('comments');

  // Utility: buat elemen aman dari XSS
  function createSafeElement(tag, className, text) {
    const el = document.createElement(tag);
    if (className) el.className = className;
    if (text !== undefined) el.textContent = text;
    return el;
  }

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
    repliesContainer.classList.toggle('d-none');
    replyForm.classList.toggle('d-none');
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
        fetchReplies(commentId);
      });
    } else {
      window.location.href = 'login.html';
    }
  }

  // Ambil balasan
  function fetchReplies(commentId) {
    const repliesContainer = document.getElementById(`replies-container-${commentId}`);
    commentsRef.child(commentId).child('replies').on('value', (snapshot) => {
      repliesContainer.innerHTML = '';

      snapshot.forEach((childSnapshot) => {
        const reply = childSnapshot.val();
        const user = firebase.auth().currentUser;
        const liked = user && reply.usersLiked && reply.usersLiked[user.uid];

        const replyElement = createSafeElement('div', 'card card-body bg-dark text-light mb-2');
        const header = createSafeElement('div', 'd-flex justify-content-between align-items-center');

        const left = document.createElement('div');
        left.appendChild(createSafeElement('strong', 'text-success', reply.username));
        left.appendChild(createSafeElement('p', 'mb-1 small', reply.comment));
        left.appendChild(createSafeElement('small', 'text-muted', new Date(reply.timestamp).toLocaleString()));

        const right = createSafeElement('div', 'text-end');
        const likeBtn = document.createElement('button');
        likeBtn.className = `btn btn-sm btn-outline-primary ${liked ? 'active' : ''}`;
        likeBtn.innerHTML = `<i class="fa fa-thumbs-up"></i> ${reply.likes || 0}`;
        likeBtn.onclick = () => handleLike(childSnapshot.key, true, commentId);
        right.appendChild(likeBtn);

        header.appendChild(left);
        header.appendChild(right);
        replyElement.appendChild(header);

        repliesContainer.appendChild(replyElement);
      });
    });
  }

  // Render komentar utama
  function renderComment(comment) {
    const user = firebase.auth().currentUser;
    const liked = user && comment.usersLiked && comment.usersLiked[user.uid];

    const commentElement = createSafeElement('div', 'card mb-3 bg-dark text-light');
    commentElement.id = `comment-${comment.key}`;

    const body = createSafeElement('div', 'card-body');
    body.appendChild(createSafeElement('h6', 'text-success', comment.username));
    body.appendChild(createSafeElement('p', 'card-text small', comment.comment));

    const footer = createSafeElement('div', 'd-flex justify-content-between align-items-center');
    footer.appendChild(createSafeElement('small', 'text-muted', new Date(comment.timestamp).toLocaleString()));

    const btnGroup = createSafeElement('div', 'btn-group btn-group-sm');
    const likeBtn = document.createElement('button');
    likeBtn.className = `btn btn-outline-primary ${liked ? 'active' : ''}`;
    likeBtn.innerHTML = `<i class="fa fa-thumbs-up"></i> ${comment.likes || 0}`;
    likeBtn.onclick = () => handleLike(comment.key, false);

    const replyBtn = document.createElement('button');
    replyBtn.className = 'btn btn-outline-secondary';
    replyBtn.innerHTML = `<i class="fa fa-reply"></i> Balas`;
    replyBtn.onclick = () => toggleReplies(comment.key);

    btnGroup.appendChild(likeBtn);
    btnGroup.appendChild(replyBtn);
    footer.appendChild(btnGroup);

    body.appendChild(footer);

    // Container balasan
    const repliesContainer = document.createElement('div');
    repliesContainer.id = `replies-container-${comment.key}`;
    repliesContainer.className = 'mt-3 d-none';
    body.appendChild(repliesContainer);

    // Form balasan
    const replyForm = document.createElement('form');
    replyForm.id = `reply-form-${comment.key}`;
    replyForm.className = 'mt-2 d-none';
    replyForm.onsubmit = (e) => submitReply(e, comment.key);

    const textareaDiv = createSafeElement('div', 'mb-2');
    const textarea = document.createElement('textarea');
    textarea.id = `reply-input-${comment.key}`;
    textarea.className = 'form-control form-control-sm';
    textarea.rows = 2;
    textarea.placeholder = 'Tulis balasan...';
    textareaDiv.appendChild(textarea);

    const sendBtn = createSafeElement('button', 'btn btn-sm btn-success', 'Kirim');
    sendBtn.type = 'submit';

    replyForm.appendChild(textareaDiv);
    replyForm.appendChild(sendBtn);

    body.appendChild(replyForm);
    commentElement.appendChild(body);

    return commentElement;
  }

  // Ambil komentar
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
        window.remainingComments = allComments.slice(displayCount);
      } else {
        readMoreBtn.style.display = 'none';
      }
    });
  }

  // Tampilkan semua komentar
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