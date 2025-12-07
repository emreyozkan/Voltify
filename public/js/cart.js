document.addEventListener('DOMContentLoaded', async () => {
    const cartItemsContainer = document.getElementById('cart-items');
    const cartCountElement = document.getElementById('cart-count');
    const cartTotalElement = document.getElementById('cart-total');
    const checkoutBtn = document.getElementById('checkout-btn');
    const user = getUser();

    if (!user) {
        window.location.href = '/login';
        return;
    }

    try {
        const res = await fetch('/api/cart', {
            headers: {
                'Authorization': `Bearer ${user.token}`
            }
        });
        const cartItems = await res.json();

        if (cartItems.length === 0) {
            cartItemsContainer.innerHTML = '<p>Your cart is empty</p>';
            if (cartCountElement) cartCountElement.innerText = '0';
            if (cartTotalElement) cartTotalElement.innerText = '0.00';
            return;
        }

        cartItemsContainer.innerHTML = cartItems.map(item => `
            <div class="card" style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 20px;">
                <div style="display: flex; align-items: center; gap: 20px;">
                    <img src="${item.image}" alt="${item.name}" style="width: 80px; height: 80px; object-fit: cover; border-radius: 8px;">
                    <div>
                        <h4>${item.name}</h4>
                        <p>€${item.price}</p>
                    </div>
                </div>
                <div style="display: flex; align-items: center; gap: 20px;">
                    <p>Qty: ${item.qty}</p>
                    <button data-id="${item.product}" class="btn btn-danger btn-remove-cart" style="background: var(--danger-color);">Remove</button>
                </div>
            </div>
        `).join('');

        // Add Event Listener for Remove Buttons
        cartItemsContainer.addEventListener('click', (e) => {
            if (e.target.classList.contains('btn-remove-cart')) {
                const id = e.target.getAttribute('data-id');
                removeFromCart(id);
            }
        });

        const totalQty = cartItems.reduce((acc, item) => acc + item.qty, 0);
        const totalPrice = cartItems.reduce((acc, item) => acc + item.price * item.qty, 0);

        if (cartCountElement) cartCountElement.innerText = totalQty;
        if (cartTotalElement) cartTotalElement.innerText = totalPrice.toFixed(2);

        if (checkoutBtn) {
            checkoutBtn.addEventListener('click', () => {
                window.location.href = '/checkout';
            });
        }

    } catch (error) {
        console.error(error);
        cartItemsContainer.innerHTML = '<p>Error loading cart</p>';
    }
});

async function removeFromCart(id) {
    const user = getUser();
    try {
        const res = await fetch(`/api/cart/${id}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${user.token}`
            }
        });

        if (res.ok) {
            location.reload();
        } else {
            alert('Failed to remove item');
        }
    } catch (error) {
        console.error(error);
        alert('Error removing item');
    }
}
window.removeFromCart = removeFromCart;
