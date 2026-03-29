const textarea = document.getElementById('comment-textarea');
const charCountEl = document.getElementById('char-count');
const postBtn = document.getElementById('post-comment');
const cancelBtn = document.getElementById('cancel-comment');
const footer = document.getElementById('comment-footer');

textarea.addEventListener('input', () => {
    // Auto-resize
    textarea.style.height = 'auto';
    textarea.style.height = textarea.scrollHeight + 'px';
    
    // Char count
    const length = textarea.value.length;
    charCountEl.textContent = length;
    
    // Enable/disable post button
    postBtn.disabled = length === 0;
    
    // Color indicator for limit
    if (length >= 260) {
        charCountEl.style.color = '#ef4444';
    } else {
        charCountEl.style.color = '';
    }
});

textarea.addEventListener('focus', () => {
    footer.classList.add('active');
});

cancelBtn.addEventListener('click', () => {
    textarea.value = '';
    textarea.style.height = 'auto';
    footer.classList.remove('active');
    textarea.blur();
});

postBtn.addEventListener('click', () => {
    if (textarea.value.trim()) {
        const originalText = postBtn.textContent;
        postBtn.textContent = 'Posting...';
        postBtn.disabled = true;
        
        setTimeout(() => {
            alert('Comment posted!');
            textarea.value = '';
            textarea.style.height = 'auto';
            postBtn.textContent = originalText;
            footer.classList.remove('active');
            textarea.blur();
        }, 1000);
    }
});
