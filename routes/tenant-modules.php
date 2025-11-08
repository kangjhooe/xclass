<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Tenant\StudentController;
use App\Http\Controllers\Tenant\TeacherController;
use App\Http\Controllers\Tenant\ClassController;
use App\Http\Controllers\Tenant\SubjectController;
use App\Http\Controllers\Tenant\ScheduleController;
use App\Http\Controllers\Tenant\AttendanceController;
use App\Http\Controllers\Tenant\GradeController;
use App\Http\Controllers\Tenant\PpdbController;
use App\Http\Controllers\Tenant\SppController;
use App\Http\Controllers\Tenant\LibraryController;
use App\Http\Controllers\Tenant\InventoryController;
use App\Http\Controllers\Tenant\ExamController;
use App\Http\Controllers\Tenant\ExtracurricularController;
use App\Http\Controllers\Tenant\ParentPortalController;
use App\Http\Controllers\Tenant\CounselingController;
use App\Http\Controllers\Tenant\DisciplineController;
use App\Http\Controllers\Tenant\GraduationController;
use App\Http\Controllers\Tenant\EventController;
use App\Http\Controllers\Tenant\HealthController;
use App\Http\Controllers\Tenant\TransportationController;
use App\Http\Controllers\Tenant\CorrespondenceController;
use App\Http\Controllers\Tenant\AcademicController;
use App\Http\Controllers\Tenant\FinanceController;
use App\Http\Controllers\Tenant\HrController;
use App\Http\Controllers\Tenant\FacilityController;
use App\Http\Controllers\Tenant\ReportController;
use App\Http\Controllers\Tenant\CafeteriaController;
use App\Http\Controllers\Tenant\DataPokokController;
use App\Http\Controllers\Tenant\NonTeachingStaffController;
use App\Http\Controllers\Tenant\MutasiSiswaController;
use App\Http\Controllers\Tenant\AlumniController;
use App\Http\Controllers\Tenant\TeacherSupervisionController;
use App\Http\Controllers\Tenant\SuperAdminAccessController;

/*
|--------------------------------------------------------------------------
| Tenant Module Routes with Access Control
|--------------------------------------------------------------------------
|
| Routes untuk modul-modul tenant dengan kontrol akses
| Setiap route dilindungi oleh middleware TenantAccessMiddleware
|
*/

