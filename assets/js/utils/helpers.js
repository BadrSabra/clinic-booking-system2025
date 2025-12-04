/**
 * دوال مساعدة عامة
 */

/**
 * تهيئة جميع المكونات
 */
function initAll() {
    // تهيئة واجهة المستخدم
    if (typeof initUI === 'function') {
        initUI();
    }
    
    // تهيئة قاعدة البيانات
    if (typeof initDatabase === 'function') {
        initDatabase();
    }
}

/**
 * تنسيق التاريخ
 */
function formatDate(date, format = 'ar-SA') {
    if (!date) return '';
    
    const d = new Date(date);
    
    if (format === 'ar-SA') {
        return d.toLocaleDateString('ar-SA', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    } else if (format === 'short') {
        return d.toLocaleDateString('ar-SA', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    } else if (format === 'time') {
        return d.toLocaleTimeString('ar-SA', {
            hour: '2-digit',
            minute: '2-digit'
        });
    } else if (format === 'datetime') {
        return d.toLocaleDateString('ar-SA', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }
    
    return d.toISOString().split('T')[0];
}

/**
 * تنسيق الوقت
 */
function formatTime(time) {
    if (!time) return '';
    
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const minute = parseInt(minutes);
    
    return `${hour}:${minute.toString().padStart(2, '0')}`;
}

/**
 * تنسيق العملة
 */
function formatCurrency(amount, currency = 'ريال') {
    if (amount === null || amount === undefined) return '0 ' + currency;
    
    const num = parseFloat(amount);
    if (isNaN(num)) return '0 ' + currency;
    
    return num.toLocaleString('ar-SA') + ' ' + currency;
}

/**
 * تنسيق الرقم
 */
function formatNumber(num) {
    if (num === null || num === undefined) return '0';
    
    const number = parseFloat(num);
    if (isNaN(number)) return '0';
    
    return number.toLocaleString('ar-SA');
}

/**
 * حساب العمر من تاريخ الميلاد
 */
function calculateAge(birthDate) {
    if (!birthDate) return 'غير محدد';
    
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
        age--;
    }
    
    return age;
}

/**
 * التحقق من صحة البريد الإلكتروني
 */
function isValidEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

/**
 * التحقق من صحة رقم الهاتف
 */
function isValidPhone(phone) {
    const re = /^[\+]?[0-9]{10,15}$/;
    return re.test(phone.replace(/[\s\-\(\)]/g, ''));
}

/**
 * التحقق من صحة الرقم الوطني/الإقامة
 */
function isValidIdNumber(id) {
    if (!id) return false;
    
    // التحقق من أن الرقم يتكون من 10 أرقام للسعودية
    const re = /^[0-9]{10}$/;
    if (!re.test(id)) return false;
    
    // التحقق من صحة الرقم باستخدام خوارزمية Luhn (للأرقام السعودية)
    const digits = id.split('').map(Number);
    let sum = 0;
    let shouldDouble = false;
    
    for (let i = digits.length - 1; i >= 0; i--) {
        let digit = digits[i];
        
        if (shouldDouble) {
            digit *= 2;
            if (digit > 9) digit -= 9;
        }
        
        sum += digit;
        shouldDouble = !shouldDouble;
    }
    
    return sum % 10 === 0;
}

/**
 * إنشاء معرف فريد
 */
function generateUUID() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        const r = Math.random() * 16 | 0;
        const v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

/**
 * إنشاء رقم عشوائي
 */
function generateRandomNumber(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * نسخ النص للحافظة
 */
function copyToClipboard(text) {
    return new Promise((resolve, reject) => {
        if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(text)
                .then(() => resolve(true))
                .catch(err => reject(err));
        } else {
            // طريقة بديلة للمتصفحات القديمة
            const textArea = document.createElement('textarea');
            textArea.value = text;
            textArea.style.position = 'fixed';
            textArea.style.opacity = '0';
            document.body.appendChild(textArea);
            textArea.select();
            
            try {
                const successful = document.execCommand('copy');
                document.body.removeChild(textArea);
                successful ? resolve(true) : reject(new Error('فشل النسخ'));
            } catch (err) {
                document.body.removeChild(textArea);
                reject(err);
            }
        }
    });
}

/**
 * تنزيل الملف
 */
function downloadFile(content, fileName, contentType) {
    const blob = new Blob([content], { type: contentType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    
    link.href = url;
    link.download = fileName;
    link.style.display = 'none';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    URL.revokeObjectURL(url);
}

/**
 * قراءة ملف
 */
function readFile(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        
        reader.onload = function(event) {
            resolve(event.target.result);
        };
        
        reader.onerror = function(event) {
            reject(new Error('فشل في قراءة الملف'));
        };
        
        reader.readAsText(file);
    });
}

/**
 * تحويل الصورة لـ base64
 */
function imageToBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        
        reader.onload = function(event) {
            resolve(event.target.result);
        };
        
        reader.onerror = function(event) {
            reject(new Error('فشل في تحويل الصورة'));
        };
        
        reader.readAsDataURL(file);
    });
}

