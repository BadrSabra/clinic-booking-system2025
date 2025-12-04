/**
 * نظام واجهة المستخدم
 */

/**
 * تهيئة واجهة المستخدم
 */
function initUI() {
    // إعداد السمات
    initTheme();
    
    // إعداد القوائم المنسدلة
    initDropdowns();
    
    // إعداد النماذج
    initForms();
    
    // إعداد الجداول
    initTables();
    
    // إعداد المودالات
    initModals();
    
    // إعداد الأداة المنبثقة
    initTooltips();
    
    // إعداد التنبيهات
    initAlerts();
    
    // إعداد شريط التقدم
    initProgressBars();
    
    // إعداد مقاطع التحميل
    initLoaders();
    
    // إعداد الرموز
    initIcons();
    
    // إعداد الرسوم المتحركة
    initAnimations();
}

/**
 * إعداد السمات
 */
function initTheme() {
    // استعادة السمة المحفوظة
    const savedTheme = localStorage.getItem('app_theme') || 'dark';
    document.documentElement.setAttribute('data-theme', savedTheme);
    
    // تحديث أيقونة السمة
    updateThemeIcon(savedTheme);
}

/**
 * تحديث أيقونة السمة
 */
function updateThemeIcon(theme) {
    const themeToggle = document.getElementById('themeToggle');
    if (themeToggle) {
        const icon = themeToggle.querySelector('i');
        if (icon) {
            icon.className = theme === 'dark' ? 'fas fa-moon' : 'fas fa-sun';
        }
    }
}

/**
 * إعداد القوائم المنسدلة
 */
function initDropdowns() {
    const dropdowns = document.querySelectorAll('.dropdown-toggle');
    
    dropdowns.forEach(dropdown => {
        dropdown.addEventListener('click', function(e) {
            e.stopPropagation();
            const menu = this.nextElementSibling;
            if (menu && menu.classList.contains('dropdown-menu')) {
                menu.classList.toggle('show');
            }
        });
    });
    
    // إغلاق القوائم عند النقر خارجها
    document.addEventListener('click', () => {
        document.querySelectorAll('.dropdown-menu.show').forEach(menu => {
            menu.classList.remove('show');
        });
    });
}

/**
 * إعداد النماذج
 */
function initForms() {
    // التحقق من صحة النماذج
    const forms = document.querySelectorAll('form[data-validate]');
    
    forms.forEach(form => {
        form.addEventListener('submit', function(e) {
            if (!validateForm(this)) {
                e.preventDefault();
            }
        });
        
        // التحقق أثناء الكتابة
        const inputs = form.querySelectorAll('input, select, textarea');
        inputs.forEach(input => {
            input.addEventListener('blur', function() {
                validateField(this);
            });
        });
    });
    
    // إعداد المدخلات ذات التواريخ
    const dateInputs = document.querySelectorAll('input[type="date"]');
    dateInputs.forEach(input => {
        if (!input.value) {
            input.value = new Date().toISOString().split('T')[0];
        }
    });
    
    // إعداد المدخلات الرقمية
    const numberInputs = document.querySelectorAll('input[type="number"]');
    numberInputs.forEach(input => {
        input.addEventListener('change', function() {
            const value = parseFloat(this.value);
            if (this.min && value < parseFloat(this.min)) {
                this.value = this.min;
            }
            if (this.max && value > parseFloat(this.max)) {
                this.value = this.max;
            }
        });
    });
}

/**
 * التحقق من صحة الحقل
 */
function validateField(field) {
    const value = field.value.trim();
    const errorElement = field.parentElement.querySelector('.invalid-feedback');
    
    // إزالة رسائل الخطأ السابقة
    field.classList.remove('is-invalid');
    if (errorElement) {
        errorElement.remove();
    }
    
    // التحقق من الحقول المطلوبة
    if (field.required && !value) {
        showFieldError(field, 'هذا الحقل مطلوب');
        return false;
    }
    
    // التحقق من صحة البريد الإلكتروني
    if (field.type === 'email' && value) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) {
            showFieldError(field, 'البريد الإلكتروني غير صحيح');
            return false;
        }
    }
    
    // التحقق من صحة الهاتف
    if (field.type === 'tel' && value) {
        const phoneRegex = /^[\+]?[0-9]{10,15}$/;
        if (!phoneRegex.test(value.replace(/[\s\-\(\)]/g, ''))) {
            showFieldError(field, 'رقم الهاتف غير صحيح');
            return false;
        }
    }
    
    // التحقق من الحد الأدنى للطول
    if (field.minLength && value.length < field.minLength) {
        showFieldError(field, `الحد الأدنى ${field.minLength} حرف`);
        return false;
    }
    
    // التحقق من الحد الأقصى للطول
    if (field.maxLength && value.length > field.maxLength) {
        showFieldError(field, `الحد الأقصى ${field.maxLength} حرف`);
        return false;
    }
    
    return true;
}

