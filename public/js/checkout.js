document.addEventListener('DOMContentLoaded', async () => {
    const summaryItemsContainer = document.getElementById('order-summary-items');
    const summarySubtotal = document.getElementById('summary-subtotal');
    const summaryShipping = document.getElementById('summary-shipping');
    const summaryTotal = document.getElementById('summary-total');
    const placeOrderBtn = document.getElementById('place-order-btn');
    const user = getUser();

    let stripe;
    let elements;
    let clientSecret;

    if (!user) {
        window.location.href = '/login?redirect=/checkout';
        return;
    }

    // Pre-fill user info
    try {
        const profileRes = await fetch('/api/users/profile', {
            headers: {
                'Authorization': `Bearer ${user.token}`
            }
        });
        const profile = await profileRes.json();

        if (profile) {
            if (profile.contactInfo) {
                document.getElementById('fullName').value = profile.contactInfo.fullName || '';
                document.getElementById('phone').value = profile.contactInfo.phone || '';
            }
            document.getElementById('email').value = profile.email || '';

            if (profile.shippingAddress) {
                document.getElementById('country').value = profile.shippingAddress.country || '';
                document.getElementById('postcode').value = profile.shippingAddress.postcode || '';
                document.getElementById('city').value = profile.shippingAddress.city || '';
                document.getElementById('address').value = profile.shippingAddress.address || '';
            }
        }
    } catch (error) {
        console.error('Error fetching profile for checkout:', error);
    }

    try {
        const res = await fetch('/api/cart', {
            headers: {
                'Authorization': `Bearer ${user.token}`
            }
        });
        const cartItems = await res.json();

        if (cartItems.length === 0) {
            window.location.href = '/cart'; // Redirect back to cart if empty
            return;
        }

        renderOrderSummary(cartItems);

        // Initialize Stripe
        const { publishableKey } = await fetch('/api/payment/config', {
            headers: {
                'Authorization': `Bearer ${user.token}`
            }
        }).then(r => r.json());

        stripe = Stripe(publishableKey);

        const total = calculateTotal(cartItems);

        // Create Payment Intent
        const paymentIntentRes = await fetch('/api/payment/create-payment-intent', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${user.token}`
            },
            body: JSON.stringify({
                amount: total,
                currency: 'eur',
            }),
        });

        const paymentIntentData = await paymentIntentRes.json();
        clientSecret = paymentIntentData.clientSecret;

        const appearance = {
            theme: 'stripe',
        };
        elements = stripe.elements({ appearance, clientSecret });

        const paymentElement = elements.create('payment');
        paymentElement.mount('#payment-element');

        placeOrderBtn.addEventListener('click', async () => {
            // Validate forms
            if (!validateForms()) {
                alert('Please fill in all required fields.');
                return;
            }

            setLoading(true);

            // 1. Create Order
            let orderId;
            try {
                const contactData = {
                    fullName: document.getElementById('fullName').value,
                    email: document.getElementById('email').value,
                    phone: document.getElementById('phone').value
                };

                const addressData = {
                    country: document.getElementById('country').value,
                    postalCode: document.getElementById('postcode').value,
                    city: document.getElementById('city').value,
                    address: document.getElementById('address').value
                };

                const orderRes = await fetch('/api/orders', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${user.token}`
                    },
                    body: JSON.stringify({
                        orderItems: cartItems,
                        shippingAddress: addressData,
                        paymentMethod: 'Card',
                        itemsPrice: calculateTotal(cartItems),
                        taxPrice: 0,
                        shippingPrice: 0,
                        totalPrice: calculateTotal(cartItems),
                    })
                });

                if (!orderRes.ok) {
                    throw new Error('Failed to create order');
                }

                const orderData = await orderRes.json();
                orderId = orderData._id;

            } catch (error) {
                console.error(error);
                alert('Error creating order: ' + error.message);
                setLoading(false);
                return;
            }

            // 2. Confirm Payment
            const { error, paymentIntent } = await stripe.confirmPayment({
                elements,
                redirect: 'if_required', // Prevent automatic redirect
                confirmParams: {
                    return_url: window.location.origin + '/profile',
                },
            });

            if (error) {
                const messageContainer = document.querySelector('#payment-message');
                messageContainer.textContent = error.message;
                messageContainer.classList.remove('hidden');
                setLoading(false);
            } else if (paymentIntent && paymentIntent.status === 'succeeded') {
                // 3. Update Order to Paid
                try {
                    await fetch(`/api/orders/${orderId}/pay`, {
                        method: 'PUT',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${user.token}`
                        },
                        body: JSON.stringify({
                            id: paymentIntent.id,
                            status: paymentIntent.status,
                            update_time: String(Date.now()),
                            payer: {
                                email_address: document.getElementById('email').value
                            }
                        })
                    });

                    // 4. Clear Cart
                    await fetch('/api/cart', {
                        method: 'DELETE',
                        headers: {
                            'Authorization': `Bearer ${user.token}`
                        }
                    });

                    // 5. Save User Info (Contact & Address)
                    try {
                        const contactData = {
                            fullName: document.getElementById('fullName').value,
                            email: document.getElementById('email').value,
                            phone: document.getElementById('phone').value
                        };

                        const addressData = {
                            country: document.getElementById('country').value,
                            postcode: document.getElementById('postcode').value,
                            city: document.getElementById('city').value,
                            address: document.getElementById('address').value
                        };

                        await fetch('/api/users/profile', {
                            method: 'PUT',
                            headers: {
                                'Content-Type': 'application/json',
                                'Authorization': `Bearer ${user.token}`
                            },
                            body: JSON.stringify({
                                contactInfo: contactData,
                                shippingAddress: addressData
                            })
                        });
                    } catch (err) {
                        console.error('Error saving user info:', err);
                        // Non-critical error, continue
                    }

                    // Show success message
                    document.getElementById('payment-form').style.display = 'none';
                    document.getElementById('payment-success').style.display = 'block';
                    placeOrderBtn.style.display = 'none'; // Hide the button too

                    // Redirect after 3 seconds
                    setTimeout(() => {
                        window.location.href = '/profile';
                    }, 3000);

                } catch (err) {
                    console.error('Error updating order to paid:', err);
                    alert('Payment successful but failed to update order status. Please contact support.');
                    window.location.href = '/profile';
                }
            }
        });

    } catch (error) {
        console.error(error);
        summaryItemsContainer.innerHTML = '<p>Error loading order summary</p>';
    }

    function renderOrderSummary(items) {
        summaryItemsContainer.innerHTML = items.map(item => `
            <div style="display: flex; justify-content: space-between; margin-bottom: 10px; font-size: 0.9rem;">
                <span>${item.name} x ${item.qty}</span>
                <span>€${(item.price * item.qty).toFixed(2)}</span>
            </div>
        `).join('');

        const subtotal = items.reduce((acc, item) => acc + item.price * item.qty, 0);
        const shipping = 0; // Free shipping for now
        const total = subtotal + shipping;

        summarySubtotal.innerText = `€${subtotal.toFixed(2)}`;
        summaryShipping.innerText = `€${shipping.toFixed(2)}`;
        summaryTotal.innerText = `€${total.toFixed(2)}`;
    }

    function calculateTotal(items) {
        return items.reduce((acc, item) => acc + item.price * item.qty, 0);
    }

    function validateForms() {
        const requiredIds = ['fullName', 'email', 'phone', 'country', 'postcode', 'city', 'address'];
        let isValid = true;
        requiredIds.forEach(id => {
            const el = document.getElementById(id);
            if (!el.value.trim()) {
                el.style.borderColor = 'red';
                isValid = false;
            } else {
                el.style.borderColor = ''; // Reset
            }
        });
        return isValid;
    }

    function setLoading(isLoading) {
        if (isLoading) {
            placeOrderBtn.disabled = true;
            placeOrderBtn.textContent = 'Processing...';
        } else {
            placeOrderBtn.disabled = false;
            placeOrderBtn.textContent = 'Proceed to Payment';
        }
    }
});
