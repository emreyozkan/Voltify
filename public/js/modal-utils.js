window.showConfirmModal = (title, message, onConfirm) => {
    const modal = document.getElementById('custom-confirm-modal');
    const titleEl = document.getElementById('modal-title');
    const messageEl = document.getElementById('modal-message');
    const confirmBtn = document.getElementById('modal-confirm-btn');
    const cancelBtn = document.getElementById('modal-cancel-btn');

    if (!modal) {
        console.error('Modal element not found');
        return;
    }

    titleEl.textContent = title;
    messageEl.textContent = message;

    // Remove old listeners to prevent stacking
    const newConfirmBtn = confirmBtn.cloneNode(true);
    confirmBtn.parentNode.replaceChild(newConfirmBtn, confirmBtn);

    const newCancelBtn = cancelBtn.cloneNode(true);
    cancelBtn.parentNode.replaceChild(newCancelBtn, cancelBtn);

    newConfirmBtn.addEventListener('click', () => {
        onConfirm();
        closeModal();
    });

    newCancelBtn.addEventListener('click', closeModal);

    modal.style.display = 'flex';
    // Trigger reflow
    void modal.offsetWidth;
    modal.classList.add('show');

    function closeModal() {
        modal.classList.remove('show');
        setTimeout(() => modal.style.display = 'none', 300);
    }

    // Close on outside click
    modal.onclick = (e) => {
        if (e.target === modal) closeModal();
    };
};
