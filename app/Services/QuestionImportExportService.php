<?php

namespace App\Services;

use App\Models\Tenant\Question;
use App\Models\Tenant\QuestionGroup;
use App\Models\Tenant\Subject;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Http\UploadedFile;
use PhpOffice\PhpSpreadsheet\IOFactory;
use PhpOffice\PhpSpreadsheet\Spreadsheet;
use PhpOffice\PhpSpreadsheet\Writer\Xlsx;

class QuestionImportExportService
{
    /**
     * Export questions to Excel with stimulus support
     */
    public function exportToExcel($questions, $filename = null)
    {
        $spreadsheet = new Spreadsheet();
        $sheet = $spreadsheet->getActiveSheet();
        
        // Headers
        $headers = [
            'A1' => 'ID',
            'B1' => 'Subject',
            'C1' => 'Question Group',
            'D1' => 'Group Order',
            'E1' => 'Question Text',
            'F1' => 'Type',
            'G1' => 'Options (JSON)',
            'H1' => 'Answer Key',
            'I1' => 'Points',
            'J1' => 'Difficulty',
            'K1' => 'Explanation',
            'L1' => 'Visibility',
            'M1' => 'Stimulus Type',
            'N1' => 'Stimulus Content',
            'O1' => 'Stimulus Description'
        ];
        
        foreach ($headers as $cell => $value) {
            $sheet->setCellValue($cell, $value);
        }
        
        // Style headers
        $sheet->getStyle('A1:O1')->getFont()->setBold(true);
        $sheet->getStyle('A1:O1')->getFill()
            ->setFillType(\PhpOffice\PhpSpreadsheet\Style\Fill::FILL_SOLID)
            ->getStartColor()->setRGB('E3F2FD');
        
        // Data
        $row = 2;
        foreach ($questions as $question) {
            $sheet->setCellValue('A' . $row, $question->id);
            $sheet->setCellValue('B' . $row, $question->subject->name ?? '');
            $sheet->setCellValue('C' . $row, $question->questionGroup->title ?? '');
            $sheet->setCellValue('D' . $row, $question->group_order ?? '');
            $sheet->setCellValue('E' . $row, $question->question_text);
            $sheet->setCellValue('F' . $row, $question->type);
            $sheet->setCellValue('G' . $row, json_encode($question->options));
            $sheet->setCellValue('H' . $row, $question->answer_key);
            $sheet->setCellValue('I' . $row, $question->points);
            $sheet->setCellValue('J' . $row, $question->difficulty);
            $sheet->setCellValue('K' . $row, $question->explanation ?? '');
            $sheet->setCellValue('L' . $row, $question->visibility);
            $sheet->setCellValue('M' . $row, $question->questionGroup->stimulus_type ?? '');
            $sheet->setCellValue('N' . $row, $question->questionGroup->stimulus_content ?? '');
            $sheet->setCellValue('O' . $row, $question->questionGroup->description ?? '');
            $row++;
        }
        
        // Auto-size columns
        foreach (range('A', 'O') as $column) {
            $sheet->getColumnDimension($column)->setAutoSize(true);
        }
        
        // Save file
        $filename = $filename ?: 'questions_export_' . date('Y-m-d_H-i-s') . '.xlsx';
        $writer = new Xlsx($spreadsheet);
        
        $tempPath = storage_path('app/temp/' . $filename);
        $writer->save($tempPath);
        
        return $tempPath;
    }

