<?php

namespace App\Services;

use App\Models\Tenant\Question;
use App\Models\Tenant\QuestionGroup;
use Illuminate\Support\Collection;

class QuestionRandomizationService
{
    /**
     * Randomize questions while maintaining group integrity
     */
    public function randomizeQuestions(Collection $questions, bool $randomizeQuestions = true, bool $randomizeAnswers = true): Collection
    {
        // Separate questions into groups and standalone questions
        $groupedQuestions = $questions->filter(function ($question) {
            return $question->belongsToGroup();
        })->groupBy('question_group_id');

        $standaloneQuestions = $questions->filter(function ($question) {
            return $question->isStandalone();
        });

        $randomizedQuestions = collect();

        // Randomize standalone questions
        if ($randomizeQuestions) {
            $standaloneQuestions = $standaloneQuestions->shuffle();
        }

        $randomizedQuestions = $randomizedQuestions->merge($standaloneQuestions);

        // Process each group
        foreach ($groupedQuestions as $groupId => $groupQuestions) {
            $group = QuestionGroup::find($groupId);
            if (!$group) {
                // If group doesn't exist, treat as standalone
                $randomizedQuestions = $randomizedQuestions->merge($groupQuestions);
                continue;
            }

            // Randomize questions within group if enabled
            if ($randomizeQuestions) {
                $groupQuestions = $groupQuestions->shuffle();
            }

            // Add group stimulus and questions
            $randomizedQuestions = $randomizedQuestions->merge($groupQuestions);
        }

        // Randomize the order of groups and standalone questions if enabled
        if ($randomizeQuestions) {
            $randomizedQuestions = $this->randomizeGroupOrder($randomizedQuestions);
        }

        // Randomize answers for each question if enabled
        if ($randomizeAnswers) {
            $randomizedQuestions = $this->randomizeAnswers($randomizedQuestions);
        }

        return $randomizedQuestions;
    }

    /**
     * Randomize the order of groups while maintaining group integrity
     */
    protected function randomizeGroupOrder(Collection $questions): Collection
    {
        $groups = collect();
        $standaloneQuestions = collect();
        $currentGroup = null;
        $currentGroupQuestions = collect();

        foreach ($questions as $question) {
            if ($question->isStandalone()) {
                // If we have a current group, add it to groups
                if ($currentGroup) {
                    $groups->push([
                        'group' => $currentGroup,
                        'questions' => $currentGroupQuestions
                    ]);
                    $currentGroup = null;
                    $currentGroupQuestions = collect();
                }
                $standaloneQuestions->push($question);
            } else {
                // This is a grouped question
                if (!$currentGroup || $currentGroup->id !== $question->question_group_id) {
                    // New group, save previous group if exists
                    if ($currentGroup) {
                        $groups->push([
                            'group' => $currentGroup,
                            'questions' => $currentGroupQuestions
                        ]);
                    }
                    $currentGroup = $question->questionGroup;
                    $currentGroupQuestions = collect();
                }
                $currentGroupQuestions->push($question);
            }
        }

        // Add the last group if exists
        if ($currentGroup) {
            $groups->push([
                'group' => $currentGroup,
                'questions' => $currentGroupQuestions
            ]);
        }

        // Shuffle groups and standalone questions
        $groups = $groups->shuffle();
        $standaloneQuestions = $standaloneQuestions->shuffle();

        // Combine everything
        $result = collect();
        
        // Add standalone questions first
        $result = $result->merge($standaloneQuestions);
        
        // Add groups
        foreach ($groups as $groupData) {
            $result = $result->merge($groupData['questions']);
        }

        return $result;
    }

    /**
     * Randomize answers for questions that support it
     */
    protected function randomizeAnswers(Collection $questions): Collection
    {
        return $questions->map(function ($question) {
            if (in_array($question->type, [Question::TYPE_MULTIPLE_CHOICE, Question::TYPE_TRUE_FALSE])) {
                $question->randomized_options = $this->randomizeQuestionOptions($question);
            }
            return $question;
        });
    }