/**
 * التحقق من نوع الملف
 */
function isValidFileType(file, allowedTypes) {
    if (!file || !allowedTypes) return false;
    
    const fileType = file.type.toLowerCase();
    return allowedTypes.some(type => fileType.includes(type));
}

/**
 * التحقق من حجم الملف
 */
function isValidFileSize(file, maxSizeMB) {
    if (!file || !maxSizeMB) return false;
    
    const maxSizeBytes = maxSizeMB * 1024 * 1024;
    return file.size <= maxSizeBytes;
}

/**
 * حساب الوقت المتبقي
 */
function calculateTimeRemaining(endTime) {
    const now = new Date();
    const end = new Date(endTime);
    const diff = end - now;
    
    if (diff <= 0) {
        return { days: 0, hours: 0, minutes: 0, seconds: 0, expired: true };
    }
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);
    
    return { days, hours, minutes, seconds, expired: false };
}

/**
 * تنسيق الوقت المتبقي
 */
function formatTimeRemaining(timeRemaining) {
    if (timeRemaining.expired) {
        return 'انتهى الوقت';
    }
    
    if (timeRemaining.days > 0) {
        return `${timeRemaining.days} يوم ${timeRemaining.hours} ساعة`;
    } else if (timeRemaining.hours > 0) {
        return `${timeRemaining.hours} ساعة ${timeRemaining.minutes} دقيقة`;
    } else if (timeRemaining.minutes > 0) {
        return `${timeRemaining.minutes} دقيقة ${timeRemaining.seconds} ثانية`;
    } else {
        return `${timeRemaining.seconds} ثانية`;
    }
}

/**
 * ترتيب المصفوفة
 */
function sortArray(array, key, direction = 'asc') {
    if (!array || !Array.isArray(array)) return [];
    
    return array.slice().sort((a, b) => {
        let aValue = a[key];
        let bValue = b[key];
        
        // تحويل للنصوص للتأكد من المقارنة الصحيحة
        if (typeof aValue === 'string') aValue = aValue.toLowerCase();
        if (typeof bValue === 'string') bValue = bValue.toLowerCase();
        
        if (aValue < bValue) {
            return direction === 'asc' ? -1 : 1;
        }
        if (aValue > bValue) {
            return direction === 'asc' ? 1 : -1;
        }
        return 0;
    });
}

/**
 * تصفية المصفوفة
 */
function filterArray(array, filters) {
    if (!array || !Array.isArray(array)) return [];
    if (!filters || Object.keys(filters).length === 0) return array;
    
    return array.filter(item => {
        return Object.keys(filters).every(key => {
            const filterValue = filters[key];
            const itemValue = item[key];
            
            if (filterValue === null || filterValue === undefined || filterValue === '') {
                return true;
            }
            
            if (typeof filterValue === 'string') {
                return itemValue?.toString().toLowerCase().includes(filterValue.toLowerCase());
            }
            
            if (typeof filterValue === 'function') {
                return filterValue(itemValue);
            }
            
            return itemValue === filterValue;
        });
    });
}

/**
 * تقسيم المصفوفة إلى صفحات
 */
function paginateArray(array, page, perPage) {
    if (!array || !Array.isArray(array)) return { data: [], total: 0, pages: 0 };
    
    const total = array.length;
    const pages = Math.ceil(total / perPage);
    const start = (page - 1) * perPage;
    const end = start + perPage;
    
    return {
        data: array.slice(start, end),
        total,
        pages,
        currentPage: page,
        perPage
    };
}

/**
 * تجميع البيانات
 */
function groupBy(array, key) {
    if (!array || !Array.isArray(array)) return {};
    
    return array.reduce((groups, item) => {
        const groupKey = item[key];
        if (!groups[groupKey]) {
            groups[groupKey] = [];
        }
        groups[groupKey].push(item);
        return groups;
    }, {});
}

/**
 * حساب المتوسط
 */