/**
 * عرض خطأ في الحقل
 */
function showFieldError(field, message) {
    field.classList.add('is-invalid');
    
    const errorDiv = document.createElement('div');
    errorDiv.className = 'invalid-feedback';
    errorDiv.textContent = message;
    
    field.parentElement.appendChild(errorDiv);
    field.focus();
}

/**
 * التحقق من صحة النموذج
 */
function validateForm(form) {
    let isValid = true;
    const inputs = form.querySelectorAll('input, select, textarea[required]');
    
    inputs.forEach(input => {
        if (!validateField(input)) {
            isValid = false;
        }
    });
    
    return isValid;
}

/**
 * إعداد الجداول
 */
function initTables() {
    // فرز الجداول
    const sortableHeaders = document.querySelectorAll('th[data-sort]');
    
    sortableHeaders.forEach(header => {
        header.style.cursor = 'pointer';
        header.addEventListener('click', function() {
            const table = this.closest('table');
            const column = this.getAttribute('data-sort');
            const direction = this.getAttribute('data-direction') === 'asc' ? 'desc' : 'asc';
            
            sortTable(table, column, direction);
            this.setAttribute('data-direction', direction);
            
            // تحديث الأسهم
            sortableHeaders.forEach(h => {
                h.classList.remove('sort-asc', 'sort-desc');
            });
            this.classList.add(`sort-${direction}`);
        });
    });
    
    // إعداد التصفية
    const filterInputs = document.querySelectorAll('.table-filter');
    filterInputs.forEach(input => {
        input.addEventListener('input', function() {
            const table = this.closest('.data-table-container').querySelector('table');
            const column = this.getAttribute('data-filter');
            filterTable(table, column, this.value);
        });
    });
}

/**
 * فرز الجدول
 */
function sortTable(table, column, direction) {
    const tbody = table.querySelector('tbody');
    const rows = Array.from(tbody.querySelectorAll('tr'));
    
    rows.sort((a, b) => {
        const aValue = a.querySelector(`td[data-column="${column}"]`)?.textContent || '';
        const bValue = b.querySelector(`td[data-column="${column}"]`)?.textContent || '';
        
        // محاولة تحويل للأرقام
        const aNum = parseFloat(aValue.replace(/[^\d.-]/g, ''));
        const bNum = parseFloat(bValue.replace(/[^\d.-]/g, ''));
        
        if (!isNaN(aNum) && !isNaN(bNum)) {
            return direction === 'asc' ? aNum - bNum : bNum - aNum;
        }
        
        // مقارنة نصية
        return direction === 'asc' 
            ? aValue.localeCompare(bValue, 'ar')
            : bValue.localeCompare(aValue, 'ar');
    });
    
    // إعادة ترتيب الصفوف
    rows.forEach(row => tbody.appendChild(row));
}

/**
 * تصفية الجدول
 */
function filterTable(table, column, filterValue) {
    const rows = table.querySelectorAll('tbody tr');
    const searchTerm = filterValue.toLowerCase();
    
    rows.forEach(row => {
        const cell = column 
            ? row.querySelector(`td[data-column="${column}"]`)
            : row;
        
        const text = cell ? cell.textContent.toLowerCase() : '';
        row.style.display = text.includes(searchTerm) ? '' : 'none';
    });
}

/**
 * إعداد المودالات
 */
function initModals() {
    // زر إغلاق المودال
    const closeButtons = document.querySelectorAll('.btn-close, .modal-close');
    closeButtons.forEach(button => {
        button.addEventListener('click', function() {
            const modal = this.closest('.modal');
            if (modal) {
                closeModal(modal);
            }
        });
    });
    
    // إغلاق بالنقر خارج المودال
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('modal')) {
            closeModal(e.target);
        }
    });
    
    // إغلاق بمفتاح Escape
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            const openModal = document.querySelector('.modal.show');
            if (openModal) {
                closeModal(openModal);
            }
        }
    });
}

