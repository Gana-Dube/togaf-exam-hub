let currentExamData = null;
let allAnswersVisible = true; // Track global state
let imageFilterActive = false; // Track image filter state

function showHome() {
    document.getElementById('home-view').style.display = 'block';
    document.getElementById('exam-view').style.display = 'none';
}

async function loadExam(examType) {
    try {
        const response = await fetch(`data/${examType}.json`);
        currentExamData = await response.json();
        
        document.getElementById('home-view').style.display = 'none';
        document.getElementById('exam-view').style.display = 'block';
        
        // Reset global state when loading new exam
        allAnswersVisible = true;
        imageFilterActive = false;
        updateToggleAllButton();
        
        updateStats();
        renderQuestions();
    } catch (error) {
        console.error('Error loading exam data:', error);
        alert('Error loading exam data. Please check if the JSON files are available.');
    }
}

function updateStats() {
    const questions = currentExamData.questions;
    document.getElementById('total-questions').textContent = questions.length;
    document.getElementById('with-images').textContent = questions.filter(q => q.image).length;
}

function renderQuestions() {
    const container = document.getElementById('questions-container');
    container.innerHTML = '';

    // Check if this is Part 2 exam
    const isPart2 = currentExamData.title && currentExamData.title.includes('Part 2');
    
    // Filter questions based on image filter state
    let questionsToShow = currentExamData.questions;
    if (imageFilterActive) {
        questionsToShow = currentExamData.questions.filter(question => question.image);
    }

    questionsToShow.forEach((question, index) => {
        // Use original index for IDs to maintain consistency
        const originalIndex = currentExamData.questions.indexOf(question);
        
        const questionCard = document.createElement('div');
        questionCard.className = isPart2 ? 'question-card part2-card' : 'question-card';
        
        // Convert \n to <br> tags for proper line breaks
        const formattedQuestionText = question.text.replace(/\n/g, '<br>');
        const formattedAnswerText = question.correctAnswer.replace(/\n/g, '<br>');
        
        // Check if has key themes
        const hasKeyThemes = question.keyThemes && question.keyThemes.length > 0;
        
        // Build key themes HTML if available
        let keyThemesHTML = '';
        if (isPart2 && hasKeyThemes) {
            const themesListHTML = question.keyThemes.map(theme => `<li>${theme}</li>`).join('');
            keyThemesHTML = `
                <div class="key-themes-section" id="themes-section-${originalIndex}" ${!allAnswersVisible ? 'class="themes-hidden"' : ''}>
                    <div class="themes-header">
                        <iconify-icon icon="material-symbols:lightbulb" width="20" height="20"></iconify-icon>
                        <span class="themes-label">Key Themes:</span>
                    </div>
                    <ul class="themes-list">
                        ${themesListHTML}
                    </ul>
                </div>
            `;
        }
        
        questionCard.innerHTML = `
            <div class="question-header">
                <div class="question-number">
                    Question ${question.number}
                </div>
                <button class="answer-toggle-btn" onclick="toggleQuestionAnswer(${originalIndex})" id="toggle-btn-${originalIndex}">
                    <iconify-icon icon="bxs:down-arrow" width="24" height="24" id="toggle-icon-${originalIndex}"></iconify-icon>
                </button>
            </div>
            
            <div class="question-text">${formattedQuestionText}</div>
            
            ${question.image ? `<img src="static/images/${question.image}" alt="Question diagram" class="question-image">` : ''}
            
            <div class="answer-section" id="answer-section-${originalIndex}" ${!allAnswersVisible ? 'class="answer-hidden"' : ''}>
                <span class="answer-label">Answer:</span>
                <span class="correct-answer">${formattedAnswerText}</span>
            </div>
            
            ${keyThemesHTML}
        `;
        
        container.appendChild(questionCard);
        
        // Set initial arrow state based on global visibility
        updateQuestionArrow(originalIndex, allAnswersVisible);
    });
}

