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
                        <button class="btn-action btn-view" onclick="viewDoctor(${doctor.id})" title="عرض">
                            <i class="fas fa-eye"></i>
                        </button>
                        <button class="btn-action btn-edit" onclick="editDoctor(${doctor.id})" title="تعديل">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn-action btn-delete" onclick="deleteDoctor(${doctor.id})" title="حذف">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `;
    }).join('');
}

/**
 * الحصول على نص التخصص
 */
function getSpecialtyText(specialty) {
    const specialties = {
        'general': 'طب عام',
        'pediatrics': 'طب أطفال',
        'surgery': 'جراحة',
        'cardiology': 'قلب',
        'orthopedics': 'عظام',
        'dentistry': 'أسنان',
        'dermatology': 'جلدية',
        'ophthalmology': 'عيون',
        'neurology': 'أعصاب',
        'psychiatry': 'نفسية'
    };
    
    return specialties[specialty] || specialty || 'غير محدد';
}

/**
 * الحصول على نص الحالة
 */
function getStatusText(status) {
    const statuses = {
        'active': 'نشط',
        'inactive': 'غير نشط',
        'vacation': 'في إجازة',
        'on_call': 'استدعاء'
    };
    
    return statuses[status] || status || 'غير معروف';
}

/**
 * تحديث معلومات الترقيم
 */
function updatePaginationInfo(totalItems) {
    const infoElement = document.getElementById('paginationInfo');
    if (!infoElement) return;
    
    const start = ((currentPage - 1) * itemsPerPage) + 1;
    const end = Math.min(currentPage * itemsPerPage, totalItems);
    
    infoElement.textContent = `عرض ${start} إلى ${end} من ${totalItems} إدخالات`;
}

/**
 * تحديث عناصر التحكم في الترقيم
 */
function updatePaginationControls(totalPages) {
    // أزرار التنقل
    const firstBtn = document.getElementById('firstPageBtn');
    const prevBtn = document.getElementById('prevPageBtn');
    const nextBtn = document.getElementById('nextPageBtn');
    const lastBtn = document.getElementById('lastPageBtn');
    
    if (firstBtn) firstBtn.disabled = currentPage === 1;
    if (prevBtn) prevBtn.disabled = currentPage === 1;
    if (nextBtn) nextBtn.disabled = currentPage === totalPages || totalPages === 0;
    if (lastBtn) lastBtn.disabled = currentPage === totalPages || totalPages === 0;
    
    // أرقام الصفحات
    const pageNumbers = document.getElementById('pageNumbers');
    if (!pageNumbers) return;
    
    let pagesHtml = '';
    const maxVisiblePages = 5;
    
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
    
    if (endPage - startPage + 1 < maxVisiblePages) {
        startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }
    
    for (let i = startPage; i <= endPage; i++) {
        pagesHtml += `
            <button class="pagination-btn ${i === currentPage ? 'active' : ''}" 
                    onclick="goToPage(${i})">
                ${i}
            </button>
        `;
    }
    
    pageNumbers.innerHTML = pagesHtml;
}

/**
 * الانتقال لصفحة معينة
 */
async function goToPage(page) {
    if (page < 1) return;
    
    const filteredDoctors = await getFilteredDoctors();
    const totalPages = Math.ceil(filteredDoctors.length / itemsPerPage);
    
    if (page > totalPages) return;
    
    currentPage = page;
    await loadDoctorsTable();
}

/**
 * إعداد أحداث إدارة الأطباء
 */
