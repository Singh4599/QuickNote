document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const notesContainer = document.getElementById('notesContainer');
    const noteModal = document.getElementById('noteModal');
    const openModalBtn = document.getElementById('newNoteBtn');
    const closeModalBtn = document.getElementById('closeModal');
    const cancelNoteBtn = document.getElementById('cancelNote');
    const saveNoteBtn = document.getElementById('saveNote');
    const noteTitleInput = document.getElementById('noteTitle');
    const noteContentInput = document.getElementById('noteContent');
    const searchInput = document.getElementById('searchInput');
    const clearSearchBtn = document.getElementById('clearSearch');
    const noteCountEl = document.getElementById('noteCount');
    const titleCounter = document.getElementById('titleCounter');
    const contentCounter = document.getElementById('contentCounter');
    const favoriteBtn = document.getElementById('favoriteBtn');
    const notificationContainer = document.getElementById('notificationContainer');
    const sortSelect = document.getElementById('sortSelect');
    const filterButtons = document.querySelectorAll('.filter-btn');
    const viewButtons = document.querySelectorAll('.view-btn');
    
    // State variables
    let notes = JSON.parse(localStorage.getItem('notes')) || [];
    let currentNoteId = null;
    let isEditing = false;
    let currentFilter = 'all';
    let currentView = 'grid';
    let currentSort = 'date';
    
    // Initialize app
    loadTheme();
    displayNotes();
    updateNoteCount();
    setupEventListeners();


    // Event Listeners Setup
    function setupEventListeners() {
        // Modal events
        openModalBtn.addEventListener('click', () => openModal());
        closeModalBtn.addEventListener('click', closeModal);
        cancelNoteBtn.addEventListener('click', closeModal);
        saveNoteBtn.addEventListener('click', saveNote);
        
        // Search events
        searchInput.addEventListener('input', handleSearch);
        clearSearchBtn.addEventListener('click', clearSearch);
        
        // Theme toggle
        const themeToggle = document.getElementById('themeToggle');
        themeToggle.addEventListener('click', toggleTheme);
        
        // Character counters
        noteTitleInput.addEventListener('input', updateTitleCounter);
        noteContentInput.addEventListener('input', updateContentCounter);
        
        // Favorite button
        favoriteBtn.addEventListener('click', toggleFavorite);
        
        // Sort and filter
        sortSelect.addEventListener('change', handleSort);
        filterButtons.forEach(btn => {
            btn.addEventListener('click', () => handleFilter(btn.dataset.filter));
        });
        
        // View buttons
        viewButtons.forEach(btn => {
            btn.addEventListener('click', () => handleViewChange(btn.dataset.view));
        });
        
        // Close modal when clicking outside
        noteModal.addEventListener('click', (e) => {
            if (e.target === noteModal) {
                closeModal();
            }
        });
        
        // Keyboard shortcuts
        document.addEventListener('keydown', handleKeyboardShortcuts);
    }

    // Modal Functions
    function openModal(noteId = null) {
        currentNoteId = noteId;
        isEditing = !!noteId;
        
        if (isEditing) {
            const note = notes.find(n => n.id === noteId);
            noteTitleInput.value = note.title;
            noteContentInput.value = note.content;
            document.getElementById('modalTitle').textContent = 'Edit Note';
            favoriteBtn.classList.toggle('active', note.favorite);
        } else {
            noteTitleInput.value = '';
            noteContentInput.value = '';
            document.getElementById('modalTitle').textContent = 'Create New Note';
            favoriteBtn.classList.remove('active');
        }
        
        updateTitleCounter();
        updateContentCounter();
        updateNoteDateTime();
        
        noteModal.classList.add('show');
        noteModal.style.display = 'flex';
        
        // Focus on title input with a small delay for animation
        setTimeout(() => {
            noteTitleInput.focus();
        }, 100);
    }

    function closeModal() {
        noteModal.classList.remove('show');
        setTimeout(() => {
            noteModal.style.display = 'none';
        }, 200);
        
        currentNoteId = null;
        isEditing = false;
        
        // Reset form
        noteTitleInput.value = '';
        noteContentInput.value = '';
        favoriteBtn.classList.remove('active');
    }


    function saveNote() {
        const title = noteTitleInput.value.trim();
        const content = noteContentInput.value.trim();
        
        if (!title) {
            showNotification('Please enter a title for your note', 'error');
            noteTitleInput.focus();
            return;
        }
        
        const now = new Date();
        const note = {
            id: isEditing ? currentNoteId : Date.now().toString(),
            title,
            content,
            date: now.toISOString(),
            favorite: favoriteBtn.classList.contains('active'),
            createdAt: isEditing ? notes.find(n => n.id === currentNoteId)?.createdAt || now.toISOString() : now.toISOString(),
            updatedAt: now.toISOString()
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
        updateNoteCount();
        closeModal();
        
        showNotification(
            isEditing ? 'Note updated successfully!' : 'Note created successfully!',
            'success'
        );
    }


    function deleteNote(noteId) {
        const note = notes.find(n => n.id === noteId);
        if (!note) return;
        
        if (confirm(`Are you sure you want to delete "${note.title}"?`)) {
            notes = notes.filter(note => note.id !== noteId);
            saveNotes();
            displayNotes();
            updateNoteCount();
            showNotification('Note deleted successfully!', 'success');
        }
    }
    
    function toggleNoteFavorite(noteId) {
        const note = notes.find(n => n.id === noteId);
        if (note) {
            note.favorite = !note.favorite;
            note.updatedAt = new Date().toISOString();
            saveNotes();
            displayNotes();
            showNotification(
                note.favorite ? 'Added to favorites!' : 'Removed from favorites!',
                'info'
            );
        }
    }


    // Display and Filtering Functions
    function displayNotes() {
        let filteredNotes = getFilteredNotes();
        
        if (filteredNotes.length === 0) {
            showEmptyState();
            return;
        }
        
        // Apply current view
        notesContainer.className = `notes-container ${currentView}-view`;
        
        // Clear container
        notesContainer.innerHTML = '';
        
        // Add notes with staggered animation
        filteredNotes.forEach((note, index) => {
            setTimeout(() => {
                const noteElement = createNoteElement(note, index);
                notesContainer.appendChild(noteElement);
            }, index * 50);
        });
    }
    
    function getFilteredNotes() {
        let filtered = [...notes];
        
        // Apply search filter
        const searchTerm = searchInput.value.toLowerCase().trim();
        if (searchTerm) {
            filtered = filtered.filter(note => 
                note.title.toLowerCase().includes(searchTerm) || 
                note.content.toLowerCase().includes(searchTerm)
            );
        }
        
        // Apply category filter
        switch (currentFilter) {
            case 'recent':
                const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
                filtered = filtered.filter(note => new Date(note.updatedAt) > weekAgo);
                break;
            case 'favorites':
                filtered = filtered.filter(note => note.favorite);
                break;
        }
        
        // Apply sorting
        switch (currentSort) {
            case 'title':
                filtered.sort((a, b) => a.title.localeCompare(b.title));
                break;
            case 'content':
                filtered.sort((a, b) => a.content.localeCompare(b.content));
                break;
            case 'date':
            default:
                filtered.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
                break;
        }
        
        return filtered;
    }


    function createNoteElement(note, index) {
        const noteElement = document.createElement('div');
        noteElement.className = `note-card ${currentView}-view`;
        noteElement.style.animationDelay = `${index * 0.05}s`;
        
        const noteDate = formatDate(note.updatedAt || note.date);
        const truncatedContent = truncateText(escapeHtml(note.content), 200);
        const highlightedTitle = highlightSearchTerm(escapeHtml(note.title));
        const highlightedContent = highlightSearchTerm(truncatedContent);
        
        noteElement.innerHTML = `
            <div class="note-header">
                <div class="note-title">${highlightedTitle}</div>
                <div class="note-actions">
                    <button class="note-action-btn favorite ${note.favorite ? 'active' : ''}" 
                            onclick="event.stopPropagation(); toggleNoteFavorite('${note.id}')" 
                            title="${note.favorite ? 'Remove from favorites' : 'Add to favorites'}">
                        <i class="${note.favorite ? 'fas' : 'far'} fa-star"></i>
                    </button>
                    <button class="note-action-btn edit" 
                            onclick="event.stopPropagation(); openNoteForEdit('${note.id}')" 
                            title="Edit note">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="note-action-btn delete" 
                            onclick="event.stopPropagation(); deleteNoteById('${note.id}')" 
                            title="Delete note">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
            
            <div class="note-content" onclick="openNoteForEdit('${note.id}')">
                ${highlightedContent}
            </div>
            
            <div class="note-footer">
                <div class="note-date">
                    <i class="fas fa-clock"></i>
                    ${noteDate}
                </div>
                ${note.favorite ? '<i class="fas fa-star favorite-indicator"></i>' : ''}
            </div>
        `;
        
        return noteElement;
    }
    
    function showEmptyState() {
        const emptyMessage = getEmptyStateMessage();
        notesContainer.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-sticky-note"></i>
                <h3>${emptyMessage.title}</h3>
                <p>${emptyMessage.description}</p>
                <button class="btn btn-primary" onclick="document.getElementById('newNoteBtn').click()">
                    <i class="fas fa-plus"></i>
                    Create Your First Note
                </button>
            </div>
        `;
    }
    
    function getEmptyStateMessage() {
        const searchTerm = searchInput.value.trim();
        
        if (searchTerm) {
            return {
                title: 'No matching notes found',
                description: `No notes match your search for "${searchTerm}". Try a different search term.`
            };
        }
        
        switch (currentFilter) {
            case 'favorites':
                return {
                    title: 'No favorite notes yet',
                    description: 'Star some notes to see them here as favorites.'
                };
            case 'recent':
                return {
                    title: 'No recent notes',
                    description: 'Notes modified in the last 7 days will appear here.'
                };
            default:
                return {
                    title: 'No notes yet',
                    description: 'Start capturing your thoughts and ideas by creating your first note.'
                };
        }
    }


    // UI Helper Functions
    function updateNoteCount() {
        const count = notes.length;
        noteCountEl.textContent = `${count} ${count === 1 ? 'note' : 'notes'}`;
    }
    
    function updateTitleCounter() {
        const length = noteTitleInput.value.length;
        titleCounter.textContent = length;
        titleCounter.style.color = length > 90 ? 'var(--error-500)' : 'var(--text-tertiary)';
    }
    
    function updateContentCounter() {
        const length = noteContentInput.value.length;
        contentCounter.textContent = length;
    }
    
    function updateNoteDateTime() {
        const now = new Date();
        document.getElementById('noteDate').textContent = formatDate(now.toISOString(), false);
        document.getElementById('noteTime').textContent = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    
    function toggleFavorite() {
        favoriteBtn.classList.toggle('active');
        const icon = favoriteBtn.querySelector('i');
        icon.className = favoriteBtn.classList.contains('active') ? 'fas fa-star' : 'far fa-star';
    }
    
    // Search and Filter Functions
    function handleSearch() {
        displayNotes();
        clearSearchBtn.style.opacity = searchInput.value ? '1' : '0';
    }
    
    function clearSearch() {
        searchInput.value = '';
        clearSearchBtn.style.opacity = '0';
        displayNotes();
        searchInput.focus();
    }
    
    function handleFilter(filter) {
        currentFilter = filter;
        
        // Update active filter button
        filterButtons.forEach(btn => {
            btn.classList.toggle('active', btn.dataset.filter === filter);
        });
        
        displayNotes();
    }
    
    function handleSort() {
        currentSort = sortSelect.value;
        displayNotes();
    }
    
    function handleViewChange(view) {
        currentView = view;
        
        // Update active view button
        viewButtons.forEach(btn => {
            btn.classList.toggle('active', btn.dataset.view === view);
        });
        
        displayNotes();
        localStorage.setItem('noteView', view);
    }
    
    // Theme Functions
    function toggleTheme() {
        document.body.classList.toggle('dark-theme');
        const isDark = document.body.classList.contains('dark-theme');
        const themeToggle = document.getElementById('themeToggle');
        const icon = themeToggle.querySelector('i');
        
        if (isDark) {
            icon.className = 'fas fa-sun';
            localStorage.setItem('theme', 'dark');
        } else {
            icon.className = 'fas fa-moon';
            localStorage.setItem('theme', 'light');
        }
    }

    function loadTheme() {
        const savedTheme = localStorage.getItem('theme');
        const savedView = localStorage.getItem('noteView');
        
        if (savedTheme === 'dark') {
            document.body.classList.add('dark-theme');
            document.getElementById('themeToggle').querySelector('i').className = 'fas fa-sun';
        }
        
        if (savedView && ['grid', 'list', 'masonry'].includes(savedView)) {
            currentView = savedView;
            viewButtons.forEach(btn => {
                btn.classList.toggle('active', btn.dataset.view === savedView);
            });
        }
    }


    // Utility Functions
    function saveNotes() {
        localStorage.setItem('notes', JSON.stringify(notes));
    }
    
    function formatDate(dateString, includeTime = true) {
        const date = new Date(dateString);
        const now = new Date();
        const diffInHours = (now - date) / (1000 * 60 * 60);
        
        if (diffInHours < 1) {
            const diffInMinutes = Math.floor((now - date) / (1000 * 60));
            return diffInMinutes < 1 ? 'Just now' : `${diffInMinutes}m ago`;
        } else if (diffInHours < 24) {
            return `${Math.floor(diffInHours)}h ago`;
        } else if (diffInHours < 48) {
            return 'Yesterday';
        } else {
            const options = includeTime 
                ? { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }
                : { month: 'short', day: 'numeric', year: 'numeric' };
            return date.toLocaleDateString(undefined, options);
        }
    }

    function truncateText(text, maxLength) {
        if (text.length <= maxLength) return text;
        return text.substring(0, maxLength).trim() + '...';
    }

    function escapeHtml(unsafe) {
        return unsafe
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    function highlightSearchTerm(text) {
        const searchTerm = searchInput.value.trim();
        if (!searchTerm) return text;
        
        const regex = new RegExp(`(${escapeRegex(searchTerm)})`, 'gi');
        return text.replace(regex, '<span class="highlight">$1</span>');
    }
    
    function escapeRegex(string) {
        return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }


    // Notification System
    function showNotification(message, type = 'success') {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        
        const icon = getNotificationIcon(type);
        notification.innerHTML = `
            <i class="${icon}"></i>
            <span>${message}</span>
        `;
        
        notificationContainer.appendChild(notification);
        
        // Trigger animation
        requestAnimationFrame(() => {
            notification.classList.add('show');
        });
        
        // Auto remove after 4 seconds
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 4000);
    }
    
    function getNotificationIcon(type) {
        const icons = {
            success: 'fas fa-check-circle',
            error: 'fas fa-exclamation-circle',
            warning: 'fas fa-exclamation-triangle',
            info: 'fas fa-info-circle'
        };
        return icons[type] || icons.info;
    }
    
    // Keyboard Shortcuts
    function handleKeyboardShortcuts(e) {
        // Ctrl/Cmd + N for new note
        if ((e.ctrlKey || e.metaKey) && e.key === 'n' && !noteModal.classList.contains('show')) {
            e.preventDefault();
            openModal();
        }
        
        // Escape to close modal
        if (e.key === 'Escape' && noteModal.classList.contains('show')) {
            closeModal();
        }
        
        // Ctrl/Cmd + S to save note (when modal is open)
        if ((e.ctrlKey || e.metaKey) && e.key === 's' && noteModal.classList.contains('show')) {
            e.preventDefault();
            saveNote();
        }
        
        // Ctrl/Cmd + F to focus search
        if ((e.ctrlKey || e.metaKey) && e.key === 'f') {
            e.preventDefault();
            searchInput.focus();
        }
        
        // Ctrl/Cmd + D to toggle theme
        if ((e.ctrlKey || e.metaKey) && e.key === 'd') {
            e.preventDefault();
            toggleTheme();
        }
    }


    // Global functions for onclick handlers
    window.openNoteForEdit = function(noteId) {
        openModal(noteId);
    };

    window.deleteNoteById = function(noteId) {
        deleteNote(noteId);
    };
    
    window.toggleNoteFavorite = function(noteId) {
        toggleNoteFavorite(noteId);
    };
});

// Service Worker Registration (for PWA capabilities)
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
            .then(registration => {
                console.log('SW registered: ', registration);
            })
            .catch(registrationError => {
                console.log('SW registration failed: ', registrationError);
            });
    });
}
