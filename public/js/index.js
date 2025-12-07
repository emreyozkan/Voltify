document.addEventListener('DOMContentLoaded', async () => {
    const searchInput = document.getElementById('search-input');
    const searchBtn = document.getElementById('search-btn');

    // Search functionality - Redirect to server route
    searchBtn.addEventListener('click', () => {
        if (searchInput.value.trim()) {
            window.location.href = `/?keyword=${searchInput.value}`;
        } else {
            window.location.href = '/';
        }
    });

    searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            if (searchInput.value.trim()) {
                window.location.href = `/?keyword=${searchInput.value}`;
            } else {
                window.location.href = '/';
            }
        }
    });
});

// Add to Cart function (Global scope for onclick)
async function addToCart(id) {
    const user = getUser();

    if (!user) {
        window.location.href = '/login';
        return;
    }

    try {
        // Fetch product details first
        const res = await fetch(`/api/products/${id}`);
        const product = await res.json();

        const cartRes = await fetch('/api/cart', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${user.token}`
            },
            body: JSON.stringify({
                product: product._id,
                name: product.name,
                image: product.image,
                price: product.price,
                qty: 1
            })
        });

        if (cartRes.ok) {
            showToast('Added to cart', 'success');
        } else {
            showToast('Failed to add to cart', 'danger');
        }
    } catch (error) {
        console.error(error);
        showToast('Error adding to cart', 'danger');
    }
}

// Add to Cart function (Global scope for onclick)
async function addToCart(id) {
    const user = getUser();

    if (!user) {
        window.location.href = '/login';
        return;
    }

    try {
        // Fetch product details first
        const res = await fetch(`/api/products/${id}`);
        const product = await res.json();

        const cartRes = await fetch('/api/cart', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${user.token}`
            },
            body: JSON.stringify({
                product: product._id,
                name: product.name,
                image: product.image,
                price: product.price,
                qty: 1
            })
        });

        if (cartRes.ok) {
            showToast('Added to cart', 'success');
        } else {
            showToast('Failed to add to cart', 'danger');
        }
    } catch (error) {
        console.error(error);
        showToast('Error adding to cart', 'danger');
    }
}