/**
 * فتح مودال
 */
function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.add('show');
        document.body.style.overflow = 'hidden';
        
        // تركيز على أول حقل إدخال
        const firstInput = modal.querySelector('input, select, textarea');
        if (firstInput) {
            setTimeout(() => firstInput.focus(), 100);
        }
    }
}

/**
 * إغلاق مودال
 */
function closeModal(modal) {
    modal.classList.remove('show');
    document.body.style.overflow = '';
}

/**
 * إنشاء مودال ديناميكي
 */
function createModal(options) {
    const modalId = 'modal-' + Date.now();
    const modalHtml = `
        <div class="modal" id="${modalId}">
            <div class="modal-content" style="max-width: ${options.width || '600px'}">
                <div class="modal-header">
                    <h3 class="modal-title">${options.title || ''}</h3>
                    <button class="btn-close">&times;</button>
                </div>
                <div class="modal-body">
                    ${options.body || ''}
                </div>
                ${options.footer ? `
                <div class="modal-footer">
                    ${options.footer}
                </div>
                ` : ''}
            </div>
        </div>
    `;
    
    document.getElementById('modalsContainer').innerHTML += modalHtml;
    
    // إعداد الأحداث
    const modal = document.getElementById(modalId);
    const closeBtn = modal.querySelector('.btn-close');
    
    if (closeBtn) {
        closeBtn.addEventListener('click', () => closeModal(modal));
    }
    
    if (options.onOpen) {
        modal.addEventListener('shown', options.onOpen);
    }
    
    if (options.onClose) {
        modal.addEventListener('hidden', options.onClose);
    }
    
    return modal;
}

/**
 * إعداد الأداة المنبثقة
 */
function initTooltips() {
    const tooltipElements = document.querySelectorAll('[data-tooltip]');
    
    tooltipElements.forEach(element => {
        element.addEventListener('mouseenter', function(e) {
            const tooltip = document.createElement('div');
            tooltip.className = 'tooltip';
            tooltip.textContent = this.getAttribute('data-tooltip');
            
            document.body.appendChild(tooltip);
            
            const rect = this.getBoundingClientRect();
            tooltip.style.left = rect.left + (rect.width / 2) - (tooltip.offsetWidth / 2) + 'px';
            tooltip.style.top = rect.top - tooltip.offsetHeight - 10 + 'px';
            
            this._tooltip = tooltip;
        });
        
        element.addEventListener('mouseleave', function() {
            if (this._tooltip) {
                this._tooltip.remove();
                this._tooltip = null;
            }
        });
    });
}

/**
 * إعداد التنبيهات
 */
function initAlerts() {
    // زر إغلاق التنبيهات
    const alertCloseButtons = document.querySelectorAll('.alert .close');
    alertCloseButtons.forEach(button => {
        button.addEventListener('click', function() {
            this.closest('.alert').remove();
        });
    });
    
    // إغلاق التنبيهات تلقائياً
    const autoCloseAlerts = document.querySelectorAll('.alert[data-auto-close]');
    autoCloseAlerts.forEach(alert => {
        const delay = parseInt(alert.getAttribute('data-auto-close')) || 5000;
        setTimeout(() => {
            alert.remove();
        }, delay);
    });
}

/**
 * إعداد شريط التقدم
 */
function initProgressBars() {
    const progressBars = document.querySelectorAll('.progress-bar[data-progress]');
    
    progressBars.forEach(bar => {
        const progress = bar.getAttribute('data-progress');
        bar.style.width = progress + '%';
        bar.setAttribute('aria-valuenow', progress);
        
        // تحديث متحرك
        if (bar.hasAttribute('data-animate')) {
            bar.style.transition = 'width 1s ease-in-out';
        }
    });
}

/**
 * تحديث شريط التقدم
 */
function updateProgressBar(barId, progress) {
    const bar = document.getElementById(barId);
    if (bar) {
        bar.style.width = progress + '%';
        bar.setAttribute('aria-valuenow', progress);
        bar.textContent = progress + '%';
    }
}

/**
 * إعداد مقاطع التحميل
 */
function initLoaders() {
    // لا حاجة لإعداد إضافي
}

/**
 * إعداد الرموز
 */
