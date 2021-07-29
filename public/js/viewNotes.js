let googleUserId;
let alphabetical = [];

window.onload = (event) => {
  // Use this to retain user state between html pages.
  firebase.auth().onAuthStateChanged(function(user) {
    if (user) {
      console.log('Logged in as: ' + user.displayName);
        googleUserId = user.uid;
      getNotes(googleUserId);
    } else {
      // If not logged in, navigate back to login page.
      window.location = 'index.html'; 
    };
  });
};

const getNotes = (userId) => {
  const notesRef = firebase.database().ref(`users/${userId}`);
  notesRef.on('value', (snapshot) => {
    const data = snapshot.val();
    renderDataAsHtml(data);
  });
};

const renderDataAsHtml = (data) => {
  let cards = ``;
  for(const noteId in data) {
    let note = data[noteId];
    // For each note create an HTML card
    // cards += createCard(note, noteId)
    note.id = noteId;
    alphabetical.push(note);
  };
     alphabetical.sort( (a, b) => (a.text > b.text) ? 1 : -1);

    for (const noteId in alphabetical) {
        cards += createCard(alphabetical[noteId], alphabetical[noteId].id);
    }
  // Inject our string of HTML into our viewNotes.html page
  document.querySelector('#app').innerHTML = cards;
};

const createCard = (note, noteId) => {
    
   return `
     <div class="column is-one-quarter">
       <div class="card">
         <header class="card-header">
           <p class="card-header-title">${note.title}</p>
         </header>
         <div class="card-content">
           <div class="content">${note.text}</div>
         </div>
         <footer class="card-footer">
            <a id="${noteId}"
            href = "#"
            class="card-footer-item"
            onclick="deleteNote('${noteId}')">
            Delete
            </a>

            <a
            href = "#"
            class="card-footer-item"
            onclick="editNote('${noteId}')">
            Edit
            </a>
    
         </footer>
       </div>
     </div>
   `;
};

function editNote(noteId) {
    const editNoteModal = document.querySelector('#editNoteModal');

    const notesRef =  firebase.database().ref(`users/${googleUserId}/${noteId}`);
    notesRef.on('value', (snapshot) => {
        const note = snapshot.val();
        document.querySelector('#editTitleInput').value = note.title;
        document.querySelector('#editTextInput').value = note.text;
        document.querySelector('#noteId').value = noteId;
    });
    editNoteModal.classList.toggle('is-active');
    // console.log('edit', noteId);
}

function deleteNote(noteId) {
    // window.confirm("Are you sure you want to delete this note?");
    if (confirm("Are you sure you want to delete this note?")) {
        firebase.database().ref(`users/${googleUserId}/${noteId}`).remove();
    } else {
        alert("ok, that note will stay");
    }
    
    
    // console.log('delete', noteId);
}

function saveEditedNote(){
    const noteTitle = document.querySelector('#editTitleInput').value;
    const noteText = document.querySelector('#editTextInput').value;
    const editedNote = {
        title: noteTitle,
        text: noteText,
    }
    const noteId = document.querySelector('#noteId').value //= noteId;
    firebase.database().ref(`users/${googleUserId}/${noteId}`).update(editedNote);
    closeEditModal();
}

function closeEditModal() {
    const editNoteModal = document.querySelector('#editNoteModal'); 
    editNoteModal.classList.toggle('is-active');
}