function setupDoctorsEvents() {
    // إضافة طبيب جديد
    const addBtn = document.getElementById('addDoctorBtn');
    if (addBtn) {
        addBtn.addEventListener('click', openAddDoctorModal);
    }
    
    // البحث
    const searchInput = document.getElementById('searchDoctors');
    if (searchInput) {
        let searchTimeout;
        searchInput.addEventListener('input', function() {
            clearTimeout(searchTimeout);
            searchTimeout = setTimeout(async () => {
                currentFilters.search = this.value;
                currentPage = 1;
                await loadDoctorsTable();
            }, 500);
        });
    }
    
    // التصفية بالتخصص
    const specialtyFilter = document.getElementById('filterSpecialty');
    if (specialtyFilter) {
        specialtyFilter.addEventListener('change', async function() {
            currentFilters.specialty = this.value;
            currentPage = 1;
            await loadDoctorsTable();
        });
    }
    
    // التصفية بالحالة
    const statusFilter = document.getElementById('filterStatus');
    if (statusFilter) {
        statusFilter.addEventListener('change', async function() {
            currentFilters.status = this.value;
            currentPage = 1;
            await loadDoctorsTable();
        });
    }
    
    // إعادة تعيين الفلاتر
    const resetBtn = document.getElementById('resetFiltersBtn');
    if (resetBtn) {
        resetBtn.addEventListener('click', async () => {
            currentFilters = {};
            document.getElementById('searchDoctors').value = '';
            document.getElementById('filterSpecialty').value = '';
            document.getElementById('filterStatus').value = '';
            currentPage = 1;
            await loadDoctorsTable();
        });
    }
    
    // البحث في الجدول
    const tableSearch = document.getElementById('tableSearch');
    if (tableSearch) {
        tableSearch.addEventListener('input', function() {
            const searchTerm = this.value.toLowerCase();
            const rows = document.querySelectorAll('#doctorsTableBody tr');
            
            rows.forEach(row => {
                const text = row.textContent.toLowerCase();
                row.style.display = text.includes(searchTerm) ? '' : 'none';
            });
        });
    }
    
    // تصدير البيانات
    const exportBtn = document.getElementById('exportDoctorsBtn');
    if (exportBtn) {
        exportBtn.addEventListener('click', exportDoctorsData);
    }
    
    // أزرار التنقل بين الصفحات
    document.getElementById('firstPageBtn')?.addEventListener('click', () => goToPage(1));
    document.getElementById('prevPageBtn')?.addEventListener('click', () => goToPage(currentPage - 1));
    document.getElementById('nextPageBtn')?.addEventListener('click', () => goToPage(currentPage + 1));
    document.getElementById('lastPageBtn')?.addEventListener('click', async () => {
        const filteredDoctors = await getFilteredDoctors();
        const totalPages = Math.ceil(filteredDoctors.length / itemsPerPage);
        goToPage(totalPages);
    });
}

/**
 * فتح نافذة إضافة طبيب
 */
