document.addEventListener('DOMContentLoaded', async () => {
    const user = getUser();
    if (!user || !user.isAdmin) {
        window.location.href = '/';
        return;
    }

    const userList = document.getElementById('user-list');

    try {
        const res = await fetch('/api/admin/users', {
            headers: {
                'Authorization': `Bearer ${user.token}`
            }
        });
        const users = await res.json();

        userList.innerHTML = users.map(u => `
            <tr style="border-bottom: 1px solid #eee;">
                <td>${u._id}</td>
                <td>${u.name}</td>
                <td><a href="mailto:${u.email}">${u.email}</a></td>
                <td>${u.isAdmin ? 'Yes' : 'No'}</td>
                <td>${u.isSeller ? 'Yes' : 'No'}</td>
                <td>
                    <button data-id="${u._id}" class="btn btn-danger btn-delete-user" style="background: var(--danger-color); padding: 5px 10px; font-size: 0.8rem;">Delete</button>
                </td>
            </tr>
        `).join('');

        // Event Delegation for Delete
        userList.addEventListener('click', async (e) => {
            if (e.target.classList.contains('btn-delete-user')) {
                const id = e.target.dataset.id;
                await deleteUser(id);
            }
        });

    } catch (error) {
        console.error(error);
        userList.innerHTML = '<p>Error loading users</p>';
    }
});

function deleteUser(id) {
    showConfirmModal('Delete User', 'Are you sure you want to delete this user?', async () => {
        const user = getUser();

        try {
            const res = await fetch(`/api/admin/users/${id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${user.token}`
                }
            });

            if (res.ok) {
                showToast('User deleted successfully', 'success');
                setTimeout(() => location.reload(), 1000);
            } else {
                showToast('Failed to delete user', 'danger');
            }
        } catch (error) {
            console.error(error);
            showToast('Error deleting user: ' + error.message, 'danger');
        }
    });
}