Route::prefix('{tenant}')->name('tenant.')->middleware(['web', 'auth', 'tenant', 'tenant.model.binding'])->group(function () {
    
    // Core Module Routes - Student Management
    Route::middleware('tenant.access:module,students')->group(function () {
        Route::prefix('students')->name('students.')->group(function () {
            Route::get('/', [StudentController::class, 'index'])->name('index');
            Route::get('/create', [StudentController::class, 'create'])->name('create');
            Route::post('/', [StudentController::class, 'store'])->name('store');
            
            // Import/Export routes - Protected by rate limiting
            Route::middleware('rate.limit.import.export:10,60')->group(function () {
                Route::get('/import/form', [StudentController::class, 'importForm'])->name('import.form');
                Route::post('/import', [StudentController::class, 'import'])->name('import');
                Route::get('/export', [StudentController::class, 'export'])->name('export');
                Route::get('/template/download', [StudentController::class, 'downloadTemplate'])->name('template.download');
            });
            
            Route::get('/{student}', [StudentController::class, 'show'])->name('show');
            Route::get('/{student}/edit', [StudentController::class, 'edit'])->name('edit');
            Route::put('/{student}', [StudentController::class, 'update'])->name('update');
            Route::delete('/{student}', [StudentController::class, 'destroy'])->name('destroy');
            Route::get('/{student}/grades', [StudentController::class, 'grades'])->name('grades');
            Route::get('/{student}/attendance', [StudentController::class, 'attendance'])->name('attendance');
        });
    });

    // Core Module Routes - Teacher Management
    Route::middleware('tenant.access:module,teachers')->group(function () {
        Route::prefix('teachers')->name('teachers.')->group(function () {
            Route::get('/', [TeacherController::class, 'index'])->name('index');
            Route::get('/create', [TeacherController::class, 'create'])->name('create');
            Route::post('/', [TeacherController::class, 'store'])->name('store');
            Route::get('/{teacher}', [TeacherController::class, 'show'])->name('show');
            Route::get('/{teacher}/edit', [TeacherController::class, 'edit'])->name('edit');
            Route::put('/{teacher}', [TeacherController::class, 'update'])->name('update');
            Route::delete('/{teacher}', [TeacherController::class, 'destroy'])->name('destroy');
            Route::get('/{teacher}/schedules', [TeacherController::class, 'schedules'])->name('schedules');
            Route::get('/{teacher}/classes', [TeacherController::class, 'classes'])->name('classes');
            Route::get('/{teacher}/export-credentials-pdf', [TeacherController::class, 'exportCredentialsPdf'])->name('export-credentials-pdf');
            Route::get('/{teacher}/export-credentials-excel', [TeacherController::class, 'exportCredentialsExcel'])->name('export-credentials-excel');
            Route::get('/{teacher}/progress', [TeacherController::class, 'getProgress'])->name('progress');
        });
    });

    // Teacher Supervision Module - Protected by module access
    Route::middleware('tenant.access:module,teachers')->group(function () {
        Route::prefix('teacher-supervisions')->name('teacher-supervisions.')->group(function () {
            Route::get('/', [TeacherSupervisionController::class, 'index'])->name('index');
            Route::get('/create', [TeacherSupervisionController::class, 'create'])->name('create');
            Route::post('/', [TeacherSupervisionController::class, 'store'])->name('store');
            Route::get('/{teacher_supervision}', [TeacherSupervisionController::class, 'show'])->name('show');
            Route::get('/{teacher_supervision}/edit', [TeacherSupervisionController::class, 'edit'])->name('edit');
            Route::put('/{teacher_supervision}', [TeacherSupervisionController::class, 'update'])->name('update');
            Route::delete('/{teacher_supervision}', [TeacherSupervisionController::class, 'destroy'])->name('destroy');
            Route::post('/{teacher_supervision}/confirm', [TeacherSupervisionController::class, 'confirm'])->name('confirm');
            Route::post('/{teacher_supervision}/response', [TeacherSupervisionController::class, 'addResponse'])->name('response');
        });
    });

    // Core Module Routes - Class Management
    Route::middleware('tenant.access:module,classes')->group(function () {
        Route::prefix('classes')->name('classes.')->group(function () {
            Route::get('/', [ClassController::class, 'index'])->name('index');
            Route::get('/create', [ClassController::class, 'create'])->name('create');
            Route::post('/', [ClassController::class, 'store'])->name('store');
            Route::get('/{class}', [ClassController::class, 'show'])->name('show');
            Route::get('/{class}/edit', [ClassController::class, 'edit'])->name('edit');
            Route::put('/{class}', [ClassController::class, 'update'])->name('update');
            Route::delete('/{class}', [ClassController::class, 'destroy'])->name('destroy');
            Route::get('/{class}/students', [ClassController::class, 'students'])->name('students');
            Route::get('/{class}/schedules', [ClassController::class, 'schedules'])->name('schedules');
            Route::post('/{class}/add-students', [ClassController::class, 'addStudents'])->name('add-students');
            Route::post('/{class}/set-homeroom-teacher', [ClassController::class, 'setHomeroomTeacher'])->name('set-homeroom-teacher');
            Route::get('/{class}/available-students', [ClassController::class, 'getAvailableStudents'])->name('available-students');
        });
    });

    // Core Module Routes - Subject Management
    Route::middleware('tenant.access:module,subjects')->group(function () {
        Route::prefix('subjects')->name('subjects.')->group(function () {
            Route::get('/', [SubjectController::class, 'index'])->name('index');
            Route::get('/create', [SubjectController::class, 'create'])->name('create');
            Route::post('/', [SubjectController::class, 'store'])->name('store');
            Route::get('/{subject}', [SubjectController::class, 'show'])->name('show');
            Route::get('/{subject}/edit', [SubjectController::class, 'edit'])->name('edit');
            Route::put('/{subject}', [SubjectController::class, 'update'])->name('update');
            Route::delete('/{subject}', [SubjectController::class, 'destroy'])->name('destroy');
            Route::get('/{subject}/teachers', [SubjectController::class, 'teachers'])->name('teachers');
        });
    });

    // Core Module Routes - Schedule Management
    Route::middleware('tenant.access:module,schedules')->group(function () {
        Route::prefix('schedules')->name('schedules.')->group(function () {
            Route::get('/', [ScheduleController::class, 'index'])->name('index');
            Route::get('/create', [ScheduleController::class, 'create'])->name('create');
            Route::post('/', [ScheduleController::class, 'store'])->name('store');
            Route::get('/{schedule}', [ScheduleController::class, 'show'])->name('show');
            Route::get('/{schedule}/edit', [ScheduleController::class, 'edit'])->name('edit');
            Route::put('/{schedule}', [ScheduleController::class, 'update'])->name('update');
            Route::delete('/{schedule}', [ScheduleController::class, 'destroy'])->name('destroy');
            Route::get('/weekly', [ScheduleController::class, 'weekly'])->name('weekly');
        });
    });

    // Core Module Routes - Attendance Management
    Route::middleware('tenant.access:module,attendance')->group(function () {
        Route::prefix('attendance')->name('attendance.')->group(function () {
            Route::get('/', [AttendanceController::class, 'index'])->name('index');
            Route::get('/create', [AttendanceController::class, 'create'])->name('create');
            Route::post('/', [AttendanceController::class, 'store'])->name('store');
            Route::get('/{attendance}', [AttendanceController::class, 'show'])->name('show');
            Route::get('/{attendance}/edit', [AttendanceController::class, 'edit'])->name('edit');
            Route::put('/{attendance}', [AttendanceController::class, 'update'])->name('update');
            Route::delete('/{attendance}', [AttendanceController::class, 'destroy'])->name('destroy');
            Route::get('/summary', [AttendanceController::class, 'summary'])->name('summary');
        });
    });

    // Core Module Routes - Grade Management
    Route::middleware('tenant.access:module,grades')->group(function () {
        Route::prefix('grades')->name('grades.')->group(function () {
            Route::get('/', [GradeController::class, 'index'])->name('index');
            Route::get('/create', [GradeController::class, 'create'])->name('create');
            Route::post('/', [GradeController::class, 'store'])->name('store');
            Route::get('/{grade}', [GradeController::class, 'show'])->name('show');
            Route::get('/{grade}/edit', [GradeController::class, 'edit'])->name('edit');
            Route::put('/{grade}', [GradeController::class, 'update'])->name('update');
            Route::delete('/{grade}', [GradeController::class, 'destroy'])->name('destroy');
            Route::get('/report', [GradeController::class, 'report'])->name('report');
        });
    });

    // Data Pokok Module - Protected by module access
    Route::middleware('tenant.access:module,data_pokok')->group(function () {
        Route::prefix('data-pokok')->name('data-pokok.')->group(function () {
            Route::get('/', [DataPokokController::class, 'index'])->name('index');
            Route::get('/export', [DataPokokController::class, 'export'])->name('export');
            Route::get('/search', [DataPokokController::class, 'search'])->name('search');
            
            // Activity Logs for Data Pokok
            Route::prefix('activity-logs')->name('activity-logs.')->group(function () {
                Route::get('/', [\App\Http\Controllers\Tenant\ActivityLogController::class, 'index'])->name('index');
                Route::get('/export', [\App\Http\Controllers\Tenant\ActivityLogController::class, 'export'])->name('export');
                Route::get('/recent', [\App\Http\Controllers\Tenant\ActivityLogController::class, 'recent'])->name('recent');
                Route::get('/statistics', [\App\Http\Controllers\Tenant\ActivityLogController::class, 'statistics'])->name('statistics');
                Route::post('/clean', [\App\Http\Controllers\Tenant\ActivityLogController::class, 'clean'])->name('clean');
            });
            
            // Non-Teaching Staff Management - Protected by permissions
            Route::middleware('tenant.access:permission,data_pokok:create')->group(function () {
                Route::get('/non-teaching-staff/create', [NonTeachingStaffController::class, 'create'])->name('non-teaching-staff.create');
                Route::post('/non-teaching-staff', [NonTeachingStaffController::class, 'store'])->name('non-teaching-staff.store');
            });
            
            Route::middleware('tenant.access:permission,data_pokok:read')->group(function () {
                Route::get('/non-teaching-staff', [NonTeachingStaffController::class, 'index'])->name('non-teaching-staff.index');
                Route::get('/non-teaching-staff/{nonTeachingStaff}', [NonTeachingStaffController::class, 'show'])->name('non-teaching-staff.show');
            });
            
            Route::middleware('tenant.access:permission,data_pokok:update')->group(function () {
                Route::get('/non-teaching-staff/{nonTeachingStaff}/edit', [NonTeachingStaffController::class, 'edit'])->name('non-teaching-staff.edit');
                Route::put('/non-teaching-staff/{nonTeachingStaff}', [NonTeachingStaffController::class, 'update'])->name('non-teaching-staff.update');
            });
            
            Route::middleware('tenant.access:permission,data_pokok:delete')->group(function () {
                Route::delete('/non-teaching-staff/{nonTeachingStaff}', [NonTeachingStaffController::class, 'destroy'])->name('non-teaching-staff.destroy');
            });
            
            Route::middleware('tenant.access:permission,data_pokok:export')->group(function () {
                Route::get('/non-teaching-staff/{nonTeachingStaff}/export', [NonTeachingStaffController::class, 'export'])->name('non-teaching-staff.export');
            });
            
            // Mutasi Siswa Management - Protected by permissions
            Route::middleware('tenant.access:permission,data_pokok:mutasi')->group(function () {
                Route::prefix('mutasi-siswa')->name('mutasi-siswa.')->group(function () {
                    Route::get('/', [MutasiSiswaController::class, 'index'])->name('index');
                    Route::get('/create', [MutasiSiswaController::class, 'create'])->name('create');
                    Route::post('/', [MutasiSiswaController::class, 'store'])->name('store');
                    Route::get('/{id}', [MutasiSiswaController::class, 'show'])->name('show');
                    Route::post('/{id}/approve', [MutasiSiswaController::class, 'approve'])->name('approve');
                    Route::post('/{id}/reject', [MutasiSiswaController::class, 'reject'])->name('reject');
                    Route::post('/{id}/complete', [MutasiSiswaController::class, 'complete'])->name('complete');
                    Route::post('/{id}/cancel', [MutasiSiswaController::class, 'cancel'])->name('cancel');
                    Route::get('/api/pending-approvals', [MutasiSiswaController::class, 'pendingApprovals'])->name('api.pending-approvals');
                    Route::get('/api/statistics', [MutasiSiswaController::class, 'statistics'])->name('api.statistics');
                    Route::get('/api/destinations', [MutasiSiswaController::class, 'destinations'])->name('api.destinations');
                });
            });
        });
    });
    
    // PPDB Module - Protected by module access
    // Note: PPDB routes are already defined in tenant.php with proper middleware

    // SPP Module - Protected by module access
    Route::middleware('tenant.access:module,spp')->group(function () {
        Route::prefix('spp')->name('spp.')->group(function () {
            Route::get('/', [SppController::class, 'index'])->name('index');
            Route::get('/create', [SppController::class, 'create'])->name('create');
            Route::post('/', [SppController::class, 'store'])->name('store');
            Route::get('/{spp}', [SppController::class, 'show'])->name('show');
            Route::get('/{spp}/edit', [SppController::class, 'edit'])->name('edit');
            Route::put('/{spp}', [SppController::class, 'update'])->name('update');
            Route::delete('/{spp}', [SppController::class, 'destroy'])->name('destroy');
            
            // Payment routes
            Route::prefix('payments')->name('payments.')->group(function () {
                Route::get('/create', [SppController::class, 'createPayment'])->name('create');
                Route::post('/', [SppController::class, 'storePayment'])->name('store');
                Route::get('/{payment}', [SppController::class, 'showPayment'])->name('show');
                Route::get('/{payment}/invoice', [SppController::class, 'generateInvoice'])->name('invoice');
            });
            
            // Payment history
            Route::get('/students/{student}/history', [SppController::class, 'paymentHistory'])->name('payment-history');
            
            // Bulk operations
            Route::post('/bulk-create', [SppController::class, 'bulkCreate'])->name('bulk-create');
            Route::post('/send-reminder', [SppController::class, 'sendReminder'])->name('send-reminder');
            Route::get('/export-report', [SppController::class, 'exportReport'])->name('export-report');
        });
    });

    // Library Module - Protected by module access
    Route::middleware('tenant.access:module,library')->group(function () {
        Route::prefix('library')->name('library.')->group(function () {
            Route::get('/', [LibraryController::class, 'index'])->name('index');
            Route::get('/statistics', [LibraryController::class, 'statistics'])->name('statistics');
            
            // Books routes
            Route::get('/books', [LibraryController::class, 'books'])->name('books');
            Route::get('/books/create', [LibraryController::class, 'createBook'])->name('create-book');
            Route::post('/books', [LibraryController::class, 'storeBook'])->name('store-book');
            Route::get('/books/{id}', [LibraryController::class, 'showBook'])->name('show-book');
            Route::get('/books/{id}/edit', [LibraryController::class, 'editBook'])->name('edit-book');
            Route::put('/books/{id}', [LibraryController::class, 'updateBook'])->name('update-book');
            Route::delete('/books/{id}', [LibraryController::class, 'destroyBook'])->name('destroy-book');
            
            // Loans routes
            Route::get('/loans', [LibraryController::class, 'loans'])->name('loans');
            Route::get('/loans/create', [LibraryController::class, 'createLoan'])->name('create-loan');
            Route::post('/loans', [LibraryController::class, 'storeLoan'])->name('store-loan');
            Route::get('/loans/{id}', [LibraryController::class, 'showLoan'])->name('show-loan');
            Route::get('/loans/{id}/edit', [LibraryController::class, 'editLoan'])->name('edit-loan');
            Route::put('/loans/{id}', [LibraryController::class, 'updateLoan'])->name('update-loan');
            Route::post('/loans/{id}/return', [LibraryController::class, 'returnBook'])->name('return-book');
            Route::post('/loans/{id}/mark-lost', [LibraryController::class, 'markAsLost'])->name('mark-lost');
            Route::post('/loans/{id}/mark-damaged', [LibraryController::class, 'markAsDamaged'])->name('mark-damaged');
        });
    });

    // Inventory Module - Protected by module access
    Route::middleware('tenant.access:module,inventory')->group(function () {
        Route::prefix('inventory')->name('inventory.')->group(function () {
            Route::get('/', [InventoryController::class, 'index'])->name('index');
            Route::get('/items', [InventoryController::class, 'items'])->name('items');
            Route::get('/movements', [InventoryController::class, 'movements'])->name('movements');
            
            // Item Management - Protected by permissions
            Route::middleware('tenant.access:permission,inventory:create')->group(function () {
                Route::get('/items/create', [InventoryController::class, 'createItem'])->name('items.create');
                Route::post('/items', [InventoryController::class, 'storeItem'])->name('items.store');
            });
            
            Route::middleware('tenant.access:permission,inventory:update')->group(function () {
                Route::get('/items/{item}/edit', [InventoryController::class, 'editItem'])->name('items.edit');
                Route::put('/items/{item}', [InventoryController::class, 'updateItem'])->name('items.update');
            });
            
            Route::middleware('tenant.access:permission,inventory:delete')->group(function () {
                Route::delete('/items/{item}', [InventoryController::class, 'destroyItem'])->name('items.destroy');
            });
        });
    });

    // Exam Module - Enhanced with new features
    // Route alias untuk navigasi (tetap terdaftar meskipun tenant tidak punya akses)
    Route::prefix('exam')->name('exam.')->group(function () {
        Route::get('/exams', [\App\Http\Controllers\Tenant\ExamController::class, 'exams'])->name('exams');
        Route::get('/questions', [\App\Http\Controllers\Tenant\ExamController::class, 'questions'])->name('questions');
        Route::get('/attempts', [\App\Http\Controllers\Tenant\ExamAttemptController::class, 'index'])->name('attempts');
    });
    
    // Exam routes dengan access control
    // CATATAN: Exam dikelola sebagai FEATURE di /admin/tenant-features (bukan module)
    // Jika ingin membatasi akses exam, gunakan /admin/tenant-features/{tenant}
    Route::middleware('tenant.access:feature,exam')->group(function () {
        // Include enhanced exam routes
        require_once base_path('routes/tenant-exam-enhanced.php');
    });

    // E-Learning Module - Protected by module access
    Route::middleware('tenant.access:module,elearning')->group(function () {
        // Include E-Learning module routes
        require_once module_path('ELearning', '/routes/web.php');
    });

    // Extracurricular Module - Protected by module access
    Route::middleware('tenant.access:module,extracurricular')->group(function () {
        Route::prefix('extracurricular')->name('extracurricular.')->group(function () {
            Route::get('/', [ExtracurricularController::class, 'index'])->name('index');
            Route::get('/activities', [ExtracurricularController::class, 'activities'])->name('activities');
            Route::get('/participants', [ExtracurricularController::class, 'participants'])->name('participants');
            
            // Activity Management - Protected by permissions
            Route::middleware('tenant.access:permission,extracurricular:create')->group(function () {
                Route::get('/activities/create', [ExtracurricularController::class, 'createActivity'])->name('activities.create');
                Route::post('/activities', [ExtracurricularController::class, 'storeActivity'])->name('activities.store');
            });
            
            Route::middleware('tenant.access:permission,extracurricular:update')->group(function () {
                Route::get('/activities/{activity}/edit', [ExtracurricularController::class, 'editActivity'])->name('activities.edit');
                Route::put('/activities/{activity}', [ExtracurricularController::class, 'updateActivity'])->name('activities.update');
            });
            
            Route::middleware('tenant.access:permission,extracurricular:delete')->group(function () {
                Route::delete('/activities/{activity}', [ExtracurricularController::class, 'destroyActivity'])->name('activities.destroy');
            });
            
            // Participant Management - Protected by permissions
            Route::middleware('tenant.access:permission,extracurricular:update')->group(function () {
                Route::post('/activities/{activityId}/participants', [ExtracurricularController::class, 'addParticipant'])->name('activities.add-participant');
                Route::delete('/participants/{participantId}', [ExtracurricularController::class, 'removeParticipant'])->name('participants.remove');
            });
        });
    });

    // Parent Portal Module - Protected by module access
    Route::middleware('tenant.access:module,parent_portal')->group(function () {
        Route::prefix('parent-portal')->name('parent-portal.')->group(function () {
            Route::get('/', [ParentPortalController::class, 'index'])->name('index');
            
            // Parent Management - Protected by permissions
            Route::middleware('tenant.access:permission,parent_portal:create')->group(function () {
                Route::get('/parents/create', [ParentPortalController::class, 'createParent'])->name('parents.create');
                Route::post('/parents', [ParentPortalController::class, 'storeParent'])->name('parents.store');
            });
            
            Route::middleware('tenant.access:permission,parent_portal:update')->group(function () {
                Route::get('/parents/{parent}/edit', [ParentPortalController::class, 'editParent'])->name('parents.edit');
                Route::put('/parents/{parent}', [ParentPortalController::class, 'updateParent'])->name('parents.update');
            });
            
            // Notification Management - Protected by permissions
            Route::middleware('tenant.access:permission,parent_portal:read')->group(function () {
                Route::get('/notifications', [ParentPortalController::class, 'notifications'])->name('notifications');
                Route::post('/notifications/{id}/mark-read', [ParentPortalController::class, 'markNotificationAsRead'])->name('notifications.mark-read');
            });
            
            Route::middleware('tenant.access:permission,parent_portal:create')->group(function () {
                Route::post('/notifications', [ParentPortalController::class, 'sendNotification'])->name('notifications.send');
            });
            
            // Message Management - Protected by permissions
            Route::middleware('tenant.access:permission,parent_portal:read')->group(function () {
                Route::get('/messages', [ParentPortalController::class, 'messages'])->name('messages');
            });
            
            Route::middleware('tenant.access:permission,parent_portal:create')->group(function () {
                Route::post('/messages', [ParentPortalController::class, 'sendMessage'])->name('messages.send');
            });
        });
    });

    // Counseling Module - Protected by module access
    Route::middleware('tenant.access:module,counseling')->group(function () {
        Route::prefix('counseling')->name('counseling.')->group(function () {
            Route::get('/', [CounselingController::class, 'index'])->name('index');
            Route::get('/sessions', [CounselingController::class, 'sessions'])->name('sessions');
            Route::get('/students', [CounselingController::class, 'students'])->name('students');
            
            // Session Management - Protected by permissions
            Route::middleware('tenant.access:permission,counseling:create')->group(function () {
                Route::get('/sessions/create', [CounselingController::class, 'createSession'])->name('sessions.create');
                Route::post('/sessions', [CounselingController::class, 'storeSession'])->name('sessions.store');
            });
            
            Route::middleware('tenant.access:permission,counseling:update')->group(function () {
                Route::get('/sessions/{session}/edit', [CounselingController::class, 'editSession'])->name('sessions.edit');
                Route::put('/sessions/{session}', [CounselingController::class, 'updateSession'])->name('sessions.update');
                Route::post('/sessions/{session}/follow-up', [CounselingController::class, 'addFollowUp'])->name('sessions.follow-up');
            });
            
            Route::middleware('tenant.access:permission,counseling:delete')->group(function () {
                Route::delete('/sessions/{session}', [CounselingController::class, 'destroySession'])->name('sessions.destroy');
            });
            
            Route::get('/sessions/{student}/history', [CounselingController::class, 'getStudentHistory'])->name('sessions.history');
            
            // Calendar and appointment
            Route::get('/calendar', [CounselingController::class, 'calendar'])->name('calendar');
            Route::post('/check-availability', [CounselingController::class, 'checkAvailability'])->name('check-availability');
            
            // Session notes
            Route::post('/sessions/{session}/notes', [CounselingController::class, 'addSessionNotes'])->name('sessions.notes');
            
            // Follow-up tracking
            Route::get('/follow-up-tracking', [CounselingController::class, 'followUpTracking'])->name('follow-up-tracking');
            Route::post('/sessions/{session}/complete-follow-up', [CounselingController::class, 'completeFollowUp'])->name('sessions.complete-follow-up');
        });
    });

    // Discipline Module - Protected by module access
    Route::middleware('tenant.access:module,discipline')->group(function () {
        Route::prefix('discipline')->name('discipline.')->group(function () {
            Route::get('/', [DisciplineController::class, 'index'])->name('index');
            Route::get('/actions', [DisciplineController::class, 'actions'])->name('actions');
            
            // Action Management - Protected by permissions
            Route::middleware('tenant.access:permission,discipline:create')->group(function () {
                Route::get('/actions/create', [DisciplineController::class, 'createAction'])->name('actions.create');
                Route::post('/actions', [DisciplineController::class, 'storeAction'])->name('actions.store');
            });
            
            Route::middleware('tenant.access:permission,discipline:update')->group(function () {
                Route::get('/actions/{action}/edit', [DisciplineController::class, 'editAction'])->name('actions.edit');
                Route::put('/actions/{action}', [DisciplineController::class, 'updateAction'])->name('actions.update');
                Route::post('/actions/{action}/status', [DisciplineController::class, 'updateStatus'])->name('actions.status');
            });
            
            Route::middleware('tenant.access:permission,discipline:delete')->group(function () {
                Route::delete('/actions/{action}', [DisciplineController::class, 'destroyAction'])->name('actions.destroy');
            });
            
            Route::get('/actions/{student}/history', [DisciplineController::class, 'getStudentHistory'])->name('actions.history');
        });
    });

    // Graduation Module - Protected by module access
    Route::middleware('tenant.access:module,graduation')->group(function () {
        Route::prefix('graduation')->name('graduation.')->group(function () {
            Route::get('/', [GraduationController::class, 'index'])->name('index');
            Route::get('/graduates', [GraduationController::class, 'graduates'])->name('graduates');
            Route::get('/graduates/export', [GraduationController::class, 'exportGraduates'])->name('graduates.export');
            
            // Graduate Management - Protected by permissions
            Route::middleware('tenant.access:permission,graduation:create')->group(function () {
                Route::get('/graduates/create', [GraduationController::class, 'createGraduate'])->name('graduates.create');
                Route::post('/graduates', [GraduationController::class, 'storeGraduate'])->name('graduates.store');
            });
            
            Route::middleware('tenant.access:permission,graduation:update')->group(function () {
                Route::get('/graduates/{graduate}/edit', [GraduationController::class, 'editGraduate'])->name('graduates.edit');
                Route::put('/graduates/{graduate}', [GraduationController::class, 'updateGraduate'])->name('graduates.update');
            });
            
            Route::middleware('tenant.access:permission,graduation:delete')->group(function () {
                Route::delete('/graduates/{graduate}', [GraduationController::class, 'destroyGraduate'])->name('graduates.destroy');
            });
            
            // Certificate generation
            Route::get('/graduates/{graduate}/certificate', [GraduationController::class, 'generateCertificate'])->name('graduates.certificate');
        });
    });

    // Event Module - Protected by module access
    Route::middleware('tenant.access:module,events')->group(function () {
        Route::prefix('events')->name('events.')->group(function () {
            Route::get('/', [EventController::class, 'index'])->name('index');
            Route::get('/calendar', [EventController::class, 'calendar'])->name('calendar');
            
            // Event Management - Protected by permissions
            Route::middleware('tenant.access:permission,events:create')->group(function () {
                Route::get('/create', [EventController::class, 'create'])->name('create');
                Route::post('/', [EventController::class, 'store'])->name('store');
            });
            
            Route::middleware('tenant.access:permission,events:update')->group(function () {
                Route::get('/{event}/edit', [EventController::class, 'edit'])->name('edit');
                Route::put('/{event}', [EventController::class, 'update'])->name('update');
            });
            
            Route::middleware('tenant.access:permission,events:delete')->group(function () {
                Route::delete('/{event}', [EventController::class, 'destroy'])->name('destroy');
            });
        });
    });

    // Health Module - Protected by module access
    Route::middleware('tenant.access:module,health')->group(function () {
        Route::prefix('health')->name('health.')->group(function () {
            Route::get('/', [HealthController::class, 'index'])->name('index');
            
            // Record Management - Protected by permissions
            Route::middleware('tenant.access:permission,health:read')->group(function () {
                Route::get('/records', [HealthController::class, 'records'])->name('records');
                Route::get('/records/{id}', [HealthController::class, 'showRecord'])->name('records.show');
                Route::get('/records/student/{student}/history', [HealthController::class, 'getStudentHistory'])->name('records.student-history');
                Route::get('/records/export', [HealthController::class, 'exportRecords'])->name('records.export');
            });
            
            Route::middleware('tenant.access:permission,health:create')->group(function () {
                Route::get('/records/create', [HealthController::class, 'createRecord'])->name('records.create');
                Route::post('/records', [HealthController::class, 'storeRecord'])->name('records.store');
            });
            
            Route::middleware('tenant.access:permission,health:update')->group(function () {
                Route::get('/records/{id}/edit', [HealthController::class, 'editRecord'])->name('records.edit');
                Route::put('/records/{id}', [HealthController::class, 'updateRecord'])->name('records.update');
            });
            
            Route::middleware('tenant.access:permission,health:delete')->group(function () {
                Route::delete('/records/{id}', [HealthController::class, 'destroyRecord'])->name('records.destroy');
            });
        });
    });

    // Transportation Module - Protected by module access
    Route::middleware('tenant.access:module,transportation')->group(function () {
        Route::prefix('transportation')->name('transportation.')->group(function () {
            Route::get('/', [TransportationController::class, 'index'])->name('index');
            
            // Route Management - Protected by permissions
            Route::middleware('tenant.access:permission,transportation:read')->group(function () {
                Route::get('/routes', [TransportationController::class, 'routes'])->name('routes');
                Route::get('/routes/{id}', [TransportationController::class, 'showRoute'])->name('routes.show');
            });
            
            Route::middleware('tenant.access:permission,transportation:create')->group(function () {
                Route::get('/routes/create', [TransportationController::class, 'createRoute'])->name('routes.create');
                Route::post('/routes', [TransportationController::class, 'storeRoute'])->name('routes.store');
            });
            
            Route::middleware('tenant.access:permission,transportation:update')->group(function () {
                Route::get('/routes/{id}/edit', [TransportationController::class, 'editRoute'])->name('routes.edit');
                Route::put('/routes/{id}', [TransportationController::class, 'updateRoute'])->name('routes.update');
            });
            
            Route::middleware('tenant.access:permission,transportation:delete')->group(function () {
                Route::delete('/routes/{id}', [TransportationController::class, 'destroyRoute'])->name('routes.destroy');
            });
            
            // Schedule Management - Protected by permissions
            Route::middleware('tenant.access:permission,transportation:read')->group(function () {
                Route::get('/schedules', [TransportationController::class, 'schedules'])->name('schedules');
                Route::get('/schedules/{id}', [TransportationController::class, 'showSchedule'])->name('schedules.show');
            });
            
            Route::middleware('tenant.access:permission,transportation:create')->group(function () {
                Route::get('/schedules/create', [TransportationController::class, 'createSchedule'])->name('schedules.create');
                Route::post('/schedules', [TransportationController::class, 'storeSchedule'])->name('schedules.store');
            });
            
            Route::middleware('tenant.access:permission,transportation:update')->group(function () {
                Route::get('/schedules/{id}/edit', [TransportationController::class, 'editSchedule'])->name('schedules.edit');
                Route::put('/schedules/{id}', [TransportationController::class, 'updateSchedule'])->name('schedules.update');
            });
            
            Route::middleware('tenant.access:permission,transportation:delete')->group(function () {
                Route::delete('/schedules/{id}', [TransportationController::class, 'destroySchedule'])->name('schedules.destroy');
            });
        });
    });

    // Cafeteria Module - Protected by module access
    Route::middleware('tenant.access:module,cafeteria')->group(function () {
        Route::prefix('cafeteria')->name('cafeteria.')->group(function () {
            Route::get('/', [CafeteriaController::class, 'index'])->name('index');
            
            // Menu Management Routes
            Route::middleware('tenant.access:permission,cafeteria:read')->group(function () {
                Route::get('/menu', [CafeteriaController::class, 'menu'])->name('menu');
                Route::get('/menu/{id}', [CafeteriaController::class, 'showMenuItem'])->name('menu.show');
            });
            
            Route::middleware('tenant.access:permission,cafeteria:create')->group(function () {
                Route::get('/menu/create', [CafeteriaController::class, 'createMenuItem'])->name('menu.create');
                Route::post('/menu', [CafeteriaController::class, 'storeMenuItem'])->name('menu.store');
            });
            
            Route::middleware('tenant.access:permission,cafeteria:update')->group(function () {
                Route::get('/menu/{id}/edit', [CafeteriaController::class, 'editMenuItem'])->name('menu.edit');
                Route::put('/menu/{id}', [CafeteriaController::class, 'updateMenuItem'])->name('menu.update');
            });
            
            Route::middleware('tenant.access:permission,cafeteria:delete')->group(function () {
                Route::delete('/menu/{id}', [CafeteriaController::class, 'destroyMenuItem'])->name('menu.destroy');
            });
            
            // Orders Management Routes
            Route::middleware('tenant.access:permission,cafeteria:read')->group(function () {
                Route::get('/orders', [CafeteriaController::class, 'orders'])->name('orders');
                Route::get('/orders/{id}', [CafeteriaController::class, 'showOrder'])->name('orders.show');
            });
            
            Route::middleware('tenant.access:permission,cafeteria:create')->group(function () {
                Route::get('/orders/create', [CafeteriaController::class, 'createOrder'])->name('orders.create');
                Route::post('/orders', [CafeteriaController::class, 'storeOrder'])->name('orders.store');
            });
            
            Route::middleware('tenant.access:permission,cafeteria:update')->group(function () {
                Route::post('/orders/{id}/status', [CafeteriaController::class, 'updateOrderStatus'])->name('orders.update-status');
            });
            
            Route::middleware('tenant.access:permission,cafeteria:delete')->group(function () {
                Route::delete('/orders/{id}', [CafeteriaController::class, 'destroyOrder'])->name('orders.destroy');
            });
        });
    });

    // Alumni Module - Protected by module access
    Route::middleware('tenant.access:module,alumni')->group(function () {
        Route::prefix('alumni')->name('alumni.')->group(function () {
            Route::get('/', [AlumniController::class, 'index'])->name('index');
            Route::get('/statistics', [AlumniController::class, 'statistics'])->name('statistics');
            
            // Alumni Management - Protected by permissions
            Route::middleware('tenant.access:permission,alumni:create')->group(function () {
                Route::get('/create', [AlumniController::class, 'create'])->name('create');
                Route::post('/', [AlumniController::class, 'store'])->name('store');
            });
            
            Route::middleware('tenant.access:permission,alumni:read')->group(function () {
                Route::get('/{alumni}', [AlumniController::class, 'show'])->name('show');
            });
            
            Route::middleware('tenant.access:permission,alumni:update')->group(function () {
                Route::get('/{alumni}/edit', [AlumniController::class, 'edit'])->name('edit');
                Route::put('/{alumni}', [AlumniController::class, 'update'])->name('update');
                Route::post('/{alumni}/status', [AlumniController::class, 'updateStatus'])->name('update-status');
                Route::post('/{alumni}/toggle-active', [AlumniController::class, 'toggleActive'])->name('toggle-active');
            });
            
            Route::middleware('tenant.access:permission,alumni:delete')->group(function () {
                Route::delete('/{alumni}', [AlumniController::class, 'destroy'])->name('destroy');
            });
        });
    });

    // Correspondence Module - Protected by module access
    Route::middleware('tenant.access:module,correspondence')->group(function () {
        Route::prefix('correspondence')->name('correspondence.')->group(function () {
            Route::get('/', [CorrespondenceController::class, 'index'])->name('index');
            Route::get('/api/new-letters', [CorrespondenceController::class, 'apiNewLetters'])->name('api.new-letters');
            
            // Incoming Letters Routes
            Route::middleware('tenant.access:permission,correspondence:read')->group(function () {
                Route::get('/incoming', [CorrespondenceController::class, 'incoming'])->name('incoming');
                Route::get('/incoming/{id}', [CorrespondenceController::class, 'showIncoming'])->name('incoming.show');
            });
            
            Route::middleware('tenant.access:permission,correspondence:create')->group(function () {
                Route::get('/incoming/create', [CorrespondenceController::class, 'createIncoming'])->name('incoming.create');
                Route::post('/incoming', [CorrespondenceController::class, 'storeIncoming'])->name('incoming.store');
            });
            
            Route::middleware('tenant.access:permission,correspondence:update')->group(function () {
                Route::get('/incoming/{id}/edit', [CorrespondenceController::class, 'editIncoming'])->name('incoming.edit');
                Route::put('/incoming/{id}', [CorrespondenceController::class, 'updateIncoming'])->name('incoming.update');
            });
            
            Route::middleware('tenant.access:permission,correspondence:delete')->group(function () {
                Route::delete('/incoming/{id}', [CorrespondenceController::class, 'destroyIncoming'])->name('incoming.destroy');
            });
            
            // Outgoing Letters Routes
            Route::middleware('tenant.access:permission,correspondence:read')->group(function () {
                Route::get('/outgoing', [CorrespondenceController::class, 'outgoing'])->name('outgoing');
                Route::get('/outgoing/{id}', [CorrespondenceController::class, 'showOutgoing'])->name('outgoing.show');
            });
            
            Route::middleware('tenant.access:permission,correspondence:create')->group(function () {
                Route::get('/outgoing/create', [CorrespondenceController::class, 'createOutgoing'])->name('outgoing.create');
                Route::post('/outgoing', [CorrespondenceController::class, 'storeOutgoing'])->name('outgoing.store');
            });
            
            Route::middleware('tenant.access:permission,correspondence:update')->group(function () {
                Route::get('/outgoing/{id}/edit', [CorrespondenceController::class, 'editOutgoing'])->name('outgoing.edit');
                Route::put('/outgoing/{id}', [CorrespondenceController::class, 'updateOutgoing'])->name('outgoing.update');
            });
            
            Route::middleware('tenant.access:permission,correspondence:delete')->group(function () {
                Route::delete('/outgoing/{id}', [CorrespondenceController::class, 'destroyOutgoing'])->name('outgoing.destroy');
            });
        });
    });

    // Academic Module - Protected by module access
    Route::middleware('tenant.access:module,academic')->group(function () {
        Route::prefix('academic')->name('academic.')->group(function () {
            Route::get('/', [AcademicController::class, 'index'])->name('index');
            
            // Curriculum Management - Protected by permissions
            Route::middleware('tenant.access:permission,academic:read')->group(function () {
                Route::get('/curriculum', [AcademicController::class, 'curriculum'])->name('curriculum');
                Route::get('/curriculum/{id}', [AcademicController::class, 'showCurriculum'])->name('curriculum.show');
            });
            
            Route::middleware('tenant.access:permission,academic:create')->group(function () {
                Route::get('/curriculum/create', [AcademicController::class, 'createCurriculum'])->name('curriculum.create');
                Route::post('/curriculum', [AcademicController::class, 'storeCurriculum'])->name('curriculum.store');
            });
            
            Route::middleware('tenant.access:permission,academic:update')->group(function () {
                Route::get('/curriculum/{id}/edit', [AcademicController::class, 'editCurriculum'])->name('curriculum.edit');
                Route::put('/curriculum/{id}', [AcademicController::class, 'updateCurriculum'])->name('curriculum.update');
            });
            
            Route::middleware('tenant.access:permission,academic:delete')->group(function () {
                Route::delete('/curriculum/{id}', [AcademicController::class, 'destroyCurriculum'])->name('curriculum.destroy');
            });
            
            // Syllabus Management - Protected by permissions
            Route::middleware('tenant.access:permission,academic:read')->group(function () {
                Route::get('/syllabus', [AcademicController::class, 'syllabus'])->name('syllabus');
                Route::get('/syllabus/{id}', [AcademicController::class, 'showSyllabus'])->name('syllabus.show');
            });
            
            Route::middleware('tenant.access:permission,academic:create')->group(function () {
                Route::get('/syllabus/create', [AcademicController::class, 'createSyllabus'])->name('syllabus.create');
                Route::post('/syllabus', [AcademicController::class, 'storeSyllabus'])->name('syllabus.store');
            });
            
            Route::middleware('tenant.access:permission,academic:update')->group(function () {
                Route::get('/syllabus/{id}/edit', [AcademicController::class, 'editSyllabus'])->name('syllabus.edit');
                Route::put('/syllabus/{id}', [AcademicController::class, 'updateSyllabus'])->name('syllabus.update');
            });
            
            Route::middleware('tenant.access:permission,academic:delete')->group(function () {
                Route::delete('/syllabus/{id}', [AcademicController::class, 'destroySyllabus'])->name('syllabus.destroy');
            });
        });
    });

    // Finance Module - Protected by module access
    Route::middleware('tenant.access:module,finance')->group(function () {
        Route::prefix('finance')->name('finance.')->group(function () {
            Route::get('/', [FinanceController::class, 'index'])->name('index');
            
            // Budget Management - Protected by permissions
            Route::middleware('tenant.access:permission,finance:read')->group(function () {
                Route::get('/budget', [FinanceController::class, 'budget'])->name('budget');
                Route::get('/budget/{id}', [FinanceController::class, 'showBudget'])->name('budget.show');
            });
            
            Route::middleware('tenant.access:permission,finance:create')->group(function () {
                Route::get('/budget/create', [FinanceController::class, 'createBudget'])->name('budget.create');
                Route::post('/budget', [FinanceController::class, 'storeBudget'])->name('budget.store');
            });
            
            Route::middleware('tenant.access:permission,finance:update')->group(function () {
                Route::get('/budget/{id}/edit', [FinanceController::class, 'editBudget'])->name('budget.edit');
                Route::put('/budget/{id}', [FinanceController::class, 'updateBudget'])->name('budget.update');
            });
            
            Route::middleware('tenant.access:permission,finance:delete')->group(function () {
                Route::delete('/budget/{id}', [FinanceController::class, 'destroyBudget'])->name('budget.destroy');
            });
            
            // Expense Management - Protected by permissions
            Route::middleware('tenant.access:permission,finance:read')->group(function () {
                Route::get('/expenses', [FinanceController::class, 'expenses'])->name('expenses');
                Route::get('/expenses/{id}', [FinanceController::class, 'showExpense'])->name('expenses.show');
            });
            
            Route::middleware('tenant.access:permission,finance:create')->group(function () {
                Route::get('/expenses/create', [FinanceController::class, 'createExpense'])->name('expenses.create');
                Route::post('/expenses', [FinanceController::class, 'storeExpense'])->name('expenses.store');
            });
            
            Route::middleware('tenant.access:permission,finance:update')->group(function () {
                Route::get('/expenses/{id}/edit', [FinanceController::class, 'editExpense'])->name('expenses.edit');
                Route::put('/expenses/{id}', [FinanceController::class, 'updateExpense'])->name('expenses.update');
            });
            
            Route::middleware('tenant.access:permission,finance:delete')->group(function () {
                Route::delete('/expenses/{id}', [FinanceController::class, 'destroyExpense'])->name('expenses.destroy');
            });
        });
    });

    // HR Module - Protected by module access
    Route::middleware('tenant.access:module,hr')->group(function () {
        Route::prefix('hr')->name('hr.')->group(function () {
            Route::get('/', [HrController::class, 'index'])->name('index');
            
            // Employee routes
            Route::get('/employees', [HrController::class, 'employees'])->name('employees');
            Route::get('/employees/create', [HrController::class, 'createEmployee'])->name('employees.create');
            Route::post('/employees', [HrController::class, 'storeEmployee'])->name('employees.store');
            Route::get('/employees/{id}', [HrController::class, 'showEmployee'])->name('employees.show');
            Route::get('/employees/{id}/edit', [HrController::class, 'editEmployee'])->name('employees.edit');
            Route::put('/employees/{id}', [HrController::class, 'updateEmployee'])->name('employees.update');
            Route::delete('/employees/{id}', [HrController::class, 'destroyEmployee'])->name('employees.destroy');
            
            // Payroll routes
            Route::get('/payroll', [HrController::class, 'payroll'])->name('payroll');
            Route::get('/payroll/create', [HrController::class, 'createPayroll'])->name('payroll.create');
            Route::post('/payroll', [HrController::class, 'storePayroll'])->name('payroll.store');
            Route::get('/payroll/{id}', [HrController::class, 'showPayroll'])->name('payroll.show');
            Route::get('/payroll/{id}/edit', [HrController::class, 'editPayroll'])->name('payroll.edit');
            Route::put('/payroll/{id}', [HrController::class, 'updatePayroll'])->name('payroll.update');
            Route::delete('/payroll/{id}', [HrController::class, 'destroyPayroll'])->name('payroll.destroy');
        });
    });

    // Facility Module - Protected by module access
    Route::middleware('tenant.access:module,facility')->group(function () {
        Route::prefix('facility')->name('facility.')->group(function () {
            Route::get('/', [FacilityController::class, 'index'])->name('index');
            
            // Lands routes
            Route::get('/lands', [FacilityController::class, 'lands'])->name('lands');
            Route::get('/lands/create', [FacilityController::class, 'createLand'])->name('lands.create');
            Route::post('/lands', [FacilityController::class, 'storeLand'])->name('lands.store');
            Route::get('/lands/{id}', [FacilityController::class, 'showLand'])->name('lands.show');
            Route::get('/lands/{id}/edit', [FacilityController::class, 'editLand'])->name('lands.edit');
            Route::put('/lands/{id}', [FacilityController::class, 'updateLand'])->name('lands.update');
            Route::delete('/lands/{id}', [FacilityController::class, 'destroyLand'])->name('lands.destroy');
            
            // Buildings routes
            Route::get('/buildings', [FacilityController::class, 'buildings'])->name('buildings');
            Route::get('/buildings/create', [FacilityController::class, 'createBuilding'])->name('buildings.create');
            Route::post('/buildings', [FacilityController::class, 'storeBuilding'])->name('buildings.store');
            Route::get('/buildings/{id}', [FacilityController::class, 'showBuilding'])->name('buildings.show');
            Route::get('/buildings/{id}/edit', [FacilityController::class, 'editBuilding'])->name('buildings.edit');
            Route::put('/buildings/{id}', [FacilityController::class, 'updateBuilding'])->name('buildings.update');
            Route::delete('/buildings/{id}', [FacilityController::class, 'destroyBuilding'])->name('buildings.destroy');
            
            // Rooms routes
            Route::get('/rooms', [FacilityController::class, 'rooms'])->name('rooms');
            Route::get('/rooms/create', [FacilityController::class, 'createRoom'])->name('rooms.create');
            Route::post('/rooms', [FacilityController::class, 'storeRoom'])->name('rooms.store');
            Route::get('/rooms/{id}', [FacilityController::class, 'showRoom'])->name('rooms.show');
            Route::get('/rooms/{id}/edit', [FacilityController::class, 'editRoom'])->name('rooms.edit');
            Route::put('/rooms/{id}', [FacilityController::class, 'updateRoom'])->name('rooms.update');
            Route::delete('/rooms/{id}', [FacilityController::class, 'destroyRoom'])->name('rooms.destroy');
        });
    });

    // Report Module - Protected by module access
    Route::middleware('tenant.access:module,report')->group(function () {
        Route::prefix('report')->name('report.')->group(function () {
            Route::get('/', [ReportController::class, 'index'])->name('index');
            Route::get('/academic', [ReportController::class, 'academic'])->name('academic');
            Route::get('/financial', [ReportController::class, 'financial'])->name('financial');
            
            // Student Reports
            Route::get('/students', [ReportController::class, 'generateStudentReport'])->name('students');
            Route::get('/attendance', [ReportController::class, 'generateAttendanceReport'])->name('attendance');
            Route::get('/grades', [ReportController::class, 'generateGradeReport'])->name('grades');
            
            // Financial Reports
            Route::get('/financial-detail', [ReportController::class, 'generateFinancialReport'])->name('financial-detail');
            Route::get('/spp', [ReportController::class, 'generateSppReport'])->name('spp');
            Route::get('/budget', [ReportController::class, 'generateBudgetReport'])->name('budget');
            
            // Export Routes
            Route::get('/export-pdf', [ReportController::class, 'exportPdf'])->name('export-pdf');
            Route::get('/export-excel', [ReportController::class, 'exportExcel'])->name('export-excel');
        });
    });

    // Student Activity Logs - For students
    Route::middleware('auth')->group(function () {
        Route::prefix('student')->name('student.')->group(function () {
            Route::get('/activity-logs', [\App\Http\Controllers\Tenant\StudentActivityController::class, 'index'])->name('activity-logs');
            Route::get('/activity-logs/statistics', [\App\Http\Controllers\Tenant\StudentActivityController::class, 'statistics'])->name('activity-logs.statistics');
            Route::get('/activity-logs/trends', [\App\Http\Controllers\Tenant\StudentActivityController::class, 'trends'])->name('activity-logs.trends');
            Route::get('/activity-logs/export', [\App\Http\Controllers\Tenant\StudentActivityController::class, 'export'])->name('activity-logs.export');
            Route::get('/activity-logs/recent', [\App\Http\Controllers\Tenant\StudentActivityController::class, 'recent'])->name('activity-logs.recent');
        });
    });

    // Admin Activity Logs - For admin/teachers
    Route::middleware('tenant.access:module,activity')->group(function () {
        Route::prefix('admin')->name('admin.')->group(function () {
            Route::get('/activity-logs', [\App\Http\Controllers\Tenant\StudentActivityController::class, 'adminIndex'])->name('activity-logs');
            Route::get('/activity-logs/statistics', [\App\Http\Controllers\Tenant\StudentActivityController::class, 'statistics'])->name('activity-logs.statistics');
            Route::get('/activity-logs/trends', [\App\Http\Controllers\Tenant\StudentActivityController::class, 'trends'])->name('activity-logs.trends');
            Route::get('/activity-logs/export', [\App\Http\Controllers\Tenant\StudentActivityController::class, 'export'])->name('activity-logs.export');
            Route::post('/activity-logs/clean', [\App\Http\Controllers\Tenant\StudentActivityController::class, 'clean'])->name('activity-logs.clean');
        });
    });

    // Super Admin Access Management - Only for school_admin
    Route::middleware('role:school_admin')->group(function () {
        Route::prefix('super-admin-access')->name('super-admin-access.')->group(function () {
            Route::get('/', [SuperAdminAccessController::class, 'index'])->name('index');
            Route::get('/{access}', [SuperAdminAccessController::class, 'show'])->name('show');
            Route::post('/{access}/approve', [SuperAdminAccessController::class, 'approve'])->name('approve');
            Route::post('/{access}/reject', [SuperAdminAccessController::class, 'reject'])->name('reject');
            Route::post('/{access}/revoke', [SuperAdminAccessController::class, 'revoke'])->name('revoke');
        });
    });
});

