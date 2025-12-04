/**
 * وحدة لوحة التحكم
 */

// المتغيرات العامة
let appointmentsChart = null;
let revenueChart = null;

/**
 * تحميل محتوى لوحة التحكم
 */
async function loadDashboardContent(element) {
    try {
        showLoading();
        
        const html = await getDashboardHTML();
        element.innerHTML = html;
        
        // تهيئة المكونات
        await initDashboardComponents();
        
        // تحميل البيانات
        await loadDashboardData();
        
        // إعداد الأحداث
        setupDashboardEvents();
        
    } catch (error) {
        console.error('خطأ في تحميل لوحة التحكم:', error);
        element.innerHTML = `
            <div class="alert alert-danger">
                <i class="fas fa-exclamation-circle"></i>
                حدث خطأ في تحميل لوحة التحكم: ${error.message}
            </div>
        `;
    } finally {
        hideLoading();
    }
}

/**
 * الحصول على HTML للوحة التحكم
 */
async function getDashboardHTML() {
    return `
        <div class="section-header">
            <div class="header-content">
                <h2 class="section-title">
                    <i class="fas fa-home"></i>
                    لوحة التحكم
                </h2>
                <p class="section-subtitle">نظرة عامة على إحصائيات وأداء العيادة</p>
            </div>
            <div class="header-actions">
                <div class="date-range-selector">
                    <select id="dashboardRange" class="range-select">
                        <option value="today">اليوم</option>
                        <option value="week">هذا الأسبوع</option>
                        <option value="month" selected>هذا الشهر</option>
                        <option value="year">هذه السنة</option>
                    </select>
                </div>
                <button class="btn-refresh" id="refreshDashboard" aria-label="تحديث البيانات">
                    <i class="fas fa-sync-alt"></i>
                </button>
            </div>
        </div>

        <!-- Statistics Grid -->
        <div class="stats-grid">
            <!-- Doctor Stats -->
            <div class="stat-card stat-primary">
                <div class="stat-icon">
                    <i class="fas fa-user-md"></i>
                </div>
                <div class="stat-content">
                    <h3 class="stat-title">الأطباء</h3>
                    <div class="stat-numbers">
                        <span class="stat-main" id="doctorsCount">0</span>
                        <span class="stat-change" id="doctorsChange">
                            <i class="fas fa-arrow-up"></i> 0%
                        </span>
                    </div>
                    <p class="stat-subtitle">إجمالي الأطباء المسجلين</p>
                </div>
            </div>

            <!-- Patient Stats -->
            <div class="stat-card stat-success">
                <div class="stat-icon">
                    <i class="fas fa-user-injured"></i>
                </div>
                <div class="stat-content">
                    <h3 class="stat-title">المرضى</h3>
                    <div class="stat-numbers">
                        <span class="stat-main" id="patientsCount">0</span>
                        <span class="stat-change" id="patientsChange">
                            <i class="fas fa-arrow-up"></i> 0%
                        </span>
                    </div>
                    <p class="stat-subtitle">إجمالي المرضى المسجلين</p>
                </div>
            </div>

            <!-- Appointment Stats -->
            <div class="stat-card stat-warning">
                <div class="stat-icon">
                    <i class="fas fa-calendar-check"></i>
                </div>
                <div class="stat-content">
                    <h3 class="stat-title">المواعيد</h3>
                    <div class="stat-numbers">
                        <span class="stat-main" id="appointmentsCount">0</span>
                        <span class="stat-change" id="appointmentsChange">
                            <i class="fas fa-arrow-up"></i> 0%
                        </span>
                    </div>
                    <p class="stat-subtitle">مواعيد اليوم</p>
                </div>
            </div>

            <!-- Revenue Stats -->
            <div class="stat-card stat-info">
                <div class="stat-icon">
                    <i class="fas fa-money-bill-wave"></i>
                </div>
                <div class="stat-content">
                    <h3 class="stat-title">الإيرادات</h3>
                    <div class="stat-numbers">
                        <span class="stat-main" id="revenueCount">0 ريال</span>
                        <span class="stat-change" id="revenueChange">
                            <i class="fas fa-arrow-up"></i> 0%
                        </span>
                    </div>
                    <p class="stat-subtitle">إيرادات الشهر الحالي</p>
                </div>
            </div>
        </div>

        <!-- Charts and Graphs -->
        <div class="charts-grid">
            <!-- Appointments Chart -->
            <div class="chart-container">
                <div class="chart-header">
                    <h4 class="chart-title">
                        <i class="fas fa-chart-line"></i>
                        إحصائيات المواعيد
                    </h4>
                    <div class="chart-actions">
                        <button class="chart-action-btn active" data-period="monthly">شهري</button>
                        <button class="chart-action-btn" data-period="weekly">أسبوعي</button>
                        <button class="chart-action-btn" data-period="daily">يومي</button>
                    </div>
                </div>
                <div class="chart-body">
                    <canvas id="appointmentsChart"></canvas>
                </div>
            </div>

            <!-- Revenue Chart -->
            <div class="chart-container">
                <div class="chart-header">
                    <h4 class="chart-title">
                        <i class="fas fa-chart-bar"></i>
                        الإيرادات المالية
                    </h4>
                    <div class="chart-actions">
                        <button class="chart-action-btn active" data-period="monthly">شهري</button>
                        <button class="chart-action-btn" data-period="weekly">أسبوعي</button>
                        <button class="chart-action-btn" data-period="daily">يومي</button>
                    </div>
                </div>
                <div class="chart-body">
                    <canvas id="revenueChart"></canvas>
                </div>
            </div>
        </div>

        <!-- Recent Activity & Upcoming Appointments -->
        <div class="activity-grid">
            <!-- Recent Activity -->
            <div class="activity-container">
                <div class="activity-header">
                    <h4 class="activity-title">
                        <i class="fas fa-history"></i>
                        النشاطات الأخيرة
                    </h4>
                    <button class="btn-view-all" id="viewAllActivities">عرض الكل</button>
                </div>
                <div class="activity-list" id="recentActivities">
                    <!-- Activities will be loaded here dynamically -->
                </div>
            </div>

            <!-- Upcoming Appointments -->
            <div class="appointments-container">
                <div class="appointments-header">
                    <h4 class="appointments-title">
                        <i class="fas fa-calendar-alt"></i>
                        المواعيد القادمة
                    </h4>
                    <button class="btn-view-all" id="viewAllAppointments">عرض الكل</button>
                </div>
                <div class="appointments-list" id="upcomingAppointments">
                    <!-- Appointments will be loaded here dynamically -->
                </div>
            </div>
        </div>

        <!-- Quick Stats -->
        <div class="quick-stats">
            <div class="quick-stat">
                <div class="quick-stat-icon">
                    <i class="fas fa-clock"></i>
                </div>
                <div class="quick-stat-content">
                    <span class="quick-stat-number" id="todayAppointments">0</span>
                    <span class="quick-stat-label">موعد اليوم</span>
                </div>
            </div>
            <div class="quick-stat">
                <div class="quick-stat-icon">
                    <i class="fas fa-exclamation-circle"></i>
                </div>
                <div class="quick-stat-content">
                    <span class="quick-stat-number" id="pendingBills">0</span>
                    <span class="quick-stat-label">فواتير معلقة</span>
                </div>
            </div>
            <div class="quick-stat">
                <div class="quick-stat-icon">
                    <i class="fas fa-capsules"></i>
                </div>
                <div class="quick-stat-content">
                    <span class="quick-stat-number" id="lowStockItems">0</span>
                    <span class="quick-stat-label">أدوية منخفضة</span>
                </div>
            </div>
            <div class="quick-stat">
                <div class="quick-stat-icon">
                    <i class="fas fa-user-clock"></i>
                </div>
                <div class="quick-stat-content">
                    <span class="quick-stat-number" id="waitingPatients">0</span>
                    <span class="quick-stat-label">مرضى منتظرين</span>
                </div>
            </div>
        </div>
    `;
}

