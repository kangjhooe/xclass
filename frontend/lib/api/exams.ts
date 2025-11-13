import apiClient from './client';

export interface Exam {
  id: number;
  title: string;
  description?: string;
  subjectId?: number;
  subject?: {
    id: number;
    name: string;
  };
  classId?: number;
  classRoom?: {
    id: number;
    name: string;
  };
  startDate: string;
  endDate: string;
  duration?: number; // in minutes
  totalQuestions?: number;
  passingScore?: number;
  isActive?: boolean;
  created_at?: string;
  updated_at?: string;
  examType?: string;
  status?: string;
  startTime?: string;
  endTime?: string;
  academicYear?: string;
  allowReview?: boolean;
  showCorrectAnswers?: boolean;
  randomizeQuestions?: boolean;
  randomizeAnswers?: boolean;
  maxAttempts?: number;
}

export interface ExamCreateData {
  title: string;
  description?: string;
  subjectId?: number;
  classId?: number;
  startDate: string;
  endDate: string;
  duration?: number;
  totalQuestions?: number;
  passingScore?: number;
  isActive?: boolean;
  academicYear?: string;
}

export interface ExamQuestion {
  id: number;
  examId: number;
  questionText: string;
  questionType: 'multiple_choice' | 'true_false' | 'essay' | 'fill_blank' | 'matching';
  options?: Record<string, any>;
  correctAnswer?: string;
  explanation?: string;
  points: number;
  difficulty: 'easy' | 'medium' | 'hard';
  order: number;
  isActive: boolean;
}

export interface ExamAttempt {
  id: number;
  examId: number;
  studentId: number;
  startedAt?: string;
  submittedAt?: string;
  status: 'started' | 'in_progress' | 'completed' | 'abandoned' | 'timeout';
  score: number;
  totalQuestions: number;
  correctAnswers: number;
  timeSpent: number; // in seconds
  questionOrder?: number[];
  answerOrder?: Record<string, any>;
  exam?: Exam;
}

export interface StartExamAttemptDto {
  scheduleId: number;
  ipAddress?: string;
  userAgent?: string;
}

export interface SubmitExamAnswerDto {
  questionId: number;
  answer: string;
  answerData?: Record<string, any>;
  timeSpent?: number;
}

