/* ==========================================================================
   PARTICLE CANVAS SYSTEM
   ========================================================================== */
const canvas = document.getElementById('particle-canvas');
const ctx = canvas.getContext('2d');

let particlesArray = [];
const maxParticles = 60;
const mouse = {
    x: null,
    y: null,
    radius: 120
};

// Listen to mouse coordinates
window.addEventListener('mousemove', function(e) {
    mouse.x = e.x;
    mouse.y = e.y;
});

window.addEventListener('mouseleave', function() {
    mouse.x = null;
    mouse.y = null;
});

// Resize canvas
function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas();

// Particle Blueprints
class Particle {
    constructor() {
        this.x = Math.random() * canvas.width;
        this.y = canvas.height + Math.random() * 100;
        this.size = Math.random() * 3 + 1;
        this.speedX = Math.random() * 0.8 - 0.4;
        this.speedY = -(Math.random() * 1.2 + 0.4); // Floating upwards
        this.alpha = Math.random() * 0.5 + 0.1;
        this.baseAlpha = this.alpha;
    }

    update() {
        this.x += this.speedX;
        this.y += this.speedY;

        // Reset if float off top
        if (this.y < -10) {
            this.y = canvas.height + 10;
            this.x = Math.random() * canvas.width;
            this.alpha = this.baseAlpha;
        }

        // Mouse interaction (repulsion)
        if (mouse.x !== null && mouse.y !== null) {
            let dx = this.x - mouse.x;
            let dy = this.y - mouse.y;
            let distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance < mouse.radius) {
                let forceDirectionX = dx / distance;
                let forceDirectionY = dy / distance;
                let force = (mouse.radius - distance) / mouse.radius;
                
                // Disperse speed
                this.x += forceDirectionX * force * 3;
                this.y += forceDirectionY * force * 3;
                this.alpha = Math.min(1, this.alpha + 0.05); // Highlight
            } else {
                if (this.alpha > this.baseAlpha) {
                    this.alpha -= 0.01;
                }
            }
        }
    }

    draw() {
        // Light glowing orange/red embers
        ctx.save();
        ctx.globalAlpha = this.alpha;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        
        // Ember theme colors
        ctx.fillStyle = document.body.classList.contains('dark-theme') 
            ? 'rgba(255, 71, 87, 0.8)' 
            : 'rgba(255, 107, 129, 0.6)';
            
        ctx.shadowBlur = this.size * 2;
        ctx.shadowColor = '#ff4757';
        ctx.fill();
        ctx.restore();
    }
}

// Initialise Particle Array
function initParticles() {
    particlesArray = [];
    for (let i = 0; i < maxParticles; i++) {
        particlesArray.push(new Particle());
    }
}
initParticles();

// Animation Loop
function animateParticles() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (let i = 0; i < particlesArray.length; i++) {
        particlesArray[i].update();
        particlesArray[i].draw();
    }
    requestAnimationFrame(animateParticles);
}
animateParticles();


/* ==========================================================================
   THEME TOGGLE SYSTEM
   ========================================================================== */
const themeToggleBtn = document.getElementById('theme-toggle-btn');
const currentTheme = localStorage.getItem('theme') || 'dark';

// Set loaded theme
if (currentTheme === 'light') {
    document.body.classList.remove('dark-theme');
    document.body.classList.add('light-theme');
} else {
    document.body.classList.add('dark-theme');
    document.body.classList.remove('light-theme');
}

// Toggle Theme click handler
themeToggleBtn.addEventListener('click', () => {
    if (document.body.classList.contains('dark-theme')) {
        document.body.classList.remove('dark-theme');
        document.body.classList.add('light-theme');
        localStorage.setItem('theme', 'light');
    } else {
        document.body.classList.remove('light-theme');
        document.body.classList.add('dark-theme');
        localStorage.setItem('theme', 'dark');
    }
});


/* ==========================================================================
   MOBILE HAMBURGER MENU SYSTEM
   ========================================================================== */
