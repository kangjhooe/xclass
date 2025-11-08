<?php

use Illuminate\Support\Facades\Route;
use Modules\ELearning\app\Http\Controllers\CourseController;
use Modules\ELearning\app\Http\Controllers\CourseEnrollmentController;
use Modules\ELearning\app\Http\Controllers\CourseMaterialController;
use Modules\ELearning\app\Http\Controllers\CourseVideoController;
use Modules\ELearning\app\Http\Controllers\CourseAssignmentController;
use Modules\ELearning\app\Http\Controllers\CourseQuizController;
use Modules\ELearning\app\Http\Controllers\CourseForumController;
use Modules\ELearning\app\Http\Controllers\CourseAnnouncementController;
use Modules\ELearning\app\Http\Controllers\CourseProgressController;
use Modules\ELearning\app\Http\Controllers\CourseLiveClassController;
use Modules\ELearning\app\Http\Controllers\CourseResourceController;
use Modules\ELearning\app\Http\Controllers\StudentCourseController;

/*
|--------------------------------------------------------------------------
| E-Learning Module Routes
|--------------------------------------------------------------------------
|
| Routes untuk modul E-Learning dengan kontrol akses tenant
|
*/

// Route E-Learning sudah di-include di dalam context {tenant} dari tenant-modules.php
// Jadi tidak perlu prefix {tenant} lagi di sini
Route::name('elearning.')->group(function () {
    
    // Course Management Routes
    Route::prefix('courses')->name('courses.')->group(function () {
        Route::get('/', [CourseController::class, 'index'])->name('index');
        Route::get('/create', [CourseController::class, 'create'])->name('create');
        Route::post('/', [CourseController::class, 'store'])->name('store');
        Route::get('/{course}', [CourseController::class, 'show'])->name('show');
        Route::get('/{course}/edit', [CourseController::class, 'edit'])->name('edit');
        Route::put('/{course}', [CourseController::class, 'update'])->name('update');
        Route::delete('/{course}', [CourseController::class, 'destroy'])->name('destroy');
        Route::post('/{course}/toggle-publish', [CourseController::class, 'togglePublish'])->name('toggle-publish');
    });

    // Enrollment Routes
    Route::prefix('enrollments')->name('enrollments.')->group(function () {
        Route::post('/{course}', [CourseEnrollmentController::class, 'enroll'])->name('enroll');
        Route::post('/{course}/unenroll', [CourseEnrollmentController::class, 'unenroll'])->name('unenroll');
        Route::get('/my-courses', [CourseEnrollmentController::class, 'myCourses'])->name('my-courses');
    });

    // Material Management Routes
    Route::prefix('courses/{course}/materials')->name('materials.')->group(function () {
        Route::get('/', [CourseMaterialController::class, 'index'])->name('index');
        Route::get('/create', [CourseMaterialController::class, 'create'])->name('create');
        Route::post('/', [CourseMaterialController::class, 'store'])->name('store');
        Route::get('/{material}', [CourseMaterialController::class, 'show'])->name('show');
        Route::get('/{material}/edit', [CourseMaterialController::class, 'edit'])->name('edit');
        Route::put('/{material}', [CourseMaterialController::class, 'update'])->name('update');
        Route::delete('/{material}', [CourseMaterialController::class, 'destroy'])->name('destroy');
    });

    // Video Management Routes
    Route::prefix('courses/{course}/videos')->name('videos.')->group(function () {
        Route::get('/', [CourseVideoController::class, 'index'])->name('index');
        Route::get('/create', [CourseVideoController::class, 'create'])->name('create');
        Route::post('/', [CourseVideoController::class, 'store'])->name('store');
        Route::get('/{video}', [CourseVideoController::class, 'show'])->name('show');
        Route::get('/{video}/edit', [CourseVideoController::class, 'edit'])->name('edit');
        Route::put('/{video}', [CourseVideoController::class, 'update'])->name('update');
        Route::delete('/{video}', [CourseVideoController::class, 'destroy'])->name('destroy');
        Route::post('/{video}/update-progress', [CourseVideoController::class, 'updateProgress'])->name('update-progress');
    });

    // Assignment Routes
    Route::prefix('courses/{course}/assignments')->name('assignments.')->group(function () {
        Route::get('/', [CourseAssignmentController::class, 'index'])->name('index');
        Route::get('/create', [CourseAssignmentController::class, 'create'])->name('create');
        Route::post('/', [CourseAssignmentController::class, 'store'])->name('store');
        Route::get('/{assignment}', [CourseAssignmentController::class, 'show'])->name('show');
        Route::get('/{assignment}/edit', [CourseAssignmentController::class, 'edit'])->name('edit');
        Route::put('/{assignment}', [CourseAssignmentController::class, 'update'])->name('update');
        Route::delete('/{assignment}', [CourseAssignmentController::class, 'destroy'])->name('destroy');
        Route::post('/{assignment}/submit', [CourseAssignmentController::class, 'submit'])->name('submit');
        Route::get('/{assignment}/submissions', [CourseAssignmentController::class, 'submissions'])->name('submissions');
        Route::post('/{assignment}/submissions/{submission}/grade', [CourseAssignmentController::class, 'grade'])->name('grade');
    });

    // Quiz Routes
    Route::prefix('courses/{course}/quizzes')->name('quizzes.')->group(function () {
        Route::get('/', [CourseQuizController::class, 'index'])->name('index');
        Route::get('/create', [CourseQuizController::class, 'create'])->name('create');
        Route::post('/', [CourseQuizController::class, 'store'])->name('store');
        Route::get('/{quiz}', [CourseQuizController::class, 'show'])->name('show');
        Route::get('/{quiz}/edit', [CourseQuizController::class, 'edit'])->name('edit');
        Route::put('/{quiz}', [CourseQuizController::class, 'update'])->name('update');
        Route::delete('/{quiz}', [CourseQuizController::class, 'destroy'])->name('destroy');
        Route::post('/{quiz}/start', [CourseQuizController::class, 'start'])->name('start');
        Route::get('/{quiz}/take/{attempt}', [CourseQuizController::class, 'take'])->name('take');
        Route::post('/{quiz}/submit/{attempt}', [CourseQuizController::class, 'submit'])->name('submit');
        Route::get('/{quiz}/results/{attempt}', [CourseQuizController::class, 'results'])->name('results');
        Route::get('/{quiz}/attempts', [CourseQuizController::class, 'attempts'])->name('attempts');
    });

    // Forum Routes
    Route::prefix('courses/{course}/forums')->name('forums.')->group(function () {
        Route::get('/', [CourseForumController::class, 'index'])->name('index');
        Route::post('/', [CourseForumController::class, 'store'])->name('store');
        Route::get('/{forum}', [CourseForumController::class, 'show'])->name('show');
        Route::get('/{forum}/edit', [CourseForumController::class, 'edit'])->name('edit');
        Route::put('/{forum}', [CourseForumController::class, 'update'])->name('update');
        Route::delete('/{forum}', [CourseForumController::class, 'destroy'])->name('destroy');
        Route::post('/{forum}/posts', [CourseForumController::class, 'storePost'])->name('posts.store');
        Route::post('/posts/{post}/reply', [CourseForumController::class, 'reply'])->name('posts.reply');
    });

    // Announcement Routes
    Route::prefix('courses/{course}/announcements')->name('announcements.')->group(function () {
        Route::get('/', [CourseAnnouncementController::class, 'index'])->name('index');
        Route::get('/create', [CourseAnnouncementController::class, 'create'])->name('create');
        Route::post('/', [CourseAnnouncementController::class, 'store'])->name('store');
        Route::get('/{announcement}', [CourseAnnouncementController::class, 'show'])->name('show');
        Route::get('/{announcement}/edit', [CourseAnnouncementController::class, 'edit'])->name('edit');
        Route::put('/{announcement}', [CourseAnnouncementController::class, 'update'])->name('update');
        Route::delete('/{announcement}', [CourseAnnouncementController::class, 'destroy'])->name('destroy');
    });

    // Progress Routes
    Route::prefix('courses/{course}/progress')->name('progress.')->group(function () {
        Route::get('/', [CourseProgressController::class, 'index'])->name('index');
        Route::get('/student/{student}', [CourseProgressController::class, 'studentProgress'])->name('student');
        Route::get('/analytics', [CourseProgressController::class, 'analytics'])->name('analytics');
    });

    // Live Class Routes
    Route::prefix('courses/{course}/live-classes')->name('live-classes.')->group(function () {
        Route::get('/', [CourseLiveClassController::class, 'index'])->name('index');
        Route::get('/create', [CourseLiveClassController::class, 'create'])->name('create');
        Route::post('/', [CourseLiveClassController::class, 'store'])->name('store');
        Route::get('/{liveClass}', [CourseLiveClassController::class, 'show'])->name('show');
        Route::get('/{liveClass}/edit', [CourseLiveClassController::class, 'edit'])->name('edit');
        Route::put('/{liveClass}', [CourseLiveClassController::class, 'update'])->name('update');
        Route::delete('/{liveClass}', [CourseLiveClassController::class, 'destroy'])->name('destroy');
    });

    // Resource Routes
    Route::prefix('courses/{course}/resources')->name('resources.')->group(function () {
        Route::get('/', [CourseResourceController::class, 'index'])->name('index');
        Route::get('/create', [CourseResourceController::class, 'create'])->name('create');
        Route::post('/', [CourseResourceController::class, 'store'])->name('store');
        Route::get('/{resource}', [CourseResourceController::class, 'show'])->name('show');
        Route::delete('/{resource}', [CourseResourceController::class, 'destroy'])->name('destroy');
        Route::get('/{resource}/download', [CourseResourceController::class, 'download'])->name('download');
    });

    // Student Course Routes (Student View)
    Route::prefix('student')->name('student.')->middleware('role:student')->group(function () {
        Route::get('/courses', [StudentCourseController::class, 'index'])->name('courses');
        Route::get('/courses/{course}', [StudentCourseController::class, 'show'])->name('course.show');
        Route::get('/courses/{course}/dashboard', [StudentCourseController::class, 'dashboard'])->name('course.dashboard');
    });
});

