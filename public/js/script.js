/* ==========================================================================
   GourmetExpress Javascript Logic - Full Stack API & Local Fallback
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
    // === Initialize State & Elements ===
    const loader = document.getElementById('loader');
    const navbar = document.getElementById('navbar');
    const themeToggle = document.getElementById('theme-toggle');
    const menuToggle = document.getElementById('menu-toggle');
    const navMenu = document.getElementById('nav-menu');
    const navLinks = document.querySelectorAll('.nav-link');
    const cartCountElement = document.getElementById('cart-count');
    const toast = document.getElementById('toast');
    const toastMessage = document.getElementById('toast-message');
    const backToTopBtn = document.getElementById('back-to-top');
    const restaurantsContainer = document.getElementById('restaurants-container');

    let cartCount = 0;

    // === Local Mock Database Fallbacks (for file:// protocol) ===
    const localRestaurants = [
        {
            id: 1,
            name: 'La Piazza',
            rating: 4.8,
            cuisine: 'Italian • Wood-fired Pizza • Pasta',
            deliveryTime: '20-30 min',
            distance: '1.5 km',
            price: '$$',
            tags: ['pizza', 'pasta', 'italian'],
            promo: '50% OFF',
            safety: 'Best Safety Measures',
            image: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=600&q=80'
        },
        {
            id: 2,
            name: 'Burger Craft',
            rating: 4.7,
            cuisine: 'American • Gourmet Burgers • Craft Fries',
            deliveryTime: '15-25 min',
            distance: '2.1 km',
            price: '$$',
            tags: ['burger', 'american'],
            promo: 'Free Delivery',
            safety: 'Coupon Available',
            image: 'https://images.unsplash.com/photo-1586190848861-99aa4a171e90?auto=format&fit=crop&w=600&q=80'
        },
        {
            id: 3,
            name: 'Sushi Master',
            rating: 4.9,
            cuisine: 'Japanese • Sushi • Sashimi • Bowls',
            deliveryTime: '25-35 min',
            distance: '0.8 km',
            price: '$$$',
            tags: ['sushi', 'japanese'],
            promo: '10% OFF',
            safety: 'Best Safety Measures',
            image: 'https://images.unsplash.com/photo-1553621042-f6e147245754?auto=format&fit=crop&w=600&q=80'
        },
        {
            id: 4,
            name: 'Sweet Retreat',
            rating: 4.6,
            cuisine: 'Desserts • Waffles • Ice Cream • Cakes',
            deliveryTime: '10-20 min',
            distance: '3.4 km',
            price: '$',
            tags: ['dessert', 'sweet', 'bakery'],
            promo: '20% OFF',
            safety: 'Vegetarian Friendly',
            image: 'https://images.unsplash.com/photo-1563729784474-d77dbb933a9e?auto=format&fit=crop&w=600&q=80'
        },
        {
            id: 5,
            name: 'Wok & Roll',
            rating: 4.5,
            cuisine: 'Asian • Noodles • Dumplings • Stir Fry',
            deliveryTime: '30-40 min',
            distance: '2.7 km',
            price: '$$',
            tags: ['asian', 'noodles', 'pasta'],
            promo: 'Free Delivery',
            safety: 'Coupon Available',
            image: 'https://images.unsplash.com/photo-1563245372-f21724e3856d?auto=format&fit=crop&w=600&q=80'
        },
        {
            id: 6,
            name: 'The Green Bowl',
            rating: 4.8,
            cuisine: 'Salads • Vegan • Wraps • Healthy Bowls',
            deliveryTime: '15-25 min',
            distance: '1.2 km',
            price: '$$',
            tags: ['healthy', 'vegan', 'salad'],
            promo: 'Buy 1 Get 1',
            safety: '100% Organic Ingredients',
            image: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=600&q=80'
        }
    ];

    const localDishes = [
        { name: 'Pizza Margherita', category: 'pizza' },
        { name: 'Pepperoni Supreme Pizza', category: 'pizza' },
        { name: 'Cheeseburger Delight', category: 'burger' },
        { name: 'Smoked BBQ Bacon Burger', category: 'burger' },
        { name: 'Spicy Tuna Sushi Roll', category: 'sushi' },
        { name: 'Salmon Sashimi Platter', category: 'sushi' },
        { name: 'Creamy Fettuccine Carbonara', category: 'pasta' },
        { name: 'Truffle Mushroom Pasta', category: 'pasta' },
        { name: 'Belgian Waffle with Ice Cream', category: 'dessert' },
        { name: 'Artisanal Pistachio Gelato', category: 'dessert' },
        { name: 'Avocado Crunch Salad Bowl', category: 'healthy' },
        { name: 'Detox Green Juice Platter', category: 'healthy' }
    ];

    // ==========================================================================
    // 1. Loader Fade Out
    // ==========================================================================
    window.addEventListener('load', () => {
        if (loader) {
            loader.classList.add('fade-out');
            setTimeout(() => {
                loader.style.display = 'none';
            }, 600);
        }
    });

    // Fallback if load event takes too long
    setTimeout(() => {
        if (loader && !loader.classList.contains('fade-out')) {
            loader.classList.add('fade-out');
            setTimeout(() => {
                loader.style.display = 'none';
            }, 600);
        }
    }, 2500);


    // ==========================================================================
    // 2. Fetch & Render Restaurants
    // ==========================================================================
    const renderRestaurants = (restaurantList) => {
        if (!restaurantsContainer) return;
        restaurantsContainer.innerHTML = '';

        if (restaurantList.length === 0) {
            restaurantsContainer.innerHTML = `
                <div class="no-results-msg" style="grid-column: 1/-1; text-align: center; padding: 40px; color: var(--text-secondary);">
                    <i class="fas fa-utensils" style="font-size: 3rem; margin-bottom: 20px; color: var(--text-muted);"></i>
                    <h3>No restaurants found</h3>
                    <p>Try searching for a different dish or category.</p>
                </div>
            `;
            return;
        }

        restaurantList.forEach((res, index) => {
            const delay = (index % 3 + 1) * 100;
            const card = document.createElement('div');
            card.className = 'restaurant-card scroll-reveal';
            card.setAttribute('data-origin', 'bottom');
            card.setAttribute('data-delay', delay);
            card.setAttribute('data-tags', res.tags.join(','));

            card.innerHTML = `
                <div class="res-img-container">
                    <img src="${res.image}" alt="${res.name}" loading="lazy">
                    <div class="res-promo-tag">${res.promo}</div>
                    <button class="favorite-btn" aria-label="Add to favorites">
                        <i class="far fa-heart"></i>
                    </button>
                </div>
                <div class="res-details">
                    <div class="res-meta-header">
                        <h3 class="res-name">${res.name}</h3>
                        <span class="res-rating"><i class="fas fa-star"></i> ${res.rating}</span>
                    </div>
                    <p class="res-cuisine">${res.cuisine}</p>
                    <div class="res-delivery-info">
                        <span><i class="far fa-clock"></i> ${res.deliveryTime}</span>
                        <span class="bullet-dot">•</span>
                        <span><i class="fas fa-bicycle"></i> ${res.distance}</span>
                        <span class="bullet-dot">•</span>
                        <span class="res-price">${res.price}</span>
                    </div>
                    <div class="res-card-footer">
                        <span class="safety-badge"><i class="fas fa-shield-halved"></i> ${res.safety}</span>
                        <button class="btn-order-now add-to-cart-trigger">Order Now</button>
                    </div>
                </div>
            `;

            // Bind individual card buttons
            const favBtn = card.querySelector('.favorite-btn');
            favBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                favBtn.classList.toggle('active');
                if (favBtn.classList.contains('active')) {
                    favBtn.querySelector('i').className = 'fas fa-heart';
                    showToast(`Added ${res.name} to Favorites!`, 'fa-heart');
                } else {
                    favBtn.querySelector('i').className = 'far fa-heart';
                    showToast(`Removed ${res.name} from Favorites.`, 'fa-heart-broken');
                }
            });

            const orderBtn = card.querySelector('.add-to-cart-trigger');
            orderBtn.addEventListener('click', () => {
                const item = restaurantDishes[res.name] || { id: Date.now(), name: res.name, price: 250, veg: true };
                addToLocalStorageCart(item);
                localStorage.setItem('gourmet_restaurant', res.name);
                window.location.href = 'payment.html';
            });

            restaurantsContainer.appendChild(card);
        });

        // Initialize scroll reveal on newly injected elements
        initializeScrollReveal();
    };

    const loadRestaurants = async (category = '', search = '', scrollToRestaurants = false) => {
        // Fallback for file:// protocol (local files) or offline mode
        if (window.location.protocol === 'file:') {
            let results = localRestaurants;
            if (category) {
                results = results.filter(r => r.tags.includes(category.toLowerCase()));
            }
            if (search) {
                const query = search.toLowerCase();
                const queryWords = query.split(/\s+/).filter(word => word.length > 2);
                results = results.filter(r => {
                    const nameMatch = r.name.toLowerCase().includes(query);
                    const cuisineMatch = r.cuisine.toLowerCase().includes(query);
                    const tagMatch = r.tags.some(tag => 
                        query.includes(tag) || tag.includes(query) || 
                        queryWords.some(word => word.includes(tag) || tag.includes(word))
                    );
                    return nameMatch || cuisineMatch || tagMatch;
                });
            }
            renderRestaurants(results);
            if (scrollToRestaurants) {
                const targetSection = document.getElementById('restaurants');
                if (targetSection) targetSection.scrollIntoView({ behavior: 'smooth' });
            }
            return;
        }

        // Standard backend API route
        try {
            let url = '/api/restaurants';
            const params = [];
            if (category) params.push(`category=${encodeURIComponent(category)}`);
            if (search) params.push(`search=${encodeURIComponent(search)}`);
            if (params.length > 0) url += `?${params.join('&')}`;

            const response = await fetch(url);
            const data = await response.json();
            if (data.success) {
                renderRestaurants(data.data);
                
                if (scrollToRestaurants) {
                    const restaurantsSection = document.getElementById('restaurants');
                    if (restaurantsSection) {
                        restaurantsSection.scrollIntoView({ behavior: 'smooth' });
                    }
                }
            }
        } catch (err) {
            console.error('Failed to load restaurants:', err);
            // Dynamic offline / server-down fallback
            let results = localRestaurants;
            if (category) results = results.filter(r => r.tags.includes(category.toLowerCase()));
            if (search) {
                const query = search.toLowerCase();
                results = results.filter(r => r.name.toLowerCase().includes(query) || r.cuisine.toLowerCase().includes(query));
            }
            renderRestaurants(results);
        }
    };

    // Load initial restaurant selection
    loadRestaurants();
    updateCartBadge();


    // ==========================================================================
    // 3. Sticky Animated Header & Back To Top Button
    // ==========================================================================
    const handleScroll = () => {
        const scrollY = window.scrollY;
        
        // Sticky Header shrink
        if (scrollY > 50) {
            navbar.classList.add('nav-scrolled');
        } else {
            navbar.classList.remove('nav-scrolled');
        }

        // Back to top button visibility
        if (scrollY > 500) {
            backToTopBtn.classList.add('show');
        } else {
            backToTopBtn.classList.remove('show');
        }

        // Active Navigation Link Highlight on Scroll
        const sections = document.querySelectorAll('section[id]');
        sections.forEach(section => {
            const sectionHeight = section.offsetHeight;
            const sectionTop = section.offsetTop - 120;
            const sectionId = section.getAttribute('id');
            
            if (scrollY > sectionTop && scrollY <= sectionTop + sectionHeight) {
                document.querySelector(`.nav-list a[href*=${sectionId}]`)?.classList.add('active');
            } else {
                document.querySelector(`.nav-list a[href*=${sectionId}]`)?.classList.remove('active');
            }
        });
    };

    window.addEventListener('scroll', handleScroll);
    
    // Back to top click handler
    backToTopBtn.addEventListener('click', () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });


    // ==========================================================================
    // 4. Premium Dark / Light Mode Toggle
    // ==========================================================================
    const savedTheme = localStorage.getItem('theme');
    
    if (savedTheme === 'light') {
        document.body.classList.remove('dark-theme');
        document.body.classList.add('light-theme');
    } else {
        document.body.classList.remove('light-theme');
        document.body.classList.add('dark-theme');
    }

    themeToggle.addEventListener('click', () => {
        if (document.body.classList.contains('dark-theme')) {
            document.body.classList.remove('dark-theme');
            document.body.classList.add('light-theme');
            localStorage.setItem('theme', 'light');
            showToast('Switched to Light Mode!', 'fa-sun');
        } else {
            document.body.classList.remove('light-theme');
            document.body.classList.add('dark-theme');
            localStorage.setItem('theme', 'dark');
            showToast('Switched to Dark Mode!', 'fa-moon');
        }
    });


    // ==========================================================================
    // 5. Mobile Menu Navigation Toggler
    // ==========================================================================
    const toggleMobileMenu = () => {
        menuToggle.classList.toggle('active');
        navMenu.classList.toggle('active');
        document.body.classList.toggle('overflow-hidden');
    };

    const closeMobileMenu = () => {
        menuToggle.classList.remove('active');
        navMenu.classList.remove('active');
        document.body.classList.remove('overflow-hidden');
    };

    menuToggle.addEventListener('click', toggleMobileMenu);

    navLinks.forEach(link => {
        link.addEventListener('click', closeMobileMenu);
    });

    document.addEventListener('click', (e) => {
        if (navMenu.classList.contains('active') && !navMenu.contains(e.target) && !menuToggle.contains(e.target)) {
            closeMobileMenu();
        }
    });


    // ==========================================================================
    // 6. Toast Notifications System
    // ==========================================================================
    let toastTimeout;
    const showToast = (message, iconClass = 'fa-check-circle') => {
        clearTimeout(toastTimeout);
        toastMessage.innerHTML = message;
        
        const iconElement = toast.querySelector('.toast-icon');
        iconElement.className = `fas ${iconClass} toast-icon`;

        toast.classList.add('show');
        
        toastTimeout = setTimeout(() => {
            toast.classList.remove('show');
        }, 3000);
    };


    // ==========================================================================
    // 7. Interactive Cart System Simulation
    // ==========================================================================
    const restaurantDishes = {
        'La Piazza': { id: 101, name: 'Pizza Margherita', price: 350, veg: true },
        'Burger Craft': { id: 102, name: 'Cheeseburger Delight', price: 250, veg: false },
        'Sushi Master': { id: 103, name: 'Spicy Tuna Sushi Roll', price: 450, veg: false },
        'Sweet Retreat': { id: 104, name: 'Belgian Waffle with Ice Cream', price: 180, veg: true },
        'Wok & Roll': { id: 105, name: 'Wok Fried Noodles', price: 220, veg: true },
        'The Green Bowl': { id: 106, name: 'Avocado Crunch Salad Bowl', price: 290, veg: true }
    };

    const galleryDishes = {
        'Charcoal Grilled Ribeye': { id: 201, name: 'Charcoal Grilled Ribeye', price: 799, veg: false },
        'Spicy Tonkotsu Ramen': { id: 202, name: 'Spicy Tonkotsu Ramen', price: 499, veg: false },
        'Smoked Salmon Tacos': { id: 203, name: 'Smoked Salmon Tacos', price: 399, veg: false },
        'Artisanal Pistachio Gelato': { id: 204, name: 'Artisanal Pistachio Gelato', price: 249, veg: true },
        'Steamed Shrimp Dim Sum': { id: 205, name: 'Steamed Shrimp Dim Sum', price: 299, veg: false },
        'Classic Mojito Mocktail': { id: 206, name: 'Classic Mojito Mocktail', price: 149, veg: true }
    };

    const addToLocalStorageCart = (item) => {
        let cart = localStorage.getItem('gourmet_cart');
        cart = cart ? JSON.parse(cart) : [];
        
        const existingItem = cart.find(c => c.name === item.name);
        if (existingItem) {
            existingItem.qty++;
        } else {
            cart.push({
                id: item.id,
                name: item.name,
                price: item.price,
                qty: 1,
                veg: item.veg
            });
        }
        
        localStorage.setItem('gourmet_cart', JSON.stringify(cart));
        updateCartBadge();
    };

    function updateCartBadge() {
        let cart = localStorage.getItem('gourmet_cart');
        cart = cart ? JSON.parse(cart) : [];
        const totalQty = cart.reduce((acc, item) => acc + item.qty, 0);
        cartCount = totalQty;
        if (cartCountElement) {
            cartCountElement.innerText = totalQty;
        }
        
        // Show/hide prominent checkout button in navbar
        const checkoutBtnNav = document.getElementById('checkout-btn-nav');
        if (checkoutBtnNav) {
            if (totalQty > 0) {
                checkoutBtnNav.style.display = 'inline-block';
            } else {
                checkoutBtnNav.style.display = 'none';
            }
        }
    }

    const incrementCartCount = (itemName = "Delicious item") => {
        let item = restaurantDishes[itemName] || galleryDishes[itemName] || { id: Date.now(), name: itemName, price: 250, veg: true };
        
        // Find which restaurant this item belongs to
        let itemRestaurant = 'GourmetExpress';
        for (const [resName, dish] of Object.entries(restaurantDishes)) {
            if (dish.name === item.name) {
                itemRestaurant = resName;
                break;
            }
        }
        
        addToLocalStorageCart(item);
        
        const currentRes = localStorage.getItem('gourmet_restaurant');
        if (!currentRes || currentRes === 'GourmetExpress') {
            localStorage.setItem('gourmet_restaurant', itemRestaurant);
        }
        
        // Bounce animation
        if (cartCountElement) {
            cartCountElement.style.animation = 'none';
            void cartCountElement.offsetWidth; // Reflow trigger
            cartCountElement.style.animation = 'cartBounce 0.3s ease-out alternate';
        }

        showToast(`${item.name} added! <a href="payment.html" style="color: #ff4b2b; font-weight: 700; text-decoration: underline; margin-left: 10px;">Checkout Now &rarr;</a>`, 'fa-cart-plus');
    };

    // Bind cart increments on gallery add buttons
    const galleryAddBtns = document.querySelectorAll('.gallery-add-btn');
    galleryAddBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            const galleryItem = btn.closest('.gallery-item');
            const dishName = galleryItem ? galleryItem.querySelector('h3').innerText : 'Dish';
            incrementCartCount(dishName);
        });
    });

    // Redirect to checkout payment.html when clicking the cart navigation button
    const cartNavBtn = document.getElementById('cart-nav');
    if (cartNavBtn) {
        cartNavBtn.addEventListener('click', () => {
            window.location.href = 'payment.html';
        });
    }


    // ==========================================================================
    // 8. Coupon Code Copy Mechanism
    // ==========================================================================
    const copyCouponBtns = document.querySelectorAll('.copy-coupon-btn');

    copyCouponBtns.forEach(btn => {
        btn.addEventListener('click', async (e) => {
            const code = btn.getAttribute('data-code');
            const icon = btn.querySelector('i');
            
            try {
                await navigator.clipboard.writeText(code);
                icon.className = 'fas fa-check';
                icon.style.color = '#2ed573';
                
                showToast(`Promo code "${code}" copied to clipboard!`, 'fa-clipboard-check');
                
                setTimeout(() => {
                    icon.className = 'far fa-copy';
                    icon.style.color = '';
                }, 2000);
            } catch (err) {
                showToast('Failed to copy code. Please type it manually!', 'fa-circle-xmark');
            }
        });
    });


    // ==========================================================================
    // 9. Autocomplete Search Bar & Suggestion Retrieval
    // ==========================================================================
    const searchInput = document.getElementById('hero-search-input');
    const suggestionsList = document.getElementById('search-suggestions');
    const searchBtn = document.getElementById('hero-search-btn');

    const renderSuggestions = (results) => {
        suggestionsList.innerHTML = '';
        if (results.length === 0) {
            const noMatchLi = document.createElement('li');
            noMatchLi.className = 'suggestion-item';
            noMatchLi.style.cursor = 'default';
            noMatchLi.innerHTML = `<i class="fas fa-question-circle"></i> <span>No matching dishes found</span>`;
            suggestionsList.appendChild(noMatchLi);
        } else {
            results.forEach(dish => {
                const li = document.createElement('li');
                li.className = 'suggestion-item';
                li.innerHTML = `<i class="fas fa-utensils"></i> <span>${dish.name}</span>`;
                
                li.addEventListener('click', () => {
                    searchInput.value = dish.name;
                    suggestionsList.classList.add('hidden');
                    loadRestaurants(dish.category, '', true);
                });
                
                suggestionsList.appendChild(li);
            });
        }
        suggestionsList.classList.remove('hidden');
    };

    searchInput.addEventListener('input', async (e) => {
        const query = e.target.value.toLowerCase().trim();
        
        if (query.length === 0) {
            suggestionsList.innerHTML = '';
            suggestionsList.classList.add('hidden');
            return;
        }

        if (window.location.protocol === 'file:') {
            const filtered = localDishes.filter(dish => 
                dish.name.toLowerCase().includes(query) ||
                dish.category.toLowerCase().includes(query)
            );
            renderSuggestions(filtered);
            return;
        }

        try {
            const res = await fetch(`/api/search-suggestions?query=${encodeURIComponent(query)}`);
            const data = await res.json();
            if (data.success) {
                renderSuggestions(data.data);
            }
        } catch (err) {
            console.error('Failed to retrieve suggestions:', err);
            const filtered = localDishes.filter(dish => 
                dish.name.toLowerCase().includes(query) ||
                dish.category.toLowerCase().includes(query)
            );
            renderSuggestions(filtered);
        }
    });

    document.addEventListener('click', (e) => {
        if (!searchInput.contains(e.target) && !suggestionsList.contains(e.target)) {
            suggestionsList.classList.add('hidden');
        }
    });

    const executeSearch = () => {
        const query = searchInput.value.toLowerCase().trim();
        if (!query) {
            showToast('Please type a search query first!', 'fa-triangle-exclamation');
            return;
        }

        loadRestaurants('', query, true);
    };

    searchBtn.addEventListener('click', executeSearch);
    searchInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') executeSearch();
    });

    // Category Card click triggers restaurant filter
    const categoryCards = document.querySelectorAll('.category-card');
    categoryCards.forEach(card => {
        card.addEventListener('click', () => {
            const category = card.getAttribute('data-category');
            loadRestaurants(category, '', true);
        });
    });


    // ==========================================================================
    // 10. Testimonial Slider Carousel Logic
    // ==========================================================================
    const slides = document.querySelectorAll('.testimonial-slide');
    const prevBtn = document.getElementById('prev-review');
    const nextBtn = document.getElementById('next-review');
    const dotsContainer = document.getElementById('slider-dots-container');
    let currentSlide = 0;
    let autoSlideInterval;

    if (slides.length > 0) {
        slides.forEach((_, index) => {
            const dot = document.createElement('div');
            dot.className = `slider-dot ${index === 0 ? 'active' : ''}`;
            dot.addEventListener('click', () => {
                goToSlide(index);
                resetAutoSlide();
            });
            dotsContainer.appendChild(dot);
        });

        const dots = document.querySelectorAll('.slider-dot');

        const goToSlide = (n) => {
            slides[currentSlide].classList.remove('active');
            dots[currentSlide].classList.remove('active');
            
            currentSlide = (n + slides.length) % slides.length;
            
            slides[currentSlide].classList.add('active');
            dots[currentSlide].classList.add('active');
        };

        const nextSlide = () => {
            goToSlide(currentSlide + 1);
        };

        const prevSlide = () => {
            goToSlide(currentSlide - 1);
        };

        nextBtn.addEventListener('click', () => {
            nextSlide();
            resetAutoSlide();
        });

        prevBtn.addEventListener('click', () => {
            prevSlide();
            resetAutoSlide();
        });

        const startAutoSlide = () => {
            autoSlideInterval = setInterval(nextSlide, 6000);
        };

        const resetAutoSlide = () => {
            clearInterval(autoSlideInterval);
            startAutoSlide();
        };

        const sliderContainer = document.querySelector('.testimonials-slider-container');
        sliderContainer.addEventListener('mouseenter', () => clearInterval(autoSlideInterval));
        sliderContainer.addEventListener('mouseleave', startAutoSlide);

        startAutoSlide();
    }


    // ==========================================================================
    // 11. Newsletter Form Submission (Linked to API with Local Fallback)
    // ==========================================================================
    const newsletterForm = document.getElementById('newsletter-form');
    const emailInput = document.getElementById('newsletter-email');
    const statusText = document.getElementById('newsletter-status');

    if (newsletterForm) {
        newsletterForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const emailValue = emailInput.value.trim();
            statusText.classList.remove('hidden', 'success', 'error');

            if (!emailValue) {
                statusText.innerText = 'Please enter an email address.';
                statusText.classList.add('error');
                showToast('Email address is required!', 'fa-circle-xmark');
                return;
            }

            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(emailValue)) {
                statusText.innerText = 'Please enter a valid email address.';
                statusText.classList.add('error');
                showToast('Invalid email address!', 'fa-triangle-exclamation');
                return;
            }

            if (window.location.protocol === 'file:') {
                statusText.innerText = 'Welcome to the club! (Local Mode: Check your inbox for a 15% VIP discount code)';
                statusText.classList.add('success');
                emailInput.value = '';
                showToast('Subscribed locally!', 'fa-envelope-circle-check');
                return;
            }

            try {
                const response = await fetch('/api/newsletter', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ email: emailValue })
                });
                
                const data = await response.json();
                
                if (response.ok && data.success) {
                    statusText.innerText = data.message;
                    statusText.classList.add('success');
                    emailInput.value = '';
                    showToast('Subscribed to Newsletter!', 'fa-envelope-circle-check');
                } else {
                    statusText.innerText = data.message || 'Subscription failed.';
                    statusText.classList.add('error');
                    showToast(data.message || 'Invalid email address!', 'fa-triangle-exclamation');
                }
            } catch (err) {
                // Fallback for network issues
                statusText.innerText = 'Welcome to the club! (Offline: Check your inbox for a 15% VIP discount code)';
                statusText.classList.add('success');
                emailInput.value = '';
                showToast('Subscribed offline!', 'fa-envelope-circle-check');
            }
        });
    }


    // ==========================================================================
    // 12. Custom Light-weight Scroll Reveal Engine (Intersection Observer)
    // ==========================================================================
    function initializeScrollReveal() {
        const revealElements = document.querySelectorAll('.scroll-reveal:not(.revealed)');

        if ('IntersectionObserver' in window && revealElements.length > 0) {
            revealElements.forEach(el => {
                el.style.opacity = '0';
                const origin = el.getAttribute('data-origin') || 'bottom';
                
                let transformStr = 'translateY(40px)';
                if (origin === 'top') transformStr = 'translateY(-40px)';
                else if (origin === 'left') transformStr = 'translateX(-40px)';
                else if (origin === 'right') transformStr = 'translateX(40px)';
                else if (origin === 'zoom') transformStr = 'scale(0.92)';

                el.style.transform = transformStr;
                el.style.transition = 'opacity 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94), transform 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
            });

            const revealCallback = (entries, observer) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const el = entry.target;
                        const delay = parseInt(el.getAttribute('data-delay')) || 0;
                        
                        setTimeout(() => {
                            el.style.opacity = '1';
                            el.style.transform = 'translate(0) scale(1)';
                            el.classList.add('revealed');
                        }, delay);
                        
                        observer.unobserve(el);
                    }
                });
            };

            const revealObserver = new IntersectionObserver(revealCallback, {
                root: null,
                threshold: 0.1,
                rootMargin: '0px 0px -20px 0px'
            });

            revealElements.forEach(el => {
                revealObserver.observe(el);
            });
        } else {
            revealElements.forEach(el => {
                el.style.opacity = '1';
                el.style.transform = 'none';
                el.classList.add('revealed');
            });
        }
    }
});
