/**
 * نظام المصادقة وإدارة المستخدمين
 */

/**
 * التحقق من مصادقة المستخدم
 */
async function checkAuth() {
    try {
        const token = localStorage.getItem('auth_token');
        const userData = localStorage.getItem('user_data');
        
        if (!token || !userData) {
            return false;
        }
        
        // التحقق من صلاحية التوكن
        const isValid = await validateToken(token);
        if (!isValid) {
            clearAuth();
            return false;
        }
        
        return true;
    } catch (error) {
        console.error('خطأ في التحقق من المصادقة:', error);
        clearAuth();
        return false;
    }
}

/**
 * تسجيل الدخول
 */
async function login(username, password) {
    try {
        showLoading();
        
        // البحث عن المستخدم
        const users = await database.getRecords('users');
        const user = users.find(u => 
            u.username === username && u.password === password && u.status === 'active'
        );
        
        if (!user) {
            throw new Error('اسم المستخدم أو كلمة المرور غير صحيحة');
        }
        
        // إنشاء توكن
        const token = generateToken(user);
        
        // حفظ بيانات الجلسة
        localStorage.setItem('auth_token', token);
        localStorage.setItem('user_data', JSON.stringify({
            id: user.id,
            name: user.name,
            username: user.username,
            role: user.role,
            email: user.email
        }));
        
        // تسجيل النشاط
        await logActivity(user.id, 'login', 'تسجيل دخول');
        
        return {
            success: true,
            user: {
                id: user.id,
                name: user.name,
                role: user.role,
                email: user.email
            }
        };
        
    } catch (error) {
        console.error('خطأ في تسجيل الدخول:', error);
        throw error;
    } finally {
        hideLoading();
    }
}

/**
 * تسجيل الخروج
 */
async function logoutUser() {
    try {
        const userData = JSON.parse(localStorage.getItem('user_data') || '{}');
        
        if (userData.id) {
            await logActivity(userData.id, 'logout', 'تسجيل خروج');
        }
        
        clearAuth();
        return true;
    } catch (error) {
        console.error('خطأ في تسجيل الخروج:', error);
        throw error;
    }
}

/**
 * التحقق من صلاحية التوكن
 */
async function validateToken(token) {
    // محاكاة التحقق من التوكن
    return new Promise(resolve => {
        setTimeout(() => {
            // في تطبيق حقيقي، هنا سيتم التحقق من الخادم
            resolve(true);
        }, 100);
    });
}

/**
 * توليد توكن
 */
function generateToken(user) {
    const payload = {
        userId: user.id,
        username: user.username,
        role: user.role,
        timestamp: Date.now()
    };
    
    // في تطبيق حقيقي، هنا سيتم توقيع التوكن
    return btoa(JSON.stringify(payload));
}

/**
 * مسح بيانات المصادقة
 */
function clearAuth() {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user_data');
}

/**
 * تسجيل نشاط
 */