function calculateAverage(array, key) {
    if (!array || !Array.isArray(array) || array.length === 0) return 0;
    
    const sum = array.reduce((total, item) => {
        const value = parseFloat(item[key]);
        return total + (isNaN(value) ? 0 : value);
    }, 0);
    
    return sum / array.length;
}

/**
 * حساب المجموع
 */
function calculateSum(array, key) {
    if (!array || !Array.isArray(array) || array.length === 0) return 0;
    
    return array.reduce((total, item) => {
        const value = parseFloat(item[key]);
        return total + (isNaN(value) ? 0 : value);
    }, 0);
}

/**
 * حساب الوسيط
 */
function calculateMedian(array, key) {
    if (!array || !Array.isArray(array) || array.length === 0) return 0;
    
    const values = array
        .map(item => parseFloat(item[key]))
        .filter(value => !isNaN(value))
        .sort((a, b) => a - b);
    
    if (values.length === 0) return 0;
    
    const middle = Math.floor(values.length / 2);
    
    if (values.length % 2 === 0) {
        return (values[middle - 1] + values[middle]) / 2;
    }
    
    return values[middle];
}

/**
 * حساب النسبة المئوية
 */
function calculatePercentage(part, total) {
    if (total === 0) return 0;
    return (part / total) * 100;
}

/**
 * تنسيق النسبة المئوية
 */
function formatPercentage(value, decimals = 2) {
    if (value === null || value === undefined) return '0%';
    
    const num = parseFloat(value);
    if (isNaN(num)) return '0%';
    
    return num.toFixed(decimals) + '%';
}

/**
 * إخفاء جزء من النص
 */
function maskText(text, start = 0, end = 4, maskChar = '*') {
    if (!text) return '';
    
    const textStr = String(text);
    const maskLength = textStr.length - start - end;
    
    if (maskLength <= 0) return textStr;
    
    const maskedPart = maskChar.repeat(maskLength);
    return textStr.substring(0, start) + maskedPart + textStr.substring(textStr.length - end);
}

/**
 * إخفاء رقم الهاتف
 */
function maskPhone(phone) {
    if (!phone) return '';
    
    const phoneStr = String(phone);
    if (phoneStr.length <= 4) return phoneStr;
    
    const visiblePart = phoneStr.substring(phoneStr.length - 4);
    return '****' + visiblePart;
}

/**
 * إخفاء البريد الإلكتروني
 */
function maskEmail(email) {
    if (!email) return '';
    if (!isValidEmail(email)) return email;
    
    const [username, domain] = email.split('@');
    if (username.length <= 2) return email;
    
    const maskedUsername = username.substring(0, 2) + '****' + username.substring(username.length - 1);
    return maskedUsername + '@' + domain;
}

/**
 * التحويل بين الأنظمة
 */
function convertUnits(value, fromUnit, toUnit) {
    const conversions = {
        // الطول
        'cm_to_m': 0.01,
        'm_to_cm': 100,
        'kg_to_g': 1000,
        'g_to_kg': 0.001,
        // الوزن
        'kg_to_lb': 2.20462,
        'lb_to_kg': 0.453592,
        // الحجم
        'ml_to_l': 0.001,
        'l_to_ml': 1000
    };
    
    const conversionKey = `${fromUnit}_to_${toUnit}`;
    const factor = conversions[conversionKey];
    
    if (factor === undefined) {
        throw new Error(`التحويل من ${fromUnit} إلى ${toUnit} غير مدعوم`);
    }
    
    return value * factor;
}

/**
 * إنشاء رمز QR
 */
function generateQRCode(text, elementId) {
    // هذه دالة افتراضية، في التطبيق الحقيقي ستستخدم مكتبة QR code
    console.log('إنشاء QR code للنص:', text);
    
    const element = document.getElementById(elementId);
    if (element) {
        element.innerHTML = `
            <div class="qrcode-placeholder">
                <i class="fas fa-qrcode fa-3x"></i>
                <p>QR Code: ${text.substring(0, 20)}...</p>
            </div>
        `;
    }
}

/**
 * إنشاء باركود
 */
function generateBarcode(text, elementId) {
    // هذه دالة افتراضية، في التطبيق الحقيقي ستستخدم مكتبة Barcode
    console.log('إنشاء Barcode للنص:', text);
    
    const element = document.getElementById(elementId);
    if (element) {
        element.innerHTML = `
            <div class="barcode-placeholder">
                <div class="barcode-lines">
                    ${Array.from({length: 20}, (_, i) => 
                        `<div class="barcode-line" style="height: ${20 + (i % 10)}px;"></div>`
                    ).join('')}
                </div>
                <p>${text}</p>
            </div>
        `;
    }
}