/**
 * تهيئة مكونات لوحة التحكم
 */
async function initDashboardComponents() {
    try {
        // إعداد مخطط المواعيد
        initAppointmentsChart();
        
        // إعداد مخطط الإيرادات
        initRevenueChart();
        
    } catch (error) {
        console.error('خطأ في تهيئة المكونات:', error);
    }
}

/**
 * تحميل بيانات لوحة التحكم
 */
async function loadDashboardData() {
    try {
        // تحديث الإحصائيات
        await updateDashboardStats();
        
        // تحميل النشاطات الأخيرة
        await loadRecentActivities();
        
        // تحميل المواعيد القادمة
        await loadUpcomingAppointments();
        
        // تحميل الإحصائيات السريعة
        await loadQuickStats();
        
        // تحميل بيانات المخططات
        await loadChartData();
        
    } catch (error) {
        console.error('خطأ في تحميل البيانات:', error);
        throw error;
    }
}

/**
 * تحديث إحصائيات لوحة التحكم
 */
async function updateDashboardStats() {
    try {
        // تحميل بيانات الأطباء
        const doctors = await database.getRecords('doctors');
        const doctorsCount = doctors.length;
        updateElementContent('doctorsCount', doctorsCount);
        updateBadgeCount('doctorsBadge', doctorsCount);
        
        // تحميل بيانات المرضى
        const patients = await database.getRecords('patients');
        const patientsCount = patients.length;
        updateElementContent('patientsCount', patientsCount);
        updateBadgeCount('patientsBadge', patientsCount);
        
        // تحميل بيانات المواعيد
        const appointments = await database.getRecords('appointments');
        const today = new Date().toISOString().split('T')[0];
        const todayAppointments = appointments.filter(a => a.date === today).length;
        const appointmentsCount = appointments.length;
        updateElementContent('appointmentsCount', todayAppointments);
        updateElementContent('todayAppointments', todayAppointments);
        updateBadgeCount('appointmentsBadge', appointmentsCount);
        
        // تحميل بيانات الإيرادات
        const bills = await database.getRecords('bills');
        const currentMonth = new Date().getMonth() + 1;
        const monthlyRevenue = bills
            .filter(b => new Date(b.date).getMonth() + 1 === currentMonth)
            .reduce((sum, bill) => sum + (bill.total || 0), 0);
        
        updateElementContent('revenueCount', `${monthlyRevenue.toLocaleString()} ريال`);
        
        // حساب التغييرات
        await calculateChanges();
        
    } catch (error) {
        console.error('خطأ في تحديث الإحصائيات:', error);
    }
}

