document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');
    const loginCard = document.querySelector('.login-card');
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const togglePasswordBtn = document.getElementById('togglePassword');
    const eyeIcon = document.getElementById('eyeIcon');
    const loginBtn = document.getElementById('loginBtn');

    // Regex for standard email format validation
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

    // 1. Show/Hide Password Toggle
    togglePasswordBtn.addEventListener('click', () => {
        const isPassword = passwordInput.getAttribute('type') === 'password';
        passwordInput.setAttribute('type', isPassword ? 'text' : 'password');

        // Change Icon
        if (isPassword) {
            eyeIcon.classList.remove('fa-regular', 'fa-eye');
            eyeIcon.classList.add('fa-solid', 'fa-eye-slash');
            togglePasswordBtn.setAttribute('aria-label', 'Hide password');
        } else {
            eyeIcon.classList.remove('fa-solid', 'fa-eye-slash');
            eyeIcon.classList.add('fa-regular', 'fa-eye');
            togglePasswordBtn.setAttribute('aria-label', 'Show password');
        }
    });

    // Helper function to show error on a field
    const showError = (inputElement, errorElementId, message) => {
        const inputGroup = inputElement.closest('.input-group');
        const errorSpan = document.getElementById(errorElementId);

        inputGroup.classList.add('error');
        errorSpan.textContent = message;
    };

    // Helper function to clear error on a field
    const clearError = (inputElement, errorElementId) => {
        const inputGroup = inputElement.closest('.input-group');
        const errorSpan = document.getElementById(errorElementId);

        inputGroup.classList.remove('error');
        errorSpan.textContent = '';
    };

    // Live input validation (removes error as user types)
    emailInput.addEventListener('input', () => {
        if (emailInput.value.trim() !== '') {
            if (emailRegex.test(emailInput.value.trim())) {
                clearError(emailInput, 'emailError');
            } else {
                showError(emailInput, 'emailError', 'Please enter a valid email address');
            }
        } else {
            clearError(emailInput, 'emailError');
        }
    });

    passwordInput.addEventListener('input', () => {
        if (passwordInput.value.trim() !== '') {
            clearError(passwordInput, 'passwordError');
        }
    });

    // 2. Form Submit & Validation
    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const emailValue = emailInput.value.trim();
        const passwordValue = passwordInput.value.trim();
        let isValid = true;

        // Email validation
        if (emailValue === '') {
            showError(emailInput, 'emailError', 'Email address is required');
            isValid = false;
        } else if (!emailRegex.test(emailValue)) {
            showError(emailInput, 'emailError', 'Please enter a valid email address');
            isValid = false;
        } else {
            clearError(emailInput, 'emailError');
        }

        // Password validation
        if (passwordValue === '') {
            showError(passwordInput, 'passwordError', 'Password is required');
            isValid = false;
        } else if (passwordValue.length < 6) {
            showError(passwordInput, 'passwordError', 'Password must be at least 6 characters');
            isValid = false;
        } else {
            clearError(passwordInput, 'passwordError');
        }

        // Shake animation on error
        if (!isValid) {
            loginCard.classList.remove('shake');
            // Trigger reflow to restart animation
            void loginCard.offsetWidth;
            loginCard.classList.add('shake');
            return;
        }

        // 3. Loading animation on login button
        startLoadingState();

        // Simulate API call / login success
        setTimeout(() => {
            stopLoadingState();
            alert('🎉 Login successful! Redirecting to dashboard...');
            // Reset form
            loginForm.reset();
        }, 2000);
    });

    const startLoadingState = () => {
        loginBtn.classList.add('loading');
        loginBtn.disabled = true;
        emailInput.disabled = true;
        passwordInput.disabled = true;
        togglePasswordBtn.disabled = true;
    };

    const stopLoadingState = () => {
        loginBtn.classList.remove('loading');
        loginBtn.disabled = false;
        emailInput.disabled = false;
        passwordInput.disabled = false;
        togglePasswordBtn.disabled = false;
    };
});
