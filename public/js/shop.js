document.addEventListener('DOMContentLoaded', () => {
    const user = getUser();
    const addProductBtn = document.getElementById('shop-add-product-btn');
    const addProductFormContainer = document.getElementById('shop-add-product-container');
    const cancelBtn = document.getElementById('shop-cancel-btn');
    const form = document.getElementById('shop-add-product-form');

    // Show "Add Product" button if user is Seller or Admin
    if (user && (user.isSeller || user.isAdmin)) {
        if (addProductBtn) addProductBtn.style.display = 'inline-flex';
        fetchCategories();
    }

    async function fetchCategories() {
        try {
            const res = await fetch('/api/products/categories');
            const categories = await res.json();
            const dataList = document.getElementById('category-list');
            if (dataList) {
                dataList.innerHTML = categories.map(c => `<option value="${c}">`).join('');
            }
        } catch (error) {
            console.error('Error fetching categories:', error);
        }
    }

    // Toggle Form
    if (addProductBtn) {
        addProductBtn.addEventListener('click', () => {
            addProductFormContainer.style.display = 'block';
            addProductBtn.style.display = 'none';
        });
    }

    // Cancel Form
    if (cancelBtn) {
        cancelBtn.addEventListener('click', () => {
            addProductFormContainer.style.display = 'none';
            addProductBtn.style.display = 'inline-flex';
            form.reset();
            document.getElementById('p-id').value = '';
        });
    }

    // Handle Image Upload
    const imageFile = document.getElementById('p-image-file');
    if (imageFile) {
        imageFile.addEventListener('change', async (e) => {
            const file = e.target.files[0];
            const formData = new FormData();
            formData.append('image', file);

            try {
                const res = await fetch('/api/upload', {
                    method: 'POST',
                    body: formData
                });
                const data = await res.text();
                document.getElementById('p-image').value = data;
            } catch (error) {
                console.error(error);
                showToast('Image upload failed', 'danger');
            }
        });
    }

    // Handle Form Submission
    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            const user = getUser(); // Re-fetch to be safe
            if (!user) return;

            const productData = {
                name: document.getElementById('p-name').value,
                price: document.getElementById('p-price').value,
                image: document.getElementById('p-image').value,
                brand: document.getElementById('p-brand').value,
                category: document.getElementById('p-category').value,
                countInStock: document.getElementById('p-countInStock').value,
                description: document.getElementById('p-description').value,
            };

            try {
                // Create logic: Create placeholder -> Update
                const createRes = await fetch('/api/products', {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${user.token}`
                    }
                });
                const newProduct = await createRes.json();

                const updateRes = await fetch(`/api/products/${newProduct._id}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${user.token}`
                    },
                    body: JSON.stringify(productData)
                });

                if (updateRes.ok) {
                    showToast('Product created successfully', 'success');
                    setTimeout(() => location.reload(), 1000);
                } else {
                    showToast('Failed to create product', 'danger');
                }
            } catch (error) {
                console.error(error);
                showToast('Error creating product', 'danger');
            }
        });
    }
});