export const examsApi = {
  getAll: async (
    tenantId: number,
    params?: { classId?: number; subjectId?: number; status?: string; examType?: string; academicYear?: string }
  ): Promise<{ data: Exam[]; total: number }> => {
    const response = await apiClient.get(`/tenants/${tenantId}/exams`, { params });
    return response.data;
  },

  getById: async (tenantId: number, id: number): Promise<Exam> => {
    const response = await apiClient.get(`/tenants/${tenantId}/exams/${id}`);
    return response.data;
  },

  create: async (tenantId: number, data: ExamCreateData): Promise<Exam> => {
    const response = await apiClient.post(`/tenants/${tenantId}/exams`, data);
    return response.data;
  },

  update: async (tenantId: number, id: number, data: Partial<ExamCreateData>): Promise<Exam> => {
    const response = await apiClient.patch(`/tenants/${tenantId}/exams/${id}`, data);
    return response.data;
  },

  delete: async (tenantId: number, id: number): Promise<void> => {
    await apiClient.delete(`/tenants/${tenantId}/exams/${id}`);
  },

  // Exam Questions
  getExamQuestions: async (examId: number): Promise<ExamQuestion[]> => {
    const response = await apiClient.get(`/exams/${examId}/questions`);
    return response.data;
  },

  createQuestion: async (examId: number, data: Partial<ExamQuestion>): Promise<ExamQuestion> => {
    const response = await apiClient.post(`/exams/${examId}/questions`, data);
    return response.data;
  },

  // Exam Schedules
  getSchedules: async (params?: {
    examId?: number;
    classId?: number;
    subjectId?: number;
    status?: string;
  }): Promise<{ data: any[]; total: number }> => {
    const response = await apiClient.get(`/exams/schedules`, { params });
    return response.data;
  },

  getSchedule: async (scheduleId: number): Promise<any> => {
    const response = await apiClient.get(`/exams/schedules/${scheduleId}`);
    return response.data;
  },

  // Exam Attempts
  startAttempt: async (data: StartExamAttemptDto, studentId?: number): Promise<ExamAttempt> => {
    const response = await apiClient.post(`/exams/attempts/start?studentId=${studentId || ''}`, data);
    return response.data;
  },

  getAttempt: async (attemptId: number): Promise<ExamAttempt> => {
    const response = await apiClient.get(`/exams/attempts/${attemptId}`);
    return response.data;
  },

  submitAnswer: async (attemptId: number, data: SubmitExamAnswerDto): Promise<ExamAttempt> => {
    const response = await apiClient.post(`/exams/attempts/${attemptId}/answers`, data);
    return response.data;
  },

  submitAttempt: async (attemptId: number): Promise<ExamAttempt> => {
    const response = await apiClient.post(`/exams/attempts/${attemptId}/submit`);
    return response.data;
  },

  getStudentAttempts: async (studentId: number): Promise<ExamAttempt[]> => {
    const response = await apiClient.get(`/exams/students/${studentId}/attempts`);
    return response.data;
  },

  getExamResults: async (tenantId: number, examId: number): Promise<any> => {
    const response = await apiClient.get(`/tenants/${tenantId}/exams/${examId}/results`);
    return response.data;
  },

  // Question Banks
  createQuestionBank: async (data: any): Promise<any> => {
    const response = await apiClient.post(`/exams/question-banks`, data);
    return response.data;
  },

  getQuestionBanks: async (params?: { subjectId?: number; classId?: number }): Promise<any> => {
    const response = await apiClient.get(`/exams/question-banks`, { params });
    return response.data;
  },

  getQuestionBank: async (bankId: number): Promise<any> => {
    const response = await apiClient.get(`/exams/question-banks/${bankId}`);
    return response.data;
  },

  updateQuestionBank: async (bankId: number, data: any): Promise<any> => {
    const response = await apiClient.patch(`/exams/question-banks/${bankId}`, data);
    return response.data;
  },

  deleteQuestionBank: async (bankId: number): Promise<any> => {
    const response = await apiClient.delete(`/exams/question-banks/${bankId}`);
    return response.data;
  },

  exportQuestionBank: async (bankId: number, includeStimuli: boolean = true): Promise<Blob> => {
    const response = await apiClient.get(`/exams/question-banks/${bankId}/export`, {
      params: { includeStimuli },
      responseType: 'blob',
    });
    return response.data;
  },

  importQuestionBank: async (file: File, data: {
    targetBankId?: number;
    name?: string;
    subjectId?: number;
    classId?: number;
    overwriteExisting?: boolean;
  }): Promise<any> => {
    const formData = new FormData();
    formData.append('file', file);
    if (data.targetBankId) formData.append('targetBankId', data.targetBankId.toString());
    if (data.name) formData.append('name', data.name);
    if (data.subjectId) formData.append('subjectId', data.subjectId.toString());
    if (data.classId) formData.append('classId', data.classId.toString());
    if (data.overwriteExisting !== undefined) formData.append('overwriteExisting', data.overwriteExisting.toString());

    const response = await apiClient.post(`/exams/question-banks/import`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Questions
  createQuestion: async (data: any): Promise<any> => {
    const response = await apiClient.post(`/exams/questions`, data);
    return response.data;
  },

  getQuestions: async (params?: {
    questionBankId?: number;
    difficulty?: number;
    questionType?: string;
  }): Promise<any> => {
    const response = await apiClient.get(`/exams/questions`, { params });
    return response.data;
  },

  updateQuestion: async (questionId: number, data: any): Promise<any> => {
    const response = await apiClient.patch(`/exams/questions/${questionId}`, data);
    return response.data;
  },

  deleteQuestion: async (questionId: number): Promise<any> => {
    const response = await apiClient.delete(`/exams/questions/${questionId}`);
    return response.data;
  },

  // Stimulus
  createStimulus: async (data: any): Promise<any> => {
    const response = await apiClient.post(`/exams/stimuli`, data);
    return response.data;
  },

  getStimuli: async (): Promise<any> => {
    const response = await apiClient.get(`/exams/stimuli`);
    return response.data;
  },

  // Add Question to Exam
  addQuestionToExam: async (examId: number, data: any): Promise<any> => {
    const response = await apiClient.post(`/exams/${examId}/questions/add`, data);
    return response.data;
  },

  removeQuestionFromExam: async (examId: number, questionId: number): Promise<any> => {
    const response = await apiClient.delete(`/exams/${examId}/questions/${questionId}`);
    return response.data;
  },

  // Question Share
  shareQuestion: async (data: any): Promise<any> => {
    const response = await apiClient.post(`/exams/questions/share`, data);
    return response.data;
  },

  getPendingShares: async (): Promise<any> => {
    const response = await apiClient.get(`/exams/question-shares/pending`);
    return response.data;
  },

  getApprovedShares: async (): Promise<any> => {
    const response = await apiClient.get(`/exams/question-shares/approved`);
    return response.data;
  },

  approveQuestionShare: async (shareId: number): Promise<any> => {
    const response = await apiClient.post(`/exams/question-shares/${shareId}/approve`);
    return response.data;
  },

  rejectQuestionShare: async (shareId: number): Promise<any> => {
    const response = await apiClient.post(`/exams/question-shares/${shareId}/reject`);
    return response.data;
  },

  // Grade Conversion
  createGradeConversion: async (data: any): Promise<any> => {
    const response = await apiClient.post(`/exams/grade-conversions`, data);
    return response.data;
  },

  applyGradeConversion: async (examId: number, conversionId: number): Promise<any> => {
    const response = await apiClient.post(`/exams/${examId}/grade-conversions/${conversionId}/apply`);
    return response.data;
  },

  // Exam Weight
  createExamWeight: async (data: any): Promise<any> => {
    const response = await apiClient.post(`/exams/exam-weights`, data);
    return response.data;
  },

  getExamWeights: async (params: {
    subjectId: number;
    classId: number;
    semester: string;
    academicYear: string;
  }): Promise<any> => {
    const response = await apiClient.get(`/exams/exam-weights`, { params });
    return response.data;
  },

  updateExamWeight: async (weightId: number, data: any): Promise<any> => {
    const response = await apiClient.patch(`/exams/exam-weights/${weightId}`, data);
    return response.data;
  },

  deleteExamWeight: async (weightId: number): Promise<any> => {
    const response = await apiClient.delete(`/exams/exam-weights/${weightId}`);
    return response.data;
  },

  // Item Analysis
  analyzeExamQuestions: async (examId: number): Promise<any> => {
    const response = await apiClient.post(`/exams/${examId}/item-analysis`);
    return response.data;
  },

  getAllItemAnalyses: async (examId: number): Promise<any> => {
    const response = await apiClient.get(`/exams/${examId}/item-analysis`);
    return response.data;
  },

  getQuestionItemAnalysis: async (examId: number, questionId: number): Promise<any> => {
    const response = await apiClient.get(`/exams/${examId}/item-analysis/${questionId}`);
    return response.data;
  },
};