function openAddDoctorModal() {
    const modalHtml = `
        <div class="modal" id="addDoctorModal">
            <div class="modal-content" style="max-width: 700px">
                <div class="modal-header">
                    <h3 class="modal-title">
                        <i class="fas fa-user-md"></i>
                        إضافة طبيب جديد
                    </h3>
                    <button class="btn-close">&times;</button>
                </div>
                <div class="modal-body">
                    <form id="doctorForm" class="form-container">
                        <div class="form-row">
                            <div class="form-group">
                                <label for="doctorName" class="form-label">الاسم الكامل *</label>
                                <input type="text" id="doctorName" class="form-control" required>
                            </div>
                            
                            <div class="form-group">
                                <label for="doctorSpecialty" class="form-label">التخصص *</label>
                                <select id="doctorSpecialty" class="form-control" required>
                                    <option value="">اختر التخصص</option>
                                    <option value="general">طب عام</option>
                                    <option value="pediatrics">طب أطفال</option>
                                    <option value="surgery">جراحة</option>
                                    <option value="cardiology">قلب</option>
                                    <option value="orthopedics">عظام</option>
                                    <option value="dentistry">أسنان</option>
                                    <option value="dermatology">جلدية</option>
                                    <option value="ophthalmology">عيون</option>
                                    <option value="neurology">أعصاب</option>
                                    <option value="psychiatry">نفسية</option>
                                </select>
                            </div>
                        </div>
                        
                        <div class="form-row">
                            <div class="form-group">
                                <label for="doctorLicense" class="form-label">رقم الرخصة الطبية *</label>
                                <input type="text" id="doctorLicense" class="form-control" required>
                            </div>
                            
                            <div class="form-group">
                                <label for="doctorExperience" class="form-label">سنوات الخبرة</label>
                                <input type="number" id="doctorExperience" class="form-control" min="0" max="50">
                            </div>
                        </div>
                        
                        <div class="form-row">
                            <div class="form-group">
                                <label for="doctorPhone" class="form-label">رقم الهاتف *</label>
                                <input type="tel" id="doctorPhone" class="form-control" required>
                            </div>
                            
                            <div class="form-group">
                                <label for="doctorEmail" class="form-label">البريد الإلكتروني</label>
                                <input type="email" id="doctorEmail" class="form-control">
                            </div>
                        </div>
                        
                        <div class="form-row">
                            <div class="form-group">
                                <label for="doctorAddress" class="form-label">العنوان</label>
                                <textarea id="doctorAddress" class="form-control" rows="2"></textarea>
                            </div>
                        </div>
                        
                        <div class="form-row">
                            <div class="form-group">
                                <label for="doctorQualifications" class="form-label">المؤهلات العلمية</label>
                                <textarea id="doctorQualifications" class="form-control" rows="3"></textarea>
                            </div>
                        </div>
                        
                        <div class="form-row">
                            <div class="form-group">
                                <label for="doctorStatus" class="form-label">الحالة</label>
                                <select id="doctorStatus" class="form-control">
                                    <option value="active">نشط</option>
                                    <option value="inactive">غير نشط</option>
                                    <option value="vacation">في إجازة</option>
                                </select>
                            </div>
                            
                            <div class="form-group">
                                <label for="consultationFee" class="form-label">رسوم الكشف (ريال)</label>
                                <input type="number" id="consultationFee" class="form-control" min="0" value="100">
                            </div>
                        </div>
                        
                        <div class="form-row">
                            <div class="form-group">
                                <label for="workingHours" class="form-label">ساعات العمل</label>
                                <div class="working-hours-input">
                                    <div class="time-input-group">
                                        <label>من</label>
                                        <input type="time" id="workStartTime" class="form-control" value="08:00">
                                    </div>
                                    <div class="time-input-group">
                                        <label>إلى</label>
                                        <input type="time" id="workEndTime" class="form-control" value="17:00">
                                    </div>
                                </div>
                            </div>
                            
                            <div class="form-group">
                                <label class="form-label">أيام العمل</label>
                                <div class="work-days">
                                    <label class="checkbox-label">
                                        <input type="checkbox" name="workDays" value="saturday" checked>
                                        <span>السبت</span>
                                    </label>
                                    <label class="checkbox-label">
                                        <input type="checkbox" name="workDays" value="sunday" checked>
                                        <span>الأحد</span>
                                    </label>
                                    <label class="checkbox-label">
                                        <input type="checkbox" name="workDays" value="monday" checked>
                                        <span>الإثنين</span>
                                    </label>
                                    <label class="checkbox-label">
                                        <input type="checkbox" name="workDays" value="tuesday" checked>
                                        <span>الثلاثاء</span>
                                    </label>
                                    <label class="checkbox-label">
                                        <input type="checkbox" name="workDays" value="wednesday" checked>
                                        <span>الأربعاء</span>
                                    </label>
                                    <label class="checkbox-label">
                                        <input type="checkbox" name="workDays" value="thursday" checked>
                                        <span>الخميس</span>
                                    </label>
                                    <label class="checkbox-label">
                                        <input type="checkbox" name="workDays" value="friday">
                                        <span>الجمعة</span>
                                    </label>
                                </div>
                            </div>
                        </div>
                        
                        <div class="form-row">
                            <div class="form-group">
                                <label for="doctorNotes" class="form-label">ملاحظات</label>
                                <textarea id="doctorNotes" class="form-control" rows="2"></textarea>
                            </div>
                        </div>
                    </form>
                </div>
                <div class="modal-footer">
                    <button class="btn btn-secondary" onclick="closeModal(document.getElementById('addDoctorModal'))">
                        إلغاء
                    </button>
                    <button class="btn btn-primary" onclick="saveDoctor()">
                        <i class="fas fa-save"></i>
                        حفظ الطبيب
                    </button>
                </div>
            </div>
        </div>
    `;
    
    document.getElementById('modalsContainer').innerHTML = modalHtml;
    const modal = document.getElementById('addDoctorModal');
    openModal('addDoctorModal');
    
    // إعداد إغلاق المودال
    modal.querySelector('.btn-close').addEventListener('click', () => {
        closeModal(modal);
    });
}

/**
 * حفظ بيانات الطبيب
 */