function toggleQuestionAnswer(questionIndex) {
    const answerSection = document.getElementById(`answer-section-${questionIndex}`);
    const themesSection = document.getElementById(`themes-section-${questionIndex}`);
    const toggleIcon = document.getElementById(`toggle-icon-${questionIndex}`);
    
    if (!answerSection) return; // Safety check
    
    // Check current state
    const isCurrentlyVisible = !answerSection.classList.contains('answer-hidden');
    
    if (isCurrentlyVisible) {
        // Hide the answer and themes
        answerSection.classList.add('answer-hidden');
        if (themesSection) {
            themesSection.classList.add('themes-hidden');
        }
        if (toggleIcon) {
            toggleIcon.setAttribute('icon', 'bxs:up-arrow');
        }
    } else {
        // Show the answer and themes
        answerSection.classList.remove('answer-hidden');
        if (themesSection) {
            themesSection.classList.remove('themes-hidden');
        }
        if (toggleIcon) {
            toggleIcon.setAttribute('icon', 'bxs:down-arrow');
        }
    }
}

function toggleAllAnswers() {
    allAnswersVisible = !allAnswersVisible;
    
    // Get all answer sections and toggle them
    const totalQuestions = currentExamData.questions.length;
    
    for (let i = 0; i < totalQuestions; i++) {
        const answerSection = document.getElementById(`answer-section-${i}`);
        const themesSection = document.getElementById(`themes-section-${i}`);
        
        if (answerSection) {
            if (allAnswersVisible) {
                // Show all answers
                answerSection.classList.remove('answer-hidden');
            } else {
                // Hide all answers
                answerSection.classList.add('answer-hidden');
            }
        }
        
        if (themesSection) {
            if (allAnswersVisible) {
                // Show all themes
                themesSection.classList.remove('themes-hidden');
            } else {
                // Hide all themes
                themesSection.classList.add('themes-hidden');
            }
        }
        
        // Update individual arrow icons
        updateQuestionArrow(i, allAnswersVisible);
    }
    
    // Update the toggle all button
    updateToggleAllButton();
}

function updateQuestionArrow(questionIndex, isVisible) {
    const toggleIcon = document.getElementById(`toggle-icon-${questionIndex}`);
    if (toggleIcon) {
        if (isVisible) {
            toggleIcon.setAttribute('icon', 'bxs:down-arrow');
        } else {
            toggleIcon.setAttribute('icon', 'bxs:up-arrow');
        }
    }
}

function toggleImageFilter() {
    imageFilterActive = !imageFilterActive;
    
    const filterBtn = document.getElementById('image-filter-btn');
    const filterIcon = document.getElementById('image-filter-icon');
    
    if (imageFilterActive) {
        // Show only questions with images
        filterBtn.classList.add('active');
        filterIcon.setAttribute('icon', 'streamline-flex:pictures-folder-memories-solid');
    } else {
        // Show all questions
        filterBtn.classList.remove('active');
        filterIcon.setAttribute('icon', 'streamline-flex:pictures-folder-memories');
    }
    
    // Re-render questions with filter applied
    renderQuestions();
}

function updateToggleAllButton() {
    const toggleAllText = document.getElementById('toggle-all-text');
    const toggleAllIcon = document.getElementById('toggle-all-icon');
    
    if (allAnswersVisible) {
        toggleAllText.textContent = 'Hide All Answers';
        toggleAllIcon.setAttribute('icon', 'tdesign:look-around-filled');
    } else {
        toggleAllText.textContent = 'Show All Answers';
        toggleAllIcon.setAttribute('icon', 'tdesign:look-around');
    }
}

function openTipsModal() {
    const modal = document.getElementById('tips-modal');
    modal.classList.add('show');
    // Prevent body scroll when modal is open
    document.body.style.overflow = 'hidden';
}

function closeTipsModal() {
    const modal = document.getElementById('tips-modal');
    modal.classList.remove('show');
    // Restore body scroll
    document.body.style.overflow = 'auto';
}

// Close modal on Escape key
document.addEventListener('keydown', function(event) {
    if (event.key === 'Escape') {
        closeTipsModal();
    }
});

function toggleOption(element) {
    // Simple visual feedback for user interaction
    element.style.transform = 'scale(0.98)';
    setTimeout(() => element.style.transform = 'scale(1)', 150);
}

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    showHome();
});
