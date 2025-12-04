/**
 * نظام إدارة العيادات الطبية - التطبيق الرئيسي
 * @version 1.0.0
 * @author Clinic Management System
 */

// تهيئة التطبيق
document.addEventListener('DOMContentLoaded', function() {
    initApp();
});

/**
 * تهيئة التطبيق
 */
async function initApp() {
    try {
        // عرض شاشة التحميل
        showLoading();
        
        // تهيئة النظام
        await initSystem();
        
        // تحميل البيانات الأولية
        await loadInitialData();
        
        // إعداد واجهة المستخدم
        setupUI();
        
        // إعداد المستخدم الحالي
        setupCurrentUser();
        
        // إعداد مستمعي الأحداث
        setupEventListeners();
        
        // إخفاء شاشة التحميل
        setTimeout(() => {
            hideLoading();
            showNotification('تم تحميل النظام بنجاح', 'success');
        }, 1000);
        
        // مراقبة حالة الاتصال
        monitorConnection();
        
        // تحميل قسم لوحة التحكم
        loadSection('dashboard');
        
    } catch (error) {
        console.error('خطأ في تهيئة التطبيق:', error);
        showNotification('حدث خطأ أثناء تحميل النظام', 'error');
        hideLoading();
    }
}

/**
 * تهيئة النظام
 */
async function initSystem() {
    try {
        // تهيئة قاعدة البيانات
        if (typeof initDatabase === 'function') {
            await initDatabase();
        }
        
        // التحقق من مصادقة المستخدم
        if (typeof checkAuth === 'function') {
            const isAuthenticated = await checkAuth();
            if (!isAuthenticated) {
                window.location.href = 'login.html';
                return;
            }
        }
        
        // تسجيل معلومات النظام
        console.log('تم تهيئة النظام بنجاح');
        
    } catch (error) {
        console.error('خطأ في تهيئة النظام:', error);
        throw error;
    }
}

/**
 * تحميل البيانات الأولية
 */
async function loadInitialData() {
    try {
        // تحميل الإحصائيات
        await updateDashboardStats();
        
        // تحميل الإشعارات
        await loadNotifications();
        
        // تحميل المستخدم الحالي
        await loadCurrentUser();
        
    } catch (error) {
        console.error('خطأ في تحميل البيانات:', error);
    }
}

/**
 * إعداد واجهة المستخدم
 */
function setupUI() {
    // إعداد القائمة الجانبية
    setupSidebar();
    
    // إعداد شريط التنقل العلوي
    setupTopBar();
    
    // إعداد تبديل السمات
    setupThemeToggle();
    
    // إعداد البحث العام
    setupGlobalSearch();
    
    // إعداد الإشعارات
    setupNotifications();
    
    // إعداد الإجراءات السريعة
    setupQuickActions();
}

/**
 * إعداد القائمة الجانبية
 */
function setupSidebar() {
    const sidebar = document.getElementById('sidebar');
    const sidebarToggle = document.getElementById('sidebarToggle');
    const menuToggle = document.getElementById('menuToggle');
    const menuLinks = document.querySelectorAll('.menu-link');
    
    // تبديل القائمة الجانبية
    if (sidebarToggle) {
        sidebarToggle.addEventListener('click', function() {
            sidebar.classList.toggle('collapsed');
            updateSidebarState();
        });
    }
    
    // تبديل القائمة من زر الهيدر
    if (menuToggle) {
        menuToggle.addEventListener('click', function() {
            sidebar.classList.toggle('show');
        });
    }
    
    // إغلاق القائمة عند النقر خارجها
    document.addEventListener('click', function(event) {
        if (!sidebar.contains(event.target) && !menuToggle.contains(event.target)) {
            sidebar.classList.remove('show');
        }
    });
    
    // التنقل بين الأقسام
    menuLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            // إزالة النشاط من جميع الروابط
            menuLinks.forEach(l => l.classList.remove('active'));
            
            // إضافة النشاط للرابط الحالي
            this.classList.add('active');
            
            // تحميل القسم المحدد
            const section = this.getAttribute('data-section');
            loadSection(section);
            
            // تحديث مسار التنقل
            updateBreadcrumb(section);
            
            // إغلاق القائمة على الهواتف
            if (window.innerWidth < 992) {
                sidebar.classList.remove('show');
            }
        });
    });
    
    // تحديث حالة القائمة
    updateSidebarState();
}

/**
 * تحديث حالة القائمة الجانبية
 */