async function saveDoctor() {
    try {
        // التحقق من صحة النموذج
        const form = document.getElementById('doctorForm');
        if (!ui.validateForm(form)) {
            showToast('يرجى ملء الحقول المطلوبة بشكل صحيح', 'error');
            return;
        }
        
        showLoading();
        
        // جمع بيانات النموذج
        const doctorData = {
            name: document.getElementById('doctorName').value,
            specialty: document.getElementById('doctorSpecialty').value,
            license_number: document.getElementById('doctorLicense').value,
            experience_years: parseInt(document.getElementById('doctorExperience').value) || 0,
            phone: document.getElementById('doctorPhone').value,
            email: document.getElementById('doctorEmail').value || '',
            address: document.getElementById('doctorAddress').value || '',
            qualifications: document.getElementById('doctorQualifications').value || '',
            status: document.getElementById('doctorStatus').value,
            consultation_fee: parseInt(document.getElementById('consultationFee').value) || 100,
            working_hours: {
                start: document.getElementById('workStartTime').value,
                end: document.getElementById('workEndTime').value
            },
            work_days: Array.from(document.querySelectorAll('input[name="workDays"]:checked'))
                .map(cb => cb.value),
            notes: document.getElementById('doctorNotes').value || '',
            today_appointments: 0,
            total_appointments: 0
        };
        
        // إضافة الطبيب
        const newDoctor = await database.addRecord('doctors', doctorData);
        
        // إغلاق المودال
        closeModal(document.getElementById('addDoctorModal'));
        
        // إعادة تحميل البيانات
        await loadDoctorsData();
        
        // إظهار رسالة نجاح
        showToast('تم إضافة الطبيب بنجاح', 'success');
        
        // تسجيل النشاط
        await database.addRecord('activities', {
            user_id: 1, // يجب استبدالها بالمستخدم الحالي
            action: 'doctor_add',
            description: `إضافة طبيب جديد: ${doctorData.name}`,
            timestamp: new Date().toISOString()
        });
        
        return newDoctor;
        
    } catch (error) {
        console.error('خطأ في حفظ الطبيب:', error);
        showToast('حدث خطأ في حفظ بيانات الطبيب', 'error');
    } finally {
        hideLoading();
    }
}

/**
 * عرض بيانات الطبيب
 */
async function viewDoctor(doctorId) {
    try {
        showLoading();
        
        const doctor = await database.getRecordById('doctors', doctorId);
        if (!doctor) {
            showToast('الطبيب غير موجود', 'error');
            return;
        }
        
        const modalHtml = `
            <div class="modal" id="viewDoctorModal">
                <div class="modal-content" style="max-width: 800px">
                    <div class="modal-header">
                        <h3 class="modal-title">
                            <i class="fas fa-user-md"></i>
                            بيانات الطبيب
                        </h3>
                        <button class="btn-close">&times;</button>
                    </div>
                    <div class="modal-body">
                        <div class="doctor-profile">
                            <div class="profile-header">
                                <div class="profile-avatar">
                                    <i class="fas fa-user-md fa-3x"></i>
                                </div>
                                <div class="profile-info">
                                    <h4>${doctor.name || 'غير معروف'}</h4>
                                    <p class="profile-specialty">${getSpecialtyText(doctor.specialty)}</p>
                                    <span class="status-badge status-${doctor.status}">
                                        ${getStatusText(doctor.status)}
                                    </span>
                                </div>
                            </div>
                            
                            <div class="profile-details">
                                <div class="details-grid">
                                    <div class="detail-item">
                                        <label>رقم الرخصة:</label>
                                        <span>${doctor.license_number || 'غير محدد'}</span>
                                    </div>
                                    <div class="detail-item">
                                        <label>سنوات الخبرة:</label>
                                        <span>${doctor.experience_years || 0} سنة</span>
                                    </div>
                                    <div class="detail-item">
                                        <label>رقم الهاتف:</label>
                                        <span>${doctor.phone || 'غير محدد'}</span>
                                    </div>
                                    <div class="detail-item">
                                        <label>البريد الإلكتروني:</label>
                                        <span>${doctor.email || 'غير محدد'}</span>
                                    </div>
                                    <div class="detail-item">
                                        <label>رسوم الكشف:</label>
                                        <span>${doctor.consultation_fee || 0} ريال</span>
                                    </div>
                                    <div class="detail-item">
                                        <label>إجمالي المواعيد:</label>
                                        <span>${doctor.total_appointments || 0} موعد</span>
                                    </div>
                                </div>
                                
                                <div class="details-section">
                                    <h5>ساعات العمل</h5>
                                    <div class="work-schedule">
                                        <p>من ${doctor.working_hours?.start || '08:00'} إلى ${doctor.working_hours?.end || '17:00'}</p>
                                        <p>أيام العمل: ${getWorkDaysText(doctor.work_days)}</p>
                                    </div>
                                </div>
                                
                                ${doctor.address ? `
                                <div class="details-section">
                                    <h5>العنوان</h5>
                                    <p>${doctor.address}</p>
                                </div>
                                ` : ''}
                                
                                ${doctor.qualifications ? `
                                <div class="details-section">
                                    <h5>المؤهلات العلمية</h5>
                                    <p>${doctor.qualifications}</p>
                                </div>
                                ` : ''}
                                
                                ${doctor.notes ? `
                                <div class="details-section">
                                    <h5>ملاحظات</h5>
                                    <p>${doctor.notes}</p>
                                </div>
                                ` : ''}
                            </div>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button class="btn btn-secondary" onclick="closeModal(document.getElementById('viewDoctorModal'))">
                            إغلاق
                        </button>
                        <button class="btn btn-primary" onclick="editDoctor(${doctorId})">
                            <i class="fas fa-edit"></i>
                            تعديل
                        </button>
                    </div>
                </div>
            </div>
        `;
        
        document.getElementById('modalsContainer').innerHTML = modalHtml;
        const modal = document.getElementById('viewDoctorModal');
        openModal('viewDoctorModal');
        
        // إعداد إغلاق المودال
        modal.querySelector('.btn-close').addEventListener('click', () => {
            closeModal(modal);
        });
        
    } catch (error) {
        console.error('خطأ في عرض بيانات الطبيب:', error);
        showToast('حدث خطأ في عرض البيانات', 'error');
    } finally {
        hideLoading();
    }
}

