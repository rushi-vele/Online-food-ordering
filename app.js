/* ==========================================================================
   Food Express Master App Controller - SPA Unified Logic
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
    // ----------------------------------------------------------------------
    // 1. STATE SYSTEM (Consolidated)
    // ----------------------------------------------------------------------
    const appState = {
        currentUser: null,
        cart: [], // Shared shopping cart between Dashboard and Checkout tabs
        tip: 0,
        coupon: null,
        goldMember: false,
        paymentMethod: 'saved-cards',
        savedCards: [
            { id: 'card-1', digits: '4890', brand: 'visa', cvv: '' },
            { id: 'card-2', digits: '1024', brand: 'mastercard', cvv: '' }
        ],
        selectedSavedCard: 'card-1',
        upiApp: 'gpay',
        upiVerified: false,
        selectedBank: null,
        deliveryFeeDefault: 45,
        platformFee: 5
    };

    // Coupons Database
    const couponsDb = {
        'GOLDSTAR': { discount: 100, minTotal: 400, type: 'flat' },
        'FEAST30': { discount: 0.3, maxDiscount: 150, type: 'percent' },
        'FREEDEL': { type: 'free_delivery' }
    };

    // Menu Item list Database
    const menuDb = [
        { id: 1, name: 'Truffle Mushroom Risotto', price: 380, desc: 'Creamy arborio rice infused with black truffle oil and field mushrooms.', veg: true, icon: '🍄' },
        { id: 2, name: 'Avocado & Feta Sourdough', price: 190, desc: 'Artisanal sourdough toasted, topped with mashed avocado and crumbed feta.', veg: true, icon: '🥑' },
        { id: 3, name: 'Classic Roasted Tiramisu', price: 250, desc: 'Espresso-soaked ladyfingers layered with whipped mascarpone mixture.', veg: false, icon: '🍮' },
        { id: 4, name: 'Signature Pepperoni Pizza', price: 420, desc: 'Stone-baked thin crust pizza topped with spicy Italian pepperoni and fresh mozzarella.', veg: false, icon: '🍕' },
        { id: 5, name: 'Crispy Truffle Fries', price: 150, desc: 'Golden fries tossed in white truffle oil, rosemary, and grated parmesan.', veg: true, icon: '🍟' },
        { id: 6, name: 'Double Smash Burger', price: 320, desc: 'Two juicy smash patties, melted cheddar, house sauce on toasted brioche bun.', veg: false, icon: '🍔' }
    ];

    // ----------------------------------------------------------------------
    // 2. SPA VIEW SWITCHER (Tab controller)
    // ----------------------------------------------------------------------
    const switchTab = (tabId) => {
        // Hide all views
        document.querySelectorAll('.tab-view').forEach(view => {
            view.classList.remove('active');
        });

        // Show active view
        const activeView = document.getElementById(`${tabId}-tab`);
        if (activeView) {
            activeView.classList.add('active');
        }

        // Handle navigation active state highlights
        document.querySelectorAll('.nav-links .nav-link').forEach(link => {
            if (link.getAttribute('data-tab') === tabId) {
                link.classList.add('active');
            } else {
                link.classList.remove('active');
            }
        });

        // Toggle master header frame and body state depending on authentication page
        if (tabId === 'login' || tabId === 'register') {
            document.body.classList.remove('logged-in');
        } else {
            document.body.classList.add('logged-in');
            // If logged in, update header user name display
            if (appState.currentUser) {
                document.getElementById('profileName').textContent = appState.currentUser.name;
            }
        }

        // Scroll to top of window
        window.scrollTo(0, 0);

        // Render tab contents if necessary
        if (tabId === 'dashboard') {
            renderMenuCatalog();
            updateDashboardCartUI();
        } else if (tabId === 'checkout') {
            renderCheckoutCartItems();
            updateCheckoutReceipt();
        }
    };

    // Attach click listeners to any element with data-tab (like header nav links, card buttons, or links)
    document.addEventListener('click', (e) => {
        const target = e.target.closest('[data-tab]');
        if (target) {
            const tabId = target.getAttribute('data-tab');
            if (tabId && tabId !== 'logout') {
                e.preventDefault();
                switchTab(tabId);
            }
        }
    });

    // ----------------------------------------------------------------------
    // 3. LOGIN LOGIC (Renamed IDs to prevent collisions)
    // ----------------------------------------------------------------------
    const loginForm = document.getElementById('loginForm');
    const loginCard = document.querySelector('.login-card');
    const loginEmailInput = document.getElementById('loginEmail');
    const loginPasswordInput = document.getElementById('loginPassword');
    const loginTogglePasswordBtn = document.getElementById('loginTogglePassword');
    const loginEyeIcon = document.getElementById('loginEyeIcon');
    const loginBtn = document.getElementById('loginBtn');

    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

    // Show/Hide Password
    if (loginTogglePasswordBtn) {
        loginTogglePasswordBtn.addEventListener('click', () => {
            const isPassword = loginPasswordInput.getAttribute('type') === 'password';
            loginPasswordInput.setAttribute('type', isPassword ? 'text' : 'password');
            if (isPassword) {
                loginEyeIcon.className = 'fa-solid fa-eye-slash';
            } else {
                loginEyeIcon.className = 'fa-regular fa-eye';
            }
        });
    }

    const showLoginError = (inputElement, errorElementId, message) => {
        const inputGroup = inputElement.closest('.input-group');
        const errorSpan = document.getElementById(errorElementId);
        inputGroup.classList.add('error');
        errorSpan.textContent = message;
    };

    const clearLoginError = (inputElement, errorElementId) => {
        const inputGroup = inputElement.closest('.input-group');
        const errorSpan = document.getElementById(errorElementId);
        inputGroup.classList.remove('error');
        errorSpan.textContent = '';
    };

    // Live validation
    if (loginEmailInput) {
        loginEmailInput.addEventListener('input', () => {
            if (loginEmailInput.value.trim() !== '') {
                if (emailRegex.test(loginEmailInput.value.trim())) {
                    clearLoginError(loginEmailInput, 'loginEmailError');
                } else {
                    showLoginError(loginEmailInput, 'loginEmailError', 'Please enter a valid email address');
                }
            } else {
                clearLoginError(loginEmailInput, 'loginEmailError');
            }
        });

        loginPasswordInput.addEventListener('input', () => {
            if (loginPasswordInput.value.trim() !== '') {
                clearLoginError(loginPasswordInput, 'loginPasswordError');
            }
        });
    }

    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const emailValue = loginEmailInput.value.trim();
            const passwordValue = loginPasswordInput.value.trim();
            let isValid = true;

            if (emailValue === '') {
                showLoginError(loginEmailInput, 'loginEmailError', 'Email address is required');
                isValid = false;
            } else if (!emailRegex.test(emailValue)) {
                showLoginError(loginEmailInput, 'loginEmailError', 'Please enter a valid email address');
                isValid = false;
            }

            if (passwordValue === '') {
                showLoginError(loginPasswordInput, 'loginPasswordError', 'Password is required');
                isValid = false;
            } else if (passwordValue.length < 6) {
                showLoginError(loginPasswordInput, 'loginPasswordError', 'Password must be at least 6 characters');
                isValid = false;
            }

            if (!isValid) {
                loginCard.classList.remove('shake');
                void loginCard.offsetWidth;
                loginCard.classList.add('shake');
                return;
            }

            // Start login button loading state
            loginBtn.classList.add('loading');
            loginBtn.disabled = true;

            setTimeout(() => {
                loginBtn.classList.remove('loading');
                loginBtn.disabled = false;
                
                // Set authenticated user state
                appState.currentUser = {
                    email: emailValue,
                    name: emailValue.split('@')[0]
                };

                alert('🎉 Login successful! Opening dashboard...');
                loginForm.reset();
                switchTab('dashboard');
            }, 1500);
        });
    }

    // Tab switching is handled globally by the data-tab click event listener above

    // ----------------------------------------------------------------------
    // 4. REGISTRATION LOGIC
    // ----------------------------------------------------------------------
    const registerForm = document.getElementById('registerForm');
    const registerCard = document.querySelector('#register-tab .login-card');
    const regFullNameInput = document.getElementById('registerFullName');
    const regEmailInput = document.getElementById('registerEmail');
    const regPhoneInput = document.getElementById('registerPhone');
    const regPasswordInput = document.getElementById('registerPassword');
    const regConfirmPasswordInput = document.getElementById('registerConfirmPassword');
    const regTermsCheckbox = document.getElementById('registerTerms');
    const regTogglePasswordBtn = document.getElementById('registerTogglePassword');
    const regEyeIcon = document.getElementById('registerEyeIcon');
    const regToggleConfirmPasswordBtn = document.getElementById('registerToggleConfirmPassword');
    const regConfirmEyeIcon = document.getElementById('registerConfirmEyeIcon');
    const regBtn = document.getElementById('registerBtn');

    const phoneRegex = /^\d{10}$/;

    // Toggle buttons for password visibility
    if (regTogglePasswordBtn) {
        regTogglePasswordBtn.addEventListener('click', () => {
            const isPassword = regPasswordInput.getAttribute('type') === 'password';
            regPasswordInput.setAttribute('type', isPassword ? 'text' : 'password');
            regEyeIcon.className = isPassword ? 'fa-solid fa-eye-slash' : 'fa-regular fa-eye';
        });
    }

    if (regToggleConfirmPasswordBtn) {
        regToggleConfirmPasswordBtn.addEventListener('click', () => {
            const isPassword = regConfirmPasswordInput.getAttribute('type') === 'password';
            regConfirmPasswordInput.setAttribute('type', isPassword ? 'text' : 'password');
            regConfirmEyeIcon.className = isPassword ? 'fa-solid fa-eye-slash' : 'fa-regular fa-eye';
        });
    }

    const showRegError = (inputElement, errorElementId, message) => {
        const group = inputElement.closest('.floating-group') || inputElement.closest('.gender-group') || inputElement.closest('.form-options');
        const errorSpan = document.getElementById(errorElementId);
        if (group) group.classList.add('error');
        if (errorSpan) {
            errorSpan.textContent = message;
            errorSpan.style.opacity = '1';
            errorSpan.style.transform = 'translateY(0)';
        }
    };

    const clearRegError = (inputElement, errorElementId) => {
        const group = inputElement.closest('.floating-group') || inputElement.closest('.gender-group') || inputElement.closest('.form-options');
        const errorSpan = document.getElementById(errorElementId);
        if (group) group.classList.remove('error');
        if (errorSpan) {
            errorSpan.textContent = '';
            errorSpan.style.opacity = '0';
            errorSpan.style.transform = 'translateY(-5px)';
        }
    };

    // Live validation
    if (regFullNameInput) {
        regFullNameInput.addEventListener('input', () => {
            if (regFullNameInput.value.trim().length >= 2) {
                clearRegError(regFullNameInput, 'registerFullNameError');
            }
        });

        regEmailInput.addEventListener('input', () => {
            if (emailRegex.test(regEmailInput.value.trim())) {
                clearRegError(regEmailInput, 'registerEmailError');
            }
        });

        regPhoneInput.addEventListener('input', () => {
            regPhoneInput.value = regPhoneInput.value.replace(/\D/g, '');
            if (phoneRegex.test(regPhoneInput.value.trim())) {
                clearRegError(regPhoneInput, 'registerPhoneError');
            }
        });

        regPasswordInput.addEventListener('input', () => {
            if (regPasswordInput.value.trim().length >= 8) {
                clearRegError(regPasswordInput, 'registerPasswordError');
            }
        });

        regConfirmPasswordInput.addEventListener('input', () => {
            if (regConfirmPasswordInput.value.trim() === regPasswordInput.value.trim()) {
                clearRegError(regConfirmPasswordInput, 'registerConfirmPasswordError');
            }
        });
    }

    if (registerForm) {
        registerForm.addEventListener('submit', (e) => {
            e.preventDefault();

            const fullNameVal = regFullNameInput.value.trim();
            const emailVal = regEmailInput.value.trim();
            const phoneVal = regPhoneInput.value.trim();
            const passwordVal = regPasswordInput.value.trim();
            const confirmPasswordVal = regConfirmPasswordInput.value.trim();
            const checkedGender = document.querySelector('input[name="gender"]:checked');
            const isTermsChecked = regTermsCheckbox.checked;

            let isValid = true;

            if (fullNameVal === '') {
                showRegError(regFullNameInput, 'registerFullNameError', 'Full name is required');
                isValid = false;
            } else if (fullNameVal.length < 2) {
                showRegError(regFullNameInput, 'registerFullNameError', 'Full name must be at least 2 characters');
                isValid = false;
            }

            if (emailVal === '') {
                showRegError(regEmailInput, 'registerEmailError', 'Email address is required');
                isValid = false;
            } else if (!emailRegex.test(emailVal)) {
                showRegError(regEmailInput, 'registerEmailError', 'Please enter a valid email address');
                isValid = false;
            }

            if (phoneVal === '') {
                showRegError(regPhoneInput, 'registerPhoneError', 'Phone number is required');
                isValid = false;
            } else if (!phoneRegex.test(phoneVal)) {
                showRegError(regPhoneInput, 'registerPhoneError', 'Phone number must be exactly 10 digits');
                isValid = false;
            }

            if (passwordVal === '') {
                showRegError(regPasswordInput, 'registerPasswordError', 'Password is required');
                isValid = false;
            } else if (passwordVal.length < 8) {
                showRegError(regPasswordInput, 'registerPasswordError', 'Password must be at least 8 characters');
                isValid = false;
            }

            if (confirmPasswordVal === '') {
                showRegError(regConfirmPasswordInput, 'registerConfirmPasswordError', 'Please confirm your password');
                isValid = false;
            } else if (confirmPasswordVal !== passwordVal) {
                showRegError(regConfirmPasswordInput, 'registerConfirmPasswordError', 'Passwords do not match');
                isValid = false;
            }

            if (!checkedGender) {
                showRegError(document.querySelector('input[name="gender"]'), 'registerGenderError', 'Please select your gender');
                isValid = false;
            } else {
                clearRegError(document.querySelector('input[name="gender"]'), 'registerGenderError');
            }

            if (!isTermsChecked) {
                showRegError(regTermsCheckbox, 'registerTermsError', 'You must agree to the Terms & Conditions');
                isValid = false;
            } else {
                clearRegError(regTermsCheckbox, 'registerTermsError');
            }

            if (!isValid) {
                registerCard.classList.remove('shake');
                void registerCard.offsetWidth;
                registerCard.classList.add('shake');
                return;
            }

            regBtn.classList.add('loading');
            regBtn.disabled = true;

            setTimeout(() => {
                regBtn.classList.remove('loading');
                regBtn.disabled = false;
                alert('🎉 Account created successfully! Returning to Login Page...');
                registerForm.reset();
                switchTab('login');
            }, 1500);
        });
    }

    // ----------------------------------------------------------------------
    // 5. DASHBOARD & CATALOG LOGIC
    // ----------------------------------------------------------------------
    const menuGrid = document.getElementById('menuGrid');
    const cartWidgetItems = document.getElementById('cartWidgetItems');
    const cartWidgetFooter = document.getElementById('cartWidgetFooter');
    const cartWidgetTotal = document.getElementById('cartWidgetTotal');
    const cartBadgeCount = document.getElementById('cartBadgeCount');
    const proceedCheckoutBtn = document.getElementById('proceedCheckoutBtn');

    const renderMenuCatalog = () => {
        if (!menuGrid) return;
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

        // Set up click handlers on dynamic buttons
        menuGrid.querySelectorAll('.btn-add-cart').forEach(btn => {
            btn.addEventListener('click', () => {
                const id = parseInt(btn.getAttribute('data-id'));
                addCatalogToCart(id);
                btn.style.transform = 'scale(0.95)';
                setTimeout(() => btn.style.transform = 'scale(1)', 100);
            });
        });
    };

    const addCatalogToCart = (id) => {
        const menuItem = menuDb.find(item => item.id === id);
        if (!menuItem) return;

        const existingItem = appState.cart.find(item => item.id === id);

        if (existingItem) {
            if (existingItem.qty < 10) {
                existingItem.qty++;
            } else {
                alert("Maximum limit is 10 servings per item.");
                return;
            }
        } else {
            appState.cart.push({
                id: menuItem.id,
                name: menuItem.name,
                price: menuItem.price,
                qty: 1,
                veg: menuItem.veg
            });
        }
        updateDashboardCartUI();
    };

    const updateDashboardCartUI = () => {
        if (!cartWidgetItems) return;
        cartWidgetItems.innerHTML = '';
        
        let totalCount = 0;
        let totalPrice = 0;

        if (appState.cart.length === 0) {
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

        appState.cart.forEach(item => {
            totalCount += item.qty;
            totalPrice += item.qty * item.price;

            const cartRow = document.createElement('div');
            cartRow.className = 'cart-widget-item';
            cartRow.innerHTML = `
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
            cartWidgetItems.appendChild(cartRow);
        });

        cartBadgeCount.textContent = totalCount;
        cartWidgetTotal.textContent = `₹${totalPrice}`;
        cartWidgetFooter.style.display = 'flex';

        // Add listeners to mini-cart modify buttons
        cartWidgetItems.querySelectorAll('.minus-qty').forEach(btn => {
            btn.addEventListener('click', () => {
                const id = parseInt(btn.getAttribute('data-id'));
                modifyCartQty(id, -1);
            });
        });

        cartWidgetItems.querySelectorAll('.plus-qty').forEach(btn => {
            btn.addEventListener('click', () => {
                const id = parseInt(btn.getAttribute('data-id'));
                modifyCartQty(id, 1);
            });
        });

        cartWidgetItems.querySelectorAll('.remove-item').forEach(btn => {
            btn.addEventListener('click', () => {
                const id = parseInt(btn.getAttribute('data-id'));
                appState.cart = appState.cart.filter(item => item.id !== id);
                updateDashboardCartUI();
            });
        });
    };

    const modifyCartQty = (id, change) => {
        const item = appState.cart.find(c => c.id === id);
        if (!item) return;

        item.qty += change;

        if (item.qty <= 0) {
            appState.cart = appState.cart.filter(c => c.id !== id);
        }
        updateDashboardCartUI();
    };

    if (proceedCheckoutBtn) {
        proceedCheckoutBtn.addEventListener('click', () => {
            if (appState.cart.length === 0) {
                alert("Please add at least one item to checkout!");
                return;
            }
            // Navigate directly to Checkout Tab
            switchTab('checkout');
        });
    }

    // ----------------------------------------------------------------------
    // 6. CHECKOUT & PAYMENT LOGIC (Consolidated from payment-script.js)
    // ----------------------------------------------------------------------
    
    // Selectors
    const billItemTotalEl = document.getElementById('bill-item-total');
    const billDeliveryFeeEl = document.getElementById('bill-delivery-fee');
    const billTaxesEl = document.getElementById('bill-taxes');
    const billTipEl = document.getElementById('bill-tip');
    const billDiscountEl = document.getElementById('bill-discount');
    const billGrandTotalEl = document.getElementById('bill-grand-total');
    const mainPayBtn = document.getElementById('main-pay-btn');
    const payTextEl = mainPayBtn ? mainPayBtn.querySelector('.pay-text') : null;
    const successPaidAmountEl = document.getElementById('success-paid-amount');
    
    const summaryHeader = document.getElementById('summary-header');
    const cartItemCountEl = document.getElementById('cart-item-count');
    const cartItemsContainer = document.getElementById('cart-items-container');
    const cartItemsList = document.getElementById('cart-items-list');

    const goldToggle = document.getElementById('gold-toggle');
    const goldBenefitsMsg = document.getElementById('gold-benefits-msg');
    const instructionBtns = document.querySelectorAll('.instruction-btn');

    const couponInput = document.getElementById('coupon-code-input');
    const applyCouponBtn = document.getElementById('apply-coupon-btn');
    const couponFeedback = document.getElementById('coupon-feedback-message');
    const couponRow = document.getElementById('coupon-row');
    const couponBadgeName = document.getElementById('coupon-badge-name');
    const couponPills = document.querySelectorAll('.coupon-pill');

    const tipBtns = document.querySelectorAll('.tip-btn');
    const customTipTrigger = document.getElementById('custom-tip-trigger');
    const customTipWrapper = document.getElementById('custom-tip-wrapper');
    const customTipInput = document.getElementById('custom-tip-input');
    const applyCustomTipBtn = document.getElementById('apply-custom-tip');
    const tipThankYou = document.getElementById('tip-thankyou-msg');
    const tipRow = document.getElementById('tip-row');

    const accordions = document.querySelectorAll('.payment-method-accordion');
    const savedCardRows = document.querySelectorAll('.saved-card-row');
    const upiAppCards = document.querySelectorAll('.upi-app-card');
    const verifyUpiBtn = document.getElementById('verify-upi-btn');
    const upiIdField = document.getElementById('upi-id-field');
    const upiValidationMsg = document.getElementById('upi-validation-msg');
    const bankCards = document.querySelectorAll('.bank-card');
    const otherBanksSelect = document.getElementById('other-banks-select');

    const cardNumInput = document.getElementById('card-num');
    const cardNameInput = document.getElementById('card-name');
    const cardExpInput = document.getElementById('card-exp');
    const cardCvvInput = document.getElementById('card-cvv');
    const cardPreview = document.getElementById('credit-card-preview');
    const previewNum = document.getElementById('preview-number');
    const previewHolder = document.getElementById('preview-holder');
    const previewExpiry = document.getElementById('preview-expiry');
    const previewCvv = document.getElementById('preview-cvv');
    const previewBrand = document.getElementById('preview-brand');
    const inputBrandIcon = document.getElementById('input-brand-icon');

    const otpModal = document.getElementById('otp-modal');
    const closeOtpModalBtn = document.getElementById('close-otp-modal');
    const verifyOtpSubmitBtn = document.getElementById('verify-otp-submit-btn');
    const otpInputs = document.querySelectorAll('.otp-input');
    const otpTimerEl = document.getElementById('otp-timer');
    const resendOtpBtn = document.getElementById('resend-otp-btn');
    const otpErrorDisplay = document.getElementById('otp-error-display');

    const processingModal = document.getElementById('processing-modal');
    const bankStatusText = document.getElementById('bank-status-text');

    const successScreen = document.getElementById('success-screen');
    const trackingProgressFill = document.getElementById('tracking-progress-fill');
    const stepConfirmed = document.getElementById('step-confirmed');
    const stepPreparing = document.getElementById('step-preparing');
    const stepAssigned = document.getElementById('step-assigned');
    const stepTransit = document.getElementById('step-transit');
    const riderCard = document.getElementById('rider-card');

    // Populate checkout item list view dynamically
    const renderCheckoutCartItems = () => {
        if (!cartItemsList) return;
        cartItemsList.innerHTML = '';
        
        if (appState.cart.length === 0) {
            cartItemsList.innerHTML = '<div class="cart-item"><p>Your checkout cart is empty.</p></div>';
            return;
        }

        appState.cart.forEach(item => {
            const itemEl = document.createElement('div');
            itemEl.className = 'cart-item';
            itemEl.setAttribute('data-id', item.id);
            itemEl.innerHTML = `
                <div class="item-info">
                    <span class="veg-nonveg ${item.veg ? 'veg' : 'nonveg'}"></span>
                    <div>
                        <h4 class="item-name">${item.name}</h4>
                        <p class="item-desc">Premium selection, freshly made with quality ingredients.</p>
                    </div>
                </div>
                <div class="item-actions">
                    <div class="qty-selector">
                        <button class="qty-btn minus" data-id="${item.id}">&minus;</button>
                        <span class="qty-val">${item.qty}</span>
                        <button class="qty-btn plus" data-id="${item.id}">&plus;</button>
                    </div>
                    <span class="item-price">₹${item.qty * item.price}</span>
                </div>
            `;
            cartItemsList.appendChild(itemEl);
        });

        // Attach quantity buttons listeners inside Checkout Cart
        cartItemsList.querySelectorAll('.qty-btn.minus').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const id = parseInt(btn.getAttribute('data-id'));
                const item = appState.cart.find(c => c.id === id);
                if (item && item.qty > 1) {
                    item.qty--;
                    renderCheckoutCartItems();
                    updateCheckoutReceipt();
                } else if (item && item.qty === 1) {
                    if (appState.cart.length > 1) {
                        appState.cart = appState.cart.filter(c => c.id !== id);
                        renderCheckoutCartItems();
                        updateCheckoutReceipt();
                    } else {
                        alert("You must have at least one item to proceed!");
                    }
                }
            });
        });

        cartItemsList.querySelectorAll('.qty-btn.plus').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const id = parseInt(btn.getAttribute('data-id'));
                const item = appState.cart.find(c => c.id === id);
                if (item && item.qty < 10) {
                    item.qty++;
                    renderCheckoutCartItems();
                    updateCheckoutReceipt();
                }
            });
        });
    };

    // Calculate Receipt Billing
    const updateCheckoutReceipt = () => {
        if (!billItemTotalEl) return;
        
        let itemTotal = 0;
        let activeItemsCount = 0;

        appState.cart.forEach(item => {
            itemTotal += item.qty * item.price;
            activeItemsCount += item.qty;
        });

        if (cartItemCountEl) {
            cartItemCountEl.textContent = `${activeItemsCount} item${activeItemsCount > 1 ? 's' : ''} from Trattoria Pizzeria`;
        }

        let deliveryFee = appState.deliveryFeeDefault;
        if (appState.goldMember) {
            deliveryFee = 0;
            if (goldBenefitsMsg) goldBenefitsMsg.style.display = 'block';
        } else {
            if (goldBenefitsMsg) goldBenefitsMsg.style.display = 'none';
        }

        let couponDiscount = 0;
        if (appState.coupon) {
            const rules = couponsDb[appState.coupon];
            if (rules) {
                if (rules.type === 'flat') {
                    if (itemTotal >= rules.minTotal) {
                        couponDiscount = rules.discount;
                    } else {
                        appState.coupon = null;
                        if (couponFeedback) {
                            couponFeedback.textContent = `Coupon removed. Cart total must be above ₹${rules.minTotal}`;
                            couponFeedback.className = 'coupon-feedback error';
                            couponFeedback.style.display = 'block';
                        }
                    }
                } else if (rules.type === 'percent') {
                    couponDiscount = Math.round(itemTotal * rules.discount);
                    if (rules.maxDiscount && couponDiscount > rules.maxDiscount) {
                        couponDiscount = rules.maxDiscount;
                    }
                } else if (rules.type === 'free_delivery') {
                    couponDiscount = deliveryFee;
                    deliveryFee = 0;
                }
            }
        }

        let taxes = Math.round(itemTotal * 0.06);
        let tip = appState.tip;
        let grandTotal = itemTotal + deliveryFee + taxes + appState.platformFee + tip - couponDiscount;
        if (grandTotal < 0) grandTotal = 0;

        // Render to DOM
        billItemTotalEl.textContent = `₹${itemTotal}`;
        billDeliveryFeeEl.textContent = deliveryFee === 0 ? 'FREE' : `₹${deliveryFee}`;
        if (deliveryFee === 0) {
            billDeliveryFeeEl.classList.add('text-success');
        } else {
            billDeliveryFeeEl.classList.remove('text-success');
        }

        billTaxesEl.textContent = `₹${taxes}`;

        if (couponRow) {
            if (couponDiscount > 0) {
                couponRow.style.display = 'flex';
                couponBadgeName.textContent = appState.coupon;
                billDiscountEl.textContent = `-₹${couponDiscount}`;
            } else {
                couponRow.style.display = 'none';
            }
        }

        if (tipRow) {
            if (tip > 0) {
                tipRow.style.display = 'flex';
                billTipEl.textContent = `₹${tip}`;
            } else {
                tipRow.style.display = 'none';
            }
        }

        const formattedGrandTotal = grandTotal.toLocaleString('en-IN');
        if (billGrandTotalEl) billGrandTotalEl.textContent = `₹${formattedGrandTotal}`;
        if (successPaidAmountEl) successPaidAmountEl.textContent = `₹${formattedGrandTotal}`;
        if (payTextEl) payTextEl.textContent = `Pay Securely ₹${formattedGrandTotal}`;
    };

    // Collapsible Items
    if (summaryHeader) {
        summaryHeader.addEventListener('click', () => {
            const isExpanded = summaryHeader.querySelector('.toggle-arrow').getAttribute('aria-expanded') === 'true';
            summaryHeader.querySelector('.toggle-arrow').setAttribute('aria-expanded', !isExpanded);
            
            if (isExpanded) {
                cartItemsContainer.classList.add('collapsed');
            } else {
                cartItemsContainer.classList.remove('collapsed');
            }
        });
    }

    // Toggle Delivery Options
    instructionBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            btn.classList.toggle('active');
        });
    });

    if (goldToggle) {
        goldToggle.addEventListener('change', () => {
            appState.goldMember = goldToggle.checked;
            
            const banner = document.querySelector('.gold-pass-banner');
            if (banner) {
                banner.style.transform = 'scale(1.02)';
                setTimeout(() => { banner.style.transform = 'scale(1)'; }, 200);
            }
            updateCheckoutReceipt();
        });
    }

    // Coupons
    const applyCheckoutCoupon = (code) => {
        const uppercaseCode = code.toUpperCase().trim();
        
        if (!uppercaseCode) {
            showCheckoutCouponFeedback('Please enter a coupon code', 'error');
            return;
        }

        if (couponsDb.hasOwnProperty(uppercaseCode)) {
            const rules = couponsDb[uppercaseCode];
            let itemTotal = 0;
            appState.cart.forEach(item => itemTotal += item.qty * item.price);

            if (rules.minTotal && itemTotal < rules.minTotal) {
                showCheckoutCouponFeedback(`Code requires a minimum item total of ₹${rules.minTotal}`, 'error');
                return;
            }

            appState.coupon = uppercaseCode;
            showCheckoutCouponFeedback(`Coupon "${uppercaseCode}" applied successfully!`, 'success');
            
            couponPills.forEach(pill => {
                const link = pill.querySelector('.coupon-apply-link');
                if (pill.getAttribute('data-code') === uppercaseCode) {
                    pill.classList.add('selected');
                    if (link) {
                        link.textContent = 'Applied';
                        link.style.color = 'var(--success)';
                    }
                } else {
                    pill.classList.remove('selected');
                    if (link) {
                        link.textContent = 'Apply';
                        link.style.color = 'var(--success)';
                    }
                }
            });

            updateCheckoutReceipt();
        } else {
            showCheckoutCouponFeedback('Invalid coupon code. Try GOLDSTAR or FEAST30', 'error');
        }
    };

    const showCheckoutCouponFeedback = (msg, type) => {
        if (!couponFeedback) return;
        couponFeedback.textContent = msg;
        couponFeedback.className = `coupon-feedback ${type}`;
        couponFeedback.style.display = 'block';
    };

    if (applyCouponBtn) {
        applyCouponBtn.addEventListener('click', () => {
            applyCheckoutCoupon(couponInput.value);
        });

        couponInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                applyCheckoutCoupon(couponInput.value);
            }
        });
    }

    couponPills.forEach(pill => {
        const applyLink = pill.querySelector('.coupon-apply-link');
        if (applyLink) {
            applyLink.addEventListener('click', (e) => {
                e.stopPropagation();
                const code = pill.getAttribute('data-code');
                applyCheckoutCoupon(code);
                if (couponInput) couponInput.value = code;
            });
        }
    });

    // Driver Tipping
    const setCheckoutTip = (amount) => {
        appState.tip = amount;
        
        tipBtns.forEach(btn => {
            if (btn.getAttribute('data-tip') == amount && btn !== customTipTrigger) {
                btn.classList.add('selected');
            } else {
                btn.classList.remove('selected');
            }
        });

        if (amount > 0) {
            if (tipThankYou) {
                tipThankYou.textContent = `Thank you! Rahul Kumar will be notified of your generous tip of ₹${amount}.`;
                tipThankYou.style.display = 'block';
            }
        } else {
            if (tipThankYou) tipThankYou.style.display = 'none';
        }

        updateCheckoutReceipt();
    };

    tipBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            if (btn === customTipTrigger) {
                customTipTrigger.classList.add('selected');
                if (customTipWrapper) {
                    customTipWrapper.style.display = 'flex';
                    customTipInput.focus();
                }
            } else {
                if (customTipTrigger) customTipTrigger.classList.remove('selected');
                if (customTipWrapper) customTipWrapper.style.display = 'none';
                const tipVal = parseInt(btn.getAttribute('data-tip'));
                setCheckoutTip(tipVal);
            }
        });
    });

    if (applyCustomTipBtn) {
        applyCustomTipBtn.addEventListener('click', () => {
            const amount = parseInt(customTipInput.value);
            if (amount >= 5 && amount <= 500) {
                setCheckoutTip(amount);
            } else {
                alert("Please enter a custom tip between ₹5 and ₹500");
            }
        });
    }

    // Payment Selection Accordions
    accordions.forEach(accordion => {
        accordion.addEventListener('click', (e) => {
            if (e.target.closest('.payment-details-body')) return;

            const radio = accordion.querySelector('input[type="radio"]');
            
            accordions.forEach(acc => {
                acc.classList.remove('active');
                acc.querySelector('input[type="radio"]').checked = false;
            });

            accordion.classList.add('active');
            radio.checked = true;
            appState.paymentMethod = radio.value;

            setTimeout(() => {
                if (appState.paymentMethod === 'credit-card' && cardNumInput) {
                    cardNumInput.focus();
                }
            }, 150);
        });
    });

    savedCardRows.forEach(row => {
        row.addEventListener('click', () => {
            savedCardRows.forEach(r => {
                r.classList.remove('selected');
                r.querySelector('.mini-cvv').disabled = true;
            });
            row.classList.add('selected');
            const cvvInput = row.querySelector('.mini-cvv');
            cvvInput.disabled = false;
            cvvInput.focus();
        });
    });

    upiAppCards.forEach(card => {
        card.addEventListener('click', () => {
            upiAppCards.forEach(c => c.classList.remove('selected'));
            card.classList.add('selected');
            appState.upiApp = card.getAttribute('data-app');
        });
    });

    if (verifyUpiBtn) {
        verifyUpiBtn.addEventListener('click', () => {
            const upiVal = upiIdField.value.trim();
            if (!upiVal || !upiVal.includes('@')) {
                upiValidationMsg.textContent = 'Please enter a valid UPI ID (e.g. username@okhdfc)';
                upiValidationMsg.className = 'validation-message error';
                appState.upiVerified = false;
                return;
            }

            verifyUpiBtn.disabled = true;
            verifyUpiBtn.textContent = 'Verifying...';
            upiValidationMsg.textContent = '';

            setTimeout(() => {
                verifyUpiBtn.disabled = false;
                verifyUpiBtn.textContent = 'Verify';
                upiValidationMsg.textContent = '✓ Verified: RAHUL KUMAR (rahulkumar@okaxis)';
                upiValidationMsg.className = 'validation-message success';
                appState.upiVerified = true;
                upiIdField.style.borderColor = 'var(--success)';
            }, 1200);
        });

        upiIdField.addEventListener('input', () => {
            if (appState.upiVerified) {
                appState.upiVerified = false;
                upiValidationMsg.textContent = '';
                upiIdField.style.borderColor = 'var(--border-color)';
            }
        });
    }

    bankCards.forEach(card => {
        card.addEventListener('click', () => {
            bankCards.forEach(c => c.classList.remove('selected'));
            card.classList.add('selected');
            appState.selectedBank = card.getAttribute('data-bank');
            if (otherBanksSelect) otherBanksSelect.value = '';
        });
    });

    if (otherBanksSelect) {
        otherBanksSelect.addEventListener('change', () => {
            if (otherBanksSelect.value) {
                bankCards.forEach(c => c.classList.remove('selected'));
                appState.selectedBank = otherBanksSelect.value;
            }
        });
    }

    // Card Input Visual Formatting
    if (cardNumInput) {
        cardNumInput.addEventListener('input', (e) => {
            let value = e.target.value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
            let formatted = '';
            for (let i = 0; i < value.length; i++) {
                if (i > 0 && i % 4 === 0) formatted += ' ';
                formatted += value[i];
            }
            e.target.value = formatted;
            previewNum.textContent = formatted || '•••• •••• •••• ••••';

            let brand = 'VISA';
            let brandText = 'Visa';
            if (value.startsWith('5')) {
                brand = 'MASTERCARD';
                brandText = 'MC';
                inputBrandIcon.style.color = '#EB001B';
            } else if (value.startsWith('4')) {
                brand = 'VISA';
                brandText = 'Visa';
                inputBrandIcon.style.color = '#1A1F71';
            } else if (value.startsWith('3')) {
                brand = 'AMEX';
                brandText = 'Amex';
                inputBrandIcon.style.color = '#0070CD';
            } else {
                brand = 'CARD';
                brandText = 'Card';
                inputBrandIcon.style.color = 'var(--text-light)';
            }
            previewBrand.textContent = brand;
            inputBrandIcon.textContent = brandText;
        });

        cardExpInput.addEventListener('input', (e) => {
            let value = e.target.value.replace(/\D/g, '');
            if (value.length > 2) {
                e.target.value = value.substring(0, 2) + '/' + value.substring(2, 4);
            } else {
                e.target.value = value;
            }
            previewExpiry.textContent = e.target.value || 'MM/YY';
        });

        cardNameInput.addEventListener('input', (e) => {
            previewHolder.textContent = e.target.value.toUpperCase() || 'YOUR NAME';
        });

        cardCvvInput.addEventListener('focus', () => {
            cardPreview.classList.add('flipped');
        });

        cardCvvInput.addEventListener('blur', () => {
            cardPreview.classList.remove('flipped');
        });

        cardCvvInput.addEventListener('input', (e) => {
            const val = e.target.value.replace(/\D/g, '');
            e.target.value = val;
            previewCvv.textContent = '•'.repeat(val.length) || '•••';
        });
    }

    // Checkout OTP Submission Simulators
    let checkoutOtpInterval = null;

    const startCheckoutOtpTimer = () => {
        let seconds = 30;
        otpTimerEl.textContent = seconds;
        resendOtpBtn.disabled = true;

        if (checkoutOtpInterval) clearInterval(checkoutOtpInterval);
        
        checkoutOtpInterval = setInterval(() => {
            seconds--;
            otpTimerEl.textContent = seconds;
            if (seconds <= 0) {
                clearInterval(checkoutOtpInterval);
                resendOtpBtn.disabled = false;
                document.querySelector('.otp-timer-text').style.display = 'none';
            }
        }, 1000);
    };

    if (mainPayBtn) {
        mainPayBtn.addEventListener('click', () => {
            if (appState.paymentMethod === 'credit-card') {
                const num = cardNumInput.value.replace(/\s+/g, '');
                const name = cardNameInput.value.trim();
                const exp = cardExpInput.value.trim();
                const cvv = cardCvvInput.value.trim();

                if (num.length < 16 || name.length < 3 || exp.length < 5 || cvv.length < 3) {
                    alert("Please fill in all credit card details correctly before proceeding.");
                    return;
                }
            } else if (appState.paymentMethod === 'saved-cards') {
                const activeCard = document.querySelector('.saved-card-row.selected');
                const cvv = activeCard.querySelector('.mini-cvv').value.trim();
                if (cvv.length < 3) {
                    alert("Please enter the 3-digit CVV code to verify your saved card.");
                    activeCard.querySelector('.mini-cvv').focus();
                    return;
                }
            } else if (appState.paymentMethod === 'upi') {
                if (upiIdField.value.trim() !== '' && !appState.upiVerified) {
                    alert("Please verify your custom UPI ID first or choose a saved app.");
                    return;
                }
            } else if (appState.paymentMethod === 'netbanking') {
                if (!appState.selectedBank) {
                    alert("Please select a bank to proceed.");
                    return;
                }
            }

            // Trigger secure OTP validation
            otpModal.classList.add('show');
            startCheckoutOtpTimer();
            setTimeout(() => { otpInputs[0].focus(); }, 300);
        });
    }

    if (closeOtpModalBtn) {
        closeOtpModalBtn.addEventListener('click', () => {
            otpModal.classList.remove('show');
            clearInterval(checkoutOtpInterval);
        });

        resendOtpBtn.addEventListener('click', () => {
            document.querySelector('.otp-timer-text').style.display = 'block';
            startCheckoutOtpTimer();
            alert('Verification code resent successfully! (Demo OTP: 1234)');
        });
    }

    // Auto tab movement in single block OTP fields
    otpInputs.forEach((input, index) => {
        input.addEventListener('keyup', (e) => {
            const val = input.value.replace(/[^0-9]/g, '');
            input.value = val;
            if (val.length === 1) {
                if (index < otpInputs.length - 1) {
                    otpInputs[index + 1].focus();
                } else {
                    verifyOtpSubmitBtn.focus();
                }
            }
        });

        input.addEventListener('keydown', (e) => {
            if (e.key === 'Backspace' && input.value.length === 0) {
                if (index > 0) otpInputs[index - 1].focus();
            }
        });
    });

    if (verifyOtpSubmitBtn) {
        verifyOtpSubmitBtn.addEventListener('click', () => {
            let code = '';
            otpInputs.forEach(input => code += input.value);

            if (code === '1234') {
                otpErrorDisplay.style.display = 'none';
                otpModal.classList.remove('show');
                clearInterval(checkoutOtpInterval);

                // Run animated processing spinner redirection
                runPaymentRedirectSimulator();
            } else {
                otpErrorDisplay.textContent = 'Invalid verification code. Please try again. (Hint: 1234)';
                otpErrorDisplay.style.display = 'block';
                otpInputs.forEach(input => input.value = '');
                otpInputs[0].focus();
            }
        });
    }

    const runPaymentRedirectSimulator = () => {
        processingModal.classList.add('show');
        
        const steps = [
            { text: 'Connecting securely with your bank...', time: 0 },
            { text: 'Authorizing transaction amount...', time: 1000 },
            { text: 'Securing confirmation token from gateway...', time: 2200 },
            { text: 'Order details successfully confirmed!', time: 3500 }
        ];

        steps.forEach(step => {
            setTimeout(() => {
                bankStatusText.textContent = step.text;
            }, step.time);
        });

        setTimeout(() => {
            processingModal.classList.remove('show');
            displayLiveTrackingTimeline();
        }, 4500);
    };

    // Live order tracking timeline simulation
    const displayLiveTrackingTimeline = () => {
        successScreen.classList.add('show');

        // Confetti
        const container = document.getElementById('confetti-container');
        if (container) {
            container.innerHTML = '';
            for (let i = 0; i < 40; i++) {
                const conf = document.createElement('div');
                conf.className = 'confetti-piece';
                conf.style.left = `${Math.random() * 100}%`;
                conf.style.animationDelay = `${Math.random() * 2}s`;
                conf.style.backgroundColor = ['#FF7E40', '#FF3E3E', '#FF2E93', '#10B981', '#FFD700'][Math.floor(Math.random() * 5)];
                container.appendChild(conf);
            }
        }

        // Timeline Progress
        trackingProgressFill.style.height = '0%';
        stepConfirmed.className = 'timeline-step active';
        stepPreparing.className = 'timeline-step';
        stepAssigned.className = 'timeline-step';
        stepTransit.className = 'timeline-step';
        riderCard.style.display = 'none';

        // 1. Confirmed -> Preparing (3s)
        setTimeout(() => {
            trackingProgressFill.style.height = '33%';
            stepConfirmed.className = 'timeline-step completed';
            stepPreparing.className = 'timeline-step active';
        }, 3000);

        // 2. Preparing -> Assigned (7s)
        setTimeout(() => {
            trackingProgressFill.style.height = '66%';
            stepPreparing.className = 'timeline-step completed';
            stepAssigned.className = 'timeline-step active';
            riderCard.style.display = 'flex';
        }, 7000);

        // 3. Assigned -> Transit (11s)
        setTimeout(() => {
            trackingProgressFill.style.height = '100%';
            stepAssigned.className = 'timeline-step completed';
            stepTransit.className = 'timeline-step active';
        }, 11000);
    };

    // Reset action inside tracking overlay
    const resetCheckoutOrderFlow = () => {
        successScreen.classList.remove('show');
        appState.cart = []; // Reset shopping cart
        appState.tip = 0;
        appState.coupon = null;
        if (couponInput) couponInput.value = '';
        if (customTipWrapper) customTipWrapper.style.display = 'none';
        if (goldToggle) goldToggle.checked = false;
        appState.goldMember = false;
        
        switchTab('dashboard');
    };

    // Order Something Else click handler
    const backToMenuBtn = document.querySelector('#success-screen .success-actions .btn-secondary');
    if (backToMenuBtn) {
        backToMenuBtn.removeAttribute('onclick'); // Remove inline onclick reload
        backToMenuBtn.addEventListener('click', () => {
            resetCheckoutOrderFlow();
        });
    }

    // ----------------------------------------------------------------------
    // 7. SESSION MANAGEMENT (Logout / Init state)
    // ----------------------------------------------------------------------
    const masterLogoutBtn = document.getElementById('logoutBtn');
    if (masterLogoutBtn) {
        masterLogoutBtn.addEventListener('click', (e) => {
            e.preventDefault();
            if (confirm("Are you sure you want to log out?")) {
                appState.currentUser = null;
                appState.cart = [];
                appState.tip = 0;
                appState.coupon = null;
                appState.goldMember = false;
                
                // Switch back to Login Screen
                switchTab('login');
            }
        });
    }

    // Default initialization page on open
    switchTab('login');
});
