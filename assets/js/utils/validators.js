/**
 * دوال التحقق من صحة البيانات
 */

/**
 * التحقق من صحة النموذج
 */
function validateForm(form) {
    const inputs = form.querySelectorAll('input, select, textarea');
    let isValid = true;
    
    inputs.forEach(input => {
        if (!validateInput(input)) {
            isValid = false;
        }
    });
    
    return isValid;
}

/**
 * التحقق من صحة المدخل
 */
function validateInput(input) {
    const value = input.value.trim();
    const type = input.type;
    const required = input.required;
    
    // إزالة رسائل الخطأ السابقة
    removeError(input);
    
    // التحقق من الحقول المطلوبة
    if (required && !value) {
        showError(input, 'هذا الحقل مطلوب');
        return false;
    }
    
    // التحقق بناءً على نوع الحقل
    switch (type) {
        case 'email':
            if (value && !isValidEmail(value)) {
                showError(input, 'البريد الإلكتروني غير صحيح');
                return false;
            }
            break;
            
        case 'tel':
            if (value && !isValidPhone(value)) {
                showError(input, 'رقم الهاتف غير صحيح');
                return false;
            }
            break;
            
        case 'number':
            if (value) {
                const num = parseFloat(value);
                if (isNaN(num)) {
                    showError(input, 'يجب أن يكون رقماً');
                    return false;
                }
                
                if (input.min && num < parseFloat(input.min)) {
                    showError(input, `الحد الأدنى هو ${input.min}`);
                    return false;
                }
                
                if (input.max && num > parseFloat(input.max)) {
                    showError(input, `الحد الأقصى هو ${input.max}`);
                    return false;
                }
            }
            break;
            
        case 'date':
            if (value) {
                const date = new Date(value);
                if (isNaN(date.getTime())) {
                    showError(input, 'التاريخ غير صحيح');
                    return false;
                }
                
                if (input.min && new Date(value) < new Date(input.min)) {
                    showError(input, `التاريخ يجب أن يكون بعد ${input.min}`);
                    return false;
                }
                
                if (input.max && new Date(value) > new Date(input.max)) {
                    showError(input, `التاريخ يجب أن يكون قبل ${input.max}`);
                    return false;
                }
            }
            break;
            
        case 'password':
            if (value) {
                if (input.minLength && value.length < input.minLength) {
                    showError(input, `كلمة المرور يجب أن تكون على الأقل ${input.minLength} أحرف`);
                    return false;
                }
                
                if (input.dataset.confirm) {
                    const confirmInput = document.getElementById(input.dataset.confirm);
                    if (confirmInput && value !== confirmInput.value) {
                        showError(input, 'كلمات المرور غير متطابقة');
                        return false;
                    }
                }
            }
            break;
    }
    
    // التحقق من الطول
    if (input.minLength && value.length < input.minLength) {
        showError(input, `يجب أن يكون على الأقل ${input.minLength} حرفاً`);
        return false;
    }
    
    if (input.maxLength && value.length > input.maxLength) {
        showError(input, `يجب أن يكون على الأكثر ${input.maxLength} حرفاً`);
        return false;
    }
    
    // التحقق من النمط
    if (input.pattern && value) {
        const pattern = new RegExp(input.pattern);
        if (!pattern.test(value)) {
            showError(input, input.title || 'القيمة غير صحيحة');
            return false;
        }
    }
    
    return true;
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
 * التحقق من صحة الرقم الوطني السعودي
 */
function isValidSaudiId(id) {
    if (!id || typeof id !== 'string') return false;
    
    // التحقق من الطول
    if (id.length !== 10) return false;
    
    // التحقق من أن جميع الأحرف أرقام
    if (!/^\d+$/.test(id)) return false;
    
    // التحقق من أن الرقم يبدأ بـ 1 أو 2
    const firstDigit = parseInt(id.charAt(0));
    if (firstDigit !== 1 && firstDigit !== 2) return false;
    
    // تطبيق خوارزمية Luhn
    let sum = 0;
    for (let i = 0; i < 10; i++) {
        let digit = parseInt(id.charAt(i));
        
        if (i % 2 === 0) {
            digit *= 2;
            if (digit > 9) digit -= 9;
        }
        
        sum += digit;
    }
    
    return sum % 10 === 0;
}

/**
 * التحقق من صحة رقم الإقامة السعودي
 */
function isValidIqama(iqama) {
    if (!iqama || typeof iqama !== 'string') return false;
    
    // التحقق من الطول
    if (iqama.length !== 10) return false;
    
    // التحقق من أن جميع الأحرف أرقام
    if (!/^\d+$/.test(iqama)) return false;
    
    // التحقق من أن الرقم يبدأ بـ 2
    if (parseInt(iqama.charAt(0)) !== 2) return false;
    
    // تطبيق خوارزمية Luhn
    let sum = 0;
    for (let i = 0; i < 10; i++) {
        let digit = parseInt(iqama.charAt(i));
        
        if (i % 2 === 0) {
            digit *= 2;
            if (digit > 9) digit -= 9;
        }
        
        sum += digit;
    }
    
    return sum % 10 === 0;
}

/**
 * التحقق من صحة رقم بطاقة الهوية
 */
function isValidIdCardNumber(number) {
    if (!number || typeof number !== 'string') return false;
    
    // يمكن أن يكون 10 أرقام للسعودية أو 9 أرقام لدول أخرى
    if (number.length < 9 || number.length > 10) return false;
    
    // التحقق من أن جميع الأحرف أرقام
    return /^\d+$/.test(number);
}

/**
 * التحقق من صحة الرقم الطبي
 */
function isValidMedicalNumber(number) {
    if (!number || typeof number !== 'string') return false;
    
    // عادةً ما يكون بين 6-20 رقم/حرف
    if (number.length < 6 || number.length > 20) return false;
    
    // يمكن أن يحتوي على أرقام وحروف
    return /^[a-zA-Z0-9]+$/.test(number);
}

/**
 * التحقق من صحة تاريخ الميلاد
 */
function isValidBirthDate(date) {
    if (!date) return false;
    
    const birthDate = new Date(date);
    const today = new Date();
    
    // التحقق من أن التاريخ صحيح
    if (isNaN(birthDate.getTime())) return false;
    
    // التحقق من أن التاريخ ليس في المستقبل
    if (birthDate > today) return false;
    
    // التحقق من أن العمر ليس أكبر من 150 سنة
    const age = today.getFullYear() - birthDate.getFullYear();
    if (age > 150) return false;
    
    return true;
}

/**
 * التحقق من صحة العمر
 */
function isValidAge(age, min = 0, max = 150) {
    const num = parseInt(age);
    return !isNaN(num) && num >= min && num <= max;
}

/**
 * التحقق من صحة الوزن (كجم)
 */
function isValidWeight(weight) {
    const num = parseFloat(weight);
    return !isNaN(num) && num > 0 && num <= 300;
}

/**
 * التحقق من صحة الطول (سم)
 */
function isValidHeight(height) {
    const num = parseFloat(height);
    return !isNaN(num) && num > 30 && num <= 250;
}

/**
 * التحقق من صحة ضغط الدم
 */
function isValidBloodPressure(bp) {
    if (!bp || typeof bp !== 'string') return false;
    
    const parts = bp.split('/');
    if (parts.length !== 2) return false;
    
    const systolic = parseInt(parts[0]);
    const diastolic = parseInt(parts[1]);
    
    return !isNaN(systolic) && !isNaN(diastolic) &&
           systolic >= 60 && systolic <= 250 &&
           diastolic >= 40 && diastolic <= 150 &&
           systolic > diastolic;
}

/**
 * التحقق من صحة درجة الحرارة
 */
function isValidTemperature(temp) {
    const num = parseFloat(temp);
    return !isNaN(num) && num >= 35 && num <= 42;
}

/**
 * التحقق من صحة النبض
 */
function isValidPulse(pulse) {
    const num = parseInt(pulse);
    return !isNaN(num) && num >= 40 && num <= 200;
}

/**
 * التحقق من صحة السكر في الدم
 */
function isValidBloodSugar(sugar) {
    const num = parseFloat(sugar);
    return !isNaN(num) && num >= 2 && num <= 30;
}

/**
 * التحقق من صحة الكوليسترول
 */
function isValidCholesterol(chol) {
    const num = parseFloat(chol);
    return !isNaN(num) && num >= 100 && num <= 400;
}

/**
 * التحقق من صحة التاريخ
 */
function isValidDate(dateString) {
    const date = new Date(dateString);
    return !isNaN(date.getTime());
}

/**
 * التحقق من أن التاريخ ليس في المستقبل
 */
function isNotFutureDate(dateString) {
    const date = new Date(dateString);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date <= today;
}

/**
 * التحقق من أن التاريخ ليس في الماضي البعيد
 */
function isNotDistantPast(dateString, years = 150) {
    const date = new Date(dateString);
    const today = new Date();
    const pastLimit = new Date();
    pastLimit.setFullYear(today.getFullYear() - years);
    return date >= pastLimit;
}

/**
 * التحقق من صحة الوقت
 */
function isValidTime(timeString) {
    const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
    return timeRegex.test(timeString);
}

/**
 * التحقق من صحة الملف
 */
function isValidFile(file, options = {}) {
    if (!file || !(file instanceof File)) return false;
    
    const {
        allowedTypes = [],
        maxSizeMB = 10,
        minSizeMB = 0
    } = options;
    
    // التحقق من النوع
    if (allowedTypes.length > 0) {
        const fileType = file.type.toLowerCase();
        const isAllowed = allowedTypes.some(type => {
            if (type.startsWith('.')) {
                return file.name.toLowerCase().endsWith(type.toLowerCase());
            }
            return fileType.includes(type);
        });
        
        if (!isAllowed) return false;
    }
    
    // التحقق من الحجم
    const maxSizeBytes = maxSizeMB * 1024 * 1024;
    const minSizeBytes = minSizeMB * 1024 * 1024;
    
    if (file.size > maxSizeBytes) return false;
    if (file.size < minSizeBytes) return false;
    
    return true;
}

/**
 * التحقق من صحة الصورة
 */
function isValidImage(file) {
    return isValidFile(file, {
        allowedTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
        maxSizeMB: 5
    });
}

/**
 * التحقق من صحة PDF
 */
function isValidPDF(file) {
    return isValidFile(file, {
        allowedTypes: ['application/pdf', '.pdf'],
        maxSizeMB: 10
    });
}

/**
 * التحقق من صحة كلمة المرور
 */
function isValidPassword(password) {
    if (!password || password.length < 8) return false;
    
    // يجب أن تحتوي على حرف كبير على الأقل
    if (!/[A-Z]/.test(password)) return false;
    
    // يجب أن تحتوي على حرف صغير على الأقل
    if (!/[a-z]/.test(password)) return false;
    
    // يجب أن تحتوي على رقم على الأقل
    if (!/[0-9]/.test(password)) return false;
    
    // يمكن أن تحتوي على رموز خاصة
    return true;
}

/**
 * التحقق من قوة كلمة المرور
 */
function getPasswordStrength(password) {
    if (!password) return 0;
    
    let strength = 0;
    
    // الطول
    if (password.length >= 8) strength += 20;
    if (password.length >= 12) strength += 10;
    
    // الأحرف الكبيرة
    if (/[A-Z]/.test(password)) strength += 20;
    
    // الأحرف الصغيرة
    if (/[a-z]/.test(password)) strength += 20;
    
    // الأرقام
    if (/[0-9]/.test(password)) strength += 20;
    
    // الرموز الخاصة
    if (/[^A-Za-z0-9]/.test(password)) strength += 20;
    
    // عدم تكرار الأنماط
    if (!/(.)\1{2,}/.test(password)) strength += 10;
    
    return Math.min(strength, 100);
}

/**
 * التحقق من صحة الكود الطبي
 */
function isValidMedicalCode(code) {
    if (!code || typeof code !== 'string') return false;
    
    // يمكن أن يحتوي على أرقام وحروف وشرطات
    const regex = /^[A-Za-z0-9\-]+$/;
    return regex.test(code) && code.length >= 3 && code.length <= 20;
}

/**
 * التحقق من صحة الكود الدوائي
 */
function isValidDrugCode(code) {
    if (!code || typeof code !== 'string') return false;
    
    // عادةً ما يكون بين 6-15 رقم/حرف
    const regex = /^[A-Za-z0-9]+$/;
    return regex.test(code) && code.length >= 6 && code.length <= 15;
}

/**
 * التحقق من صحة رقم الوصفة الطبية
 */
function isValidPrescriptionNumber(number) {
    if (!number || typeof number !== 'string') return false;
    
    // عادةً ما يكون تنسيق مثل: PRES-2024-001
    const regex = /^[A-Z]{3,5}-[0-9]{4}-[0-9]{3,5}$/;
    return regex.test(number);
}

/**
 * التحقق من صحة رقم الفاتورة
 */
function isValidInvoiceNumber(number) {
    if (!number || typeof number !== 'string') return false;
    
    // عادةً ما يكون تنسيق مثل: INV-2024-001
    const regex = /^[A-Z]{3,5}-[0-9]{4}-[0-9]{3,5}$/;
    return regex.test(number);
}

/**
 * التحقق من صحة المبلغ المالي
 */
function isValidAmount(amount) {
    if (!amount && amount !== 0) return false;
    
    const num = parseFloat(amount);
    if (isNaN(num)) return false;
    
    return num >= 0 && num <= 1000000; // حتى مليون ريال
}

/**
 * التحقق من صحة النسبة المئوية
 */
function isValidPercentage(percentage) {
    const num = parseFloat(percentage);
    return !isNaN(num) && num >= 0 && num <= 100;
}

/**
 * التحقق من صحة الكمية
 */
function isValidQuantity(quantity) {
    const num = parseFloat(quantity);
    return !isNaN(num) && num >= 0 && num <= 10000;
}

/**
 * التحقق من صحة الجرعة الدوائية
 */
function isValidDosage(dosage) {
    if (!dosage || typeof dosage !== 'string') return false;
    
    // يمكن أن يكون مثل: 500mg, 1 tablet, 10ml
    const regex = /^[0-9]+(\.[0-9]+)?\s*(mg|g|ml|tablet|cap|drops|puff|patch|injection)?$/i;
    return regex.test(dosage.trim());
}

/**
 * التحقق من صحة التكرار
 */
function isValidFrequency(frequency) {
    if (!frequency || typeof frequency !== 'string') return false;
    
    const validFrequencies = [
        'once', 'daily', 'bid', 'tid', 'qid',
        'weekly', 'monthly', 'as_needed', 'every_hour',
        'every_2_hours', 'every_4_hours', 'every_6_hours',
        'every_8_hours', 'every_12_hours'
    ];
    
    return validFrequencies.includes(frequency.toLowerCase());
}

/**
 * التحقق من صحة المدة
 */
function isValidDuration(duration) {
    if (!duration || typeof duration !== 'string') return false;
    
    // يمكن أن يكون مثل: 7 days, 2 weeks, 1 month
    const regex = /^[0-9]+\s*(day|week|month|year)s?$/i;
    return regex.test(duration.trim());
}

/**
 * التحقق من صحة التشخيص
 */
function isValidDiagnosis(diagnosis) {
    if (!diagnosis || typeof diagnosis !== 'string') return false;
    
    // يجب أن يكون نصاً ذا معنى
    return diagnosis.trim().length >= 3 && diagnosis.trim().length <= 500;
}

/**
 * التحقق من صحة الملاحظات
 */
function isValidNotes(notes) {
    if (!notes) return true; // الملاحظات اختيارية
    
    // يجب ألا تتجاوز طول معين
    return typeof notes === 'string' && notes.length <= 2000;
}

/**
 * التحقق من صحة العنوان
 */
function isValidAddress(address) {
    if (!address || typeof address !== 'string') return false;
    
    return address.trim().length >= 5 && address.trim().length <= 200;
}

/**
 * التحقق من صحة الرمز البريدي
 */
function isValidPostalCode(code) {
    if (!code || typeof code !== 'string') return false;
    
    // السعودية: 5 أرقام
    const saudiRegex = /^[0-9]{5}$/;
    return saudiRegex.test(code);
}

/**
 * التحقق من صحة الإحداثيات الجغرافية
 */
function isValidCoordinates(lat, lng) {
    const latNum = parseFloat(lat);
    const lngNum = parseFloat(lng);
    
    return !isNaN(latNum) && !isNaN(lngNum) &&
           latNum >= -90 && latNum <= 90 &&
           lngNum >= -180 && lngNum <= 180;
}

/**
 * عرض خطأ للمدخل
 */
function showError(input, message) {
    input.classList.add('is-invalid');
    
    // إزالة رسالة الخطأ السابقة إن وجدت
    removeError(input);
    
    // إنشاء عنصر رسالة الخطأ
    const errorDiv = document.createElement('div');
    errorDiv.className = 'invalid-feedback';
    errorDiv.textContent = message;
    
    // إضافة رسالة الخطأ بعد المدخل
    input.parentNode.appendChild(errorDiv);
    
    // إضافة حدث لإزالة الخطأ عند التصحيح
    input.addEventListener('input', function onInput() {
        if (validateInput(input)) {
            removeError(input);
            input.removeEventListener('input', onInput);
        }
    });
}

/**
 * إزالة خطأ من المدخل
 */
function removeError(input) {
    input.classList.remove('is-invalid');
    
    const errorDiv = input.parentNode.querySelector('.invalid-feedback');
    if (errorDiv) {
        errorDiv.remove();
    }
}

/**
 * إظهار رسالة نجاح
 */
function showSuccess(input) {
    input.classList.remove('is-invalid');
    input.classList.add('is-valid');
    
    // إزالة رسالة النجاح السابقة إن وجدت
    const successDiv = input.parentNode.querySelector('.valid-feedback');
    if (successDiv) {
        successDiv.remove();
    }
}

/**
 * إعادة تعيين التحقق
 */
function resetValidation(form) {
    const inputs = form.querySelectorAll('input, select, textarea');
    
    inputs.forEach(input => {
        input.classList.remove('is-invalid', 'is-valid');
        
        const errorDiv = input.parentNode.querySelector('.invalid-feedback');
        if (errorDiv) {
            errorDiv.remove();
        }
        
        const successDiv = input.parentNode.querySelector('.valid-feedback');
        if (successDiv) {
            successDiv.remove();
        }
    });
}

/**
 * التحقق من صحة جميع الحقول في النموذج
 */
function validateAll(form) {
    const inputs = form.querySelectorAll('input, select, textarea');
    let allValid = true;
    
    inputs.forEach(input => {
        if (!validateInput(input)) {
            allValid = false;
        }
    });
    
    return allValid;
}

/**
 * التحقق من صحة البيانات الطبية
 */
function validateMedicalData(data) {
    const errors = [];
    
    if (data.height && !isValidHeight(data.height)) {
        errors.push('الطول غير صحيح');
    }
    
    if (data.weight && !isValidWeight(data.weight)) {
        errors.push('الوزن غير صحيح');
    }
    
    if (data.blood_pressure && !isValidBloodPressure(data.blood_pressure)) {
        errors.push('ضغط الدم غير صحيح');
    }
    
    if (data.temperature && !isValidTemperature(data.temperature)) {
        errors.push('درجة الحرارة غير صحيحة');
    }
    
    if (data.pulse && !isValidPulse(data.pulse)) {
        errors.push('معدل النبض غير صحيح');
    }
    
    if (data.blood_sugar && !isValidBloodSugar(data.blood_sugar)) {
        errors.push('معدل السكر غير صحيح');
    }
    
    if (data.cholesterol && !isValidCholesterol(data.cholesterol)) {
        errors.push('معدل الكوليسترول غير صحيح');
    }
    
    return {
        isValid: errors.length === 0,
        errors
    };
}

/**
 * التحقق من صحة بيانات المريض
 */
function validatePatientData(data) {
    const errors = [];
    
    if (!data.name || data.name.trim().length < 2) {
        errors.push('الاسم يجب أن يكون على الأقل حرفين');
    }
    
    if (data.national_id && !isValidSaudiId(data.national_id) && !isValidIqama(data.national_id)) {
        errors.push('رقم الهوية/الإقامة غير صحيح');
    }
    
    if (data.phone && !isValidPhone(data.phone)) {
        errors.push('رقم الهاتف غير صحيح');
    }
    
    if (data.email && !isValidEmail(data.email)) {
        errors.push('البريد الإلكتروني غير صحيح');
    }
    
    if (data.birth_date && !isValidBirthDate(data.birth_date)) {
        errors.push('تاريخ الميلاد غير صحيح');
    }
    
    if (data.emergency_phone && !isValidPhone(data.emergency_phone)) {
        errors.push('رقم الهاتف الطوارئ غير صحيح');
    }
    
    return {
        isValid: errors.length === 0,
        errors
    };
}

/**
 * التحقق من صحة بيانات الطبيب
 */
function validateDoctorData(data) {
    const errors = [];
    
    if (!data.name || data.name.trim().length < 2) {
        errors.push('اسم الطبيب يجب أن يكون على الأقل حرفين');
    }
    
    if (!data.specialty) {
        errors.push('التخصص مطلوب');
    }
    
    if (!data.license_number || data.license_number.trim().length < 3) {
        errors.push('رقم الرخصة الطبية مطلوب');
    }
    
    if (!data.phone || !isValidPhone(data.phone)) {
        errors.push('رقم الهاتف غير صحيح');
    }
    
    if (data.email && !isValidEmail(data.email)) {
        errors.push('البريد الإلكتروني غير صحيح');
    }
    
    if (data.consultation_fee && !isValidAmount(data.consultation_fee)) {
        errors.push('رسوم الكشف غير صحيحة');
    }
    
    return {
        isValid: errors.length === 0,
        errors
    };
}

/**
 * التحقق من صحة بيانات الموعد
 */
function validateAppointmentData(data) {
    const errors = [];
    
    if (!data.patient_id) {
        errors.push('المريض مطلوب');
    }
    
    if (!data.doctor_id) {
        errors.push('الطبيب مطلوب');
    }
    
    if (!data.date || !isValidDate(data.date)) {
        errors.push('تاريخ الموعد غير صحيح');
    }
    
    if (!data.time || !isValidTime(data.time)) {
        errors.push('وقت الموعد غير صحيح');
    }
    
    if (data.date && data.time) {
        const appointmentDateTime = new Date(`${data.date}T${data.time}`);
        if (appointmentDateTime < new Date()) {
            errors.push('لا يمكن تحديد موعد في الماضي');
        }
    }
    
    if (data.duration && (!isValidQuantity(data.duration) || data.duration > 240)) {
        errors.push('مدة الموعد غير صحيحة (الحد الأقصى 240 دقيقة)');
    }
    
    return {
        isValid: errors.length === 0,
        errors
    };
}

// تصدير الدوال للاستخدام العام
window.validators = {
    validateForm,
    validateInput,
    isValidEmail,
    isValidPhone,
    isValidSaudiId,
    isValidIqama,
    isValidIdCardNumber,
    isValidMedicalNumber,
    isValidBirthDate,
    isValidAge,
    isValidWeight,
    isValidHeight,
    isValidBloodPressure,
    isValidTemperature,
    isValidPulse,
    isValidBloodSugar,
    isValidCholesterol,
    isValidDate,
    isNotFutureDate,
    isNotDistantPast,
    isValidTime,
    isValidFile,
    isValidImage,
    isValidPDF,
    isValidPassword,
    getPasswordStrength,
    isValidMedicalCode,
    isValidDrugCode,
    isValidPrescriptionNumber,
    isValidInvoiceNumber,
    isValidAmount,
    isValidPercentage,
    isValidQuantity,
    isValidDosage,
    isValidFrequency,
    isValidDuration,
    isValidDiagnosis,
    isValidNotes,
    isValidAddress,
    isValidPostalCode,
    isValidCoordinates,
    showError,
    removeError,
    showSuccess,
    resetValidation,
    validateAll,
    validateMedicalData,
    validatePatientData,
    validateDoctorData,
    validateAppointmentData
};