/**
 * الحصول على نص أيام العمل
 */
function getWorkDaysText(workDays) {
    if (!workDays || !Array.isArray(workDays)) return 'غير محدد';
    
    const dayNames = {
        'saturday': 'السبت',
        'sunday': 'الأحد',
        'monday': 'الإثنين',
        'tuesday': 'الثلاثاء',
        'wednesday': 'الأربعاء',
        'thursday': 'الخميس',
        'friday': 'الجمعة'
    };
    
    return workDays.map(day => dayNames[day] || day).join('، ');
}

/**
 * تعديل بيانات الطبيب
 */
async function editDoctor(doctorId) {
    try {
        showLoading();
        
        const doctor = await database.getRecordById('doctors', doctorId);
        if (!doctor) {
            showToast('الطبيب غير موجود', 'error');
            return;
        }
        
        const modalHtml = `
            <div class="modal" id="editDoctorModal">
                <div class="modal-content" style="max-width: 700px">
                    <div class="modal-header">
                        <h3 class="modal-title">
                            <i class="fas fa-edit"></i>
                            تعديل بيانات الطبيب
                        </h3>
                        <button class="btn-close">&times;</button>
                    </div>
                    <div class="modal-body">
                        <form id="editDoctorForm" class="form-container">
                            <input type="hidden" id="editDoctorId" value="${doctorId}">
                            
                            <div class="form-row">
                                <div class="form-group">
                                    <label for="editDoctorName" class="form-label">الاسم الكامل *</label>
                                    <input type="text" id="editDoctorName" class="form-control" 
                                           value="${doctor.name || ''}" required>
                                </div>
                                
                                <div class="form-group">
                                    <label for="editDoctorSpecialty" class="form-label">التخصص *</label>
                                    <select id="editDoctorSpecialty" class="form-control" required>
                                        <option value="">اختر التخصص</option>
                                        <option value="general" ${doctor.specialty === 'general' ? 'selected' : ''}>طب عام</option>
                                        <option value="pediatrics" ${doctor.specialty === 'pediatrics' ? 'selected' : ''}>طب أطفال</option>
                                        <option value="surgery" ${doctor.specialty === 'surgery' ? 'selected' : ''}>جراحة</option>
                                        <option value="cardiology" ${doctor.specialty === 'cardiology' ? 'selected' : ''}>قلب</option>
                                        <option value="orthopedics" ${doctor.specialty === 'orthopedics' ? 'selected' : ''}>عظام</option>
                                        <option value="dentistry" ${doctor.specialty === 'dentistry' ? 'selected' : ''}>أسنان</option>
                                        <option value="dermatology" ${doctor.specialty === 'dermatology' ? 'selected' : ''}>جلدية</option>
                                        <option value="ophthalmology" ${doctor.specialty === 'ophthalmology' ? 'selected' : ''}>عيون</option>
                                        <option value="neurology" ${doctor.specialty === 'neurology' ? 'selected' : ''}>أعصاب</option>
                                        <option value="psychiatry" ${doctor.specialty === 'psychiatry' ? 'selected' : ''}>نفسية</option>
                                    </select>
                                </div>
                            </div>
                            
                            <div class="form-row">
                                <div class="form-group">
                                    <label for="editDoctorLicense" class="form-label">رقم الرخصة الطبية *</label>
                                    <input type="text" id="editDoctorLicense" class="form-control" 
                                           value="${doctor.license_number || ''}" required>
                                </div>
                                
                                <div class="form-group">
                                    <label for="editDoctorExperience" class="form-label">سنوات الخبرة</label>
                                    <input type="number" id="editDoctorExperience" class="form-control" 
                                           min="0" max="50" value="${doctor.experience_years || 0}">
                                </div>
                            </div>
                            
                            <div class="form-row">
                                <div class="form-group">
                                    <label for="editDoctorPhone" class="form-label">رقم الهاتف *</label>
                                    <input type="tel" id="editDoctorPhone" class="form-control" 
                                           value="${doctor.phone || ''}" required>
                                </div>
                                
                                <div class="form-group">
                                    <label for="editDoctorEmail" class="form-label">البريد الإلكتروني</label>
                                    <input type="email" id="editDoctorEmail" class="form-control" 
                                           value="${doctor.email || ''}">
                                </div>
                            </div>
                            
                            <div class="form-row">
                                <div class="form-group">
                                    <label for="editDoctorAddress" class="form-label">العنوان</label>
                                    <textarea id="editDoctorAddress" class="form-control" rows="2">${doctor.address || ''}</textarea>
                                </div>
                            </div>
                            
                            <div class="form-row">
                                <div class="form-group">
                                    <label for="editDoctorQualifications" class="form-label">المؤهلات العلمية</label>
                                    <textarea id="editDoctorQualifications" class="form-control" rows="3">${doctor.qualifications || ''}</textarea>
                                </div>
                            </div>
                            
                            <div class="form-row">
                                <div class="form-group">
                                    <label for="editDoctorStatus" class="form-label">الحالة</label>
                                    <select id="editDoctorStatus" class="form-control">
                                        <option value="active" ${doctor.status === 'active' ? 'selected' : ''}>نشط</option>
                                        <option value="inactive" ${doctor.status === 'inactive' ? 'selected' : ''}>غير نشط</option>
                                        <option value="vacation" ${doctor.status === 'vacation' ? 'selected' : ''}>في إجازة</option>
                                    </select>
                                </div>
                                
                                <div class="form-group">
                                    <label for="editConsultationFee" class="form-label">رسوم الكشف (ريال)</label>
                                    <input type="number" id="editConsultationFee" class="form-control" 
                                           min="0" value="${doctor.consultation_fee || 100}">
                                </div>
                            </div>
                            
                            <div class="form-row">
                                <div class="form-group">
                                    <label for="editWorkStartTime" class="form-label">ساعات العمل</label>
                                    <div class="working-hours-input">
                                        <div class="time-input-group">
                                            <label>من</label>
                                            <input type="time" id="editWorkStartTime" class="form-control" 
                                                   value="${doctor.working_hours?.start || '08:00'}">
                                        </div>
                                        <div class="time-input-group">
                                            <label>إلى</label>
                                            <input type="time" id="editWorkEndTime" class="form-control" 
                                                   value="${doctor.working_hours?.end || '17:00'}">
                                        </div>
                                    </div>
                                </div>
                                
                                <div class="form-group">
                                    <label class="form-label">أيام العمل</label>
                                    <div class="work-days">
                                        <label class="checkbox-label">
                                            <input type="checkbox" name="editWorkDays" value="saturday" 
                                                   ${(doctor.work_days || []).includes('saturday') ? 'checked' : ''}>
                                            <span>السبت</span>
                                        </label>
                                        <label class="checkbox-label">
                                            <input type="checkbox" name="editWorkDays" value="sunday" 
                                                   ${(doctor.work_days || []).includes('sunday') ? 'checked' : ''}>
                                            <span>الأحد</span>
                                        </label>
                                        <label class="checkbox-label">
                                            <input type="checkbox" name="editWorkDays" value="monday" 
                                                   ${(doctor.work_days || []).includes('monday') ? 'checked' : ''}>
                                            <span>الإثنين</span>
                                        </label>
                                        <label class="checkbox-label">
                                            <input type="checkbox" name="editWorkDays" value="tuesday" 
                                                   ${(doctor.work_days || []).includes('tuesday') ? 'checked' : ''}>
                                            <span>الثلاثاء</span>
                                        </label>
                                        <label class="checkbox-label">
                                            <input type="checkbox" name="editWorkDays" value="wednesday" 
                                                   ${(doctor.work_days || []).includes('wednesday') ? 'checked' : ''}>
                                            <span>الأربعاء</span>
                                        </label>
                                        <label class="checkbox-label">
                                            <input type="checkbox" name="editWorkDays" value="thursday" 
                                                   ${(doctor.work_days || []).includes('thursday') ? 'checked' : ''}>
                                            <span>الخميس</span>
                                        </label>
                                        <label class="checkbox-label">
                                            <input type="checkbox" name="editWorkDays" value="friday" 
                                                   ${(doctor.work_days || []).includes('friday') ? 'checked' : ''}>
                                            <span>الجمعة</span>
                                        </label>
                                    </div>
                                </div>
                            </div>
                            
                            <div class="form-row">
                                <div class="form-group">
                                    <label for="editDoctorNotes" class="form-label">ملاحظات</label>
                                    <textarea id="editDoctorNotes" class="form-control" rows="2">${doctor.notes || ''}</textarea>
                                </div>
                            </div>
                        </form>
                    </div>
                    <div class="modal-footer">
                        <button class="btn btn-secondary" onclick="closeModal(document.getElementById('editDoctorModal'))">
                            إلغاء
                        </button>
                        <button class="btn btn-danger" onclick="deleteDoctor(${doctorId})">
                            <i class="fas fa-trash"></i>
                            حذف
                        </button>
                        <button class="btn btn-primary" onclick="updateDoctor()">
                            <i class="fas fa-save"></i>
                            حفظ التغييرات
                        </button>
                    </div>
                </div>
            </div>
        `;
        
        document.getElementById('modalsContainer').innerHTML = modalHtml;
        const modal = document.getElementById('editDoctorModal');
        openModal('editDoctorModal');
        
        // إعداد إغلاق المودال
        modal.querySelector('.btn-close').addEventListener('click', () => {
            closeModal(modal);
        });
        
    } catch (error) {
        console.error('خطأ في تعديل بيانات الطبيب:', error);
        showToast('حدث خطأ في تحميل بيانات الطبيب', 'error');
    } finally {
        hideLoading();
    }
}

