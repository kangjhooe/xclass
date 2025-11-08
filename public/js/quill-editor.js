// Quill.js Editor Configuration
class QuillEditor {
    constructor() {
        this.editors = new Map();
        this.defaultConfig = {
            theme: 'snow',
            modules: {
                toolbar: [
                    [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
                    ['bold', 'italic', 'underline', 'strike'],
                    [{ 'color': [] }, { 'background': [] }],
                    [{ 'list': 'ordered'}, { 'list': 'bullet' }],
                    [{ 'indent': '-1'}, { 'indent': '+1' }],
                    [{ 'align': [] }],
                    ['link', 'image'],
                    ['clean']
                ]
            },
            placeholder: 'Tuliskan konten di sini...'
        };
        
        this.init();
    }

    init() {
        // Initialize editors for different contexts
        this.initTemplateEditor();
        this.initCorrespondenceEditor();
        this.initExamEditor();
        this.initHealthEditor();
        this.initEssayEditor();
        this.initNewsEditor();
    }

    // Template Surat Editor
    initTemplateEditor() {
        const templateTextarea = document.getElementById('isi_template');
        if (templateTextarea) {
            const editorContainer = document.createElement('div');
            editorContainer.id = 'template-editor';
            editorContainer.style.height = '300px';
            
            templateTextarea.parentNode.insertBefore(editorContainer, templateTextarea);
            templateTextarea.style.display = 'none';
            
            const quill = new Quill(editorContainer, {
                ...this.defaultConfig,
                placeholder: 'Masukkan isi template surat...'
            });
            
            // Load existing content
            if (templateTextarea.value) {
                quill.root.innerHTML = templateTextarea.value;
            }
            
            // Sync with textarea
            quill.on('text-change', () => {
                templateTextarea.value = quill.root.innerHTML;
            });
            
            this.editors.set('template', quill);
        }
    }

    // Surat Masuk/Keluar Editor
    initCorrespondenceEditor() {
        const contentTextarea = document.getElementById('content');
        if (contentTextarea) {
            const editorContainer = document.createElement('div');
            editorContainer.id = 'content-editor';
            editorContainer.style.height = '400px';
            
            contentTextarea.parentNode.insertBefore(editorContainer, contentTextarea);
            contentTextarea.style.display = 'none';
            
            const quill = new Quill(editorContainer, {
                ...this.defaultConfig,
                placeholder: 'Tuliskan isi surat di sini...'
            });
            
            // Load existing content
            if (contentTextarea.value) {
                quill.root.innerHTML = contentTextarea.value;
            }
            
            // Sync with textarea
            quill.on('text-change', () => {
                contentTextarea.value = quill.root.innerHTML;
            });
            
            this.editors.set('correspondence', quill);
        }
    }

    // Soal Ujian Editor
    initExamEditor() {
        // Question Text Editor
        const questionTextarea = document.getElementById('question_text');
        if (questionTextarea) {
            const editorContainer = document.createElement('div');
            editorContainer.id = 'question-editor';
            editorContainer.style.height = '200px';
            
            questionTextarea.parentNode.insertBefore(editorContainer, questionTextarea);
            questionTextarea.style.display = 'none';
            
            const quill = new Quill(editorContainer, {
                ...this.defaultConfig,
                placeholder: 'Masukkan pertanyaan...'
            });
            
            // Load existing content
            if (questionTextarea.value) {
                quill.root.innerHTML = questionTextarea.value;
            }
            
            // Sync with textarea
            quill.on('text-change', () => {
                questionTextarea.value = quill.root.innerHTML;
            });
            
            this.editors.set('question', quill);
        }

        // Explanation Editor
        const explanationTextarea = document.getElementById('explanation');
        if (explanationTextarea) {
            const editorContainer = document.createElement('div');
            editorContainer.id = 'explanation-editor';
            editorContainer.style.height = '150px';
            
            explanationTextarea.parentNode.insertBefore(editorContainer, explanationTextarea);
            explanationTextarea.style.display = 'none';
            
            const quill = new Quill(editorContainer, {
                ...this.defaultConfig,
                placeholder: 'Masukkan penjelasan jawaban...'
            });
            
            // Load existing content
            if (explanationTextarea.value) {
                quill.root.innerHTML = explanationTextarea.value;
            }
            
            // Sync with textarea
            quill.on('text-change', () => {
                explanationTextarea.value = quill.root.innerHTML;
            });
            
            this.editors.set('explanation', quill);
        }
    }

    // Catatan Kesehatan Editor
    initHealthEditor() {
        const healthFields = ['symptoms', 'diagnosis', 'treatment', 'medication'];
        
        healthFields.forEach(fieldName => {
            const textarea = document.getElementById(fieldName);
            if (textarea) {
                const editorContainer = document.createElement('div');
                editorContainer.id = `${fieldName}-editor`;
                editorContainer.style.height = '120px';
                
                textarea.parentNode.insertBefore(editorContainer, textarea);
                textarea.style.display = 'none';
                
                const quill = new Quill(editorContainer, {
                    ...this.defaultConfig,
                    placeholder: `Masukkan ${this.getFieldLabel(fieldName)}...`
                });
                
                // Load existing content
                if (textarea.value) {
                    quill.root.innerHTML = textarea.value;
                }
                
                // Sync with textarea
                quill.on('text-change', () => {
                    textarea.value = quill.root.innerHTML;
                });
                
                this.editors.set(fieldName, quill);
            }
        });
    }

    // Jawaban Essay Editor (untuk halaman ujian)
    initEssayEditor() {
        const essayTextareas = document.querySelectorAll('textarea[data-question-id]');
        
        essayTextareas.forEach((textarea, index) => {
            if (textarea.placeholder.includes('jawaban') || textarea.placeholder.includes('essay')) {
                const questionId = textarea.getAttribute('data-question-id');
                const editorContainer = document.createElement('div');
                editorContainer.id = `essay-editor-${questionId}`;
                editorContainer.style.height = '200px';
                editorContainer.style.marginBottom = '15px';
                
                // Find the container div and insert editor
                const container = document.getElementById(`essay-editor-container-${questionId}`);
                if (container) {
                    container.appendChild(editorContainer);
                    textarea.style.display = 'none';
                    
                    const quill = new Quill(editorContainer, {
                        ...this.defaultConfig,
                        placeholder: 'Tulis jawaban Anda di sini...'
                    });
                    
                    // Load existing content
                    if (textarea.value) {
                        quill.root.innerHTML = textarea.value;
                    }
                    
                    // Sync with textarea
                    quill.on('text-change', () => {
                        textarea.value = quill.root.innerHTML;
                    });
                    
                    this.editors.set(`essay-${questionId}`, quill);
                }
            }
        });
    }

    // Berita Editor
    initNewsEditor() {
        // Content Editor - Check if div already exists
        let editorContainer = document.getElementById('news-content-editor');
        const contentTextarea = document.getElementById('content');
        
        if (!editorContainer && contentTextarea) {
            // Create div if it doesn't exist (backward compatibility)
            editorContainer = document.createElement('div');
            editorContainer.id = 'news-content-editor';
            editorContainer.style.height = '400px';
            contentTextarea.parentNode.insertBefore(editorContainer, contentTextarea);
            contentTextarea.style.display = 'none';
        }
        
        if (editorContainer && contentTextarea) {
            const quill = new Quill(editorContainer, {
                ...this.defaultConfig,
                placeholder: 'Tuliskan konten berita di sini...'
            });
            
            // Load existing content
            if (contentTextarea.value) {
                quill.root.innerHTML = contentTextarea.value;
            }
            
            // Sync with textarea
            quill.on('text-change', () => {
                contentTextarea.value = quill.root.innerHTML;
            });
            
            this.editors.set('news-content', quill);
        }

        // Excerpt Editor - Check if div already exists
        let excerptEditorContainer = document.getElementById('news-excerpt-editor');
        const excerptTextarea = document.getElementById('excerpt');
        
        if (!excerptEditorContainer && excerptTextarea) {
            // Create div if it doesn't exist (backward compatibility)
            excerptEditorContainer = document.createElement('div');
            excerptEditorContainer.id = 'news-excerpt-editor';
            excerptEditorContainer.style.height = '150px';
            excerptTextarea.parentNode.insertBefore(excerptEditorContainer, excerptTextarea);
            excerptTextarea.style.display = 'none';
        }
        
        if (excerptEditorContainer && excerptTextarea) {
            const quill = new Quill(excerptEditorContainer, {
                ...this.defaultConfig,
                placeholder: 'Tuliskan ringkasan berita di sini...'
            });
            
            // Load existing content
            if (excerptTextarea.value) {
                quill.root.innerHTML = excerptTextarea.value;
            }
            
            // Sync with textarea
            quill.on('text-change', () => {
                excerptTextarea.value = quill.root.innerHTML;
            });
            
            this.editors.set('news-excerpt', quill);
        }
    }

    getFieldLabel(fieldName) {
        const labels = {
            'symptoms': 'gejala',
            'diagnosis': 'diagnosis',
            'treatment': 'perawatan',
            'medication': 'obat-obatan'
        };
        return labels[fieldName] || fieldName;
    }

    // Method to get editor content as HTML
    getContent(editorName) {
        const editor = this.editors.get(editorName);
        return editor ? editor.root.innerHTML : '';
    }

    // Method to set editor content
    setContent(editorName, content) {
        const editor = this.editors.get(editorName);
        if (editor) {
            editor.root.innerHTML = content;
        }
    }

    // Method to get all editors content as plain text
    getAllContentAsText() {
        const content = {};
        this.editors.forEach((editor, name) => {
            content[name] = editor.getText();
        });
        return content;
    }
}

// Initialize Quill Editor when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Check if Quill is loaded
    if (typeof Quill !== 'undefined') {
        window.quillEditor = new QuillEditor();
    } else {
        console.error('Quill.js tidak ditemukan. Pastikan Quill.js sudah dimuat.');
    }
});

// Export for global access
window.QuillEditor = QuillEditor;
