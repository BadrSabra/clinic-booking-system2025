/**
 * نظام إدارة قاعدة البيانات
 */

// تهيئة قاعدة البيانات
let db;

/**
 * تهيئة قاعدة البيانات
 */
async function initDatabase() {
    return new Promise((resolve, reject) => {
        // استعادة البيانات من LocalStorage
        if (!localStorage.getItem('clinic_db_initialized')) {
            initializeLocalStorageDB();
        }
        
        // محاكاة تهيئة قاعدة البيانات
        setTimeout(() => {
            console.log('تم تهيئة قاعدة البيانات بنجاح');
            resolve();
        }, 500);
    });
}

/**
 * تهيئة LocalStorage
 */
function initializeLocalStorageDB() {
    const initialData = {
        users: [
            {
                id: 1,
                username: 'admin',
                password: 'admin123',
                name: 'المسؤول',
                role: 'admin',
                email: 'admin@clinic.com',
                phone: '0512345678',
                status: 'active'
            }
        ],
        doctors: [],
        patients: [],
        appointments: [],
        prescriptions: [],
        inventory: [],
        bills: [],
        notifications: [],
        settings: {
            clinic_name: 'العيادة الطبية',
            address: 'الرياض، المملكة العربية السعودية',
            phone: '0112345678',
            email: 'info@clinic.com',
            currency: 'ريال',
            tax_rate: 15,
            working_hours: {
                start: '08:00',
                end: '17:00'
            }
        }
    };
    
    Object.keys(initialData).forEach(key => {
        localStorage.setItem(`clinic_${key}`, JSON.stringify(initialData[key]));
    });
    
    localStorage.setItem('clinic_db_initialized', 'true');
}

/**
 * إضافة سجل جديد
 */
async function addRecord(table, data) {
    try {
        const records = getRecords(table);
        const newId = generateId(table);
        const newRecord = {
            id: newId,
            ...data,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        };
        
        records.push(newRecord);
        saveRecords(table, records);
        
        // إضافة إشعار
        addNotification({
            title: 'سجل جديد',
            message: `تم إضافة سجل جديد في ${getTableName(table)}`,
            type: 'info',
            read: false
        });
        
        return newRecord;
    } catch (error) {
        console.error('خطأ في إضافة السجل:', error);
        throw error;
    }
}

/**
 * تحديث سجل
 */
async function updateRecord(table, id, data) {
    try {
        const records = getRecords(table);
        const index = records.findIndex(record => record.id === id);
        
        if (index === -1) {
            throw new Error('السجل غير موجود');
        }
        
        records[index] = {
            ...records[index],
            ...data,
            updated_at: new Date().toISOString()
        };
        
        saveRecords(table, records);
        
        // إضافة إشعار
        addNotification({
            title: 'تحديث سجل',
            message: `تم تحديث سجل في ${getTableName(table)}`,
            type: 'info',
            read: false
        });
        
        return records[index];
    } catch (error) {
        console.error('خطأ في تحديث السجل:', error);
        throw error;
    }
}

/**
 * حذف سجل
 */
async function deleteRecord(table, id) {
    try {
        const records = getRecords(table);
        const filteredRecords = records.filter(record => record.id !== id);
        
        if (filteredRecords.length === records.length) {
            throw new Error('السجل غير موجود');
        }
        
        saveRecords(table, filteredRecords);
        
        // إضافة إشعار
        addNotification({
            title: 'حذف سجل',
            message: `تم حذف سجل من ${getTableName(table)}`,
            type: 'warning',
            read: false
        });
        
        return true;
    } catch (error) {
        console.error('خطأ في حذف السجل:', error);
        throw error;
    }
}

/**
 * الحصول على السجلات
 */
async function getRecords(table, filters = {}) {
    try {
        const records = JSON.parse(localStorage.getItem(`clinic_${table}`)) || [];
        
        // تطبيق الفلاتر
        let filteredRecords = records;
        
        Object.keys(filters).forEach(key => {
            if (filters[key] !== undefined && filters[key] !== '') {
                filteredRecords = filteredRecords.filter(record => {
                    if (typeof filters[key] === 'function') {
                        return filters[key](record[key]);
                    }
                    return record[key] === filters[key];
                });
            }
        });
        
        return filteredRecords;
    } catch (error) {
        console.error('خطأ في الحصول على السجلات:', error);
        return [];
    }
}