    /**
     * Export questions to JSON with stimulus support
     */
    public function exportToJson($questions, $filename = null)
    {
        $data = [
            'export_info' => [
                'exported_at' => now()->toISOString(),
                'total_questions' => $questions->count(),
                'version' => '1.0'
            ],
            'question_groups' => [],
            'questions' => []
        ];

        // Group questions by question group
        $groupedQuestions = $questions->groupBy('question_group_id');
        
        foreach ($groupedQuestions as $groupId => $groupQuestions) {
            if ($groupId) {
                $group = $groupQuestions->first()->questionGroup;
                $data['question_groups'][] = [
                    'id' => $group->id,
                    'title' => $group->title,
                    'description' => $group->description,
                    'stimulus_type' => $group->stimulus_type,
                    'stimulus_content' => $group->stimulus_content,
                    'metadata' => $group->metadata,
                    'created_at' => $group->created_at->toISOString(),
                    'updated_at' => $group->updated_at->toISOString()
                ];
            }
        }

        // Add questions
        foreach ($questions as $question) {
            $data['questions'][] = [
                'id' => $question->id,
                'subject_id' => $question->subject_id,
                'question_group_id' => $question->question_group_id,
                'group_order' => $question->group_order,
                'question_text' => $question->question_text,
                'type' => $question->type,
                'options' => $question->options,
                'answer_key' => $question->answer_key,
                'points' => $question->points,
                'difficulty' => $question->difficulty,
                'explanation' => $question->explanation,
                'visibility' => $question->visibility,
                'created_at' => $question->created_at->toISOString(),
                'updated_at' => $question->updated_at->toISOString()
            ];
        }

        $filename = $filename ?: 'questions_export_' . date('Y-m-d_H-i-s') . '.json';
        $tempPath = storage_path('app/temp/' . $filename);
        
        file_put_contents($tempPath, json_encode($data, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));
        
        return $tempPath;
    }

    /**
     * Import questions from Excel with stimulus support
     */
    public function importFromExcel(UploadedFile $file, $subjectId, $creatorId, $tenantId)
    {
        $spreadsheet = IOFactory::load($file->getPathname());
        $worksheet = $spreadsheet->getActiveSheet();
        $rows = $worksheet->toArray();
        
        // Skip header row
        $data = array_slice($rows, 1);
        
        $importedQuestions = [];
        $questionGroups = [];
        
        DB::beginTransaction();
        try {
            foreach ($data as $row) {
                if (empty($row[0])) continue; // Skip empty rows
                
                // Check if this is a question group row
                if (!empty($row[2]) && !empty($row[12])) { // Question Group and Stimulus Type
                    $groupId = $row[0];
                    $groupTitle = $row[2];
                    $stimulusType = $row[12];
                    $stimulusContent = $row[13];
                    $stimulusDescription = $row[14] ?? '';
                    
                    if (!isset($questionGroups[$groupId])) {
                        $questionGroup = QuestionGroup::create([
                            'tenant_id' => $tenantId,
                            'subject_id' => $subjectId,
                            'created_by' => $creatorId,
                            'title' => $groupTitle,
                            'description' => $stimulusDescription,
                            'stimulus_type' => $stimulusType,
                            'stimulus_content' => $stimulusContent,
                        ]);
                        
                        $questionGroups[$groupId] = $questionGroup;
                    }
                }
                
                // Create question
                $question = Question::create([
                    'tenant_id' => $tenantId,
                    'subject_id' => $subjectId,
                    'creator_id' => $creatorId,
                    'question_group_id' => !empty($row[2]) ? $questionGroups[$row[0]]->id ?? null : null,
                    'group_order' => $row[3] ?? 0,
                    'question_text' => $row[4],
                    'type' => $row[5],
                    'options' => !empty($row[6]) ? json_decode($row[6], true) : null,
                    'answer_key' => $row[7],
                    'points' => $row[8] ?? 1,
                    'difficulty' => $row[9] ?? 'medium',
                    'explanation' => $row[10] ?? '',
                    'visibility' => $row[11] ?? 'private',
                ]);
                
                $importedQuestions[] = $question;
            }
            
            DB::commit();
            return [
                'success' => true,
                'questions_count' => count($importedQuestions),
                'groups_count' => count($questionGroups),
                'questions' => $importedQuestions
            ];
            
        } catch (\Exception $e) {
            DB::rollBack();
            return [
                'success' => false,
                'error' => $e->getMessage()
            ];
        }
    }