function updateSidebarState() {
    const sidebar = document.getElementById('sidebar');
    const isCollapsed = sidebar.classList.contains('collapsed');
    
    // حفظ الحالة في التخزين المحلي
    localStorage.setItem('sidebarCollapsed', isCollapsed);
    
    // تحديث الأيقونات والنصوص
    const menuTexts = document.querySelectorAll('.menu-text');
    const logoText = document.querySelector('.logo-text');
    
    if (isCollapsed) {
        menuTexts.forEach(text => text.style.opacity = '0');
        if (logoText) logoText.style.display = 'none';
    } else {
        menuTexts.forEach(text => text.style.opacity = '1');
        if (logoText) logoText.style.display = 'block';
    }
}

/**
 * إعداد شريط التنقل العلوي
 */
function setupTopBar() {
    // إعداد البحث
    const searchInput = document.getElementById('globalSearch');
    const searchBtn = document.querySelector('.search-btn');
    
    if (searchInput && searchBtn) {
        searchBtn.addEventListener('click', performSearch);
        searchInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                performSearch();
            }
        });
    }
}

/**
 * إعداد تبديل السمات
 */
function setupThemeToggle() {
    const themeToggle = document.getElementById('themeToggle');
    const html = document.documentElement;
    
    if (themeToggle) {
        // استعادة السمة المحفوظة
        const savedTheme = localStorage.getItem('theme') || 'dark';
        html.setAttribute('data-theme', savedTheme);
        updateThemeIcon(savedTheme);
        
        // إعداد المستمع للتبديل
        themeToggle.addEventListener('click', function() {
            const currentTheme = html.getAttribute('data-theme');
            const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
            
            html.setAttribute('data-theme', newTheme);
            localStorage.setItem('theme', newTheme);
            updateThemeIcon(newTheme);
            
            showNotification(`تم التبديل إلى وضع ${newTheme === 'dark' ? 'الداكن' : 'الفاتح'}`, 'success');
        });
    }
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
 * إعداد البحث العام
 */
function setupGlobalSearch() {
    const searchInput = document.getElementById('globalSearch');
    
    if (searchInput) {
        // البحث أثناء الكتابة
        let searchTimeout;
        searchInput.addEventListener('input', function() {
            clearTimeout(searchTimeout);
            searchTimeout = setTimeout(() => {
                if (this.value.length >= 2) {
                    performSearch();
                }
            }, 500);
        });
    }
}

/**
 * إعداد الإشعارات
 */
function setupNotifications() {
    const notificationsBtn = document.getElementById('notificationsBtn');
    const notificationsMenu = document.getElementById('notificationsMenu');
    const markAllReadBtn = document.getElementById('markAllRead');
    
    if (notificationsBtn && notificationsMenu) {
        // إظهار/إخفاء قائمة الإشعارات
        notificationsBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            notificationsMenu.classList.toggle('show');
        });
        
        // إغلاق القائمة عند النقر خارجها
        document.addEventListener('click', function() {
            notificationsMenu.classList.remove('show');
        });
        
        // منع إغلاق القائمة عند النقر داخلها
        notificationsMenu.addEventListener('click', function(e) {
            e.stopPropagation();
        });
    }
    
    if (markAllReadBtn) {
        markAllReadBtn.addEventListener('click', markAllNotificationsAsRead);
    }
}

/**
 * إعداد الإجراءات السريعة
 */
function setupQuickActions() {
    const quickActionsBtn = document.getElementById('quickActionsBtn');
    const quickActionsMenu = document.querySelector('.quick-actions-menu');
    
    if (quickActionsBtn && quickActionsMenu) {
        // إظهار/إخفاء قائمة الإجراءات السريعة
        quickActionsBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            quickActionsMenu.classList.toggle('show');
        });
        
        // إغلاق القائمة عند النقر خارجها
        document.addEventListener('click', function() {
            quickActionsMenu.classList.remove('show');
        });
        
        // منع إغلاق القائمة عند النقر داخلها
        quickActionsMenu.addEventListener('click', function(e) {
            e.stopPropagation();
        });
    }
}

/**
 * إعداد المستخدم الحالي
 */
function setupCurrentUser() {
    const logoutBtn = document.getElementById('logoutBtn');
    
    if (logoutBtn) {
        logoutBtn.addEventListener('click', async function() {
            const confirmed = await showConfirmModal('تسجيل الخروج', 'هل أنت متأكد من تسجيل الخروج؟');
            if (confirmed) {
                await logout();
            }
        });
    }
}

/**
 * إعداد مستمعي الأحداث
 */
