/* ==========================================
   FOOD ON WHEELS PAYMENT PAGE - CORE JAVASCRIPT
   ========================================== */

document.addEventListener('DOMContentLoaded', () => {
    // ------------------------------------------
    // 1. STATE SYSTEM
    // ------------------------------------------
    const savedCart = localStorage.getItem('gourmet_cart');
    const initialCart = savedCart ? JSON.parse(savedCart) : [
        { id: 1, name: 'Truffle Mushroom Risotto', price: 380, qty: 1, veg: true },
        { id: 2, name: 'Avocado & Feta Sourdough', price: 190, qty: 2, veg: true },
        { id: 3, name: 'Classic Roasted Tiramisu', price: 250, qty: 1, veg: false }
    ];

    const state = {
        cart: initialCart,
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

    // ------------------------------------------
    // 2. ELEMENT SELECTORS
    // ------------------------------------------
    // Price Calculations Elements
    const billItemTotalEl = document.getElementById('bill-item-total');
    const billDeliveryFeeEl = document.getElementById('bill-delivery-fee');
    const billTaxesEl = document.getElementById('bill-taxes');
    const billTipEl = document.getElementById('bill-tip');
    const billDiscountEl = document.getElementById('bill-discount');
    const billGrandTotalEl = document.getElementById('bill-grand-total');
    const mainPayBtn = document.getElementById('main-pay-btn');
    const payTextEl = mainPayBtn.querySelector('.pay-text');
    const successPaidAmountEl = document.getElementById('success-paid-amount');
    
    // Collapsible elements
    const summaryHeader = document.getElementById('summary-header');
    const cartItemCountEl = document.getElementById('cart-item-count');
    const cartItemsContainer = document.getElementById('cart-items-container');
    const cartItemsList = document.getElementById('cart-items-list');

    // Instructions & Gold toggle
    const goldToggle = document.getElementById('gold-toggle');
    const goldBenefitsMsg = document.getElementById('gold-benefits-msg');
    const instructionBtns = document.querySelectorAll('.instruction-btn');

    // Coupons widget
    const couponInput = document.getElementById('coupon-code-input');
    const applyCouponBtn = document.getElementById('apply-coupon-btn');
    const couponFeedback = document.getElementById('coupon-feedback-message');
    const couponRow = document.getElementById('coupon-row');
    const couponBadgeName = document.getElementById('coupon-badge-name');
    const couponPills = document.querySelectorAll('.coupon-pill');

    // Tip widget
    const tipBtns = document.querySelectorAll('.tip-btn');
    const customTipTrigger = document.getElementById('custom-tip-trigger');
    const customTipWrapper = document.getElementById('custom-tip-wrapper');
    const customTipInput = document.getElementById('custom-tip-input');
    const applyCustomTipBtn = document.getElementById('apply-custom-tip');
    const tipThankYou = document.getElementById('tip-thankyou-msg');
    const tipRow = document.getElementById('tip-row');

    // Payment Selection
    const accordions = document.querySelectorAll('.payment-method-accordion');
    const savedCardRows = document.querySelectorAll('.saved-card-row');
    const upiAppCards = document.querySelectorAll('.upi-app-card');
    const verifyUpiBtn = document.getElementById('verify-upi-btn');
    const upiIdField = document.getElementById('upi-id-field');
    const upiValidationMsg = document.getElementById('upi-validation-msg');
    const bankCards = document.querySelectorAll('.bank-card');
    const otherBanksSelect = document.getElementById('other-banks-select');

    // New Card Interactive Preview & Fields
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

    // Modals
    const otpModal = document.getElementById('otp-modal');
    const closeOtpModalBtn = document.getElementById('close-otp-modal');
    const verifyOtpSubmitBtn = document.getElementById('verify-otp-submit-btn');
    const otpInputs = document.querySelectorAll('.otp-input');
    const otpTimerEl = document.getElementById('otp-timer');
    const resendOtpBtn = document.getElementById('resend-otp-btn');
    const otpErrorDisplay = document.getElementById('otp-error-display');

    const processingModal = document.getElementById('processing-modal');
    const bankStatusText = document.getElementById('bank-status-text');

    // Success Tracker Overlay
    const successScreen = document.getElementById('success-screen');
    const confettiContainer = document.getElementById('confetti-container');
    const trackingProgressFill = document.getElementById('tracking-progress-fill');
    const stepConfirmed = document.getElementById('step-confirmed');
    const stepPreparing = document.getElementById('step-preparing');
    const stepAssigned = document.getElementById('step-assigned');
    const stepTransit = document.getElementById('step-transit');
    const riderCard = document.getElementById('rider-card');
    const trackOnMapBtn = document.getElementById('track-on-map-btn');

    // ------------------------------------------
    // 3. CORE CALCULATIONS & UI RENDERERS
    // ------------------------------------------
    const updateReceipt = () => {
        // Calculate Item Total
        let itemTotal = 0;
        let activeItemsCount = 0;
        state.cart.forEach(item => {
            itemTotal += item.qty * item.price;
            activeItemsCount += item.qty;
        });

        // Update items count and restaurant name in UI
        const restaurantName = localStorage.getItem('gourmet_restaurant') || 'GourmetExpress';
        cartItemCountEl.textContent = `${activeItemsCount} item${activeItemsCount > 1 ? 's' : ''} from ${restaurantName}`;
        
        const successResNameEl = document.getElementById('success-restaurant-name');
        if (successResNameEl) {
            successResNameEl.textContent = restaurantName;
        }

        // Calculate Delivery Fee (Waived if Food on Wheels Gold is checked OR if FREEDEL coupon is applied)
        let deliveryFee = state.deliveryFeeDefault;
        if (state.goldMember) {
            deliveryFee = 0;
            goldBenefitsMsg.style.display = 'block';
        } else {
            goldBenefitsMsg.style.display = 'none';
        }

        // Coupon calculation
        let couponDiscount = 0;
        if (state.coupon) {
            const rules = couponsDb[state.coupon];
            if (rules) {
                if (rules.type === 'flat') {
                    if (itemTotal >= rules.minTotal) {
                        couponDiscount = rules.discount;
                    } else {
                        // Deactivate coupon if item total falls below threshold
                        state.coupon = null;
                        couponFeedback.textContent = `Coupon removed. Cart total must be above ₹${rules.minTotal}`;
                        couponFeedback.className = 'coupon-feedback error';
                        couponFeedback.style.display = 'block';
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

        // Taxes & Restaurant Charges (Dynamic: 6% of item total)
        let taxes = Math.round(itemTotal * 0.06);

        // Tip
        let tip = state.tip;

        // Grand Total
        let grandTotal = itemTotal + deliveryFee + taxes + state.platformFee + tip - couponDiscount;
        if (grandTotal < 0) grandTotal = 0;

        // Update DOM Receipt values
        billItemTotalEl.textContent = `₹${itemTotal}`;
        billDeliveryFeeEl.textContent = deliveryFee === 0 ? 'FREE' : `₹${deliveryFee}`;
        if (deliveryFee === 0) {
            billDeliveryFeeEl.classList.add('text-success');
        } else {
            billDeliveryFeeEl.classList.remove('text-success');
        }

        billTaxesEl.textContent = `₹${taxes}`;

        if (couponDiscount > 0) {
            couponRow.style.display = 'flex';
            couponBadgeName.textContent = state.coupon;
            billDiscountEl.textContent = `-₹${couponDiscount}`;
        } else {
            couponRow.style.display = 'none';
        }

        if (tip > 0) {
            tipRow.style.display = 'flex';
            billTipEl.textContent = `₹${tip}`;
        } else {
            tipRow.style.display = 'none';
        }

        // Set Grand Total values
        const formattedGrandTotal = grandTotal.toLocaleString('en-IN');
        billGrandTotalEl.textContent = `₹${formattedGrandTotal}`;
        successPaidAmountEl.textContent = `₹${formattedGrandTotal}`;
        
        // Pay Button Label
        if (state.paymentMethod === 'cod') {
            payTextEl.textContent = `Confirm COD Order ₹${formattedGrandTotal}`;
        } else {
            payTextEl.textContent = `Pay Securely ₹${formattedGrandTotal}`;
        }
    };

    // Populate Cart list dynamically inside HTML
    const renderCartItems = () => {
        cartItemsList.innerHTML = '';
        state.cart.forEach(item => {
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

        // Add event listeners inside newly rendered items
        cartItemsList.querySelectorAll('.qty-btn.minus').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const id = parseInt(btn.getAttribute('data-id'));
                const item = state.cart.find(c => c.id === id);
                if (item && item.qty > 1) {
                    item.qty--;
                    renderCartItems();
                    updateReceipt();
                    localStorage.setItem('gourmet_cart', JSON.stringify(state.cart));
                } else if (item && item.qty === 1) {
                    // Alert or simple prompt to delete
                    if (state.cart.length > 1) {
                        state.cart = state.cart.filter(c => c.id !== id);
                        renderCartItems();
                        updateReceipt();
                        localStorage.setItem('gourmet_cart', JSON.stringify(state.cart));
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
                const item = state.cart.find(c => c.id === id);
                if (item && item.qty < 10) {
                    item.qty++;
                    renderCartItems();
                    updateReceipt();
                    localStorage.setItem('gourmet_cart', JSON.stringify(state.cart));
                }
            });
        });
    };

    // Initialize renderer
    renderCartItems();
    updateReceipt();


    // ------------------------------------------
    // 4. INTERACTION: COLLAPSIBLE CART SUMMARY
    // ------------------------------------------
    summaryHeader.addEventListener('click', () => {
        const isExpanded = summaryHeader.querySelector('.toggle-arrow').getAttribute('aria-expanded') === 'true';
        summaryHeader.querySelector('.toggle-arrow').setAttribute('aria-expanded', !isExpanded);
        
        if (isExpanded) {
            cartItemsContainer.classList.add('collapsed');
        } else {
            cartItemsContainer.classList.remove('collapsed');
        }
    });


    // ------------------------------------------
    // 5. INTERACTION: TOGGLE ADDRESS INSTRUCTIONS
    // ------------------------------------------
    instructionBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            btn.classList.toggle('active');
        });
    });

    // Toggle Gold membership switch
    goldToggle.addEventListener('change', () => {
        state.goldMember = goldToggle.checked;
        
        // Add dynamic animated pop to the Gold banner
        const banner = document.querySelector('.gold-pass-banner');
        banner.style.transform = 'scale(1.02)';
        setTimeout(() => { banner.style.transform = 'scale(1)'; }, 200);

        updateReceipt();
    });


    // ------------------------------------------
    // 6. INTERACTION: COUPONS & DISCOUNTS
    // ------------------------------------------
    const applyCoupon = (code) => {
        const uppercaseCode = code.toUpperCase().trim();
        
        if (!uppercaseCode) {
            showCouponFeedback('Please enter a coupon code', 'error');
            return;
        }

        if (couponsDb.hasOwnProperty(uppercaseCode)) {
            const rules = couponsDb[uppercaseCode];
            
            // Validate minimum total threshold
            let itemTotal = 0;
            state.cart.forEach(item => itemTotal += item.qty * item.price);

            if (rules.minTotal && itemTotal < rules.minTotal) {
                showCouponFeedback(`Code requires a minimum item total of ₹${rules.minTotal}`, 'error');
                return;
            }

            state.coupon = uppercaseCode;
            showCouponFeedback(`Coupon "${uppercaseCode}" applied successfully!`, 'success');
            
            // Highlight applied coupon pill in list
            couponPills.forEach(pill => {
                if (pill.getAttribute('data-code') === uppercaseCode) {
                    pill.classList.add('selected');
                    pill.querySelector('.coupon-apply-link').textContent = 'Applied';
                    pill.querySelector('.coupon-apply-link').style.color = 'var(--success)';
                } else {
                    pill.classList.remove('selected');
                    pill.querySelector('.coupon-apply-link').textContent = 'Apply';
                    pill.querySelector('.coupon-apply-link').style.color = 'var(--success)';
                }
            });

            updateReceipt();
        } else {
            showCouponFeedback('Invalid coupon code. Try GOLDSTAR or FEAST30', 'error');
        }
    };

    const showCouponFeedback = (msg, type) => {
        couponFeedback.textContent = msg;
        couponFeedback.className = `coupon-feedback ${type}`;
        couponFeedback.style.display = 'block';
    };

    applyCouponBtn.addEventListener('click', () => {
        applyCoupon(couponInput.value);
    });

    couponInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            applyCoupon(couponInput.value);
        }
    });

    // Coupon lists apply links
    couponPills.forEach(pill => {
        const applyLink = pill.querySelector('.coupon-apply-link');
        applyLink.addEventListener('click', (e) => {
            e.stopPropagation();
            const code = pill.getAttribute('data-code');
            applyCoupon(code);
            couponInput.value = code;
        });
    });


    // ------------------------------------------
    // 7. INTERACTION: DRIVER TIPPING
    // ------------------------------------------
    const setTip = (amount) => {
        state.tip = amount;
        
        tipBtns.forEach(btn => {
            if (btn.getAttribute('data-tip') == amount && btn !== customTipTrigger) {
                btn.classList.add('selected');
            } else {
                btn.classList.remove('selected');
            }
        });

        if (amount > 0) {
            tipThankYou.textContent = `Thank you! Rahul Kumar will be notified of your generous tip of ₹${amount}.`;
            tipThankYou.style.display = 'block';
            tipThankYou.style.animation = 'fadeInUp 0.3s ease-out';
        } else {
            tipThankYou.style.display = 'none';
        }

        updateReceipt();
    };

    tipBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            if (btn === customTipTrigger) {
                customTipTrigger.classList.add('selected');
                customTipWrapper.style.display = 'flex';
                customTipWrapper.style.animation = 'fadeInUp 0.3s ease-out';
                customTipInput.focus();
            } else {
                customTipTrigger.classList.remove('selected');
                customTipWrapper.style.display = 'none';
                const tipVal = parseInt(btn.getAttribute('data-tip'));
                setTip(tipVal);
            }
        });
    });

    applyCustomTipBtn.addEventListener('click', () => {
        const amount = parseInt(customTipInput.value);
        if (amount >= 5 && amount <= 500) {
            setTip(amount);
        } else {
            alert("Please enter a custom tip between ₹5 and ₹500");
        }
    });

    customTipInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            const amount = parseInt(customTipInput.value);
            if (amount >= 5 && amount <= 500) {
                setTip(amount);
            }
        }
    });


    // ------------------------------------------
    // 8. INTERACTION: PAYMENT SELECTION ACCORDIONS
    // ------------------------------------------
    accordions.forEach(accordion => {
        accordion.addEventListener('click', (e) => {
            // Prevent toggling when clicking fields/buttons inside details body
            if (e.target.closest('.payment-details-body')) return;

            const radio = accordion.querySelector('input[type="radio"]');
            
            // Deactivate others
            accordions.forEach(acc => {
                acc.classList.remove('active');
                acc.querySelector('input[type="radio"]').checked = false;
            });

            // Activate current
            accordion.classList.add('active');
            radio.checked = true;
            state.paymentMethod = radio.value;
            updateReceipt();

            // Trigger accordion slide updates
            setTimeout(() => {
                // Focus forms if card chosen
                if (state.paymentMethod === 'credit-card') {
                    cardNumInput.focus();
                }
            }, 150);
        });
    });

    // Saved card row toggle selections
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

    // UPI app selects
    upiAppCards.forEach(card => {
        card.addEventListener('click', () => {
            upiAppCards.forEach(c => c.classList.remove('selected'));
            card.classList.add('selected');
            state.upiApp = card.getAttribute('data-app');
        });
    });

    // UPI ID verification simulation
    verifyUpiBtn.addEventListener('click', () => {
        const upiVal = upiIdField.value.trim();
        
        if (!upiVal || !upiVal.includes('@')) {
            upiValidationMsg.textContent = 'Please enter a valid UPI ID (e.g. username@okhdfc)';
            upiValidationMsg.className = 'validation-message error';
            state.upiVerified = false;
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
            state.upiVerified = true;
            
            // Glow effect on verification
            upiIdField.style.borderColor = 'var(--success)';
        }, 1200);
    });

    upiIdField.addEventListener('input', () => {
        // Reset verified state when user retypes
        if (state.upiVerified) {
            state.upiVerified = false;
            upiValidationMsg.textContent = '';
            upiIdField.style.borderColor = 'var(--border-color)';
        }
    });

    // Net Banking card selectors
    bankCards.forEach(card => {
        card.addEventListener('click', () => {
            bankCards.forEach(c => c.classList.remove('selected'));
            card.classList.add('selected');
            state.selectedBank = card.getAttribute('data-bank');
            otherBanksSelect.value = ''; // Reset select box
        });
    });

    otherBanksSelect.addEventListener('change', () => {
        if (otherBanksSelect.value) {
            bankCards.forEach(c => c.classList.remove('selected'));
            state.selectedBank = otherBanksSelect.value;
        }
    });


    // ------------------------------------------
    // 9. NEW CREDIT CARD INTERACTIVE INPUTS
    // ------------------------------------------
    
    // Auto-spacing card number and brand detection
    cardNumInput.addEventListener('input', (e) => {
        let value = e.target.value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
        let formatted = '';
        
        for (let i = 0; i < value.length; i++) {
            if (i > 0 && i % 4 === 0) {
                formatted += ' ';
            }
            formatted += value[i];
        }
        e.target.value = formatted;
        
        // Sync with preview card number
        previewNum.textContent = formatted || '•••• •••• •••• ••••';

        // Detect card brand
        let brand = 'VISA';
        let brandIconText = 'Visa';
        
        if (value.startsWith('5')) {
            brand = 'MASTERCARD';
            brandIconText = 'MC';
            inputBrandIcon.style.color = '#EB001B';
        } else if (value.startsWith('4')) {
            brand = 'VISA';
            brandIconText = 'Visa';
            inputBrandIcon.style.color = '#1A1F71';
        } else if (value.startsWith('3')) {
            brand = 'AMEX';
            brandIconText = 'Amex';
            inputBrandIcon.style.color = '#0070CD';
        } else {
            brand = 'CARD';
            brandIconText = 'Card';
            inputBrandIcon.style.color = 'var(--text-light)';
        }

        previewBrand.textContent = brand;
        inputBrandIcon.textContent = brandIconText;
    });

    // Exp date formatter (MM/YY)
    cardExpInput.addEventListener('input', (e) => {
        let value = e.target.value.replace(/\D/g, '');
        if (value.length > 2) {
            e.target.value = value.substring(0, 2) + '/' + value.substring(2, 4);
        } else {
            e.target.value = value;
        }
        previewExpiry.textContent = e.target.value || 'MM/YY';
    });

    // Holder name sync
    cardNameInput.addEventListener('input', (e) => {
        previewHolder.textContent = e.target.value.toUpperCase() || 'YOUR NAME';
    });

    // CVV input flip interaction
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


    // ------------------------------------------
    // 10. SIMULATED CHECKOUT & TRANSACTION MODALS
    // ------------------------------------------
    let otpCountdownInterval = null;

    const startOtpTimer = () => {
        let seconds = 30;
        otpTimerEl.textContent = seconds;
        resendOtpBtn.disabled = true;

        if (otpCountdownInterval) clearInterval(otpCountdownInterval);
        
        otpCountdownInterval = setInterval(() => {
            seconds--;
            otpTimerEl.textContent = seconds;
            if (seconds <= 0) {
                clearInterval(otpCountdownInterval);
                resendOtpBtn.disabled = false;
                document.querySelector('.otp-timer-text').style.display = 'none';
            }
        }, 1000);
    };

    mainPayBtn.addEventListener('click', () => {
        // Form field validation checks
        if (state.paymentMethod === 'credit-card') {
            const num = cardNumInput.value.replace(/\s+/g, '');
            const name = cardNameInput.value.trim();
            const exp = cardExpInput.value.trim();
            const cvv = cardCvvInput.value.trim();

            if (num.length < 16 || name.length < 3 || exp.length < 5 || cvv.length < 3) {
                alert("Please fill in all credit card details correctly before proceeding.");
                return;
            }
        } else if (state.paymentMethod === 'saved-cards') {
            const activeCardRow = document.querySelector('.saved-card-row.selected');
            const cvv = activeCardRow.querySelector('.mini-cvv').value.trim();
            if (cvv.length < 3) {
                alert("Please enter the 3-digit CVV code to verify your saved card.");
                activeCardRow.querySelector('.mini-cvv').focus();
                return;
            }
        } else if (state.paymentMethod === 'upi') {
            if (upiIdField.value.trim() !== '' && !state.upiVerified) {
                alert("Please verify your custom UPI ID first or choose a saved app.");
                return;
            }
        } else if (state.paymentMethod === 'netbanking') {
            if (!state.selectedBank) {
                alert("Please select a bank to proceed.");
                return;
            }
        } else if (state.paymentMethod === 'cod') {
            // Bypass OTP and trigger COD flow
            triggerPaymentGatewayRedirect(true);
            return;
        }

        // Show Secure Verification (OTP Modal)
        otpModal.classList.add('show');
        startOtpTimer();
        
        // Focus first OTP block input
        setTimeout(() => {
            otpInputs[0].focus();
        }, 300);
    });

    const confirmCodBtn = document.getElementById('confirm-cod-btn');
    if (confirmCodBtn) {
        confirmCodBtn.addEventListener('click', () => {
            triggerPaymentGatewayRedirect(true);
        });
    }

    closeOtpModalBtn.addEventListener('click', () => {
        otpModal.classList.remove('show');
        clearInterval(otpCountdownInterval);
    });

    // SMS timer Resend handler
    resendOtpBtn.addEventListener('click', () => {
        document.querySelector('.otp-timer-text').style.display = 'block';
        startOtpTimer();
        alert('Verification code resent successfully! (Demo OTP: 1234)');
    });

    // Automatically navigate OTP single block inputs
    otpInputs.forEach((input, index) => {
        input.addEventListener('keyup', (e) => {
            const val = input.value;
            
            // Limit to digits only
            input.value = val.replace(/[^0-9]/g, '');

            if (val.length === 1) {
                if (index < otpInputs.length - 1) {
                    otpInputs[index + 1].focus();
                } else {
                    // Reached 4th input, auto verify
                    verifyOtpSubmitBtn.focus();
                }
            }
        });

        // Handle backspaces to navigate backward
        input.addEventListener('keydown', (e) => {
            if (e.key === 'Backspace' && input.value.length === 0) {
                if (index > 0) {
                    otpInputs[index - 1].focus();
                }
            }
        });
    });

    // OTP Code Verification Submit
    verifyOtpSubmitBtn.addEventListener('click', () => {
        let enteredOtp = '';
        otpInputs.forEach(input => enteredOtp += input.value);

        if (enteredOtp === '1234') {
            otpErrorDisplay.style.display = 'none';
            otpModal.classList.remove('show');
            clearInterval(otpCountdownInterval);

            // Trigger Secure redirect processing spinner
            triggerPaymentGatewayRedirect();
        } else {
            otpErrorDisplay.textContent = 'Invalid verification code. Please try again. (Hint: 1234)';
            otpErrorDisplay.style.display = 'block';
            
            // Clear inputs for re-entry
            otpInputs.forEach(input => input.value = '');
            otpInputs[0].focus();
        }
    });

    // Simulate Gateway Processing states
    const triggerPaymentGatewayRedirect = (isCod = false) => {
        processingModal.classList.add('show');
        
        let redirects = [];
        if (isCod) {
            redirects = [
                { text: 'Processing Cash on Delivery request...', time: 0 },
                { text: 'Verifying delivery address parameters...', time: 1000 },
                { text: 'Confirming COD booking with restaurant...', time: 2200 },
                { text: 'Order details successfully confirmed!', time: 3500 }
            ];
        } else {
            redirects = [
                { text: 'Connecting securely with your bank...', time: 0 },
                { text: 'Authorizing transaction amount...', time: 1000 },
                { text: 'Securing confirmation token from gateway...', time: 2200 },
                { text: 'Order details successfully confirmed!', time: 3500 }
            ];
        }

        redirects.forEach(step => {
            setTimeout(() => {
                bankStatusText.textContent = step.text;
            }, step.time);
        });

        // Final transition to Gorgeous Success Screen
        setTimeout(() => {
            processingModal.classList.remove('show');
            showOrderSuccessScreen(isCod);
        }, 4500);
    };


    // ------------------------------------------
    // 11. CELEBRATION & TIMELINE PROGRESS SIMULATION
    // ------------------------------------------
    const showOrderSuccessScreen = (isCod = false) => {
        const successPaidLabelEl = document.getElementById('success-paid-label');
        if (successPaidLabelEl) {
            successPaidLabelEl.textContent = isCod ? 'Payable amount (COD)' : 'Paid amount';
        }

        // Clear local storage cart and restaurant
        localStorage.removeItem('gourmet_cart');
        localStorage.removeItem('gourmet_restaurant');
        
        successScreen.classList.add('show');
        
        // Trigger celebratory confetti drops
        generateConfetti();

        // Start steps timelines animation
        simulateLiveTrackingDashboard();
    };

    // Confetti DOM drops generator
    const generateConfetti = () => {
        confettiContainer.innerHTML = '';
        const colors = ['#e23744', '#2ecc71', '#f1c40f', '#3498db', '#9b59b6', '#e67e22'];
        
        for (let i = 0; i < 60; i++) {
            const drop = document.createElement('div');
            drop.className = 'confetti';
            
            // Random properties
            drop.style.left = Math.random() * 100 + 'vw';
            drop.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
            drop.style.transform = `scale(${Math.random() * 0.8 + 0.4})`;
            drop.style.width = Math.random() * 8 + 6 + 'px';
            drop.style.height = Math.random() * 15 + 8 + 'px';
            
            // Animation values
            const delay = Math.random() * 3;
            const duration = Math.random() * 2 + 1.5;
            drop.style.animationDelay = delay + 's';
            drop.style.animationDuration = duration + 's';

            confettiContainer.appendChild(drop);
        }
    };

    // Simulated timelines step tracking
    const simulateLiveTrackingDashboard = () => {
        // Initial setup
        trackingProgressFill.style.height = '0%';
        stepConfirmed.className = 'timeline-step completed';

        // 1. Food Preparation begins
        setTimeout(() => {
            trackingProgressFill.style.height = '33%';
            stepPreparing.className = 'timeline-step active';
            
            // Update preparing text/ETA slightly
            stepPreparing.querySelector('.timeline-info p').textContent = 'Chef Mario is hand-rolling your risotto right now!';
        }, 3000);

        // 2. Rider assigns and arrives
        setTimeout(() => {
            trackingProgressFill.style.height = '66%';
            stepPreparing.className = 'timeline-step completed';
            stepAssigned.className = 'timeline-step active';
            
            // Display rider contact info card below
            riderCard.style.display = 'flex';
        }, 7000);

        // 3. Out for delivery transit
        setTimeout(() => {
            trackingProgressFill.style.height = '100%';
            stepAssigned.className = 'timeline-step completed';
            stepTransit.className = 'timeline-step active';
            
            // Flashing notifications or ETA decrement
            let eta = 25;
            const timer = setInterval(() => {
                eta--;
                document.getElementById('delivery-eta').textContent = eta;
                if (eta <= 1) clearInterval(timer);
            }, 3000);
        }, 11000);
    };

    trackOnMapBtn.addEventListener('click', () => {
        alert("Simulating Food on Wheels GPS Map... The delivery valet 'Rahul Kumar' is currently 2.4 km away from your location, travelling via high-speed electric scooter.");
    });
});
