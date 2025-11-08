<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Tenant\AdminExamController;
use App\Http\Controllers\Tenant\TeacherExamController;
use App\Http\Controllers\Tenant\QuestionController;
use App\Http\Controllers\Tenant\ExamController;
use App\Http\Controllers\Tenant\ExamAttemptController;

/*
|--------------------------------------------------------------------------
| Enhanced Exam Module Routes
|--------------------------------------------------------------------------
|
| Routes untuk modul ujian yang telah ditingkatkan dengan fitur:
| - Pemisahan peran admin dan guru
| - Berbagi soal antar tenant
| - Katrol nilai (grade adjustment)
|
*/

// Admin Exam Routes
Route::middleware(['auth'])->group(function () {
    Route::prefix('exam')->name('exam.')->group(function () {
        Route::get('/', [AdminExamController::class, 'index'])->name('index');
        Route::get('/admin', [AdminExamController::class, 'index'])->name('admin.index');
        
        // Exam Management Routes (ExamController)
        Route::prefix('exams')->name('exams.')->group(function () {
            Route::get('/', [ExamController::class, 'exams'])->name('index');
            Route::get('/create', [ExamController::class, 'createExam'])->name('create');
            Route::post('/', [ExamController::class, 'storeExam'])->name('store');
            Route::get('/{exam}', [ExamController::class, 'showExam'])->name('show');
            Route::get('/{exam}/edit', [ExamController::class, 'editExam'])->name('edit');
            Route::put('/{exam}', [ExamController::class, 'updateExam'])->name('update');
            Route::delete('/{exam}', [ExamController::class, 'destroyExam'])->name('destroy');
        });
        
        Route::get('/questions', [ExamController::class, 'questions'])->name('questions');
        
        // Exam Attempt Routes
        Route::prefix('attempts')->name('attempts.')->group(function () {
            Route::get('/', [ExamAttemptController::class, 'index'])->name('index');
            Route::get('/create', [ExamAttemptController::class, 'create'])->name('create');
            Route::post('/', [ExamAttemptController::class, 'store'])->name('store');
            Route::get('/{attempt}', [ExamAttemptController::class, 'show'])->name('show');
            Route::get('/{attempt}/edit', [ExamAttemptController::class, 'edit'])->name('edit');
            Route::put('/{attempt}', [ExamAttemptController::class, 'update'])->name('update');
            Route::delete('/{attempt}', [ExamAttemptController::class, 'destroy'])->name('destroy');
            Route::get('/{attempt}/export', [ExamAttemptController::class, 'export'])->name('export');
        });
        
        // Exam Grading Routes (harus sebelum route dengan {exam} saja)
        Route::prefix('{exam}/grading')->name('grading.')->group(function () {
            Route::get('/', [\App\Http\Controllers\Tenant\ExamGradingController::class, 'index'])->name('index');
            Route::get('/{attempt}', [\App\Http\Controllers\Tenant\ExamGradingController::class, 'show'])->name('show');
            Route::post('/{attempt}/grade', [\App\Http\Controllers\Tenant\ExamGradingController::class, 'gradeAttempt'])->name('grade-attempt');
            Route::post('/grade-all', [\App\Http\Controllers\Tenant\ExamGradingController::class, 'gradeAllAttempts'])->name('grade-all');
            Route::get('/export', [\App\Http\Controllers\Tenant\ExamGradingController::class, 'export'])->name('export');
        });
        
        // Student Exam Routes (harus sebelum route dengan {exam} saja, menggunakan route model binding)
        Route::post('/attempt/{attempt}/save-answer', [ExamAttemptController::class, 'saveAnswer'])->name('save-answer');
        Route::post('/attempt/{attempt}/submit', [ExamAttemptController::class, 'submit'])->name('submit');
        Route::get('/attempt/{attempt}/take', [ExamAttemptController::class, 'take'])->name('take');
        Route::get('/attempt/{attempt}/results', [ExamAttemptController::class, 'results'])->name('results');
        
        // Admin Exam Routes (AdminExamController)
        Route::get('/create', [AdminExamController::class, 'create'])->name('create');
        Route::post('/', [AdminExamController::class, 'store'])->name('store');
        Route::get('/{exam}', [AdminExamController::class, 'show'])->name('show');
        Route::get('/{exam}/edit', [AdminExamController::class, 'edit'])->name('edit');
        Route::put('/{exam}', [AdminExamController::class, 'update'])->name('update');
        Route::delete('/{exam}', [AdminExamController::class, 'destroy'])->name('destroy');
        Route::post('/{exam}/start', [AdminExamController::class, 'start'])->name('start');
        Route::post('/{exam}/stop', [AdminExamController::class, 'stop'])->name('stop');
        Route::get('/{exam}/results', [AdminExamController::class, 'results'])->name('results');
        Route::get('/{exam}/export', [AdminExamController::class, 'export'])->name('export');
        Route::get('/{exam}/grade-adjustment', [AdminExamController::class, 'gradeAdjustment'])->name('grade-adjustment');
        Route::post('/{exam}/grade-adjustment', [AdminExamController::class, 'applyGradeAdjustment'])->name('apply-grade-adjustment');
    });
    
    // Admin Exam Routes (with admin prefix for compatibility)
    Route::prefix('admin/exam')->name('admin.exam.')->group(function () {
        Route::get('/', [AdminExamController::class, 'index'])->name('index');
        Route::get('/create', [AdminExamController::class, 'create'])->name('create');
        Route::post('/', [AdminExamController::class, 'store'])->name('store');
        Route::get('/{exam}', [AdminExamController::class, 'show'])->name('show');
        Route::get('/{exam}/edit', [AdminExamController::class, 'edit'])->name('edit');
        Route::put('/{exam}', [AdminExamController::class, 'update'])->name('update');
        Route::delete('/{exam}', [AdminExamController::class, 'destroy'])->name('destroy');
        Route::post('/{exam}/start', [AdminExamController::class, 'start'])->name('start');
        Route::post('/{exam}/stop', [AdminExamController::class, 'stop'])->name('stop');
        Route::get('/{exam}/results', [AdminExamController::class, 'results'])->name('results');
        Route::get('/{exam}/export', [AdminExamController::class, 'export'])->name('export');
        Route::get('/{exam}/grade-adjustment', [AdminExamController::class, 'gradeAdjustment'])->name('grade-adjustment');
        Route::post('/{exam}/grade-adjustment', [AdminExamController::class, 'applyGradeAdjustment'])->name('apply-grade-adjustment');
    });
});