const hamburgerBtn = document.getElementById('hamburger-btn');
const mobileMenu = document.getElementById('mobile-menu');

hamburgerBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    hamburgerBtn.classList.toggle('active');
    mobileMenu.classList.toggle('active');
});

// Close mobile menu if clicked outside
document.addEventListener('click', (e) => {
    if (mobileMenu.classList.contains('active') && !mobileMenu.contains(e.target) && e.target !== hamburgerBtn) {
        hamburgerBtn.classList.remove('active');
        mobileMenu.classList.remove('active');
    }
});


/* ==========================================================================
   SHOW / HIDE PASSWORD TOGGLE
   ========================================================================== */
const toggleButtons = document.querySelectorAll('.password-toggle-btn');

toggleButtons.forEach(btn => {
    btn.addEventListener('click', () => {
        const targetId = btn.getAttribute('data-target');
        const inputField = document.getElementById(targetId);
        const icon = btn.querySelector('.eye-icon');

        if (inputField.type === 'password') {
            inputField.type = 'text';
            icon.classList.remove('fa-eye-slash');
            icon.classList.add('fa-eye');
        } else {
            inputField.type = 'password';
            icon.classList.remove('fa-eye');
            icon.classList.add('fa-eye-slash');
        }
    });
});


/* ==========================================================================
   FORM VALIDATION SYSTEM
   ========================================================================== */
const form = document.getElementById('registration-form');

// Inputs mapping
const inputs = {
    fullName: {
        el: document.getElementById('full-name'),
        err: document.getElementById('name-error'),
        validate: validateFullName
    },
    email: {
        el: document.getElementById('email'),
        err: document.getElementById('email-error'),
        validate: validateEmail
    },
    phone: {
        el: document.getElementById('phone'),
        err: document.getElementById('phone-error'),
        validate: validatePhone
    },
    dob: {
        el: document.getElementById('dob'),
        err: document.getElementById('dob-error'),
        validate: validateDOB
    },
    favCategory: {
        el: document.getElementById('fav-category'),
        err: document.getElementById('category-error'),
        validate: validateCategory
    },
    address: {
        el: document.getElementById('address'),
        err: document.getElementById('address-error'),
        validate: validateAddress
    },
    password: {
        el: document.getElementById('password'),
        err: document.getElementById('password-error'),
        validate: validatePassword
    },
    confirmPassword: {
        el: document.getElementById('confirm-password'),
        err: document.getElementById('confirm-error'),
        validate: validateConfirmPassword
    },
    terms: {
        el: document.getElementById('terms-checkbox'),
        err: document.getElementById('terms-error'),
        validate: validateTerms
    }
};

// Gender helper validation (not standard input field wrapper)
const genderRadios = document.getElementsByName('gender');
const genderError = document.getElementById('gender-error');

// Strip non-numbers in phone input dynamically
inputs.phone.el.addEventListener('input', (e) => {
    e.target.value = e.target.value.replace(/\D/g, '');
});

// Attach event listeners for real-time validation
Object.keys(inputs).forEach(key => {
    const field = inputs[key];
    
    // Validate on input changes
    field.el.addEventListener('input', () => {
        field.validate();
    });

    // Validate on losing focus
    field.el.addEventListener('blur', () => {
        field.validate();
    });

    // Handle selects/checkbox changes
    field.el.addEventListener('change', () => {
        field.validate();
    });
});

// Special listener on Gender radio change
genderRadios.forEach(radio => {
    radio.addEventListener('change', validateGender);
});

// Utility: Show error state
function showError(inputEl, errorEl, message) {
    inputEl.classList.add('input-error');
    errorEl.textContent = message;
    errorEl.classList.add('visible');
}

// Utility: Clear error state
function clearError(inputEl, errorEl) {
    inputEl.classList.remove('input-error');
    errorEl.classList.remove('visible');
    // Keep space but empty content slightly delayed for smoother animations
    setTimeout(() => {
        if (!errorEl.classList.contains('visible')) {
            errorEl.textContent = '';
        }
    }, 200);
}