/**
 * الحصول على سجل بواسطة المعرف
 */
async function getRecordById(table, id) {
    try {
        const records = await getRecords(table);
        return records.find(record => record.id === id) || null;
    } catch (error) {
        console.error('خطأ في الحصول على السجل:', error);
        return null;
    }
}

/**
 * الحصول على الإحصائيات
 */
async function getStats(table, field, operation = 'count') {
    try {
        const records = await getRecords(table);
        
        switch (operation) {
            case 'count':
                return records.length;
            case 'sum':
                return records.reduce((sum, record) => sum + (record[field] || 0), 0);
            case 'avg':
                const sum = records.reduce((total, record) => total + (record[field] || 0), 0);
                return records.length > 0 ? sum / records.length : 0;
            case 'max':
                return records.length > 0 ? Math.max(...records.map(r => r[field] || 0)) : 0;
            case 'min':
                return records.length > 0 ? Math.min(...records.map(r => r[field] || 0)) : 0;
            default:
                return 0;
        }
    } catch (error) {
        console.error('خطأ في الحصول على الإحصائيات:', error);
        return 0;
    }
}

/**
 * البحث في السجلات
 */
async function searchRecords(table, query, fields = []) {
    try {
        const records = await getRecords(table);
        
        if (!query || query.trim() === '') {
            return records;
        }
        
        const searchTerm = query.toLowerCase().trim();
        
        return records.filter(record => {
            // إذا تم تحديد حقول محددة
            if (fields.length > 0) {
                return fields.some(field => {
                    const value = record[field];
                    return value && value.toString().toLowerCase().includes(searchTerm);
                });
            }
            
            // البحث في جميع الحقول النصية
            return Object.keys(record).some(key => {
                const value = record[key];
                return typeof value === 'string' && 
                       value.toLowerCase().includes(searchTerm);
            });
        });
    } catch (error) {
        console.error('خطأ في البحث:', error);
        return [];
    }
}

/**
 * توليد معرف جديد
 */
function generateId(table) {
    const records = getRecords(table);
    if (records.length === 0) {
        return 1;
    }
    
    const maxId = Math.max(...records.map(record => record.id));
    return maxId + 1;
}

/**
 * الحصول على السجلات من LocalStorage
 */
function getRecords(table) {
    const data = localStorage.getItem(`clinic_${table}`);
    return data ? JSON.parse(data) : [];
}

/**
 * حفظ السجلات في LocalStorage
 */
function saveRecords(table, records) {
    localStorage.setItem(`clinic_${table}`, JSON.stringify(records));
}

/**
 * الحصول على اسم الجدول
 */
function getTableName(table) {
    const names = {
        'doctors': 'الأطباء',
        'patients': 'المرضى',
        'appointments': 'المواعيد',
        'prescriptions': 'الوصفات',
        'inventory': 'المخزون',
        'bills': 'الفواتير',
        'users': 'المستخدمين'
    };
    
    return names[table] || table;
}

/**
 * إضافة إشعار
 */
function addNotification(notification) {
    try {
        const notifications = getRecords('notifications');
        const newNotification = {
            id: generateId('notifications'),
            ...notification,
            timestamp: new Date().toISOString()
        };
        
        notifications.unshift(newNotification);
        saveRecords('notifications', notifications);
        
        // تحديث العداد
        updateNotificationCount();
        
        // إظهار إشعار مباشر إذا كان النظام مفتوح
        if (typeof showNotification === 'function') {
            showNotification(notification.message, notification.type);
        }
        
        return newNotification;
    } catch (error) {
        console.error('خطأ في إضافة الإشعار:', error);
    }
}

/**
 * تحديث عداد الإشعارات
 */