function initIcons() {
    // استبدال رموز Font Awesome الديناميكية
    const iconElements = document.querySelectorAll('[data-icon]');
    iconElements.forEach(element => {
        const iconName = element.getAttribute('data-icon');
        const iconClass = `fas fa-${iconName}`;
        
        if (!element.querySelector('i')) {
            const icon = document.createElement('i');
            icon.className = iconClass;
            element.prepend(icon);
        }
    });
}

/**
 * إعداد الرسوم المتحركة
 */
function initAnimations() {
    // إعداد التمرير المتحرك
    const animatedElements = document.querySelectorAll('[data-animate]');
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animated');
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.1
    });
    
    animatedElements.forEach(element => {
        observer.observe(element);
    });
}

/**
 * تغيير السمة
 */
function toggleTheme() {
    const html = document.documentElement;
    const currentTheme = html.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    
    html.setAttribute('data-theme', newTheme);
    localStorage.setItem('app_theme', newTheme);
    updateThemeIcon(newTheme);
    
    return newTheme;
}

/**
 * تحديث شجرة التنقل
 */
function updateBreadcrumb(path) {
    const breadcrumb = document.getElementById('breadcrumb');
    if (!breadcrumb) return;
    
    const items = path.map((item, index) => {
        const isLast = index === path.length - 1;
        return `
            <span class="breadcrumb-item ${isLast ? 'active' : ''}">
                ${isLast ? item.name : `<a href="${item.url}">${item.name}</a>`}
            </span>
        `;
    }).join('<span class="breadcrumb-separator">/</span>');
    
    breadcrumb.innerHTML = items;
}

/**
 * تحديث حالة القائمة
 */
function updateMenuState() {
    const currentPath = window.location.hash.slice(1) || 'dashboard';
    const menuItems = document.querySelectorAll('.menu-link');
    
    menuItems.forEach(item => {
        const section = item.getAttribute('data-section');
        item.classList.toggle('active', section === currentPath);
    });
}

/**
 * تحميل محتوى قسم
 */
function loadSectionContent(sectionId, content) {
    const section = document.getElementById(sectionId);
    if (section) {
        // إضافة تأثير التلاشي
        section.style.opacity = '0';
        
        setTimeout(() => {
            section.innerHTML = content;
            section.style.opacity = '1';
            
            // إعادة تهيئة مكونات UI داخل المحتوى الجديد
            initSectionUI(section);
        }, 300);
    }
}

/**
 * تهيئة واجهة المستخدم للقسم
 */
function initSectionUI(section) {
    // إعادة تهيئة جميع مكونات UI داخل القسم
    initForms();
    initTables();
    initModals();
    initTooltips();
    initProgressBars();
    initAnimations();
}

/**
 * إظهار رسالة تأكيد
 */
function showConfirmDialog(options) {
    return new Promise((resolve) => {
        const modalId = 'confirm-dialog-' + Date.now();
        const modalHtml = `
            <div class="modal" id="${modalId}">
                <div class="modal-content">
                    <div class="modal-header">
                        <h3 class="modal-title">${options.title || 'تأكيد'}</h3>
                        <button class="btn-close">&times;</button>
                    </div>
                    <div class="modal-body">
                        <p>${options.message || 'هل أنت متأكد؟'}</p>
                    </div>
                    <div class="modal-footer">
                        <button class="btn btn-secondary" data-action="cancel">
                            ${options.cancelText || 'إلغاء'}
                        </button>
                        <button class="btn ${options.danger ? 'btn-danger' : 'btn-primary'}" data-action="confirm">
                            ${options.confirmText || 'تأكيد'}
                        </button>
                    </div>
                </div>
            </div>
        `;
        
        document.getElementById('modalsContainer').innerHTML += modalHtml;
        const modal = document.getElementById(modalId);
        
        // إعداد الأحداث
        modal.querySelector('.btn-close').addEventListener('click', () => {
            closeModal(modal);
            resolve(false);
        });
        
        modal.querySelector('[data-action="cancel"]').addEventListener('click', () => {
            closeModal(modal);
            resolve(false);
        });
        
        modal.querySelector('[data-action="confirm"]').addEventListener('click', () => {
            closeModal(modal);
            resolve(true);
        });
        
        // إظهار المودال
        openModal(modalId);
        
        // إغلاق تلقائي بعد فترة
        if (options.autoClose) {
            setTimeout(() => {
                closeModal(modal);
                resolve(false);
            }, options.autoClose);
        }
    });
}

/**
 * إظهار رسالة نصية
 */