// 1. Full Name Validation
function validateFullName() {
    const val = inputs.fullName.el.value.trim();
    const nameRegex = /^[a-zA-Z\s]{3,40}$/;
    
    if (val === '') {
        showError(inputs.fullName.el, inputs.fullName.err, 'Full Name is required');
        return false;
    } else if (val.length < 3) {
        showError(inputs.fullName.el, inputs.fullName.err, 'Name must be at least 3 characters');
        return false;
    } else if (!nameRegex.test(val)) {
        showError(inputs.fullName.el, inputs.fullName.err, 'Name must contain only alphabets and spaces');
        return false;
    }
    
    clearError(inputs.fullName.el, inputs.fullName.err);
    return true;
}

// 2. Email Validation
function validateEmail() {
    const val = inputs.email.el.value.trim();
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    
    if (val === '') {
        showError(inputs.email.el, inputs.email.err, 'Email address is required');
        return false;
    } else if (!emailRegex.test(val)) {
        showError(inputs.email.el, inputs.email.err, 'Please enter a valid email address');
        return false;
    }
    
    clearError(inputs.email.el, inputs.email.err);
    return true;
}

// 3. Phone Validation
function validatePhone() {
    const val = inputs.phone.el.value.trim();
    
    if (val === '') {
        showError(inputs.phone.el, inputs.phone.err, 'Phone number is required');
        return false;
    } else if (val.length !== 10) {
        showError(inputs.phone.el, inputs.phone.err, 'Phone number must be exactly 10 digits');
        return false;
    }
    
    clearError(inputs.phone.el, inputs.phone.err);
    return true;
}

// 4. Date of Birth & Min Age 13 Validation
function validateDOB() {
    const val = inputs.dob.el.value;
    
    if (!val) {
        showError(inputs.dob.el, inputs.dob.err, 'Date of birth is required');
        return false;
    }
    
    const today = new Date();
    const birthDate = new Date(val);
    
    if (birthDate > today) {
        showError(inputs.dob.el, inputs.dob.err, 'Date of birth cannot be in the future');
        return false;
    }
    
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
        age--;
    }
    
    if (age < 13) {
        showError(inputs.dob.el, inputs.dob.err, 'You must be at least 13 years old to register');
        return false;
    }
    
    clearError(inputs.dob.el, inputs.dob.err);
    return true;
}

// 5. Favorite Category Validation
function validateCategory() {
    const val = inputs.favCategory.el.value;
    
    if (val === '') {
        showError(inputs.favCategory.el, inputs.favCategory.err, 'Please select your favorite food category');
        return false;
    }
    
    clearError(inputs.favCategory.el, inputs.favCategory.err);
    return true;
}

// 6. Delivery Address Validation
function validateAddress() {
    const val = inputs.address.el.value.trim();
    
    if (val === '') {
        showError(inputs.address.el, inputs.address.err, 'Delivery address is required');
        return false;
    } else if (val.length < 10) {
        showError(inputs.address.el, inputs.address.err, 'Please enter a complete address (min 10 characters)');
        return false;
    }
    
    clearError(inputs.address.el, inputs.address.err);
    return true;
}

