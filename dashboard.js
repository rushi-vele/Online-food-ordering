/* ==========================================================================
   Food Express Dashboard JS - Shopping Cart & Redirection Logic
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
    // 1. Menu Database (Matches items in payment.html and adds extras)
    const menuDb = [
        { id: 1, name: 'Truffle Mushroom Risotto', price: 380, desc: 'Creamy arborio rice infused with black truffle oil and field mushrooms.', veg: true, icon: '🍄' },
        { id: 2, name: 'Avocado & Feta Sourdough', price: 190, desc: 'Artisanal sourdough toasted, topped with mashed avocado and crumbed feta.', veg: true, icon: '🥑' },
        { id: 3, name: 'Classic Roasted Tiramisu', price: 250, desc: 'Espresso-soaked ladyfingers layered with whipped mascarpone mixture.', veg: false, icon: '🍮' },
        { id: 4, name: 'Signature Pepperoni Pizza', price: 420, desc: 'Stone-baked thin crust pizza topped with spicy Italian pepperoni and fresh mozzarella.', veg: false, icon: '🍕' },
        { id: 5, name: 'Crispy Truffle Fries', price: 150, desc: 'Golden fries tossed in white truffle oil, rosemary, and grated parmesan.', veg: true, icon: '🍟' },
        { id: 6, name: 'Double Smash Burger', price: 320, desc: 'Two juicy smash patties, melted cheddar, house sauce on toasted brioche bun.', veg: false, icon: '🍔' }
    ];

    // 2. Local State Management
    let cart = [];

    // Elements Selectors
    const menuGrid = document.getElementById('menuGrid');
    const cartWidgetItems = document.getElementById('cartWidgetItems');
    const cartWidgetFooter = document.getElementById('cartWidgetFooter');
    const cartWidgetTotal = document.getElementById('cartWidgetTotal');
    const cartBadgeCount = document.getElementById('cartBadgeCount');
    const proceedCheckoutBtn = document.getElementById('proceedCheckoutBtn');
    const logoutBtn = document.getElementById('logoutBtn');

    // 3. Render Menu Catalog
    const renderMenu = () => {
        menuGrid.innerHTML = '';
        menuDb.forEach(item => {
            const card = document.createElement('div');
            card.className = 'menu-card';
            card.innerHTML = `
                <div class="menu-card-header">
                    <span class="badge-veg-nonveg ${item.veg ? 'veg' : 'nonveg'}">
                        <span class="badge-indicator"></span>${item.veg ? 'Veg' : 'Non-Veg'}
                    </span>
                    <span style="font-size: 1.8rem;">${item.icon}</span>
                </div>
                <div class="menu-card-body">
                    <h4>${item.name}</h4>
                    <p>${item.desc}</p>
                </div>
                <div class="menu-card-footer">
                    <span class="menu-price">₹${item.price}</span>
                    <button class="btn-add-cart" data-id="${item.id}">
                        <i class="fa-solid fa-cart-plus"></i> Add to Cart
                    </button>
                </div>
            `;
            menuGrid.appendChild(card);
        });

        // Add event listeners to "Add to Cart" buttons
        document.querySelectorAll('.btn-add-cart').forEach(btn => {
            btn.addEventListener('click', () => {
                const id = parseInt(btn.getAttribute('data-id'));
                addToCart(id);
                // Simple click animation feedback on button
                btn.style.transform = 'scale(0.95)';
                setTimeout(() => btn.style.transform = 'scale(1)', 100);
            });
        });
    };

    // 4. Cart Operations
    const addToCart = (id) => {
        const menuItem = menuDb.find(item => item.id === id);
        if (!menuItem) return;

        const existingItem = cart.find(item => item.id === id);

        if (existingItem) {
            if (existingItem.qty < 10) {
                existingItem.qty++;
            } else {
                alert("Maximum limit is 10 servings per item.");
                return;
            }
        } else {
            cart.push({
                id: menuItem.id,
                name: menuItem.name,
                price: menuItem.price,
                qty: 1,
                veg: menuItem.veg
            });
        }
        updateCartUI();
    };

    const changeQty = (id, change) => {
        const item = cart.find(item => item.id === id);
        if (!item) return;

        item.qty += change;

        if (item.qty <= 0) {
            cart = cart.filter(item => item.id !== id);
        }
        updateCartUI();
    };

    // 5. Update Cart Sidebar UI
    const updateCartUI = () => {
        cartWidgetItems.innerHTML = '';
        
        let totalCount = 0;
        let totalPrice = 0;

        if (cart.length === 0) {
            cartWidgetItems.innerHTML = `
                <div class="cart-empty-message">
                    <i class="fa-solid fa-plate-wheat"></i>
                    <p>Your cart is empty. Add some gourmet items from the menu!</p>
                </div>
            `;
            cartWidgetFooter.style.display = 'none';
            cartBadgeCount.textContent = '0';
            return;
        }

        // Populate items
        cart.forEach(item => {
            totalCount += item.qty;
            totalPrice += item.qty * item.price;

            const cartItemRow = document.createElement('div');
            cartItemRow.className = 'cart-widget-item';
            cartItemRow.innerHTML = `
                <div class="cart-widget-item-info">
                    <h5 class="cart-widget-item-name">${item.name}</h5>
                    <span class="cart-widget-item-price">₹${item.price} × ${item.qty}</span>
                </div>
                <div class="cart-widget-item-actions">
                    <button class="cart-widget-btn minus-qty" data-id="${item.id}">&minus;</button>
                    <span class="cart-widget-qty">${item.qty}</span>
                    <button class="cart-widget-btn plus-qty" data-id="${item.id}">&plus;</button>
                    <button class="cart-widget-btn remove-item" data-id="${item.id}"><i class="fa-solid fa-trash-can"></i></button>
                </div>
            `;
            cartWidgetItems.appendChild(cartItemRow);
        });

        // Update totals
        cartBadgeCount.textContent = totalCount;
        cartWidgetTotal.textContent = `₹${totalPrice}`;
        cartWidgetFooter.style.display = 'flex';

        // Add listeners to cart modifier buttons
        cartWidgetItems.querySelectorAll('.minus-qty').forEach(btn => {
            btn.addEventListener('click', () => {
                const id = parseInt(btn.getAttribute('data-id'));
                changeQty(id, -1);
            });
        });

        cartWidgetItems.querySelectorAll('.plus-qty').forEach(btn => {
            btn.addEventListener('click', () => {
                const id = parseInt(btn.getAttribute('data-id'));
                changeQty(id, 1);
            });
        });

        cartWidgetItems.querySelectorAll('.remove-item').forEach(btn => {
            btn.addEventListener('click', () => {
                const id = parseInt(btn.getAttribute('data-id'));
                cart = cart.filter(item => item.id !== id);
                updateCartUI();
            });
        });
    };

    // 6. Proceed to Checkout Submission
    proceedCheckoutBtn.addEventListener('click', () => {
        if (cart.length === 0) {
            alert("Please add at least one item to checkout!");
            return;
        }

        // Store selected cart in localStorage for payment.html to read
        localStorage.setItem('foodExpressCart', JSON.stringify(cart));

        // Redirect to Payment Checkout Page
        window.location.href = 'payment.html';
    });

    // 7. Logout Actions
    logoutBtn.addEventListener('click', (e) => {
        e.preventDefault();
        if (confirm("Are you sure you want to log out?")) {
            localStorage.removeItem('foodExpressCart');
            window.location.href = 'index.html';
        }
    });

    // Init Render
    renderMenu();
});