/**
 * حساب التغييرات
 */
async function calculateChanges() {
    try {
        // هذه بيانات وهمية للتطوير
        const changes = {
            doctors: { value: 5, positive: true },
            patients: { value: 12, positive: true },
            appointments: { value: 3, positive: false },
            revenue: { value: 8, positive: true }
        };
        
        // تحديث عناصر التغيير
        Object.keys(changes).forEach(key => {
            const element = document.getElementById(`${key}Change`);
            if (element) {
                const change = changes[key];
                element.innerHTML = `
                    <i class="fas fa-arrow-${change.positive ? 'up' : 'down'}"></i>
                    ${change.value}%
                `;
                element.className = `stat-change ${change.positive ? 'positive' : 'negative'}`;
            }
        });
        
    } catch (error) {
        console.error('خطأ في حساب التغييرات:', error);
    }
}

/**
 * تحميل النشاطات الأخيرة
 */
async function loadRecentActivities() {
    try {
        const activitiesList = document.getElementById('recentActivities');
        if (!activitiesList) return;
        
        // الحصول على النشاطات
        const activities = await database.getRecords('activities');
        const recentActivities = activities.slice(0, 5); // آخر 5 نشاطات
        
        if (recentActivities.length === 0) {
            activitiesList.innerHTML = `
                <div class="activity-empty">
                    <i class="fas fa-info-circle"></i>
                    <p>لا توجد نشاطات مؤخراً</p>
                </div>
            `;
            return;
        }
        
        // عرض النشاطات
        activitiesList.innerHTML = recentActivities.map(activity => `
            <div class="activity-item">
                <div class="activity-icon">
                    <i class="fas fa-${getActivityIcon(activity.action)}"></i>
                </div>
                <div class="activity-content">
                    <div class="activity-title-small">${activity.description}</div>
                    <div class="activity-time">${formatActivityTime(activity.timestamp)}</div>
                </div>
            </div>
        `).join('');
        
    } catch (error) {
        console.error('خطأ في تحميل النشاطات:', error);
    }
}

/**
 * الحصول على أيقونة النشاط
 */
function getActivityIcon(action) {
    const icons = {
        'login': 'sign-in-alt',
        'logout': 'sign-out-alt',
        'patient_add': 'user-plus',
        'patient_update': 'user-edit',
        'appointment_add': 'calendar-plus',
        'appointment_update': 'calendar-check',
        'prescription_add': 'prescription',
        'bill_add': 'file-invoice-dollar',
        'password_change': 'key',
        'user_add': 'user-plus',
        'default': 'history'
    };
    
    return icons[action] || icons.default;
}

