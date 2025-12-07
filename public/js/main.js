const API_URL = '/api';

// Toast Notification
function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerText = message;
    document.body.appendChild(toast);

    setTimeout(() => {
        toast.classList.add('show');
    }, 100);

    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => {
            document.body.removeChild(toast);
        }, 300);
    }, 3000);
}

// Auth Helpers
function getUser() {
    try {
        return JSON.parse(localStorage.getItem('userInfo'));
    } catch (error) {
        console.error('Error parsing user info:', error);
        return null;
    }
}

function logout() {
    console.log('Logout clicked');
    localStorage.removeItem('userInfo');
    window.location.href = '/login';
}
window.logout = logout;

// Update Navbar based on Auth
function updateNavbar() {
    const user = getUser();
    const userMenu = document.getElementById('user-menu');

    if (!userMenu) return;

    if (user) {
        let links = `

            <a href="/cart" class="nav-icon-btn" title="Cart">
                <i class="fas fa-shopping-cart"></i>
                <span class="cart-badge">0</span>
            </a>
            <div style="position: relative; display: flex; align-items: center; gap: 10px;">
                <a href="/profile" class="nav-item" style="color: white;">Hello, ${user.name}</a>
        `;

        if (user.isAdmin) {
            links += `<a href="/seller" class="nav-item" style="color: var(--accent-color);">Dashboard</a>`;
        }

        if (user.isAdmin) {
            links += `<a href="/admin" class="nav-item" style="color: var(--warning-color);">Admin</a>`;
        }

        links += `
                <a href="#" id="logout-btn" class="nav-item" style="margin-left: 10px;">Logout</a>
            </div>
        `;
        userMenu.innerHTML = links;

        // Attach event listener
        const logoutBtn = document.getElementById('logout-btn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', (e) => {
                e.preventDefault();
                logout();
            });
        }
    } else {
        userMenu.innerHTML = `

            <a href="/cart" class="nav-icon-btn" title="Cart">
                <i class="fas fa-shopping-cart"></i>
                <span class="cart-badge">0</span>
            </a>
            <a href="/login" class="nav-item btn btn-primary" style="padding: 8px 20px; border-radius: 50px; color: white;">
                Sign In
            </a>
        `;
    }
}

// Theme Toggler
function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    updateThemeIcon(newTheme);
}

function updateThemeIcon(theme) {
    const themeBtn = document.getElementById('theme-toggle');
    if (themeBtn) {
        const icon = themeBtn.querySelector('i');
        if (theme === 'dark') {
            icon.classList.remove('fa-sun');
            icon.classList.add('fa-moon');
        } else {
            icon.classList.remove('fa-moon');
            icon.classList.add('fa-sun');
        }
    }
}

// Add to Cart
// Add to Cart Logic
async function addItemToCart(id, qty = 1) {
    const user = getUser();
    if (!user) {
        window.location.href = '/login';
        return;
    }

    try {
        // Fetch product details first
        const res = await fetch(`/api/products/${id}`);
        if (!res.ok) throw new Error('Failed to fetch product');

        const product = await res.json();

        const cartItem = {
            product: product._id,
            name: product.name,
            image: product.image,
            image: product.image,
            price: product.price,
            discountedPrice: product.discountedPrice,
            qty: Number(qty)
        };

        const addRes = await fetch('/api/cart', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${user.token}`
            },
            body: JSON.stringify(cartItem)
        });

        if (addRes.ok) {
            showToast('Added to cart', 'success');
            updateCartBadge();
        } else {
            showToast('Failed to add to cart', 'danger');
        }
    } catch (error) {
        console.error(error);
        showToast('Error adding to cart', 'danger');
    }
}

// Global Event Listener for Add to Cart
document.addEventListener('click', (e) => {
    const btn = e.target.closest('.add-to-cart-btn') || e.target.closest('.btn-add-cart');

    if (btn) {
        e.preventDefault();
        e.stopPropagation();

        const id = btn.dataset.id;
        const qtyInput = document.getElementById('qty');
        const qty = qtyInput ? qtyInput.value : 1;

        if (id) {
            addItemToCart(id, qty);
        }
    }
});

// Update Cart Badge
async function updateCartBadge() {
    const user = getUser();
    if (!user) return;

    try {
        const res = await fetch('/api/cart', {
            headers: {
                'Authorization': `Bearer ${user.token}`
            }
        });
        const cartItems = await res.json();
        const count = cartItems.reduce((acc, item) => acc + item.qty, 0);

        const badges = document.querySelectorAll('.cart-badge');
        badges.forEach(badge => {
            badge.innerText = count;
            badge.style.display = 'flex'; // Always show
        });
    } catch (error) {
        console.error(error);
    }
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
    updateThemeIcon(savedTheme);
    updateNavbar();
    updateCartBadge();

    // Attach theme toggle listener here if not already attached in HTML
    const themeBtn = document.getElementById('theme-toggle');
    if (themeBtn) {
        themeBtn.addEventListener('click', toggleTheme);
    }
});
