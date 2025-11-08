<?php

namespace App\Services;

use App\Models\Tenant\Question;
use App\Models\Core\Tenant;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class QuestionSharingService
{
    /**
     * Share a question to make it accessible by other tenants
     */
    public function shareQuestion(Question $question): bool
    {
        try {
            DB::beginTransaction();

            $question->share();

            Log::info('Question shared', [
                'question_id' => $question->id,
                'tenant_id' => $question->tenant_id,
                'shared_at' => now()
            ]);

            DB::commit();
            return true;
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Failed to share question', [
                'question_id' => $question->id,
                'error' => $e->getMessage()
            ]);
            return false;
        }
    }

    /**
     * Unshare a question to make it private again
     */
    public function unshareQuestion(Question $question): bool
    {
        try {
            DB::beginTransaction();

            $question->unshare();

            Log::info('Question unshared', [
                'question_id' => $question->id,
                'tenant_id' => $question->tenant_id,
                'unshared_at' => now()
            ]);

            DB::commit();
            return true;
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Failed to unshare question', [
                'question_id' => $question->id,
                'error' => $e->getMessage()
            ]);
            return false;
        }
    }

    /**
     * Copy a shared question to current tenant's question bank
     */
    public function copyQuestionToTenant(Question $question, $targetTenantId, $creatorId): ?Question
    {
        try {
            DB::beginTransaction();

            // Check if question is shared
            if (!$question->isShared()) {
                throw new \Exception('Question is not shared');
            }

            // Check if question is already copied by this tenant
            $existingCopy = Question::where('tenant_id', $targetTenantId)
                ->where('origin_tenant', $question->tenant_id)
                ->where('question_text', $question->question_text)
                ->first();

            if ($existingCopy) {
                throw new \Exception('Question already copied to this tenant');
            }

            $copiedQuestion = $question->copyToTenant($targetTenantId, $creatorId);

            // If question belongs to a group, copy the group first
            if ($question->belongsToGroup()) {
                $originalGroup = $question->questionGroup;
                
                // Check if group is already copied
                $existingGroup = \App\Models\Tenant\QuestionGroup::where('tenant_id', $targetTenantId)
                    ->where('title', $originalGroup->title)
                    ->where('stimulus_content', $originalGroup->stimulus_content)
                    ->first();

                if ($existingGroup) {
                    // Use existing group
                    $copiedQuestion->update(['question_group_id' => $existingGroup->id]);
                } else {
                    // Copy the group
                    $copiedGroup = $originalGroup->copyToTenant($targetTenantId, $creatorId);
                    $copiedQuestion->update(['question_group_id' => $copiedGroup->id]);
                }
            }

            Log::info('Question copied to tenant', [
                'original_question_id' => $question->id,
                'copied_question_id' => $copiedQuestion->id,
                'from_tenant' => $question->tenant_id,
                'to_tenant' => $targetTenantId,
                'copied_at' => now()
            ]);

            DB::commit();
            return $copiedQuestion;
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Failed to copy question to tenant', [
                'question_id' => $question->id,
                'target_tenant_id' => $targetTenantId,
                'error' => $e->getMessage()
            ]);
            return null;
        }
    }

    /**
     * Get shared questions accessible by tenant
     */
    public function getSharedQuestions($tenantId, $filters = [])
    {
        $query = Question::shared()
            ->where('tenant_id', '!=', $tenantId) // Exclude own tenant's questions
            ->with(['subject', 'creator', 'originTenant']);

        // Apply filters
        if (isset($filters['subject_id'])) {
            $query->where('subject_id', $filters['subject_id']);
        }

        if (isset($filters['type'])) {
            $query->where('type', $filters['type']);
        }

        if (isset($filters['difficulty'])) {
            $query->where('difficulty', $filters['difficulty']);
        }

        if (isset($filters['search'])) {
            $query->where('question_text', 'like', '%' . $filters['search'] . '%');
        }

        return $query->orderBy('shared_at', 'desc')->paginate(15);
    }

    /**
     * Get questions that can be shared by tenant
     */
    public function getShareableQuestions($tenantId, $filters = [])
    {
        $query = Question::where('tenant_id', $tenantId)
            ->with(['subject', 'creator']);

        // Apply filters
        if (isset($filters['subject_id'])) {
            $query->where('subject_id', $filters['subject_id']);
        }

        if (isset($filters['type'])) {
            $query->where('type', $filters['type']);
        }

        if (isset($filters['difficulty'])) {
            $query->where('difficulty', $filters['difficulty']);
        }

        if (isset($filters['visibility'])) {
            $query->where('visibility', $filters['visibility']);
        }

        if (isset($filters['search'])) {
            $query->where('question_text', 'like', '%' . $filters['search'] . '%');
        }

        return $query->orderBy('created_at', 'desc')->paginate(15);
    }

    /**
     * Get question sharing statistics
     */
    public function getSharingStatistics($tenantId)
    {
        $totalQuestions = Question::where('tenant_id', $tenantId)->count();
        $sharedQuestions = Question::where('tenant_id', $tenantId)
            ->where('visibility', Question::VISIBILITY_SHARED)
            ->count();
        $privateQuestions = $totalQuestions - $sharedQuestions;

        $copiedQuestions = Question::where('tenant_id', $tenantId)
            ->whereNotNull('origin_tenant')
            ->count();

        $questionsCopiedFromOthers = Question::where('origin_tenant', $tenantId)
            ->where('tenant_id', '!=', $tenantId)
            ->count();

        return [
            'total_questions' => $totalQuestions,
            'shared_questions' => $sharedQuestions,
            'private_questions' => $privateQuestions,
            'copied_questions' => $copiedQuestions,
            'questions_copied_from_others' => $questionsCopiedFromOthers,
            'sharing_rate' => $totalQuestions > 0 ? round(($sharedQuestions / $totalQuestions) * 100, 2) : 0,
        ];
    }

    /**
     * Bulk share questions
     */
    public function bulkShareQuestions(array $questionIds, $tenantId): array
    {
        $results = [
            'success' => [],
            'failed' => []
        ];

        foreach ($questionIds as $questionId) {
            $question = Question::where('id', $questionId)
                ->where('tenant_id', $tenantId)
                ->first();

            if ($question) {
                if ($this->shareQuestion($question)) {
                    $results['success'][] = $questionId;
                } else {
                    $results['failed'][] = $questionId;
                }
            } else {
                $results['failed'][] = $questionId;
            }
        }

        return $results;
    }

    /**
     * Bulk unshare questions
     */
    public function bulkUnshareQuestions(array $questionIds, $tenantId): array
    {
        $results = [
            'success' => [],
            'failed' => []
        ];

        foreach ($questionIds as $questionId) {
            $question = Question::where('id', $questionId)
                ->where('tenant_id', $tenantId)
                ->first();

            if ($question) {
                if ($this->unshareQuestion($question)) {
                    $results['success'][] = $questionId;
                } else {
                    $results['failed'][] = $questionId;
                }
            } else {
                $results['failed'][] = $questionId;
            }
        }

        return $results;
    }

    /**
     * Get popular shared questions
     */
    public function getPopularSharedQuestions($limit = 10)
    {
        return Question::shared()
            ->with(['subject', 'creator', 'originTenant'])
            ->orderBy('shared_at', 'desc')
            ->limit($limit)
            ->get();
    }

    /**
     * Search shared questions across all tenants
     */
    public function searchSharedQuestions($searchTerm, $filters = [])
    {
        $query = Question::shared()
            ->where('question_text', 'like', '%' . $searchTerm . '%')
            ->with(['subject', 'creator', 'originTenant']);

        // Apply additional filters
        if (isset($filters['subject_id'])) {
            $query->where('subject_id', $filters['subject_id']);
        }

        if (isset($filters['type'])) {
            $query->where('type', $filters['type']);
        }

        if (isset($filters['difficulty'])) {
            $query->where('difficulty', $filters['difficulty']);
        }

        return $query->orderBy('shared_at', 'desc')->paginate(15);
    }
}