function showPromptDialog(options) {
    return new Promise((resolve) => {
        const modalId = 'prompt-dialog-' + Date.now();
        const modalHtml = `
            <div class="modal" id="${modalId}">
                <div class="modal-content">
                    <div class="modal-header">
                        <h3 class="modal-title">${options.title || 'إدخال'}</h3>
                        <button class="btn-close">&times;</button>
                    </div>
                    <div class="modal-body">
                        <p>${options.message || ''}</p>
                        <div class="form-group">
                            <input type="${options.type || 'text'}" 
                                   class="form-control" 
                                   id="prompt-input"
                                   value="${options.defaultValue || ''}"
                                   placeholder="${options.placeholder || ''}"
                                   ${options.required ? 'required' : ''}>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button class="btn btn-secondary" data-action="cancel">
                            ${options.cancelText || 'إلغاء'}
                        </button>
                        <button class="btn btn-primary" data-action="confirm">
                            ${options.confirmText || 'موافق'}
                        </button>
                    </div>
                </div>
            </div>
        `;
        
        document.getElementById('modalsContainer').innerHTML += modalHtml;
        const modal = document.getElementById(modalId);
        const input = modal.querySelector('#prompt-input');
        
        // إعداد الأحداث
        modal.querySelector('.btn-close').addEventListener('click', () => {
            closeModal(modal);
            resolve(null);
        });
        
        modal.querySelector('[data-action="cancel"]').addEventListener('click', () => {
            closeModal(modal);
            resolve(null);
        });
        
        modal.querySelector('[data-action="confirm"]').addEventListener('click', () => {
            if (!options.required || input.value.trim()) {
                closeModal(modal);
                resolve(input.value);
            }
        });
        
        // السماح بالإدخال بمفتاح Enter
        input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                modal.querySelector('[data-action="confirm"]').click();
            }
        });
        
        // إظهار المودال وتركيز على المدخل
        openModal(modalId);
        setTimeout(() => input.focus(), 100);
    });
}

/**
 * إظهار نافذة اختيار
 */
function showSelectDialog(options) {
    return new Promise((resolve) => {
        const modalId = 'select-dialog-' + Date.now();
        const optionsHtml = options.options.map(option => `
            <div class="select-option" data-value="${option.value}">
                ${option.icon ? `<i class="fas fa-${option.icon}"></i>` : ''}
                <span>${option.label}</span>
            </div>
        `).join('');
        
        const modalHtml = `
            <div class="modal" id="${modalId}">
                <div class="modal-content" style="max-width: 400px">
                    <div class="modal-header">
                        <h3 class="modal-title">${options.title || 'اختيار'}</h3>
                        <button class="btn-close">&times;</button>
                    </div>
                    <div class="modal-body">
                        ${options.message ? `<p>${options.message}</p>` : ''}
                        <div class="select-options">
                            ${optionsHtml}
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button class="btn btn-secondary" data-action="cancel">
                            ${options.cancelText || 'إلغاء'}
                        </button>
                    </div>
                </div>
            </div>
        `;
        
        document.getElementById('modalsContainer').innerHTML += modalHtml;
        const modal = document.getElementById(modalId);
        
        // إعداد الأحداث للخيارات
        modal.querySelectorAll('.select-option').forEach(option => {
            option.addEventListener('click', () => {
                const value = option.getAttribute('data-value');
                closeModal(modal);
                resolve(value);
            });
        });
        
        modal.querySelector('.btn-close').addEventListener('click', () => {
            closeModal(modal);
            resolve(null);
        });
        
        modal.querySelector('[data-action="cancel"]').addEventListener('click', () => {
            closeModal(modal);
            resolve(null);
        });
        
        openModal(modalId);
    });
}

/**
 * إظهار مؤشر تحميل
 */
function showLoading(selector = 'body') {
    const container = document.querySelector(selector);
    if (!container) return null;
    
    const loaderId = 'loader-' + Date.now();
    const loaderHtml = `
        <div class="loading-overlay" id="${loaderId}">
            <div class="loading-spinner">
                <div class="spinner"></div>
                <p>جاري التحميل...</p>
            </div>
        </div>
    `;
    
    container.style.position = 'relative';
    container.insertAdjacentHTML('beforeend', loaderHtml);
    
    return loaderId;
}

/**
 * إخفاء مؤشر تحميل
 */