// Public Page Routes - No authentication required
Route::prefix('{tenant}')->name('tenant.')->middleware(['web', 'tenant'])->group(function () {
    // Public Page Routes
    Route::prefix('public')->name('public.')->group(function () {
        // Home
        Route::get('/', [\Modules\PublicPage\Http\Controllers\PublicPageController::class, 'home'])->name('home');
        
        // News Routes
        Route::get('/berita', [\Modules\PublicPage\Http\Controllers\NewsController::class, 'index'])->name('news.index');
        Route::get('/berita/{slug}', [\Modules\PublicPage\Http\Controllers\NewsController::class, 'show'])->name('news.show');
        
        // Other Public Pages
        Route::get('/tentang', [\Modules\PublicPage\Http\Controllers\PublicPageController::class, 'about'])->name('about');
        Route::get('/kontak', [\Modules\PublicPage\Http\Controllers\PublicPageController::class, 'contact'])->name('contact');
        Route::get('/galeri', [\Modules\PublicPage\Http\Controllers\PublicPageController::class, 'gallery'])->name('gallery.index');
        Route::get('/test', [\Modules\PublicPage\Http\Controllers\PublicPageController::class, 'test'])->name('test');
    });
    
    // Admin Routes for Public Page Management
    Route::prefix('admin')->name('admin.')->middleware(['auth'])->group(function () {
        // News Management
        Route::resource('news', \Modules\PublicPage\Http\Controllers\NewsController::class)->except(['show']);
        Route::get('news', [\Modules\PublicPage\Http\Controllers\NewsController::class, 'adminIndex'])->name('news.index');
        Route::post('news/bulk-action', [\Modules\PublicPage\Http\Controllers\NewsController::class, 'bulkAction'])->name('news.bulk-action');
        Route::post('news/{id}/toggle-status', [\Modules\PublicPage\Http\Controllers\NewsController::class, 'toggleStatus'])->name('news.toggle-status');
        Route::post('news/{id}/toggle-featured', [\Modules\PublicPage\Http\Controllers\NewsController::class, 'toggleFeatured'])->name('news.toggle-featured');
        Route::post('news/{id}/duplicate', [\Modules\PublicPage\Http\Controllers\NewsController::class, 'duplicate'])->name('news.duplicate');
        Route::get('news/export/csv', [\Modules\PublicPage\Http\Controllers\NewsController::class, 'export'])->name('news.export');
        Route::get('news/statistics', [\Modules\PublicPage\Http\Controllers\NewsController::class, 'statistics'])->name('news.statistics');
        
        // Gallery Management
        Route::resource('gallery', \Modules\PublicPage\Http\Controllers\GalleryController::class);
        Route::get('gallery', [\Modules\PublicPage\Http\Controllers\GalleryController::class, 'adminIndex'])->name('gallery.index');
        Route::post('gallery/bulk-action', [\Modules\PublicPage\Http\Controllers\GalleryController::class, 'bulkAction'])->name('gallery.bulk-action');
        Route::post('gallery/{id}/toggle-status', [\Modules\PublicPage\Http\Controllers\GalleryController::class, 'toggleStatus'])->name('gallery.toggle-status');
        Route::post('gallery/{id}/toggle-featured', [\Modules\PublicPage\Http\Controllers\GalleryController::class, 'toggleFeatured'])->name('gallery.toggle-featured');
        Route::post('gallery/{id}/duplicate', [\Modules\PublicPage\Http\Controllers\GalleryController::class, 'duplicate'])->name('gallery.duplicate');
        Route::get('gallery/export/csv', [\Modules\PublicPage\Http\Controllers\GalleryController::class, 'export'])->name('gallery.export');
        Route::get('gallery/statistics', [\Modules\PublicPage\Http\Controllers\GalleryController::class, 'statistics'])->name('gallery.statistics');
        
        // Menu Management
        Route::resource('menu', \Modules\PublicPage\Http\Controllers\MenuController::class);
        Route::get('menu', [\Modules\PublicPage\Http\Controllers\MenuController::class, 'index'])->name('menu.index');
        Route::post('menu/bulk-action', [\Modules\PublicPage\Http\Controllers\MenuController::class, 'bulkAction'])->name('menu.bulk-action');
        Route::post('menu/{id}/toggle-status', [\Modules\PublicPage\Http\Controllers\MenuController::class, 'toggleStatus'])->name('menu.toggle-status');
        Route::post('menu/{id}/duplicate', [\Modules\PublicPage\Http\Controllers\MenuController::class, 'duplicate'])->name('menu.duplicate');
        Route::post('menu/update-order', [\Modules\PublicPage\Http\Controllers\MenuController::class, 'updateOrder'])->name('menu.update-order');
        Route::get('menu/export/csv', [\Modules\PublicPage\Http\Controllers\MenuController::class, 'export'])->name('menu.export');
        Route::get('menu/statistics', [\Modules\PublicPage\Http\Controllers\MenuController::class, 'statistics'])->name('menu.statistics');
    });
});