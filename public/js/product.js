// Add to Cart function (Global scope for onclick)
async function addToCart(id) {
    const user = getUser();
    const qty = document.getElementById('qty') ? document.getElementById('qty').value : 1;

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
                qty: Number(qty)
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