/**
 * تنسيق وقت النشاط
 */
function formatActivityTime(timestamp) {
    const now = new Date();
    const activityTime = new Date(timestamp);
    const diffMs = now - activityTime;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    
    if (diffMins < 1) return 'الآن';
    if (diffMins < 60) return `قبل ${diffMins} دقيقة`;
    if (diffHours < 24) return `قبل ${diffHours} ساعة`;
    if (diffDays < 7) return `قبل ${diffDays} يوم`;
    
    return activityTime.toLocaleDateString('ar-SA', {
        day: 'numeric',
        month: 'short'
    });
}

/**
 * تحميل المواعيد القادمة
 */
async function loadUpcomingAppointments() {
    try {
        const appointmentsList = document.getElementById('upcomingAppointments');
        if (!appointmentsList) return;
        
        // الحصول على المواعيد
        const appointments = await database.getRecords('appointments');
        const now = new Date();
        const upcomingAppointments = appointments
            .filter(a => new Date(a.date + ' ' + a.time) > now)
            .slice(0, 5); // أول 5 مواعيد قادمة
        
        if (upcomingAppointments.length === 0) {
            appointmentsList.innerHTML = `
                <div class="appointments-empty">
                    <i class="fas fa-calendar-times"></i>
                    <p>لا توجد مواعيد قادمة</p>
                </div>
            `;
            return;
        }
        
        // عرض المواعيد
        appointmentsList.innerHTML = upcomingAppointments.map(appointment => `
            <div class="appointment-item">
                <div class="appointment-icon">
                    <i class="fas fa-calendar-check"></i>
                </div>
                <div class="appointment-content">
                    <div class="appointment-title">${appointment.patient_name || 'مريض'}</div>
                    <div class="appointment-details">
                        <span class="appointment-time">${formatAppointmentTime(appointment.date, appointment.time)}</span>
                        <span class="appointment-status ${appointment.status}">${getStatusText(appointment.status)}</span>
                    </div>
                </div>
            </div>
        `).join('');
        
    } catch (error) {
        console.error('خطأ في تحميل المواعيد:', error);
    }
}

/**
 * تنسيق وقت الموعد
 */
function formatAppointmentTime(date, time) {
    const appointmentDate = new Date(date + ' ' + time);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    if (appointmentDate.toDateString() === today.toDateString()) {
        return `اليوم ${time}`;
    } else if (appointmentDate.toDateString() === tomorrow.toDateString()) {
        return `غداً ${time}`;
    } else {
        return `${date} ${time}`;
    }
}

/**
 * الحصول على نص الحالة
 */
function getStatusText(status) {
    const statuses = {
        'scheduled': 'مجدول',
        'confirmed': 'مؤكد',
        'completed': 'مكتمل',
        'cancelled': 'ملغى',
        'no_show': 'لم يحضر'
    };
    
    return statuses[status] || status;
}

/**
 * تحميل الإحصائيات السريعة
 */
async function loadQuickStats() {
    try {
        // فواتير معلقة
        const bills = await database.getRecords('bills');
        const pendingBills = bills.filter(b => b.status === 'pending').length;
        updateElementContent('pendingBills', pendingBills);
        
        // أدوية منخفضة المخزون
        const inventory = await database.getRecords('inventory');
        const lowStockItems = inventory.filter(item => item.quantity <= item.min_quantity).length;
        updateElementContent('lowStockItems', lowStockItems);
        
        // مرضى منتظرين
        const appointments = await database.getRecords('appointments');
        const waitingPatients = appointments.filter(a => a.status === 'scheduled' && a.date === new Date().toISOString().split('T')[0]).length;
        updateElementContent('waitingPatients', waitingPatients);
        
    } catch (error) {
        console.error('خطأ في تحميل الإحصائيات السريعة:', error);
    }
}

/**
 * تحميل بيانات المخططات
 */
