/**
 * Utility Functions Library
 * ✅ Centralized helper functions to reduce code duplication
 */

/**
 * Format date to readable format
 * @param {string|Date} dateString - ISO date string or Date object
 * @returns {string} Formatted date (e.g., "Mar 20, 2025")
 */
export const formatDate = (dateString) => {
    try {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    } catch {
        return dateString || 'Invalid date';
    }
};

/**
 * Format time to readable format
 * @param {string} timeString - Time in HH:MM format
 * @returns {string} Formatted time (e.g., "10:30 AM")
 */
export const formatTime = (timeString) => {
    try {
        if (!timeString) return '';
        const [hours, minutes] = timeString.split(':');
        const hour = parseInt(hours);
        const ampm = hour >= 12 ? 'PM' : 'AM';
        const displayHour = hour % 12 || 12;
        return `${displayHour}:${minutes} ${ampm}`;
    } catch {
        return timeString || '';
    }
};

/**
 * Format currency value
 * @param {number} amount - Amount in dollars
 * @param {string} currency - Currency code (default: 'USD')
 * @returns {string} Formatted currency (e.g., "$50.00")
 */
export const formatCurrency = (amount, currency = 'USD') => {
    try {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: currency
        }).format(amount);
    } catch {
        return `$${amount || 0}`;
    }
};

/**
 * Get status badge color and text
 * @param {string} status - Status value
 * @returns {object} {bgColor, textColor, displayText}
 */
export const getStatusStyle = (status) => {
    const styles = {
        'pending': {
            bg: 'bg-amber-100',
            text: 'text-amber-800',
            border: 'border-amber-300',
            display: 'Pending'
        },
        'confirmed': {
            bg: 'bg-emerald-100',
            text: 'text-emerald-800',
            border: 'border-emerald-300',
            display: 'Confirmed'
        },
        'in_progress': {
            bg: 'bg-blue-100',
            text: 'text-blue-800',
            border: 'border-blue-300',
            display: 'In Progress'
        },
        'completed': {
            bg: 'bg-green-100',
            text: 'text-green-800',
            border: 'border-green-300',
            display: 'Completed'
        },
        'cancelled': {
            bg: 'bg-rose-100',
            text: 'text-rose-800',
            border: 'border-rose-300',
            display: 'Cancelled'
        },
        'paid': {
            bg: 'bg-green-100',
            text: 'text-green-800',
            border: 'border-green-300',
            display: 'Paid'
        },
        'unpaid': {
            bg: 'bg-red-100',
            text: 'text-red-800',
            border: 'border-red-300',
            display: 'Unpaid'
        }
    };
    return styles[status] || styles.pending;
};

/**
 * Status Badge Component
 * Reusable component to display status consistently
 */
export const StatusBadge = ({ status, className = '' }) => {
    const style = getStatusStyle(status);
    return (
        <span className={`px-3 py-1 rounded-full text-sm font-medium border ${style.bg} ${style.text} ${style.border} ${className}`}>
            {style.display}
        </span>
    );
};

/**
 * Validate email format
 * @param {string} email
 * @returns {boolean}
 */
export const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
};

/**
 * Validate phone number (basic)
 * @param {string} phone
 * @returns {boolean}
 */
export const validatePhone = (phone) => {
    const re = /^[\d\s\-\+\(\)]{10,}$/;
    return re.test(phone?.replace(/\s/g, ''));
};

/**
 * Validate age range
 * @param {number} age
 * @returns {boolean}
 */
export const validateAge = (age) => {
    const ageNum = parseInt(age);
    return ageNum >= 1 && ageNum <= 150;
};

/**
 * Check if date is in future
 * @param {string|Date} date
 * @returns {boolean}
 */
export const isFutureDate = (date) => {
    const checkDate = new Date(date);
    checkDate.setHours(0, 0, 0, 0);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return checkDate > today;
};

/**
 * Handle API errors with user-friendly messages
 * @param {object} error - Error object from API call
 * @returns {string} User-friendly error message
 */
export const getErrorMessage = (error) => {
    if (!error) return 'An unexpected error occurred';

    // Handle response errors
    if (error.response?.status === 401) {
        return 'Your session expired. Please log in again.';
    }
    if (error.response?.status === 403) {
        return 'You do not have permission to perform this action.';
    }
    if (error.response?.status === 404) {
        return 'The requested resource was not found.';
    }
    if (error.response?.status === 500) {
        return 'Server error. Please try again later.';
    }

    // Handle specific error messages from backend
    if (error.response?.data?.error) {
        return error.response.data.error;
    }
    if (error.response?.data?.detail) {
        return error.response.data.detail;
    }

    // Handle network errors
    if (error.message === 'Network Error') {
        return 'Network connection failed. Please check your internet.';
    }

    return error.message || 'Something went wrong. Please try again.';
};

/**
 * Debounce function to prevent rapid repeated calls
 * @param {function} func - Function to debounce
 * @param {number} delay - Delay in milliseconds
 * @returns {function} Debounced function
 */
export const debounce = (func, delay = 300) => {
    let timeoutId;
    return (...args) => {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => func(...args), delay);
    };
};

/**
 * Get initials from name
 * @param {string} name - Full name
 * @returns {string} Initials (e.g., "JD" for "John Doe")
 */
export const getInitials = (name) => {
    if (!name) return '?';
    return name
        .split(' ')
        .map(part => part.charAt(0).toUpperCase())
        .slice(0, 2)
        .join('');
};

/**
 * Truncate long text with ellipsis
 * @param {string} text
 * @param {number} maxLength
 * @returns {string}
 */
export const truncateText = (text, maxLength = 50) => {
    if (!text) return '';
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
};

/**
 * Check if user has specific role
 * @param {string} userRole - User's role
 * @param {string|array} requiredRoles - Required role(s)
 * @returns {boolean}
 */
export const hasRole = (userRole, requiredRoles) => {
    if (Array.isArray(requiredRoles)) {
        return requiredRoles.includes(userRole);
    }
    return userRole === requiredRoles;
};

export default {
    formatDate,
    formatTime,
    formatCurrency,
    getStatusStyle,
    StatusBadge,
    validateEmail,
    validatePhone,
    validateAge,
    isFutureDate,
    getErrorMessage,
    debounce,
    getInitials,
    truncateText,
    hasRole
};