// Teacher Exam Routes
Route::middleware(['auth'])->group(function () {
    Route::prefix('teacher/exam')->name('teacher.exam.')->group(function () {
        Route::get('/', [TeacherExamController::class, 'index'])->name('index');
        Route::get('/available', [TeacherExamController::class, 'availableExams'])->name('available');
        Route::get('/{exam}/add-subject', [TeacherExamController::class, 'addSubject'])->name('add-subject');
        Route::post('/{exam}/subject', [TeacherExamController::class, 'storeSubject'])->name('store-subject');
        Route::get('/subject/{examSubject}/questions', [TeacherExamController::class, 'manageQuestions'])->name('subject.questions');
        Route::post('/subject/{examSubject}/questions', [TeacherExamController::class, 'addQuestions'])->name('subject.add-questions');
        Route::get('/subject/{examSubject}/schedule/create', [TeacherExamController::class, 'createSchedule'])->name('subject.create-schedule');
        Route::post('/subject/{examSubject}/schedule', [TeacherExamController::class, 'storeSchedule'])->name('subject.store-schedule');
        Route::get('/{exam}/results', [TeacherExamController::class, 'results'])->name('results');
        Route::get('/{exam}/grade-adjustment', [TeacherExamController::class, 'gradeAdjustment'])->name('grade-adjustment');
        Route::post('/{exam}/grade-adjustment', [TeacherExamController::class, 'applyGradeAdjustment'])->name('apply-grade-adjustment');
    });
});

// Question Management Routes
Route::middleware(['auth'])->group(function () {
    Route::prefix('questions')->name('questions.')->group(function () {
        Route::get('/', [QuestionController::class, 'index'])->name('index');
        Route::get('/create', [QuestionController::class, 'create'])->name('create');
        Route::post('/', [QuestionController::class, 'store'])->name('store');
        Route::get('/{question}', [QuestionController::class, 'show'])->name('show');
        Route::get('/{question}/edit', [QuestionController::class, 'edit'])->name('edit');
        Route::put('/{question}', [QuestionController::class, 'update'])->name('update');
        Route::delete('/{question}', [QuestionController::class, 'destroy'])->name('destroy');
        
        // Question Sharing Routes
        Route::post('/{question}/share', [QuestionController::class, 'share'])->name('share');
        Route::post('/{question}/unshare', [QuestionController::class, 'unshare'])->name('unshare');
        Route::post('/{question}/copy', [QuestionController::class, 'copy'])->name('copy');
        
        // Shared Questions
        Route::get('/shared/list', [QuestionController::class, 'shared'])->name('shared');
        
        // Bulk Actions
        Route::post('/bulk-share', [QuestionController::class, 'bulkShare'])->name('bulk-share');
        Route::post('/bulk-unshare', [QuestionController::class, 'bulkUnshare'])->name('bulk-unshare');
        
        // Import/Export
        Route::get('/export/excel', [QuestionController::class, 'exportExcel'])->name('export.excel');
        Route::get('/export/json', [QuestionController::class, 'exportJson'])->name('export.json');
        Route::get('/import/template', [QuestionController::class, 'downloadTemplate'])->name('import.template');
        Route::post('/import/excel', [QuestionController::class, 'importExcel'])->name('import.excel');
        Route::post('/import/json', [QuestionController::class, 'importJson'])->name('import.json');
    });
});