function setupEventListeners() {
    // تحديث البيانات عند العودة للاتصال
    window.addEventListener('online', handleOnline);
    
    // إظهار مؤشر عدم الاتصال
    window.addEventListener('offline', handleOffline);
    
    // تحديث البيانات عند تحديث الصفحة
    window.addEventListener('beforeunload', saveAppState);
    
    // استعادة حالة التطبيق
    window.addEventListener('load', restoreAppState);
    
    // تحديث الإحصائيات عند تغيير النطاق الزمني
    const dashboardRange = document.getElementById('dashboardRange');
    if (dashboardRange) {
        dashboardRange.addEventListener('change', updateDashboardStats);
    }
    
    // تحديث لوحة التحكم
    const refreshDashboard = document.getElementById('refreshDashboard');
    if (refreshDashboard) {
        refreshDashboard.addEventListener('click', updateDashboardStats);
    }
}

/**
 * تسجيل الخروج
 */
async function logout() {
    try {
        showLoading();
        
        if (typeof logoutUser === 'function') {
            await logoutUser();
        }
        
        // حذف بيانات الجلسة
        localStorage.removeItem('auth_token');
        localStorage.removeItem('user_data');
        
        // التوجيه لصفحة تسجيل الدخول
        setTimeout(() => {
            window.location.href = 'login.html';
        }, 1000);
        
    } catch (error) {
        console.error('خطأ في تسجيل الخروج:', error);
        showNotification('حدث خطأ أثناء تسجيل الخروج', 'error');
    } finally {
        hideLoading();
    }
}

/**
 * تحميل قسم من الأقسام
 */
async function loadSection(section) {
    try {
        showLoading();
        
        // إخفاء جميع الأقسام
        document.querySelectorAll('.content-section').forEach(el => {
            el.classList.remove('active');
            el.innerHTML = '';
        });
        
        // تحميل القسم المطلوب
        const sectionElement = document.getElementById(section);
        if (sectionElement) {
            sectionElement.classList.add('active');
            
            // تحميل محتوى القسم
            await loadSectionContent(section);
            
            // تحديث العنوان
            document.title = `نظام إدارة العيادة | ${getSectionTitle(section)}`;
        }
        
    } catch (error) {
        console.error(`خطأ في تحميل القسم ${section}:`, error);
        showNotification('حدث خطأ في تحميل الصفحة', 'error');
    } finally {
        hideLoading();
    }
}

/**
 * تحميل محتوى القسم
 */
async function loadSectionContent(section) {
    const sectionElement = document.getElementById(section);
    if (!sectionElement) return;
    
    switch (section) {
        case 'dashboard':
            await loadDashboardContent(sectionElement);
            break;
        case 'doctors':
            await loadDoctorsContent(sectionElement);
            break;
        case 'patients':
            await loadPatientsContent(sectionElement);
            break;
        case 'appointments':
            await loadAppointmentsContent(sectionElement);
            break;
        case 'prescriptions':
            await loadPrescriptionsContent(sectionElement);
            break;
        case 'inventory':
            await loadInventoryContent(sectionElement);
            break;
        case 'billing':
            await loadBillingContent(sectionElement);
            break;
        case 'reports':
            await loadReportsContent(sectionElement);
            break;
        case 'settings':
            await loadSettingsContent(sectionElement);
            break;
        case 'help':
            await loadHelpContent(sectionElement);
            break;
        default:
            sectionElement.innerHTML = `
                <div class="section-header">
                    <div class="header-content">
                        <h2 class="section-title">
                            <i class="fas fa-exclamation-triangle"></i>
                            قسم غير معروف
                        </h2>
                    </div>
                </div>
                <div class="alert alert-warning">
                    القسم المطلوب غير موجود أو لم يتم تطويره بعد.
                </div>
            `;
    }
}

/**
 * الحصول على عنوان القسم
 */
function getSectionTitle(section) {
    const titles = {
        'dashboard': 'لوحة التحكم',
        'doctors': 'إدارة الأطباء',
        'patients': 'إدارة المرضى',
        'appointments': 'المواعيد',
        'prescriptions': 'الوصفات الطبية',
        'inventory': 'المخزون',
        'billing': 'الفواتير',
        'reports': 'التقارير',
        'settings': 'الإعدادات',
        'help': 'المساعدة'
    };
    
    return titles[section] || 'القسم غير معروف';
}

/**
 * تحديث مسار التنقل
 */