/**
 * تحديث بيانات الطبيب
 */
async function updateDoctor() {
    try {
        // التحقق من صحة النموذج
        const form = document.getElementById('editDoctorForm');
        if (!ui.validateForm(form)) {
            showToast('يرجى ملء الحقول المطلوبة بشكل صحيح', 'error');
            return;
        }
        
        showLoading();
        
        const doctorId = document.getElementById('editDoctorId').value;
        
        // جمع بيانات النموذج
        const doctorData = {
            name: document.getElementById('editDoctorName').value,
            specialty: document.getElementById('editDoctorSpecialty').value,
            license_number: document.getElementById('editDoctorLicense').value,
            experience_years: parseInt(document.getElementById('editDoctorExperience').value) || 0,
            phone: document.getElementById('editDoctorPhone').value,
            email: document.getElementById('editDoctorEmail').value || '',
            address: document.getElementById('editDoctorAddress').value || '',
            qualifications: document.getElementById('editDoctorQualifications').value || '',
            status: document.getElementById('editDoctorStatus').value,
            consultation_fee: parseInt(document.getElementById('editConsultationFee').value) || 100,
            working_hours: {
                start: document.getElementById('editWorkStartTime').value,
                end: document.getElementById('editWorkEndTime').value
            },
            work_days: Array.from(document.querySelectorAll('input[name="editWorkDays"]:checked'))
                .map(cb => cb.value),
            notes: document.getElementById('editDoctorNotes').value || '',
            updated_at: new Date().toISOString()
        };
        
        // تحديث الطبيب
        await database.updateRecord('doctors', parseInt(doctorId), doctorData);
        
        // إغلاق المودال
        closeModal(document.getElementById('editDoctorModal'));
        
        // إعادة تحميل البيانات
        await loadDoctorsData();
        
        // إظهار رسالة نجاح
        showToast('تم تحديث بيانات الطبيب بنجاح', 'success');
        
        // تسجيل النشاط
        await database.addRecord('activities', {
            user_id: 1, // يجب استبدالها بالمستخدم الحالي
            action: 'doctor_update',
            description: `تحديث بيانات طبيب: ${doctorData.name}`,
            timestamp: new Date().toISOString()
        });
        
    } catch (error) {
        console.error('خطأ في تحديث الطبيب:', error);
        showToast('حدث خطأ في تحديث بيانات الطبيب', 'error');
    } finally {
        hideLoading();
    }
}

