document.addEventListener('DOMContentLoaded', async () => {
    const user = getUser();
    if (!user) {
        window.location.href = '/login';
        return;
    }

    fetchWishlist();

    async function fetchWishlist() {
        try {
            const res = await fetch('/api/wishlist', {
                headers: {
                    'Authorization': `Bearer ${user.token}`
                }
            });
            const wishlist = await res.json();

            const wishlistList = document.getElementById('wishlist-list');
            wishlistList.innerHTML = '';

            if (wishlist.length === 0) {
                wishlistList.innerHTML = '<tr><td colspan="4">Your wishlist is empty</td></tr>';
                return;
            }

            wishlist.forEach(item => {
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td><img src="${item.image}" alt="${item.name}" style="width: 50px; height: 50px; object-fit: cover; border-radius: 5px;"></td>
                    <td><a href="/product/${item._id}" style="color: var(--text-color); text-decoration: none;">${item.name}</a></td>
                    <td>€${item.price}</td>
                    <td>
                        <button class="btn btn-danger btn-sm remove-wishlist-btn" data-id="${item._id}">
                            <i class="fas fa-trash"></i>
                        </button>
                    </td>
                `;
                wishlistList.appendChild(tr);
            });

            // Add event listeners for remove buttons
            document.querySelectorAll('.remove-wishlist-btn').forEach(btn => {
                btn.addEventListener('click', async (e) => {
                    const id = e.target.closest('button').dataset.id;
                    showConfirmModal('Remove from Wishlist', 'Are you sure you want to remove this item from your wishlist?', async () => {
                        try {
                            await fetch(`/api/wishlist/${id}`, {
                                method: 'DELETE',
                                headers: {
                                    'Authorization': `Bearer ${user.token}`
                                }
                            });
                            fetchWishlist(); // Refresh list
                            showToast('Removed from wishlist', 'success');
                        } catch (error) {
                            console.error(error);
                            showToast('Error removing from wishlist', 'danger');
                        }
                    });
                });
            });

        } catch (error) {
            console.error('Error fetching wishlist:', error);
        }
    }

    // Load Profile Data
    try {
        const res = await fetch('/api/users/profile', {
            headers: {
                'Authorization': `Bearer ${user.token}`
            }
        });
        const profile = await res.json();

        document.getElementById('name').value = profile.name;
        document.getElementById('email').value = profile.email;

        if (profile.contactInfo) {
            document.getElementById('fullName').value = profile.contactInfo.fullName || '';
            document.getElementById('contactEmail').value = profile.email || ''; // Default to main email
            document.getElementById('phone').value = profile.contactInfo.phone || '';
        }

        if (profile.shippingAddress) {
            document.getElementById('country').value = profile.shippingAddress.country || '';
            document.getElementById('postcode').value = profile.shippingAddress.postcode || '';
            document.getElementById('city').value = profile.shippingAddress.city || '';
            document.getElementById('address').value = profile.shippingAddress.address || '';
        }
    } catch (error) {
        console.error('Error fetching profile:', error);
    }

    // Update Main Profile
    document.getElementById('profile-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const name = document.getElementById('name').value;
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        updateProfile({ name, email, password });
    });

    // Update Contact Info
    document.getElementById('contact-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const contactInfo = {
            fullName: document.getElementById('fullName').value,
            phone: document.getElementById('phone').value
        };
        updateProfile({ contactInfo });
    });

    // Update Address
    document.getElementById('address-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const shippingAddress = {
            country: document.getElementById('country').value,
            postcode: document.getElementById('postcode').value,
            city: document.getElementById('city').value,
            address: document.getElementById('address').value
        };
        updateProfile({ shippingAddress });
    });

    // Delete Account
    const deleteBtn = document.getElementById('delete-account-btn');
    if (deleteBtn) {
        deleteBtn.addEventListener('click', () => {
            showConfirmModal('Delete Account', 'Are you sure you want to delete your account? This action cannot be undone.', async () => {
                try {
                    const res = await fetch('/api/users/profile', {
                        method: 'DELETE',
                        headers: {
                            'Authorization': `Bearer ${user.token}`
                        }
                    });

                    if (res.ok) {
                        localStorage.removeItem('userInfo');
                        showToast('Account deleted', 'success');
                        setTimeout(() => window.location.href = '/login', 1000);
                    } else {
                        const data = await res.json();
                        showToast(data.message || 'Failed to delete account', 'danger');
                    }
                } catch (error) {
                    console.error(error);
                    showToast('Error deleting account', 'danger');
                }
            });
        });
    }

    async function updateProfile(data) {
        try {
            const res = await fetch('/api/users/profile', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${user.token}`
                },
                body: JSON.stringify(data)
            });

            const updatedUser = await res.json();

            if (res.ok) {
                // Update local storage with basic info if changed
                if (data.name || data.email) {
                    const currentUser = JSON.parse(localStorage.getItem('userInfo'));
                    currentUser.name = updatedUser.name;
                    currentUser.email = updatedUser.email;
                    localStorage.setItem('userInfo', JSON.stringify(currentUser));
                }
                showToast('Profile updated', 'success');
            } else {
                showToast(updatedUser.message || 'Update failed', 'danger');
            }
        } catch (error) {
            console.error(error);
            showToast('Error updating profile', 'danger');
        }
    }

    // Load Orders
    const orderList = document.getElementById('order-list');
    try {
        const res = await fetch('/api/orders/myorders', {
            headers: {
                'Authorization': `Bearer ${user.token}`
            }
        });
        const orders = await res.json();

        if (orders.length === 0) {
            orderList.innerHTML = '<p>No orders found</p>';
        } else {
            orderList.innerHTML = orders.map(order => `
                <div style="border-bottom: 1px solid #ccc; padding: 10px 0;">
                    <p><strong>Order ID:</strong> ${order._id}</p>
                    <p><strong>Date:</strong> ${new Date(order.createdAt).toLocaleDateString()}</p>
                    <p><strong>Total:</strong> €${order.totalPrice}</p>
                    <p><strong>Paid:</strong> ${order.isPaid ? 'Yes' : 'No'}</p>
                    <p><strong>Delivered:</strong> ${order.isDelivered ? 'Yes' : 'No'}</p>
                </div>
            `).join('');
        }
    } catch (error) {
        console.error(error);
        orderList.innerHTML = '<p>Error loading orders</p>';
    }
});