/**
 * التحقق من صحة البيانات
 */
function validateData(data, schema) {
    const errors = [];
    
    Object.keys(schema).forEach(key => {
        const field = schema[key];
        const value = data[key];
        
        // التحقق من الحقول المطلوبة
        if (field.required && (value === null || value === undefined || value === '')) {
            errors.push(`${field.label} مطلوب`);
            return;
        }
        
        // التحقق من النوع
        if (field.type && value !== null && value !== undefined && value !== '') {
            if (field.type === 'email' && !isValidEmail(value)) {
                errors.push(`${field.label} غير صحيح`);
            } else if (field.type === 'phone' && !isValidPhone(value)) {
                errors.push(`${field.label} غير صحيح`);
            } else if (field.type === 'number') {
                const num = parseFloat(value);
                if (isNaN(num)) {
                    errors.push(`${field.label} يجب أن يكون رقماً`);
                } else if (field.min !== undefined && num < field.min) {
                    errors.push(`${field.label} يجب أن يكون على الأقل ${field.min}`);
                } else if (field.max !== undefined && num > field.max) {
                    errors.push(`${field.label} يجب أن يكون على الأكثر ${field.max}`);
                }
            } else if (field.type === 'date') {
                const date = new Date(value);
                if (isNaN(date.getTime())) {
                    errors.push(`${field.label} غير صحيح`);
                }
            }
        }
        
        // التحقق من الطول
        if (field.minLength && String(value).length < field.minLength) {
            errors.push(`${field.label} يجب أن يكون على الأقل ${field.minLength} حرفاً`);
        }
        
        if (field.maxLength && String(value).length > field.maxLength) {
            errors.push(`${field.label} يجب أن يكون على الأكثر ${field.maxLength} حرفاً`);
        }
        
        // التحقق من التنسيق
        if (field.pattern && value) {
            const pattern = new RegExp(field.pattern);
            if (!pattern.test(value)) {
                errors.push(`${field.label} غير صحيح`);
            }
        }
    });
    
    return {
        isValid: errors.length === 0,
        errors
    };
}

/**
 * إزالة القيم الفارغة من الكائن
 */
function removeEmptyValues(obj) {
    const result = {};
    
    Object.keys(obj).forEach(key => {
        const value = obj[key];
        
        if (value !== null && value !== undefined && value !== '') {
            if (typeof value === 'object' && !Array.isArray(value)) {
                const cleaned = removeEmptyValues(value);
                if (Object.keys(cleaned).length > 0) {
                    result[key] = cleaned;
                }
            } else if (Array.isArray(value)) {
                if (value.length > 0) {
                    result[key] = value;
                }
            } else {
                result[key] = value;
            }
        }
    });
    
    return result;
}

/**
 * دمج الكائنات
 */
function mergeObjects(...objects) {
    return objects.reduce((merged, obj) => {
        if (!obj) return merged;
        
        Object.keys(obj).forEach(key => {
            if (obj[key] !== undefined) {
                merged[key] = obj[key];
            }
        });
        
        return merged;
    }, {});
}

/**
 * نسخ الكائن بشكل عميق
 */
function deepClone(obj) {
    if (obj === null || typeof obj !== 'object') return obj;
    if (obj instanceof Date) return new Date(obj.getTime());
    if (Array.isArray(obj)) return obj.map(item => deepClone(item));
    
    const cloned = {};
    Object.keys(obj).forEach(key => {
        cloned[key] = deepClone(obj[key]);
    });
    
    return cloned;
}

/**
 * مقارنة الكائنات
 */
function compareObjects(obj1, obj2) {
    const keys1 = Object.keys(obj1);
    const keys2 = Object.keys(obj2);
    
    if (keys1.length !== keys2.length) return false;
    
    for (const key of keys1) {
        const val1 = obj1[key];
        const val2 = obj2[key];
        
        if (typeof val1 === 'object' && typeof val2 === 'object') {
            if (!compareObjects(val1, val2)) return false;
        } else if (val1 !== val2) {
            return false;
        }
    }
    
    return true;
}

/**
 * تسجيل الوقت
 */
class Timer {
    constructor() {
        this.startTime = null;
        this.endTime = null;
    }
    
