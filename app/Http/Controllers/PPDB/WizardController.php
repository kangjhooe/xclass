<?php

namespace App\Http\Controllers\PPDB;

use App\Http\Controllers\Controller;
use App\Models\PPDBApplication;
use App\Models\PPDBConfiguration;
use Illuminate\Http\Request;

class WizardController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();
        $application = PPDBApplication::where('user_id', $user->id)->latest()->first();
        // navigate directly to a step if requested
        $config = PPDBConfiguration::getActiveConfiguration();
        if ($request->filled('application_id') && $application && (int)$request->application_id === $application->id) {
            if ($request->get('go') === 'step1') {
                return view('ppdb.wizard.step1', ['application' => $application, 'config' => $config]);
            }
            if ($request->get('go') === 'step2') {
                return view('ppdb.wizard.step2', ['application' => $application, 'config' => $config]);
            }
            if ($request->get('go') === 'step3') {
                return view('ppdb.wizard.step3', ['application' => $application, 'config' => $config]);
            }
            if ($request->get('go') === 'step4') {
                return view('ppdb.wizard.step4', ['application' => $application, 'config' => $config]);
            }
        }

        return view('ppdb.wizard.index', compact('application'));
    }

    public function submit(Request $request, PPDBApplication $application)
    {
        if ($application->user_id !== $request->user()->id) {
            abort(403);
        }

        // Validate required fields before submission
        $validationService = \App\Core\Services\PPDB\ValidationService::class;
        $errors = $validationService::validateBeforeSubmit($application);

        if (!empty($errors)) {
            return redirect()->back()->withErrors(['validation' => $errors])->withInput();
        }

        // Check if can be submitted
        if (!$validationService::canEdit($application)) {
            return redirect()->back()->with('error', 'Pendaftaran sudah dikunci dan tidak dapat diubah.');
        }

        // Mark as registered (data locked)
        $application->update(['status' => PPDBApplication::STATUS_REGISTERED]);
        return redirect()->route('ppdb.wizard.index')->with('success', 'Pendaftaran dikunci dan dikirim untuk verifikasi.');
    }
}