// 7. Password Strength & Complexity Validation
function validatePassword() {
    const val = inputs.password.el.value;
    const strengthBar = document.getElementById('strength-bar');
    const strengthText = document.getElementById('strength-text');
    
    if (val === '') {
        strengthBar.className = 'strength-bar';
        strengthText.textContent = 'Password Strength';
        showError(inputs.password.el, inputs.password.err, 'Password is required');
        return false;
    }
    
    // Calculate Strength Score (0 to 4)
    let score = 0;
    const requirements = {
        length: val.length >= 8,
        uppercase: /[A-Z]/.test(val),
        lowercase: /[a-z]/.test(val),
        number: /[0-9]/.test(val),
        special: /[^A-Za-z0-9]/.test(val)
    };
    
    if (requirements.length) score++;
    if (requirements.uppercase && requirements.lowercase) score++;
    if (requirements.number) score++;
    if (requirements.special) score++;
    
    // Update visual strength indicator
    strengthBar.className = 'strength-bar';
    if (score <= 2) {
        strengthBar.classList.add('weak');
        strengthText.textContent = 'Weak';
        strengthText.style.color = '#ff4757';
    } else if (score === 3) {
        strengthBar.classList.add('medium');
        strengthText.textContent = 'Medium';
        strengthText.style.color = '#ffa400';
    } else if (score === 4) {
        strengthBar.classList.add('strong');
        strengthText.textContent = 'Strong';
        strengthText.style.color = '#2ed573';
    }
    
    // Complexity Requirements Check for submission
    if (val.length < 8) {
        showError(inputs.password.el, inputs.password.err, 'Password must be at least 8 characters long');
        return false;
    }
    if (!requirements.uppercase || !requirements.lowercase) {
        showError(inputs.password.el, inputs.password.err, 'Password must contain both uppercase and lowercase letters');
        return false;
    }
    if (!requirements.number) {
        showError(inputs.password.el, inputs.password.err, 'Password must contain at least one digit');
        return false;
    }
    if (!requirements.special) {
        showError(inputs.password.el, inputs.password.err, 'Password must contain at least one special character');
        return false;
    }
    
    clearError(inputs.password.el, inputs.password.err);
    return true;
}

// 8. Confirm Password Validation
function validateConfirmPassword() {
    const passVal = inputs.password.el.value;
    const confirmVal = inputs.confirmPassword.el.value;
    
    if (confirmVal === '') {
        showError(inputs.confirmPassword.el, inputs.confirmPassword.err, 'Please confirm your password');
        return false;
    } else if (passVal !== confirmVal) {
        showError(inputs.confirmPassword.el, inputs.confirmPassword.err, 'Passwords do not match');
        return false;
    }
    
    clearError(inputs.confirmPassword.el, inputs.confirmPassword.err);
    return true;
}

// 9. Terms and Conditions validation
function validateTerms() {
    if (!inputs.terms.el.checked) {
        inputs.terms.el.nextElementSibling.style.borderColor = '#ff4757';
        inputs.terms.err.textContent = 'You must agree to the Terms & Conditions';
        inputs.terms.err.classList.add('visible');
        return false;
    }
    
    inputs.terms.el.nextElementSibling.style.borderColor = '';
    inputs.terms.err.classList.remove('visible');
    return true;
}

// 10. Gender Validation
function validateGender() {
    let checked = false;
    for (let i = 0; i < genderRadios.length; i++) {
        if (genderRadios[i].checked) {
            checked = true;
            break;
        }
    }
    
    if (!checked) {
        genderError.textContent = 'Please select your gender';
        genderError.classList.add('visible');
        return false;
    }
    
    genderError.classList.remove('visible');
    return true;
}


/* ==========================================================================
   FORM SUBMISSION & SUCCESS FLOW
   ========================================================================== */
