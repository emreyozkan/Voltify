document.addEventListener('DOMContentLoaded', async () => {
    const user = getUser();
    if (!user || (!user.isSeller && !user.isAdmin)) {
        window.location.href = '/';
        return;
    }

    fetchCategories();

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

    // Handle Image Upload
    document.getElementById('p-image-file').addEventListener('change', async (e) => {
        const file = e.target.files[0];
        const formData = new FormData();
        formData.append('image', file);

        try {
            const res = await fetch('/api/upload', {
                method: 'POST',
                body: formData
            });
            const data = await res.text(); // Returns path string
            document.getElementById('p-image').value = data;
        } catch (error) {
            console.error(error);
            showToast('Image upload failed', 'danger');
        }
    });

    // Add Product
    document.getElementById('add-product-form').addEventListener('submit', async (e) => {
        e.preventDefault();

        // First create a placeholder product
        try {
            const createRes = await fetch('/api/products', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${user.token}`
                }
            });
            const product = await createRes.json();

            // Then update it with form data
            const updateRes = await fetch(`/api/products/${product._id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${user.token}`
                },
                body: JSON.stringify({
                    name: document.getElementById('p-name').value,
                    price: document.getElementById('p-price').value,
                    image: document.getElementById('p-image').value,
                    brand: document.getElementById('p-brand').value,
                    category: document.getElementById('p-category').value,
                    countInStock: document.getElementById('p-countInStock').value,
                    description: document.getElementById('p-description').value,
                })
            });

            if (updateRes.ok) {
                showToast('Product created', 'success');
                location.reload();
            } else {
                showToast('Failed to create product', 'danger');
            }
        } catch (error) {
            console.error(error);
            showToast('Error creating product', 'danger');
        }
    });

    // List Products (This is a simplified view, ideally filter by seller)
    // Since the API returns all products, we might need to filter client side or update API
    // For now, listing all products but only allowing delete if owner (handled by backend)
    // List Products
    const productList = document.getElementById('product-list');

    async function fetchProducts() {
        try {
            const url = user.isAdmin ? '/api/products?pageNumber=1' : '/api/products/my';
            const res = await fetch(url, {
                headers: {
                    'Authorization': `Bearer ${user.token}`
                }
            });
            const data = await res.json();
            const products = data.products; // Assuming API returns { products: [], ... }

            productList.innerHTML = products.map(product => `
                <tr style="border-bottom: 1px solid var(--border-color);">
                    <td style="padding: 10px;">${product._id}</td>
                    <td style="padding: 10px;">${product.name}</td>
                    <td style="padding: 10px;">€${product.price}</td>
                    <td style="padding: 10px;">${product.category}</td>
                    <td style="padding: 10px;">${product.brand}</td>
                    <td style="padding: 10px;">
                        <button onclick="editProduct('${product._id}')" class="btn btn-primary" style="padding: 5px 10px; font-size: 0.8rem; margin-right: 5px;">Edit</button>
                        <button onclick="deleteProduct('${product._id}')" class="btn btn-danger" style="background: var(--danger-color); padding: 5px 10px; font-size: 0.8rem;">Delete</button>
                    </td>
                </tr>
            `).join('');
        } catch (error) {
            console.error(error);
            productList.innerHTML = '<tr><td colspan="6">Error loading products</td></tr>';
        }
    }

    fetchProducts();

    // Edit Product Function (Global scope to be called from HTML)
    window.editProduct = async (id) => {
        try {
            const res = await fetch(`/api/products/${id}`);
            const product = await res.json();

            document.getElementById('p-id').value = product._id;
            document.getElementById('p-name').value = product.name;
            document.getElementById('p-price').value = product.price;
            document.getElementById('p-image').value = product.image;
            document.getElementById('p-brand').value = product.brand;
            document.getElementById('p-category').value = product.category;
            document.getElementById('p-countInStock').value = product.countInStock;
            document.getElementById('p-description').value = product.description;

            document.getElementById('product-submit-btn').innerText = 'Update Product';
            document.getElementById('cancel-edit-btn').style.display = 'inline-block';
            document.getElementById('edit-product-container').style.display = 'block';

            // Scroll to form
            document.querySelector('.card').scrollIntoView({ behavior: 'smooth' });
        } catch (error) {
            console.error(error);
            showToast('Error loading product details', 'danger');
        }
    };

    // Cancel Edit
    document.getElementById('cancel-edit-btn').addEventListener('click', () => {
        resetForm();
    });

    function resetForm() {
        document.getElementById('add-product-form').reset();
        document.getElementById('p-id').value = '';
        document.getElementById('product-submit-btn').innerText = 'Create Product';
        document.getElementById('cancel-edit-btn').style.display = 'none';
        document.getElementById('edit-product-container').style.display = 'none';
    }

    // Add/Update Product
    document.getElementById('add-product-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const id = document.getElementById('p-id').value;
        const isEdit = !!id;

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
            let res;
            if (isEdit) {
                res = await fetch(`/api/products/${id}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${user.token}`
                    },
                    body: JSON.stringify(productData)
                });
            } else {
                // Create logic: first create placeholder, then update
                // Or simplified: just create with data if API supports it.
                // The current API createProduct creates a sample product.
                // So we stick to the create-then-update flow or update the API.
                // Let's use the existing flow: Create -> Update

                const createRes = await fetch('/api/products', {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${user.token}`
                    }
                });
                const newProduct = await createRes.json();

                res = await fetch(`/api/products/${newProduct._id}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${user.token}`
                    },
                    body: JSON.stringify(productData)
                });
            }

            if (res.ok) {
                showToast(isEdit ? 'Product updated' : 'Product created', 'success');
                resetForm();
                fetchProducts();
            } else {
                showToast('Operation failed', 'danger');
            }
        } catch (error) {
            console.error(error);
            showToast('Error saving product', 'danger');
        }
    });

    window.deleteProduct = async (id) => {
        showConfirmModal('Delete Product', 'Are you sure you want to delete this product?', async () => {
            const user = getUser();

            try {
                const res = await fetch(`/api/products/${id}`, {
                    method: 'DELETE',
                    headers: {
                        'Authorization': `Bearer ${user.token}`
                    }
                });

                if (res.ok) {
                    showToast('Product deleted', 'success');
                    fetchProducts();
                } else {
                    showToast('Failed to delete product', 'danger');
                }
            } catch (error) {
                console.error(error);
                showToast('Error deleting product', 'danger');
            }
        });
    };
});