async function loadChartData() {
    try {
        // بيانات المخططات الوهمية للتطوير
        const appointmentsData = {
            labels: ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو'],
            datasets: [{
                label: 'عدد المواعيد',
                data: [65, 59, 80, 81, 56, 55],
                backgroundColor: 'rgba(52, 152, 219, 0.2)',
                borderColor: 'rgba(52, 152, 219, 1)',
                borderWidth: 2,
                tension: 0.4
            }]
        };
        
        const revenueData = {
            labels: ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو'],
            datasets: [{
                label: 'الإيرادات (ريال)',
                data: [12000, 19000, 15000, 25000, 22000, 30000],
                backgroundColor: 'rgba(46, 204, 113, 0.2)',
                borderColor: 'rgba(46, 204, 113, 1)',
                borderWidth: 2,
                fill: true
            }]
        };
        
        // تحديث المخططات
        updateChart(appointmentsChart, appointmentsData);
        updateChart(revenueChart, revenueData);
        
    } catch (error) {
        console.error('خطأ في تحميل بيانات المخططات:', error);
    }
}

/**
 * إعداد مخطط المواعيد
 */
function initAppointmentsChart() {
    const ctx = document.getElementById('appointmentsChart')?.getContext('2d');
    if (!ctx) return;
    
    appointmentsChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: [],
            datasets: [{
                label: 'عدد المواعيد',
                data: [],
                backgroundColor: 'rgba(52, 152, 219, 0.2)',
                borderColor: 'rgba(52, 152, 219, 1)',
                borderWidth: 2,
                tension: 0.4,
                fill: true
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: true,
                    position: 'top',
                    labels: {
                        font: {
                            family: 'Noto Sans Arabic',
                            size: 12
                        }
                    }
                },
                tooltip: {
                    rtl: true,
                    titleFont: {
                        family: 'Noto Sans Arabic'
                    },
                    bodyFont: {
                        family: 'Noto Sans Arabic'
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        font: {
                            family: 'Noto Sans Arabic'
                        }
                    },
                    grid: {
                        color: 'rgba(0, 0, 0, 0.1)'
                    }
                },
                x: {
                    ticks: {
                        font: {
                            family: 'Noto Sans Arabic'
                        }
                    },
                    grid: {
                        color: 'rgba(0, 0, 0, 0.1)'
                    }
                }
            }
        }
    });
}

/**
 * إعداد مخطط الإيرادات
 */
function initRevenueChart() {
    const ctx = document.getElementById('revenueChart')?.getContext('2d');
    if (!ctx) return;
    
    revenueChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: [],
            datasets: [{
                label: 'الإيرادات (ريال)',
                data: [],
                backgroundColor: 'rgba(46, 204, 113, 0.5)',
                borderColor: 'rgba(46, 204, 113, 1)',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: true,
                    position: 'top',
                    labels: {
                        font: {
                            family: 'Noto Sans Arabic',
                            size: 12
                        }
                    }
                },
                tooltip: {
                    rtl: true,
                    callbacks: {
                        label: function(context) {
                            return `${context.dataset.label}: ${context.raw.toLocaleString()} ريال`;
                        }
                    },
                    titleFont: {
                        family: 'Noto Sans Arabic'
                    },
                    bodyFont: {
                        family: 'Noto Sans Arabic'
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        callback: function(value) {
                            return value.toLocaleString() + ' ريال';
                        },
                        font: {
                            family: 'Noto Sans Arabic'
                        }
                    },
                    grid: {
                        color: 'rgba(0, 0, 0, 0.1)'
                    }
                },
                x: {
                    ticks: {
                        font: {
                            family: 'Noto Sans Arabic'
                        }
                    },
                    grid: {
                        color: 'rgba(0, 0, 0, 0.1)'
                    }
                }
            }
        }
    });
}

/**
 * تحديث المخطط
 */
function updateChart(chart, newData) {
    if (chart && newData) {
        chart.data = newData;
        chart.update();
    }
}

/**
 * إعداد أحداث لوحة التحكم
 */