function updateNotificationCount() {
    const notifications = getRecords('notifications');
    const unreadCount = notifications.filter(n => !n.read).length;
    
    const notificationCount = document.getElementById('notificationCount');
    if (notificationCount) {
        notificationCount.textContent = unreadCount;
    }
    
    return unreadCount;
}

/**
 * الحصول على الإعدادات
 */
async function getSettings() {
    try {
        return getRecords('settings')[0] || {};
    } catch (error) {
        console.error('خطأ في الحصول على الإعدادات:', error);
        return {};
    }
}

/**
 * تحديث الإعدادات
 */
async function updateSettings(data) {
    try {
        const settings = getRecords('settings');
        if (settings.length === 0) {
            settings.push(data);
        } else {
            settings[0] = {
                ...settings[0],
                ...data,
                updated_at: new Date().toISOString()
            };
        }
        
        saveRecords('settings', settings);
        return settings[0];
    } catch (error) {
        console.error('خطأ في تحديث الإعدادات:', error);
        throw error;
    }
}

/**
 * إنشاء نسخة احتياطية
 */
async function createBackup() {
    try {
        const backup = {};
        const tables = ['users', 'doctors', 'patients', 'appointments', 
                       'prescriptions', 'inventory', 'bills', 'settings'];
        
        tables.forEach(table => {
            backup[table] = getRecords(table);
        });
        
        backup.timestamp = new Date().toISOString();
        backup.version = '1.0.0';
        
        const backupStr = JSON.stringify(backup, null, 2);
        const blob = new Blob([backupStr], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = `clinic_backup_${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        return true;
    } catch (error) {
        console.error('خطأ في إنشاء النسخة الاحتياطية:', error);
        throw error;
    }
}

/**
 * استعادة نسخة احتياطية
 */
async function restoreBackup(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        
        reader.onload = function(event) {
            try {
                const backup = JSON.parse(event.target.result);
                
                // التحقق من صحة النسخة الاحتياطية
                if (!backup.timestamp || !backup.version) {
                    throw new Error('النسخة الاحتياطية غير صالحة');
                }
                
                // استعادة البيانات
                Object.keys(backup).forEach(key => {
                    if (key !== 'timestamp' && key !== 'version') {
                        localStorage.setItem(`clinic_${key}`, JSON.stringify(backup[key]));
                    }
                });
                
                resolve(true);
            } catch (error) {
                reject(error);
            }
        };
        
        reader.onerror = reject;
        reader.readAsText(file);
    });
}

/**
 * تصدير البيانات
 */
async function exportData(table, format = 'json') {
    try {
        const records = await getRecords(table);
        
        if (format === 'json') {
            const dataStr = JSON.stringify(records, null, 2);
            const blob = new Blob([dataStr], { type: 'application/json' });
            return blob;
        } else if (format === 'csv') {
            const csv = convertToCSV(records);
            const blob = new Blob([csv], { type: 'text/csv' });
            return blob;
        }
        
        throw new Error('التنسيق غير مدعوم');
    } catch (error) {
        console.error('خطأ في تصدير البيانات:', error);
        throw error;
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
            if (typeof value === 'object') {
                return JSON.stringify(value);
            }
            return `"${String(value).replace(/"/g, '""')}"`;
        }).join(',')
    );
    
    return [headers.join(','), ...rows].join('\n');
}

/**
 * تنظيف البيانات القديمة
 */
async function cleanupOldData(days = 30) {
    try {
        const tables = ['appointments', 'notifications'];
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - days);
        
        tables.forEach(table => {
            const records = getRecords(table);
            const filteredRecords = records.filter(record => {
                const recordDate = new Date(record.created_at || record.timestamp || record.date);
                return recordDate >= cutoffDate;
            });
            
            saveRecords(table, filteredRecords);
        });
        
        return true;
    } catch (error) {
        console.error('خطأ في تنظيف البيانات:', error);
        throw error;
    }
}

// تصدير الدوال
window.database = {
    initDatabase,
    addRecord,
    updateRecord,
    deleteRecord,
    getRecords,
    getRecordById,
    getStats,
    searchRecords,
    getSettings,
    updateSettings,
    createBackup,
    restoreBackup,
    exportData,
    cleanupOldData,
    addNotification
};