function hideLoading(loaderId) {
    if (loaderId) {
        const loader = document.getElementById(loaderId);
        if (loader) {
            loader.remove();
        }
    } else {
        const loaders = document.querySelectorAll('.loading-overlay');
        loaders.forEach(loader => loader.remove());
    }
}

/**
 * إظهار تنبيه مؤقت
 */
function showToast(message, type = 'info', duration = 3000) {
    const toastId = 'toast-' + Date.now();
    const toastHtml = `
        <div class="toast toast-${type}" id="${toastId}">
            <div class="toast-content">
                <i class="fas fa-${getToastIcon(type)}"></i>
                <span>${message}</span>
            </div>
            <button class="toast-close">&times;</button>
        </div>
    `;
    
    document.getElementById('systemNotifications').innerHTML += toastHtml;
    const toast = document.getElementById(toastId);
    
    // إضافة تأثير الظهور
    setTimeout(() => {
        toast.classList.add('show');
    }, 10);
    
    // إعداد إغلاق
    toast.querySelector('.toast-close').addEventListener('click', () => {
        hideToast(toastId);
    });
    
    // إغلاق تلقائي
    setTimeout(() => {
        hideToast(toastId);
    }, duration);
    
    return toastId;
}

/**
 * إخفاء تنبيه مؤقت
 */
function hideToast(toastId) {
    const toast = document.getElementById(toastId);
    if (toast) {
        toast.classList.remove('show');
        setTimeout(() => {
            toast.remove();
        }, 300);
    }
}

/**
 * الحصول على أيقونة التنبيه
 */
function getToastIcon(type) {
    const icons = {
        'success': 'check-circle',
        'error': 'exclamation-circle',
        'warning': 'exclamation-triangle',
        'info': 'info-circle'
    };
    
    return icons[type] || 'info-circle';
}

/**
 * تحديث عدد الإشعارات
 */
function updateBadgeCount(badgeId, count) {
    const badge = document.getElementById(badgeId);
    if (badge) {
        badge.textContent = count;
        badge.style.display = count > 0 ? 'flex' : 'none';
    }
}

/**
 * تبديل حالة العنصر
 */
function toggleElementState(elementId, state) {
    const element = document.getElementById(elementId);
    if (element) {
        if (state !== undefined) {
            element.classList.toggle('active', state);
        } else {
            element.classList.toggle('active');
        }
        return element.classList.contains('active');
    }
    return false;
}

/**
 * تعطيل/تمكين العنصر
 */
function setElementDisabled(elementId, disabled) {
    const element = document.getElementById(elementId);
    if (element) {
        element.disabled = disabled;
        element.classList.toggle('disabled', disabled);
    }
}

/**
 * تحديث محتوى العنصر
 */
function updateElementContent(elementId, content) {
    const element = document.getElementById(elementId);
    if (element) {
        element.innerHTML = content;
    }
}

/**
 * إضافة فئة CSS
 */
function addClass(elementId, className) {
    const element = document.getElementById(elementId);
    if (element) {
        element.classList.add(className);
    }
}

/**
 * إزالة فئة CSS
 */
function removeClass(elementId, className) {
    const element = document.getElementById(elementId);
    if (element) {
        element.classList.remove(className);
    }
}

/**
 * تبديل فئة CSS
 */
function toggleClass(elementId, className) {
    const element = document.getElementById(elementId);
    if (element) {
        element.classList.toggle(className);
    }
}

/**
 * إظهار/إخفاء العنصر
 */
function toggleElementVisibility(elementId, show) {
    const element = document.getElementById(elementId);
    if (element) {
        if (show !== undefined) {
            element.style.display = show ? '' : 'none';
        } else {
            element.style.display = element.style.display === 'none' ? '' : 'none';
        }
        return element.style.display !== 'none';
    }
    return false;
}

// تهيئة واجهة المستخدم عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', initUI);

// تصدير الدوال للاستخدام العام
window.ui = {
    initUI,
    openModal,
    closeModal,
    createModal,
    showConfirmDialog,
    showPromptDialog,
    showSelectDialog,
    showLoading,
    hideLoading,
    showToast,
    hideToast,
    toggleTheme,
    updateBreadcrumb,
    updateMenuState,
    loadSectionContent,
    updateBadgeCount,
    toggleElementState,
    setElementDisabled,
    updateElementContent,
    addClass,
    removeClass,
    toggleClass,
    toggleElementVisibility,
    validateForm,
    validateField,
    updateProgressBar
};