function setupDashboardEvents() {
    // تحديث البيانات
    const refreshBtn = document.getElementById('refreshDashboard');
    if (refreshBtn) {
        refreshBtn.addEventListener('click', async () => {
            await loadDashboardData();
            showToast('تم تحديث البيانات', 'success');
        });
    }
    
    // تغيير نطاق التاريخ
    const rangeSelect = document.getElementById('dashboardRange');
    if (rangeSelect) {
        rangeSelect.addEventListener('change', async () => {
            await loadDashboardData();
        });
    }
    
    // عرض جميع النشاطات
    const viewActivitiesBtn = document.getElementById('viewAllActivities');
    if (viewActivitiesBtn) {
        viewActivitiesBtn.addEventListener('click', () => {
            window.loadSection('reports');
        });
    }
    
    // عرض جميع المواعيد
    const viewAppointmentsBtn = document.getElementById('viewAllAppointments');
    if (viewAppointmentsBtn) {
        viewAppointmentsBtn.addEventListener('click', () => {
            window.loadSection('appointments');
        });
    }
    
    // تبديل فترات المخططات
    const chartButtons = document.querySelectorAll('.chart-action-btn');
    chartButtons.forEach(button => {
        button.addEventListener('click', async function() {
            // إزالة النشط من جميع الأزرار
            chartButtons.forEach(btn => btn.classList.remove('active'));
            // إضافة النشط للزر المضغوط
            this.classList.add('active');
            
            // تحديث بيانات المخططات بناءً على الفترة
            const period = this.getAttribute('data-period');
            await updateChartsByPeriod(period);
        });
    });
}

/**
 * تحديث المخططات حسب الفترة
 */
async function updateChartsByPeriod(period) {
    try {
        // هذه بيانات وهمية للتطوير
        let appointmentsData, revenueData;
        
        switch (period) {
            case 'daily':
                appointmentsData = {
                    labels: ['8:00', '10:00', '12:00', '14:00', '16:00'],
                    datasets: [{
                        label: 'المواعيد اليومية',
                        data: [5, 8, 12, 7, 4],
                        backgroundColor: 'rgba(52, 152, 219, 0.2)',
                        borderColor: 'rgba(52, 152, 219, 1)'
                    }]
                };
                
                revenueData = {
                    labels: ['8:00', '10:00', '12:00', '14:00', '16:00'],
                    datasets: [{
                        label: 'الإيرادات اليومية',
                        data: [1500, 2200, 3100, 1800, 1200],
                        backgroundColor: 'rgba(46, 204, 113, 0.5)',
                        borderColor: 'rgba(46, 204, 113, 1)'
                    }]
                };
                break;
                
            case 'weekly':
                appointmentsData = {
                    labels: ['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'],
                    datasets: [{
                        label: 'المواعيد الأسبوعية',
                        data: [15, 20, 18, 22, 25, 12, 8],
                        backgroundColor: 'rgba(52, 152, 219, 0.2)',
                        borderColor: 'rgba(52, 152, 219, 1)'
                    }]
                };
                
                revenueData = {
                    labels: ['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'],
                    datasets: [{
                        label: 'الإيرادات الأسبوعية',
                        data: [4500, 6200, 5800, 7100, 8200, 3500, 2800],
                        backgroundColor: 'rgba(46, 204, 113, 0.5)',
                        borderColor: 'rgba(46, 204, 113, 1)'
                    }]
                };
                break;
                
            case 'monthly':
            default:
                appointmentsData = {
                    labels: ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو'],
                    datasets: [{
                        label: 'المواعيد الشهرية',
                        data: [65, 59, 80, 81, 56, 55],
                        backgroundColor: 'rgba(52, 152, 219, 0.2)',
                        borderColor: 'rgba(52, 152, 219, 1)'
                    }]
                };
                
                revenueData = {
                    labels: ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو'],
                    datasets: [{
                        label: 'الإيرادات الشهرية',
                        data: [12000, 19000, 15000, 25000, 22000, 30000],
                        backgroundColor: 'rgba(46, 204, 113, 0.5)',
                        borderColor: 'rgba(46, 204, 113, 1)'
                    }]
                };
        }
        
        // تحديث المخططات
        updateChart(appointmentsChart, appointmentsData);
        updateChart(revenueChart, revenueData);
        
    } catch (error) {
        console.error('خطأ في تحديث المخططات:', error);
    }
}

/**
 * تحديث لوحة التحكم
 */
async function refreshDashboard() {
    try {
        await loadDashboardData();
        return true;
    } catch (error) {
        console.error('خطأ في تحديث لوحة التحكم:', error);
        return false;
    }
}

// تصدير الدوال للاستخدام العام
window.dashboard = {
    loadDashboardContent,
    refreshDashboard,
    updateDashboardStats,
    loadRecentActivities,
    loadUpcomingAppointments,
    loadQuickStats,
    loadChartData
};