    /**
     * Randomize options for a specific question
     */
    protected function randomizeQuestionOptions(Question $question): array
    {
        if (!$question->options) {
            return [];
        }

        $options = $question->options;
        $keys = array_keys($options);
        shuffle($keys);
        
        $randomized = [];
        foreach ($keys as $key) {
            $randomized[$key] = $options[$key];
        }
        
        return $randomized;
    }

    /**
     * Get questions for exam with proper randomization
     */
    public function getRandomizedQuestionsForExam($examSubject, bool $randomizeQuestions = true, bool $randomizeAnswers = true): Collection
    {
        $questionIds = $examSubject->question_ids ?? [];
        if (empty($questionIds)) {
            return collect();
        }

        $questions = Question::whereIn('id', $questionIds)
            ->with(['questionGroup'])
            ->get();

        return $this->randomizeQuestions($questions, $randomizeQuestions, $randomizeAnswers);
    }

    /**
     * Get questions grouped by stimulus for display
     */
    public function getQuestionsGroupedByStimulus(Collection $questions): Collection
    {
        $grouped = collect();
        $currentGroup = null;
        $currentGroupQuestions = collect();

        foreach ($questions as $question) {
            if ($question->isStandalone()) {
                // If we have a current group, add it to grouped
                if ($currentGroup) {
                    $grouped->push([
                        'type' => 'group',
                        'group' => $currentGroup,
                        'questions' => $currentGroupQuestions
                    ]);
                    $currentGroup = null;
                    $currentGroupQuestions = collect();
                }
                
                // Add standalone question
                $grouped->push([
                    'type' => 'standalone',
                    'question' => $question
                ]);
            } else {
                // This is a grouped question
                if (!$currentGroup || $currentGroup->id !== $question->question_group_id) {
                    // New group, save previous group if exists
                    if ($currentGroup) {
                        $grouped->push([
                            'type' => 'group',
                            'group' => $currentGroup,
                            'questions' => $currentGroupQuestions
                        ]);
                    }
                    $currentGroup = $question->questionGroup;
                    $currentGroupQuestions = collect();
                }
                $currentGroupQuestions->push($question);
            }
        }

        // Add the last group if exists
        if ($currentGroup) {
            $grouped->push([
                'type' => 'group',
                'group' => $currentGroup,
                'questions' => $currentGroupQuestions
            ]);
        }

        return $grouped;
    }

    /**
     * Validate question group integrity
     */
    public function validateQuestionGroupIntegrity(Collection $questions): array
    {
        $errors = [];
        $groupIds = $questions->whereNotNull('question_group_id')->pluck('question_group_id')->unique();

        foreach ($groupIds as $groupId) {
            $group = QuestionGroup::find($groupId);
            if (!$group) {
                $errors[] = "Question group with ID {$groupId} not found";
                continue;
            }

            $groupQuestions = $questions->where('question_group_id', $groupId);
            if ($groupQuestions->count() === 0) {
                $errors[] = "No questions found for group: {$group->title}";
            }
        }

        return $errors;
    }

    /**
     * Get statistics for randomized questions
     */
    public function getRandomizationStatistics(Collection $questions): array
    {
        $totalQuestions = $questions->count();
        $groupedQuestions = $questions->whereNotNull('question_group_id');
        $standaloneQuestions = $questions->whereNull('question_group_id');
        $uniqueGroups = $groupedQuestions->pluck('question_group_id')->unique()->count();

        return [
            'total_questions' => $totalQuestions,
            'grouped_questions' => $groupedQuestions->count(),
            'standalone_questions' => $standaloneQuestions->count(),
            'unique_groups' => $uniqueGroups,
            'grouping_percentage' => $totalQuestions > 0 ? round(($groupedQuestions->count() / $totalQuestions) * 100, 2) : 0,
        ];
    }
}
