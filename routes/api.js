const express = require('express');
const router = express.Router();

// Mock database in memory
const restaurants = [
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

const mockDishes = [
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

const newsletterSubscriptions = [];

// GET: Fetch all restaurants
router.get('/restaurants', (req, res) => {
    const { category, search } = req.query;
    let results = restaurants;

    if (category) {
        results = results.filter(r => r.tags.includes(category.toLowerCase()));
    }

    if (search) {
        const query = search.toLowerCase();
        const queryWords = query.split(/\s+/).filter(word => word.length > 2);
        
        results = results.filter(r => {
            const nameMatch = r.name.toLowerCase().includes(query);
            const cuisineMatch = r.cuisine.toLowerCase().includes(query);
            
            // Check if any word in the search query matches the restaurant's tags
            const tagMatch = r.tags.some(tag => 
                query.includes(tag) || tag.includes(query) || 
                queryWords.some(word => word.includes(tag) || tag.includes(word))
            );
            
            return nameMatch || cuisineMatch || tagMatch;
        });
    }

    res.json({ success: true, count: results.length, data: results });
});

// GET: Fetch search suggestions autocomplete
router.get('/search-suggestions', (req, res) => {
    const { query } = req.query;
    if (!query) {
        return res.json({ success: true, data: [] });
    }

    const filtered = mockDishes.filter(dish => 
        dish.name.toLowerCase().includes(query.toLowerCase()) ||
        dish.category.toLowerCase().includes(query.toLowerCase())
    );

    res.json({ success: true, data: filtered });
});

// POST: Subscribe to Newsletter
router.post('/newsletter', (req, res) => {
    const { email } = req.body;
    
    if (!email) {
        return res.status(400).json({ success: false, message: 'Email address is required.' });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return res.status(400).json({ success: false, message: 'Invalid email address format.' });
    }

    if (!newsletterSubscriptions.includes(email)) {
        newsletterSubscriptions.push(email);
    }

    res.json({ 
        success: true, 
        message: 'Successfully subscribed to the Gourmet Club! Check your inbox for a 15% VIP discount.' 
    });
});

// POST: Place mock Order
router.post('/orders', (req, res) => {
    const { items, total } = req.body;

    res.json({
        success: true,
        orderId: `GE-${Math.floor(100000 + Math.random() * 900000)}`,
        message: 'Order received! Tracking partner is on their way.',
        estimatedDelivery: '25 Mins'
    });
});

module.exports = router;