function updateBreadcrumb(section) {
    const breadcrumb = document.getElementById('breadcrumb');
    if (!breadcrumb) return;
    
    const sectionTitle = getSectionTitle(section);
    
    breadcrumb.innerHTML = `
        <span class="breadcrumb-item">لوحة التحكم</span>
        <span class="breadcrumb-item active">${sectionTitle}</span>
    `;
}

/**
 * إظهار مؤشر التحميل
 */
function showLoading() {
    const loadingOverlay = document.getElementById('loadingOverlay');
    if (loadingOverlay) {
        loadingOverlay.style.display = 'flex';
    }
}

/**
 * إخفاء مؤشر التحميل
 */
function hideLoading() {
    const loadingOverlay = document.getElementById('loadingOverlay');
    if (loadingOverlay) {
        loadingOverlay.style.display = 'none';
    }
}

/**
 * إظهار إشعار
 */
function showNotification(message, type = 'info', duration = 5000) {
    const container = document.getElementById('systemNotifications');
    if (!container) return;
    
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <p>${message}</p>
        </div>
        <button class="notification-close" onclick="this.parentElement.remove()">
            <i class="fas fa-times"></i>
        </button>
    `;
    
    container.appendChild(notification);
    
    // إزالة الإشعار بعد المدة المحددة
    setTimeout(() => {
        if (notification.parentElement) {
            notification.remove();
        }
    }, duration);
}

/**
 * مراقبة حالة الاتصال
 */
function monitorConnection() {
    const offlineIndicator = document.getElementById('offlineIndicator');
    if (!offlineIndicator) return;
    
    if (!navigator.onLine) {
        handleOffline();
    }
}

/**
 * التعامل مع حالة عدم الاتصال
 */
function handleOffline() {
    const offlineIndicator = document.getElementById('offlineIndicator');
    if (offlineIndicator) {
        offlineIndicator.style.display = 'flex';
        showNotification('فقدت الاتصال بالإنترنت', 'warning');
    }
}

/**
 * التعامل مع حالة الاتصال
 */
function handleOnline() {
    const offlineIndicator = document.getElementById('offlineIndicator');
    if (offlineIndicator) {
        offlineIndicator.style.display = 'none';
        showNotification('تم استعادة الاتصال بالإنترنت', 'success');
        
        // تحديث البيانات
        updateDashboardStats();
        loadNotifications();
    }
}

/**
 * حفظ حالة التطبيق
 */
function saveAppState() {
    const activeSection = document.querySelector('.menu-link.active')?.getAttribute('data-section') || 'dashboard';
    localStorage.setItem('activeSection', activeSection);
}

/**
 * استعادة حالة التطبيق
 */
function restoreAppState() {
    const activeSection = localStorage.getItem('activeSection') || 'dashboard';
    const activeLink = document.querySelector(`.menu-link[data-section="${activeSection}"]`);
    if (activeLink) {
        activeLink.click();
    }
}

/**
 * إجراء البحث
 */
function performSearch() {
    const searchInput = document.getElementById('globalSearch');
    if (!searchInput || !searchInput.value.trim()) return;
    
    const query = searchInput.value.trim();
    const activeSection = document.querySelector('.menu-link.active')?.getAttribute('data-section');
    
    showNotification(`جاري البحث عن: ${query}`, 'info');
    
    // البحث في القسم الحالي أو البحث العام
    if (typeof window[`search${capitalizeFirstLetter(activeSection)}`] === 'function') {
        window[`search${capitalizeFirstLetter(activeSection)}`](query);
    } else {
        globalSearch(query);
    }
}

/**
 * البحث العام
 */
function globalSearch(query) {
    // تنفيذ البحث في جميع الأقسام
    console.log('بحث عام عن:', query);
    // يمكن هنا تنفيذ البحث في قاعدة البيانات أو عرض نتائج متعددة
}

/**
 * تحويل أول حرف إلى كبير
 */
function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

/**
 * إظهار نافذة تأكيد
 */
function showConfirmModal(title, message) {
    return new Promise((resolve) => {
        const modalId = 'confirmModal';
        let modal = document.getElementById(modalId);
        
        if (!modal) {
            modal = document.createElement('div');
            modal.id = modalId;
            modal.className = 'modal';
            modal.innerHTML = `
                <div class="modal-content">
                    <div class="modal-header">
                        <h3 class="modal-title">${title}</h3>
                        <button class="btn-close" onclick="closeConfirmModal(false)">×</button>
                    </div>
                    <div class="modal-body">
                        <p>${message}</p>
                    </div>
                    <div class="modal-footer">
                        <button class="btn btn-secondary" onclick="closeConfirmModal(false)">إلغاء</button>
                        <button class="btn btn-primary" onclick="closeConfirmModal(true)">تأكيد</button>
                    </div>
                </div>
            `;
            document.getElementById('modalsContainer').appendChild(modal);
        }
        
        window.closeConfirmModal = function(result) {
            modal.classList.remove('show');
            setTimeout(() => {
                modal.remove();
                delete window.closeConfirmModal;
            }, 300);
            resolve(result);
        };
        
        modal.classList.add('show');
    });
}

/**
 * فتح نموذج سريع
 */
function openQuickForm(type) {
    switch (type) {
        case 'patient':
            openPatientForm();
            break;
        case 'appointment':
            openAppointmentForm();
            break;
        default:
            showNotification('النموذج غير متوفر', 'warning');
    }
}

/**
 * فتح نموذج مريض جديد
 */
function openPatientForm() {
    // تحميل قسم المرضى وفتح النموذج
    loadSection('patients').then(() => {
        if (typeof window.openPatientModal === 'function') {
            window.openPatientModal();
        }
    });
}

/**
 * فتح نموذج موعد جديد
 */
function openAppointmentForm() {
    // تحميل قسم المواعيد وفتح النموذج
    loadSection('appointments').then(() => {
        if (typeof window.openAppointmentModal === 'function') {
            window.openAppointmentModal();
        }
    });
}

/**
 * توليد تقرير سريع
 */
function generateQuickReport() {
    const activeSection = document.querySelector('.menu-link.active')?.getAttribute('data-section');
    showNotification(`جاري توليد تقرير عن ${getSectionTitle(activeSection)}`, 'info');
    // يمكن هنا استدعاء دالة توليد التقارير
}

/**
 * إنشاء نسخة احتياطية
 */
function backupNow() {
    showNotification('جاري إنشاء نسخة احتياطية...', 'info');
    // يمكن هنا استدعاء دالة النسخ الاحتياطي
    setTimeout(() => {
        showNotification('تم إنشاء النسخة الاحتياطية بنجاح', 'success');
    }, 2000);
}

/**
 * تعيين جميع الإشعارات كمقروءة
 */
function markAllNotificationsAsRead() {
    const notificationItems = document.querySelectorAll('.notification-item.unread');
    notificationItems.forEach(item => {
        item.classList.remove('unread');
    });
    
    const notificationCount = document.getElementById('notificationCount');
    if (notificationCount) {
        notificationCount.textContent = '0';
    }
    
    showNotification('تم تعيين جميع الإشعارات كمقروءة', 'success');
}

/**
 * تحديث إحصائيات لوحة التحكم
 */
async function updateDashboardStats() {
    try {
        // تحديث إحصائيات الأطباء
        updateDoctorStats();
        
        // تحديث إحصائيات المرضى
        updatePatientStats();
        
        // تحديث إحصائيات المواعيد
        updateAppointmentStats();
        
        // تحديث إحصائيات الإيرادات
        updateRevenueStats();
        
    } catch (error) {
        console.error('خطأ في تحديث الإحصائيات:', error);
    }
}

/**
 * تحديث إحصائيات الأطباء
 */
async function updateDoctorStats() {
    try {
        const doctorsCount = document.getElementById('doctorsCount');
        const doctorsChange = document.getElementById('doctorsChange');
        const doctorsBadge = document.getElementById('doctorsBadge');
        
        // استدعاء البيانات من قاعدة البيانات
        const doctors = await getDoctors();
        const count = doctors.length;
        
        if (doctorsCount) doctorsCount.textContent = count;
        if (doctorsBadge) doctorsBadge.textContent = count;
        
        // حساب التغيير (مثال)
        const change = Math.floor(Math.random() * 10) - 2;
        if (doctorsChange) {
            doctorsChange.innerHTML = `
                <i class="fas fa-arrow-${change >= 0 ? 'up' : 'down'}"></i>
                ${Math.abs(change)}%
            `;
            doctorsChange.classList.toggle('positive', change >= 0);
            doctorsChange.classList.toggle('negative', change < 0);
        }
        
    } catch (error) {
        console.error('خطأ في تحديث إحصائيات الأطباء:', error);
    }
}

/**
 * تحديث إحصائيات المرضى
 */
async function updatePatientStats() {
    try {
        const patientsCount = document.getElementById('patientsCount');
        const patientsChange = document.getElementById('patientsChange');
        const patientsBadge = document.getElementById('patientsBadge');
        
        // استدعاء البيانات من قاعدة البيانات
        const patients = await getPatients();
        const count = patients.length;
        
        if (patientsCount) patientsCount.textContent = count;
        if (patientsBadge) patientsBadge.textContent = count;
        
        // حساب التغيير (مثال)
        const change = Math.floor(Math.random() * 15) - 3;
        if (patientsChange) {
            patientsChange.innerHTML = `
                <i class="fas fa-arrow-${change >= 0 ? 'up' : 'down'}"></i>
                ${Math.abs(change)}%
            `;
            patientsChange.classList.toggle('positive', change >= 0);
            patientsChange.classList.toggle('negative', change < 0);
        }
        
    } catch (error) {
        console.error('خطأ في تحديث إحصائيات المرضى:', error);
    }
}

/**
 * تحديث إحصائيات المواعيد
 */
async function updateAppointmentStats() {
    try {
        const appointmentsCount = document.getElementById('appointmentsCount');
        const appointmentsChange = document.getElementById('appointmentsChange');
        const appointmentsBadge = document.getElementById('appointmentsBadge');
        const todayAppointments = document.getElementById('todayAppointments');
        
        // استدعاء البيانات من قاعدة البيانات
        const appointments = await getAppointments();
        const today = new Date().toISOString().split('T')[0];
        const todayCount = appointments.filter(a => a.date === today).length;
        const count = appointments.length;
        
        if (appointmentsCount) appointmentsCount.textContent = todayCount;
        if (todayAppointments) todayAppointments.textContent = todayCount;
        if (appointmentsBadge) appointmentsBadge.textContent = count;
        
        // حساب التغيير (مثال)
        const change = Math.floor(Math.random() * 20) - 5;
        if (appointmentsChange) {
            appointmentsChange.innerHTML = `
                <i class="fas fa-arrow-${change >= 0 ? 'up' : 'down'}"></i>
                ${Math.abs(change)}%
            `;
            appointmentsChange.classList.toggle('positive', change >= 0);
            appointmentsChange.classList.toggle('negative', change < 0);
        }
        
    } catch (error) {
        console.error('خطأ في تحديث إحصائيات المواعيد:', error);
    }
}

/**
 * تحديث إحصائيات الإيرادات
 */
async function updateRevenueStats() {
    try {
        const revenueCount = document.getElementById('revenueCount');
        const revenueChange = document.getElementById('revenueChange');
        
        // استدعاء البيانات من قاعدة البيانات
        const revenue = await getMonthlyRevenue();
        const total = revenue.reduce((sum, r) => sum + r.amount, 0);
        
        if (revenueCount) revenueCount.textContent = `${total.toLocaleString()} ريال`;
        
        // حساب التغيير (مثال)
        const change = Math.floor(Math.random() * 25) - 5;
        if (revenueChange) {
            revenueChange.innerHTML = `
                <i class="fas fa-arrow-${change >= 0 ? 'up' : 'down'}"></i>
                ${Math.abs(change)}%
            `;
            revenueChange.classList.toggle('positive', change >= 0);
            revenueChange.classList.toggle('negative', change < 0);
        }
        
    } catch (error) {
        console.error('خطأ في تحديث إحصائيات الإيرادات:', error);
    }
}

/**
 * تحميل الإشعارات
 */
async function loadNotifications() {
    try {
        const notificationsList = document.getElementById('notificationsList');
        const notificationCount = document.getElementById('notificationCount');
        
        if (!notificationsList) return;
        
        // استدعاء الإشعارات من قاعدة البيانات
        const notifications = await getNotifications();
        
        // تحديث العداد
        const unreadCount = notifications.filter(n => !n.read).length;
        if (notificationCount) {
            notificationCount.textContent = unreadCount;
        }
        
        // عرض الإشعارات
        notificationsList.innerHTML = '';
        
        if (notifications.length === 0) {
            notificationsList.innerHTML = `
                <div class="notification-empty">
                    <i class="fas fa-bell-slash"></i>
                    <p>لا توجد إشعارات</p>
                </div>
            `;
            return;
        }
        
        notifications.forEach(notification => {
            const item = document.createElement('div');
            item.className = `notification-item ${notification.read ? '' : 'unread'}`;
            item.innerHTML = `
                <div class="notification-icon">
                    <i class="fas fa-${getNotificationIcon(notification.type)}"></i>
                </div>
                <div class="notification-content">
                    <div class="notification-title">${notification.title}</div>
                    <div class="notification-message">${notification.message}</div>
                    <div class="notification-time">${formatTime(notification.timestamp)}</div>
                </div>
            `;
            
            item.addEventListener('click', () => handleNotificationClick(notification));
            notificationsList.appendChild(item);
        });
        
    } catch (error) {
        console.error('خطأ في تحميل الإشعارات:', error);
    }
}

/**
 * الحصول على أيقونة الإشعار
 */
function getNotificationIcon(type) {
    const icons = {
        'appointment': 'calendar-check',
        'patient': 'user-injured',
        'prescription': 'prescription',
        'billing': 'file-invoice-dollar',
        'system': 'cog',
        'warning': 'exclamation-triangle',
        'info': 'info-circle'
    };
    
    return icons[type] || 'bell';
}

/**
 * تنسيق الوقت
 */
function formatTime(timestamp) {
    const now = new Date();
    const date = new Date(timestamp);
    const diff = now - date;
    
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    
    if (minutes < 1) return 'الآن';
    if (minutes < 60) return `قبل ${minutes} دقيقة`;
    if (hours < 24) return `قبل ${hours} ساعة`;
    if (days < 7) return `قبل ${days} يوم`;
    
    return date.toLocaleDateString('ar-SA');
}

/**
 * التعامل مع النقر على الإشعار
 */
function handleNotificationClick(notification) {
    // تحديث حالة الإشعار كمقروء
    markNotificationAsRead(notification.id);
    
    // التنقل للقسم المناسب
    if (notification.action) {
        loadSection(notification.action.section);
        
        // إذا كان هناك إجراء إضافي
        if (notification.action.callback && typeof window[notification.action.callback] === 'function') {
            window[notification.action.callback](notification.action.params);
        }
    }
    
    // إغلاق قائمة الإشعارات
    const notificationsMenu = document.getElementById('notificationsMenu');
    if (notificationsMenu) {
        notificationsMenu.classList.remove('show');
    }
}

/**
 * تحميل المستخدم الحالي
 */
async function loadCurrentUser() {
    try {
        const currentUser = document.getElementById('currentUser');
        const userData = localStorage.getItem('user_data');
        
        if (userData && currentUser) {
            const user = JSON.parse(userData);
            currentUser.textContent = user.name || 'المسؤول';
        }
    } catch (error) {
        console.error('خطأ في تحميل بيانات المستخدم:', error);
    }
}

/**
 * دعم لوحة المفاتيح
 */
document.addEventListener('keydown', function(event) {
    // Ctrl/Cmd + S لحفظ
    if ((event.ctrlKey || event.metaKey) && event.key === 's') {
        event.preventDefault();
        showNotification('جاري حفظ البيانات...', 'info');
    }
    
    // Ctrl/Cmd + F للبحث
    if ((event.ctrlKey || event.metaKey) && event.key === 'f') {
        event.preventDefault();
        const searchInput = document.getElementById('globalSearch');
        if (searchInput) {
            searchInput.focus();
        }
    }
    
    // زر Escape لإغلاق النماذج
    if (event.key === 'Escape') {
        const openModals = document.querySelectorAll('.modal.show');
        openModals.forEach(modal => {
            const closeBtn = modal.querySelector('.btn-close');
            if (closeBtn) closeBtn.click();
        });
    }
});

/**
 * تهيئة الرسم البياني
 */
function initializeChart(canvasId, config) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return null;
    
    const ctx = canvas.getContext('2d');
    return new Chart(ctx, config);
}

/**
 * تحديث الرسم البياني
 */
function updateChart(chart, newData) {
    if (chart) {
        chart.data = newData;
        chart.update();
    }
}

/**
 * تصدير البيانات
 */
function exportData(data, filename, type = 'json') {
    let content, mimeType;
    
    if (type === 'json') {
        content = JSON.stringify(data, null, 2);
        mimeType = 'application/json';
    } else if (type === 'csv') {
        content = convertToCSV(data);
        mimeType = 'text/csv';
    } else {
        console.error('نوع التصدير غير مدعوم');
        return;
    }
    
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${filename}.${type}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

/**
 * تحويل البيانات لـ CSV
 */
function convertToCSV(data) {
    if (!Array.isArray(data) || data.length === 0) return '';
    
    const headers = Object.keys(data[0]);
    const rows = data.map(obj => 
        headers.map(header => JSON.stringify(obj[header])).join(',')
    );
    
    return [headers.join(','), ...rows].join('\n');
}

/**
 * استيراد البيانات
 */
function importData(file, type = 'json') {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        
        reader.onload = function(event) {
            try {
                let data;
                if (type === 'json') {
                    data = JSON.parse(event.target.result);
                } else if (type === 'csv') {
                    data = parseCSV(event.target.result);
                }
                resolve(data);
            } catch (error) {
                reject(error);
            }
        };
        
        reader.onerror = reject;
        reader.readAsText(file);
    });
}

/**
 * تحليل ملف CSV
 */
function parseCSV(csv) {
    const lines = csv.split('\n');
    const headers = lines[0].split(',').map(h => h.trim());
    
    return lines.slice(1).map(line => {
        const values = line.split(',').map(v => v.trim());
        const obj = {};
        headers.forEach((header, index) => {
            obj[header] = values[index];
        });
        return obj;
    }).filter(obj => Object.values(obj).some(v => v));
}

/**
 * تصدير الصفحة كـ PDF
 */
function exportToPDF(elementId, filename = 'document') {
    const element = document.getElementById(elementId);
    if (!element) {
        showNotification('العنصر غير موجود', 'error');
        return;
    }
    
    showNotification('جاري تحويل الصفحة إلى PDF...', 'info');
    
    // يمكن استخدام مكتبة مثل jsPDF هنا
    // html2canvas(element).then(canvas => {
    //     const imgData = canvas.toDataURL('image/png');
    //     const pdf = new jsPDF();
    //     pdf.addImage(imgData, 'PNG', 0, 0);
    //     pdf.save(`${filename}.pdf`);
    //     showNotification('تم تصدير PDF بنجاح', 'success');
    // });
}

/**
 * طباعة الصفحة
 */
function printPage(elementId = null) {
    if (elementId) {
        const element = document.getElementById(elementId);
        if (element) {
            const printWindow = window.open('', '_blank');
            printWindow.document.write(`
                <html dir="rtl">
                <head>
                    <title>طباعة</title>
                    <style>
                        body { font-family: 'Noto Sans Arabic', sans-serif; direction: rtl; }
                        @media print { .no-print { display: none; } }
                    </style>
                </head>
                <body>
                    ${element.innerHTML}
                </body>
                </html>
            `);
            printWindow.document.close();
            printWindow.print();
            return;
        }
    }
    
    window.print();
}

/**
 * نسخ النص للحافظة
 */
function copyToClipboard(text) {
    navigator.clipboard.writeText(text).then(() => {
        showNotification('تم نسخ النص', 'success');
    }).catch(err => {
        console.error('خطأ في النسخ:', err);
        showNotification('فشل في نسخ النص', 'error');
    });
}

/**
 * فتح ملف
 */
function openFileDialog(accept, callback) {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = accept;
    
    input.onchange = function(event) {
        const file = event.target.files[0];
        if (file && callback) {
            callback(file);
        }
    };
    
    input.click();
}

/**
 * التقاط صورة
 */
function capturePhoto(callback) {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        showNotification('التقاط الصور غير مدعوم في هذا المتصفح', 'error');
        return;
    }
    
    const video = document.createElement('video');
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    
    navigator.mediaDevices.getUserMedia({ video: true })
        .then(stream => {
            video.srcObject = stream;
            video.play();
            
            // يمكن إضافة واجهة للمستخدم لالتقاط الصورة
            setTimeout(() => {
                canvas.width = video.videoWidth;
                canvas.height = video.videoHeight;
                context.drawImage(video, 0, 0);
                
                stream.getTracks().forEach(track => track.stop());
                
                canvas.toBlob(blob => {
                    if (callback) callback(blob);
                }, 'image/jpeg');
            }, 1000);
        })
        .catch(error => {
            console.error('خطأ في الوصول للكاميرا:', error);
            showNotification('تعذر الوصول للكاميرا', 'error');
        });
}

// تصدير الدوال للاستخدام في الملفات الأخرى
window.app = {
    initApp,
    showNotification,
    showLoading,
    hideLoading,
    loadSection,
    logout,
    exportData,
    importData,
    printPage,
    copyToClipboard,
    openFileDialog,
    capturePhoto,
    updateDashboardStats
};

// دالات افتراضية - سيتم استبدالها بالمكاتب الفعلية
async function getDoctors() { return []; }
async function getPatients() { return []; }
async function getAppointments() { return []; }
async function getMonthlyRevenue() { return []; }
async function getNotifications() { return []; }
async function markNotificationAsRead(id) {}
async function loadDashboardContent(element) {}
async function loadDoctorsContent(element) {}
async function loadPatientsContent(element) {}
async function loadAppointmentsContent(element) {}
async function loadPrescriptionsContent(element) {}
async function loadInventoryContent(element) {}
async function loadBillingContent(element) {}
async function loadReportsContent(element) {}
async function loadSettingsContent(element) {}
async function loadHelpContent(element) {}