async function logActivity(userId, action, description) {
    try {
        await database.addRecord('activities', {
            user_id: userId,
            action: action,
            description: description,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error('خطأ في تسجيل النشاط:', error);
    }
}

/**
 * التحقق من الصلاحيات
 */
function checkPermission(requiredRole, userRole = null) {
    if (!userRole) {
        const userData = JSON.parse(localStorage.getItem('user_data') || '{}');
        userRole = userData.role;
    }
    
    const roleHierarchy = {
        'admin': ['admin', 'doctor', 'receptionist', 'pharmacist'],
        'doctor': ['doctor', 'receptionist'],
        'receptionist': ['receptionist'],
        'pharmacist': ['pharmacist']
    };
    
    const allowedRoles = roleHierarchy[requiredRole] || [];
    return allowedRoles.includes(userRole);
}

/**
 * تحديث كلمة المرور
 */
async function updatePassword(currentPassword, newPassword) {
    try {
        const userData = JSON.parse(localStorage.getItem('user_data') || '{}');
        const users = await database.getRecords('users');
        const user = users.find(u => u.id === userData.id);
        
        if (!user) {
            throw new Error('المستخدم غير موجود');
        }
        
        if (user.password !== currentPassword) {
            throw new Error('كلمة المرور الحالية غير صحيحة');
        }
        
        await database.updateRecord('users', user.id, {
            password: newPassword,
            updated_at: new Date().toISOString()
        });
        
        await logActivity(user.id, 'password_change', 'تغيير كلمة المرور');
        
        return true;
    } catch (error) {
        console.error('خطأ في تحديث كلمة المرور:', error);
        throw error;
    }
}

/**
 * استعادة كلمة المرور
 */
async function resetPassword(email) {
    try {
        const users = await database.getRecords('users');
        const user = users.find(u => u.email === email);
        
        if (!user) {
            throw new Error('البريد الإلكتروني غير مسجل');
        }
        
        // في تطبيق حقيقي، هنا سيتم إرسال بريد إلكتروني
        const resetToken = generateResetToken(user);
        
        // تسجيل طلب استعادة
        await database.addRecord('password_resets', {
            user_id: user.id,
            token: resetToken,
            expires_at: new Date(Date.now() + 3600000).toISOString(), // ساعة واحدة
            used: false
        });
        
        return {
            success: true,
            message: 'تم إرسال رابط استعادة كلمة المرور إلى بريدك الإلكتروني'
        };
    } catch (error) {
        console.error('خطأ في استعادة كلمة المرور:', error);
        throw error;
    }
}

/**
 * توليد توكن استعادة
 */
function generateResetToken(user) {
    const payload = {
        userId: user.id,
        email: user.email,
        timestamp: Date.now()
    };
    
    return btoa(JSON.stringify(payload));
}

/**
 * التحقق من توكن الاستعادة
 */
async function verifyResetToken(token) {
    try {
        const resets = await database.getRecords('password_resets');
        const reset = resets.find(r => r.token === token && !r.used);
        
        if (!reset) {
            throw new Error('الرابط غير صالح أو منتهي الصلاحية');
        }
        
        const expiresAt = new Date(reset.expires_at);
        if (expiresAt < new Date()) {
            throw new Error('الرابط منتهي الصلاحية');
        }
        
        return reset.user_id;
    } catch (error) {
        console.error('خطأ في التحقق من التوكن:', error);
        throw error;
    }
}

/**
 * تحديث كلمة المرور بواسطة توكن الاستعادة
 */
async function updatePasswordWithToken(token, newPassword) {
    try {
        const userId = await verifyResetToken(token);
        
        await database.updateRecord('users', userId, {
            password: newPassword,
            updated_at: new Date().toISOString()
        });
        
        // تحديث حالة التوكن
        const resets = await database.getRecords('password_resets');
        const reset = resets.find(r => r.token === token);
        if (reset) {
            await database.updateRecord('password_resets', reset.id, {
                used: true,
                updated_at: new Date().toISOString()
            });
        }
        
        await logActivity(userId, 'password_reset', 'استعادة كلمة المرور');
        
        return true;
    } catch (error) {
        console.error('خطأ في تحديث كلمة المرور:', error);
        throw error;
    }
}

/**
 * الحصول على بيانات المستخدم الحالي
 */
function getCurrentUser() {
    try {
        const userData = localStorage.getItem('user_data');
        return userData ? JSON.parse(userData) : null;
    } catch (error) {
        console.error('خطأ في الحصول على بيانات المستخدم:', error);
        return null;
    }
}

/**
 * تحديث بيانات المستخدم
 */
async function updateUserProfile(data) {
    try {
        const userData = getCurrentUser();
        if (!userData) {
            throw new Error('المستخدم غير مسجل الدخول');
        }
        
        await database.updateRecord('users', userData.id, {
            ...data,
            updated_at: new Date().toISOString()
        });
        
        // تحديث بيانات الجلسة
        const updatedUser = await database.getRecordById('users', userData.id);
        localStorage.setItem('user_data', JSON.stringify({
            id: updatedUser.id,
            name: updatedUser.name,
            username: updatedUser.username,
            role: updatedUser.role,
            email: updatedUser.email
        }));
        
        await logActivity(userData.id, 'profile_update', 'تحديث الملف الشخصي');
        
        return updatedUser;
    } catch (error) {
        console.error('خطأ في تحديث الملف الشخصي:', error);
        throw error;
    }
}

/**
 * إضافة مستخدم جديد
 */
async function addUser(userData) {
    try {
        const currentUser = getCurrentUser();
        
        // التحقق من الصلاحيات
        if (!checkPermission('admin', currentUser.role)) {
            throw new Error('ليس لديك صلاحية إضافة مستخدمين');
        }
        
        // التحقق من وجود المستخدم
        const users = await database.getRecords('users');
        const existingUser = users.find(u => u.username === userData.username);
        
        if (existingUser) {
            throw new Error('اسم المستخدم موجود مسبقاً');
        }
        
        const newUser = await database.addRecord('users', {
            ...userData,
            status: 'active',
            created_by: currentUser.id
        });
        
        await logActivity(currentUser.id, 'user_add', `إضافة مستخدم جديد: ${newUser.name}`);
        
        return newUser;
    } catch (error) {
        console.error('خطأ في إضافة المستخدم:', error);
        throw error;
    }
}

/**
 * تحديث مستخدم
 */
async function updateUser(userId, userData) {
    try {
        const currentUser = getCurrentUser();
        
        // التحقق من الصلاحيات
        if (!checkPermission('admin', currentUser.role)) {
            throw new Error('ليس لديك صلاحية تحديث المستخدمين');
        }
        
        await database.updateRecord('users', userId, userData);
        
        await logActivity(currentUser.id, 'user_update', `تحديث مستخدم: ${userId}`);
        
        return true;
    } catch (error) {
        console.error('خطأ في تحديث المستخدم:', error);
        throw error;
    }
}

/**
 * حذف مستخدم
 */
async function deleteUser(userId) {
    try {
        const currentUser = getCurrentUser();
        
        // التحقق من الصلاحيات
        if (!checkPermission('admin', currentUser.role)) {
            throw new Error('ليس لديك صلاحية حذف المستخدمين');
        }
        
        // منع حذف المستخدم الحالي
        if (userId === currentUser.id) {
            throw new Error('لا يمكن حذف حسابك الشخصي');
        }
        
        await database.deleteRecord('users', userId);
        
        await logActivity(currentUser.id, 'user_delete', `حذف مستخدم: ${userId}`);
        
        return true;
    } catch (error) {
        console.error('خطأ في حذف المستخدم:', error);
        throw error;
    }
}

/**
 * الحصول على قائمة المستخدمين
 */
async function getUsers(filters = {}) {
    try {
        const currentUser = getCurrentUser();
        
        // التحقق من الصلاحيات
        if (!checkPermission('admin', currentUser.role)) {
            throw new Error('ليس لديك صلاحية عرض المستخدمين');
        }
        
        return await database.getRecords('users', filters);
    } catch (error) {
        console.error('خطأ في الحصول على المستخدمين:', error);
        throw error;
    }
}

// تصدير الدوال
window.auth = {
    checkAuth,
    login,
    logoutUser,
    checkPermission,
    updatePassword,
    resetPassword,
    verifyResetToken,
    updatePasswordWithToken,
    getCurrentUser,
    updateUserProfile,
    addUser,
    updateUser,
    deleteUser,
    getUsers
};