form.addEventListener('submit', (e) => {
    e.preventDefault();
    
    // Run all validations
    const isNameValid = validateFullName();
    const isEmailValid = validateEmail();
    const isPhoneValid = validatePhone();
    const isDobValid = validateDOB();
    const isCategoryValid = validateCategory();
    const isGenderValid = validateGender();
    const isAddressValid = validateAddress();
    const isPasswordValid = validatePassword();
    const isConfirmValid = validateConfirmPassword();
    const isTermsValid = validateTerms();
    
    const isFormValid = isNameValid && 
                        isEmailValid && 
                        isPhoneValid && 
                        isDobValid && 
                        isCategoryValid && 
                        isGenderValid && 
                        isAddressValid && 
                        isPasswordValid && 
                        isConfirmValid && 
                        isTermsValid;
                        
    if (!isFormValid) {
        // Scroll to the first error element
        const firstErrorEl = document.querySelector('.input-error, .error-msg.visible');
        if (firstErrorEl) {
            firstErrorEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
            
            // Focus on input element inside that container if available
            const inputField = firstErrorEl.closest('.form-group')?.querySelector('.form-control');
            if (inputField) {
                setTimeout(() => inputField.focus(), 800);
            }
        }
        return;
    }
    
    // If valid, trigger loading spinner simulation
    form.classList.add('submitting');
    
    setTimeout(() => {
        // Complete the mock submit network call
        form.classList.remove('submitting');
        
        // Show success modal popup
        const modal = document.getElementById('success-modal');
        modal.classList.add('active');
        modal.setAttribute('aria-hidden', 'false');
        
        // Simulate redirect countdown (3 seconds)
        let countdownValue = 3;
        const countdownNum = document.getElementById('countdown-num');
        const progressBarFill = document.getElementById('redirect-progress-fill');
        
        // Set transition property on bar width, then immediately set it to 0 width (shrinking indicator)
        progressBarFill.style.width = '0%';
        
        const countdownInterval = setInterval(() => {
            countdownValue--;
            if (countdownNum) {
                countdownNum.textContent = countdownValue;
            }
            
            if (countdownValue <= 0) {
                clearInterval(countdownInterval);
                // Simulate landing dashboard redirect
                window.location.href = '#dashboard-simulation';
                
                // Show completed alert for testing environment
                alert('Success! Simulated redirect to: ' + window.location.origin + '/dashboard.html');
                
                // Reset form and close modal
                form.reset();
                modal.classList.remove('active');
                modal.setAttribute('aria-hidden', 'true');
                progressBarFill.style.width = '100%';
                
                // Clear password strength indicator
                document.getElementById('strength-bar').className = 'strength-bar';
                document.getElementById('strength-text').textContent = 'Password Strength';
            }
        }, 1000);
        
    }, 2500); // 2.5s network simulation
});

/* ==========================================================================
   SOCIAL MEDIA SIGN-IN OAUTH SIMULATOR
   ========================================================================== */
const socialAuthModal = document.getElementById('social-auth-modal');
const socialAuthLogo = document.getElementById('social-auth-logo');
const socialAuthTitle = document.getElementById('social-auth-title');
const socialAuthMsg = document.getElementById('social-auth-msg');

const stepConnect = document.getElementById('step-connect');
const stepAuth = document.getElementById('step-auth');
const stepImport = document.getElementById('step-import');

// Mock data matching user input formats
const socialMockData = {
    google: {
        fullName: "Roja Ghantasala",
        email: "rojaghantasala4869@gmail.com",
        phone: "9949962012",
        dob: "1998-05-15",
        favCategory: "desserts",
        gender: "female",
        address: "123 Sweet Street, Dessert Town, NY 10014",
        password: "SecurePassword@123",
        confirmPassword: "SecurePassword@123"
    },
    facebook: {
        fullName: "Roja Kumar",
        email: "roja.facebook@gmail.com",
        phone: "9949962012",
        dob: "1997-08-20",
        favCategory: "burger",
        gender: "male",
        address: "456 Burger Avenue, Fast Food City, CA 90210",
        password: "FacebookUser#456",
        confirmPassword: "FacebookUser#456"
    },
    instagram: {
        fullName: "Roja Foodie",
        email: "roja.insta@gmail.com",
        phone: "9949962012",
        dob: "2000-11-12",
        favCategory: "pizza",
        gender: "other",
        address: "789 Pizza Lane, Crust Valley, FL 33101",
        password: "InstaLovers$789",
        confirmPassword: "InstaLovers$789"
    }
};

// Social buttons click listeners
document.querySelector('.google-btn').addEventListener('click', () => startSocialSimulation('google'));
document.querySelector('.facebook-btn').addEventListener('click', () => startSocialSimulation('facebook'));
document.querySelector('.instagram-btn').addEventListener('click', () => startSocialSimulation('instagram'));

