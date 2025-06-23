let currentExamData = null;

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

    currentExamData.questions.forEach(question => {
        const questionCard = document.createElement('div');
        questionCard.className = 'question-card';
        
        // Convert \n to <br> tags for proper line breaks
        const formattedQuestionText = question.text.replace(/\n/g, '<br>');
        const formattedAnswerText = question.correctAnswer.replace(/\n/g, '<br>');
        
        questionCard.innerHTML = `
            <div class="question-number">
                Question ${question.number}
            </div>
            
            <div class="question-text">${formattedQuestionText}</div>
            
            ${question.image ? `<img src="static/images/${question.image}" alt="Question diagram" class="question-image">` : ''}
            
            <div class="answer-section">
                <span class="answer-label">Answer:</span>
                <span class="correct-answer">${formattedAnswerText}</span>
            </div>
        `;
        
        container.appendChild(questionCard);
    });
}

function toggleOption(element) {
    // Simple visual feedback for user interaction
    element.style.transform = 'scale(0.98)';
    setTimeout(() => element.style.transform = 'scale(1)', 150);
}

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    showHome();
});