    start() {
        this.startTime = performance.now();
        this.endTime = null;
    }
    
    stop() {
        this.endTime = performance.now();
        return this.getDuration();
    }
    
    getDuration() {
        if (!this.startTime) return 0;
        const end = this.endTime || performance.now();
        return end - this.startTime;
    }
    
    formatDuration() {
        const duration = this.getDuration();
        if (duration < 1000) {
            return duration.toFixed(2) + ' مللي ثانية';
        } else if (duration < 60000) {
            return (duration / 1000).toFixed(2) + ' ثانية';
        } else {
            return (duration / 60000).toFixed(2) + ' دقيقة';
        }
    }
}

/**
 * إنشاء مؤقت
 */
function createTimer() {
    return new Timer();
}

/**
 * تنفيذ مع تأخير
 */
function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * تنفيذ مع إعادة محاولة
 */
async function retry(fn, maxRetries = 3, delayMs = 1000) {
    let lastError;
    
    for (let i = 0; i < maxRetries; i++) {
        try {
            return await fn();
        } catch (error) {
            lastError = error;
            console.warn(`المحاولة ${i + 1} فشلت:`, error);
            
            if (i < maxRetries - 1) {
                await delay(delayMs * (i + 1)); // زيادة التأخير تدريجياً
            }
        }
    }
    
    throw lastError;
}

/**
 * الحد من تكرار الاستدعاء
 */
function debounce(fn, delay) {
    let timeoutId;
    
    return function(...args) {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => fn.apply(this, args), delay);
    };
}

/**
 * إزالة الازدواج من المصفوفة
 */
function removeDuplicates(array, key) {
    if (!array || !Array.isArray(array)) return [];
    
    const seen = new Set();
    return array.filter(item => {
        const value = key ? item[key] : item;
        if (seen.has(value)) {
            return false;
        }
        seen.add(value);
        return true;
    });
}

/**
 * التحويل إلى كاميل كيس
 */
function toCamelCase(str) {
    return str
        .replace(/[^a-zA-Z0-9]+(.)/g, (_, chr) => chr.toUpperCase())
        .replace(/^./, chr => chr.toLowerCase());
}

/**
 * التحويل إلى سنيك كيس
 */
function toSnakeCase(str) {
    return str
        .replace(/[A-Z]/g, chr => '_' + chr.toLowerCase())
        .replace(/^_/, '');
}

/**
 * إنشاء اختصار من النص
 */
function createInitials(text, maxLength = 2) {
    if (!text) return '';
    
    const words = text.trim().split(/\s+/);
    const initials = words.slice(0, maxLength).map(word => word[0]);
    
    return initials.join('').toUpperCase();
}

/**
 * تحليل الاستعلام من الرابط
 */
function parseQueryParams(url = window.location.href) {
    const queryString = url.split('?')[1];
    if (!queryString) return {};
    
    const params = {};
    queryString.split('&').forEach(pair => {
        const [key, value] = pair.split('=');
        if (key && value) {
            params[decodeURIComponent(key)] = decodeURIComponent(value);
        }
    });
    
    return params;
}

/**
 * إنشاء استعلام للرابط
 */
function buildQueryParams(params) {
    if (!params || Object.keys(params).length === 0) return '';
    
    const query = Object.keys(params)
        .filter(key => params[key] !== null && params[key] !== undefined)
        .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`)
        .join('&');
    
    return query ? '?' + query : '';
}

// تصدير الدوال للاستخدام العام
window.helpers = {
    initAll,
    formatDate,
    formatTime,
    formatCurrency,
    formatNumber,
    calculateAge,
    isValidEmail,
    isValidPhone,
    isValidIdNumber,
    generateUUID,
    generateRandomNumber,
    copyToClipboard,
    downloadFile,
    readFile,
    imageToBase64,
    isValidFileType,
    isValidFileSize,
    calculateTimeRemaining,
    formatTimeRemaining,
    sortArray,
    filterArray,
    paginateArray,
    groupBy,
    calculateAverage,
    calculateSum,
    calculateMedian,
    calculatePercentage,
    formatPercentage,
    maskText,
    maskPhone,
    maskEmail,
    convertUnits,
    generateQRCode,
    generateBarcode,
    validateData,
    removeEmptyValues,
    mergeObjects,
    deepClone,
    compareObjects,
    createTimer,
    delay,
    retry,
    debounce,
    removeDuplicates,
    toCamelCase,
    toSnakeCase,
    createInitials,
    parseQueryParams,
    buildQueryParams
};
