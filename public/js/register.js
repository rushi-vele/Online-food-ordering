document.addEventListener('DOMContentLoaded', () => {
  const registerForm = document.getElementById('registerForm');
  const registerCard = document.querySelector('.login-card');
  const fullNameInput = document.getElementById('fullName');
  const emailInput = document.getElementById('email');
  const phoneInput = document.getElementById('phone');
  const passwordInput = document.getElementById('password');
  const confirmPasswordInput = document.getElementById('confirmPassword');
  const termsCheckbox = document.getElementById('terms');
  
  const togglePasswordBtn = document.getElementById('togglePassword');
  const eyeIcon = document.getElementById('eyeIcon');
  const toggleConfirmPasswordBtn = document.getElementById('toggleConfirmPassword');
  const confirmEyeIcon = document.getElementById('confirmEyeIcon');
  
  const registerBtn = document.getElementById('registerBtn');

  // Regular expressions for validation
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  const phoneRegex = /^\d{10}$/;

  // Helper function to find standard groups (floating-group, gender-group, etc)
  const getFieldGroup = (inputElement) => {
    return inputElement.closest('.floating-group') || inputElement.closest('.gender-group') || inputElement.closest('.form-options');
  };

  // 1. Password Visibility Toggle (Password Field)
  togglePasswordBtn.addEventListener('click', () => {
    const isPassword = passwordInput.getAttribute('type') === 'password';
    passwordInput.setAttribute('type', isPassword ? 'text' : 'password');
    if (isPassword) {
      eyeIcon.className = 'fa-solid fa-eye-slash';
      togglePasswordBtn.setAttribute('aria-label', 'Hide password');
    } else {
      eyeIcon.className = 'fa-regular fa-eye';
      togglePasswordBtn.setAttribute('aria-label', 'Show password');
    }
  });

  // 2. Password Visibility Toggle (Confirm Password Field)
  toggleConfirmPasswordBtn.addEventListener('click', () => {
    const isPassword = confirmPasswordInput.getAttribute('type') === 'password';
    confirmPasswordInput.setAttribute('type', isPassword ? 'text' : 'password');
    if (isPassword) {
      confirmEyeIcon.className = 'fa-solid fa-eye-slash';
      toggleConfirmPasswordBtn.setAttribute('aria-label', 'Hide confirm password');
    } else {
      confirmEyeIcon.className = 'fa-regular fa-eye';
      toggleConfirmPasswordBtn.setAttribute('aria-label', 'Show confirm password');
    }
  });

  // Helper functions for showing/clearing error states
  const showError = (inputElement, errorElementId, message) => {
    const group = getFieldGroup(inputElement);
    const errorSpan = document.getElementById(errorElementId);
    if (group) group.classList.add('error');
    if (errorSpan) {
      errorSpan.textContent = message;
      errorSpan.style.opacity = '1';
      errorSpan.style.transform = 'translateY(0)';
    }
  };

  const clearError = (inputElement, errorElementId) => {
    const group = getFieldGroup(inputElement);
    const errorSpan = document.getElementById(errorElementId);
    if (group) group.classList.remove('error');
    if (errorSpan) {
      errorSpan.textContent = '';
      errorSpan.style.opacity = '0';
      errorSpan.style.transform = 'translateY(-5px)';
    }
  };

  // Live validation on inputs (clears or updates error states as user types)
  fullNameInput.addEventListener('input', () => {
    if (fullNameInput.value.trim() !== '') {
      if (fullNameInput.value.trim().length >= 2) {
        clearError(fullNameInput, 'fullNameError');
      } else {
        showError(fullNameInput, 'fullNameError', 'Full name must be at least 2 characters');
      }
    } else {
      clearError(fullNameInput, 'fullNameError');
    }
  });

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

  phoneInput.addEventListener('input', (e) => {
    // Sanitize input to digits only
    phoneInput.value = phoneInput.value.replace(/\D/g, '');
    
    if (phoneInput.value.trim() !== '') {
      if (phoneRegex.test(phoneInput.value.trim())) {
        clearError(phoneInput, 'phoneError');
      } else {
        showError(phoneInput, 'phoneError', 'Phone number must be exactly 10 digits');
      }
    } else {
      clearError(phoneInput, 'phoneError');
    }
  });

  passwordInput.addEventListener('input', () => {
    if (passwordInput.value.trim() !== '') {
      if (passwordInput.value.trim().length >= 8) {
        clearError(passwordInput, 'passwordError');
      } else {
        showError(passwordInput, 'passwordError', 'Password must be at least 8 characters');
      }
    } else {
      clearError(passwordInput, 'passwordError');
    }

    // Dynamic confirm password cross-check if it's already filled
    if (confirmPasswordInput.value.trim() !== '') {
      if (confirmPasswordInput.value.trim() === passwordInput.value.trim()) {
        clearError(confirmPasswordInput, 'confirmPasswordError');
      } else {
        showError(confirmPasswordInput, 'confirmPasswordError', 'Passwords do not match');
      }
    }
  });

  confirmPasswordInput.addEventListener('input', () => {
    if (confirmPasswordInput.value.trim() !== '') {
      if (confirmPasswordInput.value.trim() === passwordInput.value.trim()) {
        clearError(confirmPasswordInput, 'confirmPasswordError');
      } else {
        showError(confirmPasswordInput, 'confirmPasswordError', 'Passwords do not match');
      }
    } else {
      clearError(confirmPasswordInput, 'confirmPasswordError');
    }
  });

  // Clear radio/checkbox errors when selected
  document.querySelectorAll('input[name="gender"]').forEach(radio => {
    radio.addEventListener('change', () => {
      clearError(radio, 'genderError');
    });
  });

  termsCheckbox.addEventListener('change', () => {
    if (termsCheckbox.checked) {
      clearError(termsCheckbox, 'termsError');
    }
  });

  // Form Submit Validation
  registerForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const fullNameValue = fullNameInput.value.trim();
    const emailValue = emailInput.value.trim();
    const phoneValue = phoneInput.value.trim();
    const passwordValue = passwordInput.value.trim();
    const confirmPasswordValue = confirmPasswordInput.value.trim();
    const checkedGender = document.querySelector('input[name="gender"]:checked');
    const isTermsChecked = termsCheckbox.checked;

    let isValid = true;

    // 1. Full Name Validation
    if (fullNameValue === '') {
      showError(fullNameInput, 'fullNameError', 'Full name is required');
      isValid = false;
    } else if (fullNameValue.length < 2) {
      showError(fullNameInput, 'fullNameError', 'Full name must be at least 2 characters');
      isValid = false;
    } else {
      clearError(fullNameInput, 'fullNameError');
    }

    // 2. Email Validation
    if (emailValue === '') {
      showError(emailInput, 'emailError', 'Email address is required');
      isValid = false;
    } else if (!emailRegex.test(emailValue)) {
      showError(emailInput, 'emailError', 'Please enter a valid email address');
      isValid = false;
    } else {
      clearError(emailInput, 'emailError');
    }

    // 3. Phone Number Validation
    if (phoneValue === '') {
      showError(phoneInput, 'phoneError', 'Phone number is required');
      isValid = false;
    } else if (!phoneRegex.test(phoneValue)) {
      showError(phoneInput, 'phoneError', 'Phone number must contain exactly 10 digits');
      isValid = false;
    } else {
      clearError(phoneInput, 'phoneError');
    }

    // 4. Password Validation
    if (passwordValue === '') {
      showError(passwordInput, 'passwordError', 'Password is required');
      isValid = false;
    } else if (passwordValue.length < 8) {
      showError(passwordInput, 'passwordError', 'Password must be at least 8 characters');
      isValid = false;
    } else {
      clearError(passwordInput, 'passwordError');
    }

    // 5. Confirm Password Validation
    if (confirmPasswordValue === '') {
      showError(confirmPasswordInput, 'confirmPasswordError', 'Please confirm your password');
      isValid = false;
    } else if (confirmPasswordValue !== passwordValue) {
      showError(confirmPasswordInput, 'confirmPasswordError', 'Passwords do not match');
      isValid = false;
    } else {
      clearError(confirmPasswordInput, 'confirmPasswordError');
    }

    // 6. Gender Validation
    if (!checkedGender) {
      // Find one of the radio elements to anchor the error group
      const firstRadio = document.querySelector('input[name="gender"]');
      showError(firstRadio, 'genderError', 'Please select your gender');
      isValid = false;
    } else {
      const firstRadio = document.querySelector('input[name="gender"]');
      clearError(firstRadio, 'genderError');
    }

    // 7. Terms and Conditions Validation
    if (!isTermsChecked) {
      showError(termsCheckbox, 'termsError', 'You must agree to the Terms & Conditions');
      isValid = false;
    } else {
      clearError(termsCheckbox, 'termsError');
    }

    // Shake animation feedback on validation error
    if (!isValid) {
      registerCard.classList.remove('shake');
      // Trigger reflow to restart animation
      void registerCard.offsetWidth;
      registerCard.classList.add('shake');
      return;
    }

    // Begin Submission UI Animation
    startLoadingState();

    // Simulate Server API Call (successful registration callback)
    setTimeout(() => {
      stopLoadingState();
      alert('🎉 Account created successfully! Redirecting to login page...');
      // Reset form fields
      registerForm.reset();
      // Redirect back to login page
      window.location.href = 'login.html';
    }, 2000);
  });

  const startLoadingState = () => {
    registerBtn.classList.add('loading');
    registerBtn.disabled = true;
    fullNameInput.disabled = true;
    emailInput.disabled = true;
    phoneInput.disabled = true;
    passwordInput.disabled = true;
    confirmPasswordInput.disabled = true;
    togglePasswordBtn.disabled = true;
    toggleConfirmPasswordBtn.disabled = true;
    termsCheckbox.disabled = true;
    document.querySelectorAll('input[name="gender"]').forEach(radio => radio.disabled = true);
  };

  const stopLoadingState = () => {
    registerBtn.classList.remove('loading');
    registerBtn.disabled = false;
    fullNameInput.disabled = false;
    emailInput.disabled = false;
    phoneInput.disabled = false;
    passwordInput.disabled = false;
    confirmPasswordInput.disabled = false;
    togglePasswordBtn.disabled = false;
    toggleConfirmPasswordBtn.disabled = false;
    termsCheckbox.disabled = false;
    document.querySelectorAll('input[name="gender"]').forEach(radio => radio.disabled = false);
  };
});