    /**
     * Import questions from JSON with stimulus support
     */
    public function importFromJson(UploadedFile $file, $subjectId, $creatorId, $tenantId)
    {
        $content = file_get_contents($file->getPathname());
        $data = json_decode($content, true);
        
        if (!$data) {
            return [
                'success' => false,
                'error' => 'Invalid JSON format'
            ];
        }
        
        $importedQuestions = [];
        $questionGroups = [];
        
        DB::beginTransaction();
        try {
            // Import question groups first
            if (isset($data['question_groups'])) {
                foreach ($data['question_groups'] as $groupData) {
                    $questionGroup = QuestionGroup::create([
                        'tenant_id' => $tenantId,
                        'subject_id' => $subjectId,
                        'created_by' => $creatorId,
                        'title' => $groupData['title'],
                        'description' => $groupData['description'] ?? '',
                        'stimulus_type' => $groupData['stimulus_type'],
                        'stimulus_content' => $groupData['stimulus_content'],
                        'metadata' => $groupData['metadata'] ?? [],
                    ]);
                    
                    $questionGroups[$groupData['id']] = $questionGroup;
                }
            }
            
            // Import questions
            if (isset($data['questions'])) {
                foreach ($data['questions'] as $questionData) {
                    $question = Question::create([
                        'tenant_id' => $tenantId,
                        'subject_id' => $subjectId,
                        'creator_id' => $creatorId,
                        'question_group_id' => $questionData['question_group_id'] ? 
                            ($questionGroups[$questionData['question_group_id']]->id ?? null) : null,
                        'group_order' => $questionData['group_order'] ?? 0,
                        'question_text' => $questionData['question_text'],
                        'type' => $questionData['type'],
                        'options' => $questionData['options'],
                        'answer_key' => $questionData['answer_key'],
                        'points' => $questionData['points'] ?? 1,
                        'difficulty' => $questionData['difficulty'] ?? 'medium',
                        'explanation' => $questionData['explanation'] ?? '',
                        'visibility' => $questionData['visibility'] ?? 'private',
                    ]);
                    
                    $importedQuestions[] = $question;
                }
            }
            
            DB::commit();
            return [
                'success' => true,
                'questions_count' => count($importedQuestions),
                'groups_count' => count($questionGroups),
                'questions' => $importedQuestions
            ];
            
        } catch (\Exception $e) {
            DB::rollBack();
            return [
                'success' => false,
                'error' => $e->getMessage()
            ];
        }
    }

    /**
     * Get import template for Excel
     */
    public function getImportTemplate()
    {
        $spreadsheet = new Spreadsheet();
        $sheet = $spreadsheet->getActiveSheet();
        
        // Headers
        $headers = [
            'A1' => 'ID',
            'B1' => 'Subject',
            'C1' => 'Question Group',
            'D1' => 'Group Order',
            'E1' => 'Question Text',
            'F1' => 'Type',
            'G1' => 'Options (JSON)',
            'H1' => 'Answer Key',
            'I1' => 'Points',
            'J1' => 'Difficulty',
            'K1' => 'Explanation',
            'L1' => 'Visibility',
            'M1' => 'Stimulus Type',
            'N1' => 'Stimulus Content',
            'O1' => 'Stimulus Description'
        ];
        
        foreach ($headers as $cell => $value) {
            $sheet->setCellValue($cell, $value);
        }
        
        // Style headers
        $sheet->getStyle('A1:O1')->getFont()->setBold(true);
        $sheet->getStyle('A1:O1')->getFill()
            ->setFillType(\PhpOffice\PhpSpreadsheet\Style\Fill::FILL_SOLID)
            ->getStartColor()->setRGB('E3F2FD');
        
        // Add example data
        $examples = [
            ['1', 'Matematika', 'Soal Cerita', '1', 'Berapa hasil dari 2 + 2?', 'multiple_choice', '{"A":"3","B":"4","C":"5","D":"6"}', 'B', '2', 'easy', 'Penjumlahan dasar', 'private', 'text', 'Seorang pedagang memiliki 10 apel...', 'Cerita tentang pedagang'],
            ['2', 'Matematika', 'Soal Cerita', '2', 'Berapa hasil dari 3 + 3?', 'multiple_choice', '{"A":"5","B":"6","C":"7","D":"8"}', 'B', '2', 'easy', 'Penjumlahan dasar', 'private', '', '', ''],
        ];
        
        $row = 2;
        foreach ($examples as $example) {
            $col = 'A';
            foreach ($example as $value) {
                $sheet->setCellValue($col . $row, $value);
                $col++;
            }
            $row++;
        }
        
        // Auto-size columns
        foreach (range('A', 'O') as $column) {
            $sheet->getColumnDimension($column)->setAutoSize(true);
        }
        
        // Save template
        $filename = 'question_import_template.xlsx';
        $writer = new Xlsx($spreadsheet);
        
        $tempPath = storage_path('app/temp/' . $filename);
        $writer->save($tempPath);
        
        return $tempPath;
    }
}