function startSocialSimulation(platform) {
    // 1. Reset steps visually
    resetAuthStep(stepConnect, true, 'Secure Connection');
    resetAuthStep(stepAuth, false, 'Profile Authorization');
    resetAuthStep(stepImport, false, 'Importing Information');

    // 2. Configure Brand Logo
    socialAuthLogo.className = 'social-auth-logo'; // Reset
    if (platform === 'google') {
        socialAuthLogo.classList.add('google-active');
        socialAuthLogo.innerHTML = '<i class="fab fa-google"></i>';
        socialAuthTitle.textContent = 'Connecting to Google...';
    } else if (platform === 'facebook') {
        socialAuthLogo.classList.add('facebook-active');
        socialAuthLogo.innerHTML = '<i class="fab fa-facebook-f"></i>';
        socialAuthTitle.textContent = 'Connecting to Facebook...';
    } else if (platform === 'instagram') {
        socialAuthLogo.classList.add('instagram-active');
        socialAuthLogo.innerHTML = '<i class="fab fa-instagram"></i>';
        socialAuthTitle.textContent = 'Connecting to Instagram...';
    }
    socialAuthMsg.textContent = 'Establishing a secure OAuth 2.0 handshake...';

    // 3. Open Modal
    socialAuthModal.classList.add('active');
    socialAuthModal.setAttribute('aria-hidden', 'false');

    // 4. Run step sequence
    // Step 1 Completed -> Step 2 Active
    setTimeout(() => {
        completeAuthStep(stepConnect);
        activateAuthStep(stepAuth);
        socialAuthTitle.textContent = 'Authorizing Profile Access...';
        socialAuthMsg.textContent = 'Requesting read permissions for name, email, and gender details...';
    }, 1200);

    // Step 2 Completed -> Step 3 Active
    setTimeout(() => {
        completeAuthStep(stepAuth);
        activateAuthStep(stepImport);
        socialAuthTitle.textContent = 'Retrieving Profile Data...';
        socialAuthMsg.textContent = 'Importing verified records and autofilling form layout...';
    }, 2400);

    // Complete all steps & autofill
    setTimeout(() => {
        completeAuthStep(stepImport);
        
        // Populate fields with platform mock data
        const mockData = socialMockData[platform];
        
        // Autofill regular input elements
        Object.keys(inputs).forEach(key => {
            if (key !== 'gender' && key !== 'terms') {
                inputs[key].el.value = mockData[key];
                // Dispatch events to trigger floating labels and run check validation
                inputs[key].el.dispatchEvent(new Event('input'));
                inputs[key].el.dispatchEvent(new Event('change'));
            }
        });
        
        // Select Gender radio Capsule
        const genderRadio = document.querySelector(`input[name="gender"][value="${mockData.gender}"]`);
        if (genderRadio) {
            genderRadio.checked = true;
            validateGender();
        }

        // Accept Terms
        inputs.terms.el.checked = true;
        inputs.terms.validate();
        
        // Hide Modal
        setTimeout(() => {
            socialAuthModal.classList.remove('active');
            socialAuthModal.setAttribute('aria-hidden', 'true');
        }, 500);

    }, 3600);
}

function resetAuthStep(stepEl, isActive, text) {
    stepEl.className = 'auth-step';
    const iconWrapper = stepEl.querySelector('.step-icon-wrapper');
    if (isActive) {
        stepEl.classList.add('active');
        iconWrapper.innerHTML = '<i class="fas fa-circle-notch fa-spin text-accent"></i>';
    } else {
        iconWrapper.innerHTML = '<i class="far fa-circle"></i>';
    }
}

function activateAuthStep(stepEl) {
    stepEl.classList.add('active');
    const iconWrapper = stepEl.querySelector('.step-icon-wrapper');
    iconWrapper.innerHTML = '<i class="fas fa-circle-notch fa-spin text-accent"></i>';
}

function completeAuthStep(stepEl) {
    stepEl.classList.remove('active');
    stepEl.classList.add('completed');
    const iconWrapper = stepEl.querySelector('.step-icon-wrapper');
    iconWrapper.innerHTML = '<i class="fas fa-check-circle text-success"></i>';
}