// Question Group Management Routes
Route::middleware(['auth'])->group(function () {
    Route::prefix('question-groups')->name('question-groups.')->group(function () {
        Route::get('/', [\App\Http\Controllers\Tenant\QuestionGroupController::class, 'index'])->name('index');
        Route::get('/create', [\App\Http\Controllers\Tenant\QuestionGroupController::class, 'create'])->name('create');
        Route::post('/', [\App\Http\Controllers\Tenant\QuestionGroupController::class, 'store'])->name('store');
        Route::get('/{questionGroup}', [\App\Http\Controllers\Tenant\QuestionGroupController::class, 'show'])->name('show');
        Route::get('/{questionGroup}/edit', [\App\Http\Controllers\Tenant\QuestionGroupController::class, 'edit'])->name('edit');
        Route::put('/{questionGroup}', [\App\Http\Controllers\Tenant\QuestionGroupController::class, 'update'])->name('update');
        Route::delete('/{questionGroup}', [\App\Http\Controllers\Tenant\QuestionGroupController::class, 'destroy'])->name('destroy');
        
        // Question Management in Group
        Route::post('/{questionGroup}/add-question', [\App\Http\Controllers\Tenant\QuestionGroupController::class, 'addQuestion'])->name('add-question');
        Route::delete('/{questionGroup}/remove-question/{question}', [\App\Http\Controllers\Tenant\QuestionGroupController::class, 'removeQuestion'])->name('remove-question');
        Route::post('/{questionGroup}/reorder-questions', [\App\Http\Controllers\Tenant\QuestionGroupController::class, 'reorderQuestions'])->name('reorder-questions');
        Route::get('/{questionGroup}/available-questions', [\App\Http\Controllers\Tenant\QuestionGroupController::class, 'getAvailableQuestions'])->name('available-questions');
    });
});

// Grade Adjustment Routes (with middleware)
Route::middleware(['auth', 'grade.adjustment.access'])->group(function () {
    Route::prefix('grade-adjustments')->name('grade-adjustments.')->group(function () {
        Route::get('/exam/{exam}', [\App\Http\Controllers\Tenant\GradeAdjustmentController::class, 'index'])->name('index');
        Route::post('/exam/{exam}/percentage', [\App\Http\Controllers\Tenant\GradeAdjustmentController::class, 'applyPercentage'])->name('percentage');
        Route::post('/exam/{exam}/minimum', [\App\Http\Controllers\Tenant\GradeAdjustmentController::class, 'applyMinimum'])->name('minimum');
        Route::post('/exam/{exam}/manual', [\App\Http\Controllers\Tenant\GradeAdjustmentController::class, 'applyManual'])->name('manual');
        Route::get('/history/exam/{exam}', [\App\Http\Controllers\Tenant\GradeAdjustmentController::class, 'history'])->name('history');
        Route::post('/{adjustment}/revert', [\App\Http\Controllers\Tenant\GradeAdjustmentController::class, 'revert'])->name('revert');
    });
});

// Exam Schedule Routes
Route::middleware(['auth'])->group(function () {
    Route::prefix('exam-schedules')->name('exam-schedules.')->group(function () {
        Route::get('/', [\App\Http\Controllers\Tenant\ExamScheduleController::class, 'index'])->name('index');
        Route::get('/{schedule}', [\App\Http\Controllers\Tenant\ExamScheduleController::class, 'show'])->name('show');
        Route::get('/{schedule}/edit', [\App\Http\Controllers\Tenant\ExamScheduleController::class, 'edit'])->name('edit');
        Route::put('/{schedule}', [\App\Http\Controllers\Tenant\ExamScheduleController::class, 'update'])->name('update');
        Route::post('/{schedule}/start', [\App\Http\Controllers\Tenant\ExamScheduleController::class, 'start'])->name('start');
        Route::post('/{schedule}/stop', [\App\Http\Controllers\Tenant\ExamScheduleController::class, 'stop'])->name('stop');
        Route::get('/{schedule}/results', [\App\Http\Controllers\Tenant\ExamScheduleController::class, 'results'])->name('results');
    });
});

// Student Exam Interface (existing routes)
Route::middleware(['auth'])->group(function () {
    Route::prefix('student/exam')->name('student.exam.')->group(function () {
        Route::get('/', [\App\Http\Controllers\Tenant\StudentExamController::class, 'index'])->name('index');
        Route::get('/{schedule}/take', [\App\Http\Controllers\Tenant\StudentExamController::class, 'take'])->name('take');
        Route::post('/{schedule}/start', [\App\Http\Controllers\Tenant\StudentExamController::class, 'start'])->name('start');
        Route::post('/{attempt}/submit', [\App\Http\Controllers\Tenant\StudentExamController::class, 'submit'])->name('submit');
        Route::post('/{attempt}/save-answer', [\App\Http\Controllers\Tenant\StudentExamController::class, 'saveAnswer'])->name('save-answer');
        Route::get('/{attempt}/results', [\App\Http\Controllers\Tenant\StudentExamController::class, 'results'])->name('results');
    });
});
