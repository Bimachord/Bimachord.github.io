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
      var user = firebase.auth().currentUser;
      if (user) {
        var commentRef = isReply ? commentsRef.child(parentId).child('replies').child(commentId) : commentsRef.child(commentId);
        commentRef.once('value', (snapshot) => {
          var commentData = snapshot.val();
          var updates = {};
          if (!commentData.usersLiked || !commentData.usersLiked[user.uid]) {
            // User hasn't liked this comment yet
            updates['/likes'] = (commentData.likes || 0) + 1;
            updates[`/usersLiked/${user.uid}`] = true;
          } else {
            // User has liked this comment, remove like
            updates['/likes'] = (commentData.likes || 0) - 1;
            updates[`/usersLiked/${user.uid}`] = null;
          }
          commentRef.update(updates);
        });
      } else {
        // User is not logged in, redirect to login page
        window.location.href = 'login.html';
      }
    }

    // Function to handle reply toggle
    function toggleReplies(commentId) {
      var repliesContainer = document.getElementById(`replies-container-${commentId}`);
      var replyForm = document.getElementById(`reply-form-${commentId}`);
      if (repliesContainer.style.display === 'none' || repliesContainer.style.display === '') {
        repliesContainer.style.display = 'block';
        replyForm.style.display = 'block';
        fetchReplies(commentId); // Fetch replies when replies are displayed
      } else {
        repliesContainer.style.display = 'none';
        replyForm.style.display = 'none';
      }
    }

    // Function to submit reply
    function submitReply(event, commentId) {
      event.preventDefault();
      var reply = document.getElementById(`reply-input-${commentId}`).value;
      var user = firebase.auth().currentUser;
      if (user) {
        var replyData = {
          username: user.email,
          comment: reply,
          timestamp: new Date().toISOString(),
          likes: 0,
          usersLiked: {}
        };
        var repliesRef = commentsRef.child(commentId).child('replies').push();
        repliesRef.set(replyData).then(() => {
          document.getElementById(`reply-input-${commentId}`).value = '';
          fetchReplies(commentId); // Fetch replies after submitting reply
        }).catch((error) => {
          console.error('Error writing new reply to Firebase Database', error);
        });
      } else {
        window.location.href = 'login.html';
      }
    }

    // Fetch replies
    function fetchReplies(commentId) {
      var repliesContainer = document.getElementById(`replies-container-${commentId}`);
      commentsRef.child(commentId).child('replies').on('value', (snapshot) => {
        var replyCount = snapshot.numChildren();
        repliesContainer.innerHTML = ''; // Clear previous replies
        snapshot.forEach((childSnapshot) => {
          var replyData = childSnapshot.val();
          var replyElement = document.createElement('div');
          replyElement.className = 'reply-box';
          var user = firebase.auth().currentUser;
          var liked = user && replyData.usersLiked && replyData.usersLiked[user.uid];
          replyElement.innerHTML = `
            <strong style="color:  #00ff00;">${replyData.username}</strong>
            <p>${replyData.comment}</p>
            <small>${new Date(replyData.timestamp).toLocaleString()}</small>
            <div>
              <button class="like-btn ${liked ? 'liked' : ''}" onclick="handleLike('${childSnapshot.key}', true, '${commentId}')">
                <i class="fa fa-thumbs-up"></i>
              </button>
              <span>${replyData.likes || 0}</span>
            </div>
          `;
          repliesContainer.appendChild(replyElement);
        });
      });
    }

    // Fetch and display comments
    function fetchComments() {
      commentsRef.on('value', (snapshot) => {
        var commentsContainer = document.getElementById('comments-container');
        commentsContainer.innerHTML = '';
        snapshot.forEach((childSnapshot) => {
          var commentData = childSnapshot.val();
          var commentElement = document.createElement('div');
          commentElement.id = `comment-${childSnapshot.key}`;
          commentElement.className = 'comment-box';
          var user = firebase.auth().currentUser;
          var liked = user && commentData.usersLiked && commentData.usersLiked[user.uid];
          commentElement.innerHTML = `
            <strong style="color:  #00ff00;">${commentData.username}</strong>
            <p>${commentData.comment}</p>
            <small>${new Date(commentData.timestamp).toLocaleString()}</small>
            <div>
              <button class="like-btn ${liked ? 'liked' : ''}" onclick="handleLike('${childSnapshot.key}', false)">
                <i class="fa fa-thumbs-up"></i>
              </button>
              <span>${commentData.likes || 0}</span>
              <button class="reply-btn" onclick="toggleReplies('${childSnapshot.key}')">
                <i class="fas fa-comment"></i>
              </button>
              <span class="reply-count">${commentData.replies ? Object.keys(commentData.replies).length : 0} replies</span>
            </div>
            <div id="replies-container-${childSnapshot.key}" class="replies-container"></div>
            <form id="reply-form-${childSnapshot.key}" class="reply-form" onsubmit="submitReply(event, '${childSnapshot.key}')">
              <textarea class="form-control" id="reply-input-${childSnapshot.key}" rows="2" placeholder="Enter your reply"></textarea>
              <button type="submit" class="btn btn-primary mt-2">Submit</button>
            </form>
          `;
          commentsContainer.appendChild(commentElement);

          // Display initial replies if form is already open
          var repliesContainer = document.getElementById(`replies-container-${childSnapshot.key}`);
          if (repliesContainer.style.display === 'block') {
            fetchReplies(childSnapshot.key);
          }
        });
      });
    }

    // Fetch comments when the page loads
    window.onload = function() {
      fetchComments();
    };