/**
 * وحدة إدارة الأطباء
 */

// المتغيرات العامة
let doctorsTable = null;
let currentPage = 1;
let itemsPerPage = 10;
let currentFilters = {};

/**
 * تحميل محتوى إدارة الأطباء
 */
async function loadDoctorsContent(element) {
    try {
        showLoading();
        
        const html = await getDoctorsHTML();
        element.innerHTML = html;
        
        // تهيئة المكونات
        await initDoctorsComponents();
        
        // تحميل البيانات
        await loadDoctorsData();
        
        // إعداد الأحداث
        setupDoctorsEvents();
        
    } catch (error) {
        console.error('خطأ في تحميل إدارة الأطباء:', error);
        element.innerHTML = `
            <div class="alert alert-danger">
                <i class="fas fa-exclamation-circle"></i>
                حدث خطأ في تحميل إدارة الأطباء: ${error.message}
            </div>
        `;
    } finally {
        hideLoading();
    }
}

/**
 * الحصول على HTML لإدارة الأطباء
 */
async function getDoctorsHTML() {
    return `
        <div class="section-header">
            <div class="header-content">
                <h2 class="section-title">
                    <i class="fas fa-user-md"></i>
                    إدارة الأطباء
                </h2>
                <p class="section-subtitle">إدارة بيانات الأطباء والتخصصات</p>
            </div>
            <div class="header-actions">
                <button class="btn btn-primary" id="addDoctorBtn">
                    <i class="fas fa-plus"></i>
                    إضافة طبيب جديد
                </button>
            </div>
        </div>

        <!-- Filters Card -->
        <div class="card filters-card">
            <div class="card-header">
                <h4 class="card-title">
                    <i class="fas fa-filter"></i>
                    تصفية النتائج
                </h4>
            </div>
            <div class="card-body">
                <div class="filters-grid">
                    <div class="form-group">
                        <label for="searchDoctors" class="form-label">بحث</label>
                        <input type="text" id="searchDoctors" class="form-control" placeholder="بحث بالاسم أو التخصص...">
                    </div>
                    
                    <div class="form-group">
                        <label for="filterSpecialty" class="form-label">التخصص</label>
                        <select id="filterSpecialty" class="form-control">
                            <option value="">جميع التخصصات</option>
                            <option value="general">طب عام</option>
                            <option value="pediatrics">طب أطفال</option>
                            <option value="surgery">جراحة</option>
                            <option value="cardiology">قلب</option>
                            <option value="orthopedics">عظام</option>
                            <option value="dentistry">أسنان</option>
                        </select>
                    </div>
                    
                    <div class="form-group">
                        <label for="filterStatus" class="form-label">الحالة</label>
                        <select id="filterStatus" class="form-control">
                            <option value="">جميع الحالات</option>
                            <option value="active">نشط</option>
                            <option value="inactive">غير نشط</option>
                            <option value="vacation">في إجازة</option>
                        </select>
                    </div>
                    
                    <div class="form-group">
                        <label class="form-label">&nbsp;</label>
                        <button class="btn btn-secondary btn-block" id="resetFiltersBtn">
                            <i class="fas fa-redo"></i>
                            إعادة تعيين
                        </button>
                    </div>
                </div>
            </div>
        </div>

        <!-- Statistics Bar -->
        <div class="stats-bar">
            <div class="stat-item">
                <span class="stat-label">إجمالي الأطباء:</span>
                <span class="stat-value" id="totalDoctors">0</span>
            </div>
            <div class="stat-item">
                <span class="stat-label">نشطين:</span>
                <span class="stat-value" id="activeDoctors">0</span>
            </div>
            <div class="stat-item">
                <span class="stat-label">متوسط عدد المواعيد:</span>
                <span class="stat-value" id="avgAppointments">0</span>
            </div>
        </div>

        <!-- Doctors Table -->
        <div class="data-table-container">
            <div class="table-header">
                <h3 class="table-title">قائمة الأطباء</h3>
                <div class="table-actions">
                    <div class="table-search">
                        <input type="text" class="form-control" placeholder="بحث في الجدول..." id="tableSearch">
                    </div>
                    <button class="btn btn-secondary" id="exportDoctorsBtn">
                        <i class="fas fa-download"></i>
                        تصدير
                    </button>
                </div>
            </div>
            
            <div class="table-wrapper">
                <table class="data-table" id="doctorsTable">
                    <thead>
                        <tr>
                            <th width="50">#</th>
                            <th>الاسم</th>
                            <th>التخصص</th>
                            <th>رقم الهاتف</th>
                            <th>البريد الإلكتروني</th>
                            <th>المواعيد اليوم</th>
                            <th>الحالة</th>
                            <th width="120">الإجراءات</th>
                        </tr>
                    </thead>
                    <tbody id="doctorsTableBody">
                        <!-- Doctors will be loaded here -->
                    </tbody>
                </table>
            </div>
            
            <div class="table-pagination">
                <div class="pagination-info" id="paginationInfo">
                    عرض 0 إلى 0 من 0 إدخالات
                </div>
                <div class="pagination-controls">
                    <button class="pagination-btn" id="firstPageBtn" disabled>
                        <i class="fas fa-angle-double-right"></i>
                    </button>
                    <button class="pagination-btn" id="prevPageBtn" disabled>
                        <i class="fas fa-angle-right"></i>
                    </button>
                    
                    <div class="page-numbers" id="pageNumbers">
                        <!-- Page numbers will be generated here -->
                    </div>
                    
                    <button class="pagination-btn" id="nextPageBtn" disabled>
                        <i class="fas fa-angle-left"></i>
                    </button>
                    <button class="pagination-btn" id="lastPageBtn" disabled>
                        <i class="fas fa-angle-double-left"></i>
                    </button>
                </div>
            </div>
        </div>
    `;
}