/**
 * حذف طبيب
 */
async function deleteDoctor(doctorId) {
    try {
        const confirmed = await ui.showConfirmDialog({
            title: 'حذف طبيب',
            message: 'هل أنت متأكد من حذف هذا الطبيب؟ لا يمكن التراجع عن هذا الإجراء.',
            confirmText: 'نعم، احذف',
            cancelText: 'إلغاء',
            danger: true
        });
        
        if (!confirmed) return;
        
        showLoading();
        
        // الحصول على بيانات الطبيب قبل الحذف
        const doctor = await database.getRecordById('doctors', doctorId);
        
        // حذف الطبيب
        await database.deleteRecord('doctors', doctorId);
        
        // إعادة تحميل البيانات
        await loadDoctorsData();
        
        // إظهار رسالة نجاح
        showToast('تم حذف الطبيب بنجاح', 'success');
        
        // تسجيل النشاط
        await database.addRecord('activities', {
            user_id: 1, // يجب استبدالها بالمستخدم الحالي
            action: 'doctor_delete',
            description: `حذف طبيب: ${doctor?.name || 'غير معروف'}`,
            timestamp: new Date().toISOString()
        });
        
    } catch (error) {
        console.error('خطأ في حذف الطبيب:', error);
        showToast('حدث خطأ في حذف الطبيب', 'error');
    } finally {
        hideLoading();
    }
}

