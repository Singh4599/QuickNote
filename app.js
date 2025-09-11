document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const notesGrid = document.getElementById('notesGrid');
    const noteModal = document.getElementById('noteModal');
    const openModalBtn = document.getElementById('newNoteBtn');
    const closeModalBtn = document.querySelector('.close-btn');
    const cancelNoteBtn = document.getElementById('cancelNote');
    const saveNoteBtn = document.getElementById('saveNote');
    const noteTitleInput = document.getElementById('noteTitle');
    const noteContentInput = document.getElementById('noteContent');
    const searchInput = document.getElementById('searchInput');
    
    let notes = JSON.parse(localStorage.getItem('notes')) || [];
    let currentNoteId = null;
    let isEditing = false;

    // Event Listeners
    openModalBtn.addEventListener('click', () => openModal());
    closeModalBtn.addEventListener('click', closeModal);
    cancelNoteBtn.addEventListener('click', closeModal);
    saveNoteBtn.addEventListener('click', saveNote);
    searchInput.addEventListener('input', filterNotes);
    
    // Theme toggle
    const themeToggle = document.getElementById('themeToggle');
    themeToggle.addEventListener('click', toggleTheme);

    // Close modal when clicking outside
    window.addEventListener('click', (e) => {
        if (e.target === noteModal) {
            closeModal();
        }
    });

    // Load notes when page loads
    loadTheme();
    displayNotes();

    // Functions
    function openModal(noteId = null) {
        currentNoteId = noteId;
        isEditing = !!noteId;
        
        if (isEditing) {
            const note = notes.find(n => n.id === noteId);
            noteTitleInput.value = note.title;
            noteContentInput.value = note.content;
            document.getElementById('modalTitle').textContent = 'Edit Note';
        } else {
            noteTitleInput.value = '';
            noteContentInput.value = '';
            document.getElementById('modalTitle').textContent = 'New Note';
        }
        
        noteModal.style.display = 'flex';
        noteTitleInput.focus();
    }

    function closeModal() {
        noteModal.style.display = 'none';
        currentNoteId = null;
        isEditing = false;
    }

    function saveNote() {
        const title = noteTitleInput.value.trim();
        const content = noteContentInput.value.trim();
        
        if (!title) {
            alert('Please enter a title for your note');
            return;
        }
        
        const now = new Date();
        const note = {
            id: isEditing ? currentNoteId : Date.now().toString(),
            title,
            content,
            date: now.toISOString()
        };
        
        if (isEditing) {
            const index = notes.findIndex(n => n.id === currentNoteId);
            if (index !== -1) {
                notes[index] = note;
            }
        } else {
            notes.unshift(note);
        }
        
        saveNotes();
        displayNotes();
        closeModal();
        showNotification(isEditing ? 'Note updated successfully!' : 'Note created successfully!');
    }

    function deleteNote(noteId) {
        if (confirm('Are you sure you want to delete this note?')) {
            notes = notes.filter(note => note.id !== noteId);
            saveNotes();
            displayNotes();
            showNotification('Note deleted successfully!', 'error');
        }
    }

    // Theme toggle function
    function toggleTheme() {
        document.body.classList.toggle('dark-theme');
        const isDark = document.body.classList.contains('dark-theme');
        const icon = themeToggle.querySelector('i');
        
        if (isDark) {
            icon.className = 'fas fa-sun';
            localStorage.setItem('theme', 'dark');
        } else {
            icon.className = 'fas fa-moon';
            localStorage.setItem('theme', 'light');
        }
    }

    // Load saved theme
    function loadTheme() {
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme === 'dark') {
            document.body.classList.add('dark-theme');
            themeToggle.querySelector('i').className = 'fas fa-sun';
        }
    }

    function displayNotes() {
        if (notes.length === 0) {
            notesGrid.innerHTML = '<div class="no-notes">No notes yet. Click "New Note" to get started!</div>';
            return;
        }
        
        // Clear grid first
        notesGrid.innerHTML = '';
        
        // Add notes with staggered animation
        notes.forEach((note, index) => {
            setTimeout(() => {
                const noteElement = document.createElement('div');
                noteElement.className = 'note-card';
                noteElement.style.animationDelay = `${index * 0.1}s`;
                noteElement.onclick = () => openNoteForEdit(note.id);
                
                noteElement.innerHTML = `
                    <div class="note-title">${escapeHtml(note.title)}</div>
                    <div class="note-content">${truncateText(escapeHtml(note.content), 150)}</div>
                    <div class="note-date">${formatDate(note.date)}</div>
                    <button class="delete-btn" onclick="event.stopPropagation(); deleteNoteById('${note.id}')">
                        <i class="fas fa-trash"></i>
                    </button>
                `;
                
                notesGrid.appendChild(noteElement);
                
                // Add ripple effect
                addRippleEffect(noteElement);
            }, index * 50);
        });
    }

    function filterNotes() {
        const searchTerm = searchInput.value.toLowerCase();
        if (!searchTerm) {
            displayNotes();
            return;
        }
        
        const filtered = notes.filter(note => 
            note.title.toLowerCase().includes(searchTerm) || 
            note.content.toLowerCase().includes(searchTerm)
        );
        
        if (filtered.length === 0) {
            notesGrid.innerHTML = '<div class="no-notes">No matching notes found.</div>';
            return;
        }
        
        notesGrid.innerHTML = filtered.map(note => `
            <div class="note-card" onclick="openNoteForEdit('${note.id}')">
                <div class="note-title">${highlightText(escapeHtml(note.title), searchTerm)}</div>
                <div class="note-content">${highlightText(truncateText(escapeHtml(note.content), 150), searchTerm)}</div>
                <div class="note-date">${formatDate(note.date)}</div>
                <button class="delete-btn" onclick="event.stopPropagation(); deleteNoteById('${note.id}')">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `).join('');
    }

    function saveNotes() {
        localStorage.setItem('notes', JSON.stringify(notes));
    }

    // Helper Functions
    function formatDate(dateString) {
        const options = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
        return new Date(dateString).toLocaleDateString(undefined, options);
    }

    function truncateText(text, maxLength) {
        return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
    }

    function escapeHtml(unsafe) {
        return unsafe
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    function highlightText(text, term) {
        if (!term) return text;
        const regex = new RegExp(`(${term})`, 'gi');
        return text.replace(regex, '<span class="highlight">$1</span>');
    }

    // Add ripple effect to elements
    function addRippleEffect(element) {
        element.addEventListener('click', function(e) {
            const ripple = document.createElement('span');
            const rect = element.getBoundingClientRect();
            const size = Math.max(rect.width, rect.height);
            const x = e.clientX - rect.left - size / 2;
            const y = e.clientY - rect.top - size / 2;
            
            ripple.style.width = ripple.style.height = size + 'px';
            ripple.style.left = x + 'px';
            ripple.style.top = y + 'px';
            ripple.classList.add('ripple');
            
            element.appendChild(ripple);
            
            setTimeout(() => {
                ripple.remove();
            }, 600);
        });
    }

    // Add notification system
    function showNotification(message, type = 'success') {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.classList.add('show');
        }, 100);
        
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }

    // Global functions for onclick handlers
    window.openNoteForEdit = function(noteId) {
        openModal(noteId);
    };

    window.deleteNoteById = function(noteId) {
        deleteNote(noteId);
    };

    // Keyboard shortcuts
    document.addEventListener('keydown', function(e) {
        // Ctrl/Cmd + N for new note
        if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
            e.preventDefault();
            openModal();
        }
        
        // Escape to close modal
        if (e.key === 'Escape' && noteModal.style.display === 'flex') {
            closeModal();
        }
        
        // Ctrl/Cmd + S to save note (when modal is open)
        if ((e.ctrlKey || e.metaKey) && e.key === 's' && noteModal.style.display === 'flex') {
            e.preventDefault();
            saveNote();
        }
    });
});