/**
 * تهيئة مكونات إدارة الأطباء
 */
async function initDoctorsComponents() {
    // لا حاجة لتهيئة إضافية حالياً
}

/**
 * تحميل بيانات الأطباء
 */
async function loadDoctorsData() {
    try {
        // تحديث الإحصائيات
        await updateDoctorsStats();
        
        // تحميل جدول الأطباء
        await loadDoctorsTable();
        
    } catch (error) {
        console.error('خطأ في تحميل بيانات الأطباء:', error);
        throw error;
    }
}

/**
 * تحديث إحصائيات الأطباء
 */
async function updateDoctorsStats() {
    try {
        const doctors = await database.getRecords('doctors');
        
        // إجمالي الأطباء
        const totalDoctors = doctors.length;
        updateElementContent('totalDoctors', totalDoctors);
        
        // الأطباء النشطين
        const activeDoctors = doctors.filter(d => d.status === 'active').length;
        updateElementContent('activeDoctors', activeDoctors);
        
        // متوسط المواعيد (بيانات وهمية)
        updateElementContent('avgAppointments', '12');
        
    } catch (error) {
        console.error('خطأ في تحديث إحصائيات الأطباء:', error);
    }
}

/**
 * تحميل جدول الأطباء
 */
async function loadDoctorsTable() {
    try {
        // الحصول على بيانات الأطباء مع التصفية
        const filteredDoctors = await getFilteredDoctors();
        
        // حساب إجمالي الصفحات
        const totalPages = Math.ceil(filteredDoctors.length / itemsPerPage);
        
        // الحصول على البيانات للصفحة الحالية
        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        const pageDoctors = filteredDoctors.slice(startIndex, endIndex);
        
        // تحديث الجدول
        updateDoctorsTableBody(pageDoctors);
        
        // تحديث معلومات الترقيم
        updatePaginationInfo(filteredDoctors.length);
        
        // تحديث عناصر التحكم في الترقيم
        updatePaginationControls(totalPages);
        
    } catch (error) {
        console.error('خطأ في تحميل جدول الأطباء:', error);
    }
}

/**
 * الحصول على الأطباء المصفاة
 */
async function getFilteredDoctors() {
    try {
        let doctors = await database.getRecords('doctors');
        
        // تطبيق الفلاتر
        if (currentFilters.search) {
            const searchTerm = currentFilters.search.toLowerCase();
            doctors = doctors.filter(doctor =>
                doctor.name?.toLowerCase().includes(searchTerm) ||
                doctor.specialty?.toLowerCase().includes(searchTerm) ||
                doctor.phone?.includes(searchTerm)
            );
        }
        
        if (currentFilters.specialty) {
            doctors = doctors.filter(doctor => doctor.specialty === currentFilters.specialty);
        }
        
        if (currentFilters.status) {
            doctors = doctors.filter(doctor => doctor.status === currentFilters.status);
        }
        
        return doctors;
    } catch (error) {
        console.error('خطأ في تصفية الأطباء:', error);
        return [];
    }
}

/**
 * تحديث جسم جدول الأطباء
 */
function updateDoctorsTableBody(doctors) {
    const tbody = document.getElementById('doctorsTableBody');
    if (!tbody) return;
    
    if (doctors.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="8" class="text-center">
                    <div class="empty-state">
                        <i class="fas fa-user-md fa-3x"></i>
                        <p>لا توجد بيانات للأطباء</p>
                    </div>
                </td>
            </tr>
        `;
        return;
    }
    
    tbody.innerHTML = doctors.map((doctor, index) => {
        const rowNumber = ((currentPage - 1) * itemsPerPage) + index + 1;
        
        return `
            <tr data-id="${doctor.id}">
                <td>${rowNumber}</td>
                <td>
                    <div class="doctor-info">
                        <div class="doctor-avatar">
                            <i class="fas fa-user-md"></i>
                        </div>
                        <div class="doctor-details">
                            <div class="doctor-name">${doctor.name || 'غير معروف'}</div>
                            <div class="doctor-id">رقم الرخصة: ${doctor.license_number || 'غير محدد'}</div>
                        </div>
                    </div>
                </td>
                <td>
                    <span class="specialty-badge">${getSpecialtyText(doctor.specialty)}</span>
                </td>
                <td>${doctor.phone || 'غير محدد'}</td>
                <td>${doctor.email || 'غير محدد'}</td>
                <td>
                    <span class="appointments-count">${doctor.today_appointments || 0}</span>
                </td>
                <td>
                    <span class="status-badge status-${doctor.status || 'inactive'}">
                        ${getStatusText(doctor.status)}
                    </span>
                </td>
                <td>
                    <div class="action-buttons">
                        <button class="btn-action btn-view" onclick="viewDoctor(${doctor.id})" title="ع
