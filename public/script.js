// Osnovne validation funkcije
function isValidEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

function isValidPhoneNumber(phone) {
    const re = /^[0-9]{9,10}$/;
    return re.test(phone);
}

// Export za korištenje u drugim skriptama
window.validationHelpers = {
    isValidEmail,
    isValidPhoneNumber
};
