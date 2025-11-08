<?php

namespace Modules\PublicPage\Http\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Modules\PublicPage\Models\News;

class PublicPageController extends Controller
{
    /**
     * Display the home page.
     */
    public function home()
    {
        // Return simple view for testing without database queries
        return view('publicpage::public.home-simple', [
            'featuredNews' => collect(),
            'latestNews' => collect(),
            'newsCount' => 0,
            'studentCount' => 0,
            'teacherCount' => 0,
            'yearCount' => 0
        ]);
    }

    /**
     * Display the about page.
     */
    public function about()
    {
        return view('publicpage::public.about-simple');
    }

    /**
     * Display the contact page.
     */
    public function contact()
    {
        return view('publicpage::public.contact-simple');
    }

    /**
     * Display the gallery page.
     */
    public function gallery()
    {
        return view('publicpage::public.gallery.index-simple');
    }

    /**
     * Display the test page.
     */
    public function test()
    {
        return view('publicpage::public.test');
    }
}