/**
 * تصدير بيانات الأطباء
 */
async function exportDoctorsData() {
    try {
        showLoading();
        
        const doctors = await database.getRecords('doctors');
        
        // تحويل البيانات لتنسيق CSV
        const csvData = doctors.map(doctor => ({
            'الاسم': doctor.name || '',
            'التخصص': getSpecialtyText(doctor.specialty),
            'رقم الرخصة': doctor.license_number || '',
            'سنوات الخبرة': doctor.experience_years || 0,
            'رقم الهاتف': doctor.phone || '',
            'البريد الإلكتروني': doctor.email || '',
            'الحالة': getStatusText(doctor.status),
            'رسوم الكشف': doctor.consultation_fee || 0,
            'إجمالي المواعيد': doctor.total_appointments || 0
        }));
        
        // إنشاء ملف CSV
        const csvContent = convertToCSV(csvData);
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        
        link.setAttribute('href', url);
        link.setAttribute('download', `doctors_${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        showToast('تم تصدير بيانات الأطباء بنجاح', 'success');
        
    } catch (error) {
        console.error('خطأ في تصدير بيانات الأطباء:', error);
        showToast('حدث خطأ في تصدير البيانات', 'error');
    } finally {
        hideLoading();
    }
}

/**
 * تحويل البيانات لـ CSV
 */
function convertToCSV(data) {
    if (!Array.isArray(data) || data.length === 0) return '';
    
    const headers = Object.keys(data[0]);
    const rows = data.map(obj => 
        headers.map(header => {
            const value = obj[header];
            if (typeof value === 'string') {
                return `"${value.replace(/"/g, '""')}"`;
            }
            return value;
        }).join(',')
    );
    
    return [headers.join(','), ...rows].join('\n');
}

/**
 * البحث في الأطباء
 */
async function searchDoctors(query) {
    try {
        currentFilters.search = query;
        currentPage = 1;
        await loadDoctorsTable();
    } catch (error) {
        console.error('خطأ في البحث:', error);
    }
}

// تصدير الدوال للاستخدام العام
window.doctors = {
    loadDoctorsContent,
    openAddDoctorModal,
    viewDoctor,
    editDoctor,
    deleteDoctor,
    exportDoctorsData,
    searchDoctors
};
