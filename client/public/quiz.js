// Quiz Game Logic
class QuizGame {
    constructor() {
        this.questions = [];
        this.currentQuestionIndex = 0;
        this.score = 0;
        this.userAnswers = [];
        this.selectedAnswer = null;
        
        this.loadQuestions();
        this.initializeQuiz();
    }
    
    loadQuestions() {
        if (typeof window.quizQuestions !== 'undefined') {
            // Shuffle questions for variety
            this.questions = [...window.quizQuestions].sort(() => Math.random() - 0.5);
        } else {
            console.error('Quiz questions not loaded');
            this.questions = [];
        }
    }
    
    initializeQuiz() {
        if (this.questions.length === 0) {
            this.showError('No questions available. Please refresh the page.');
            return;
        }
        
        this.showQuestion();
    }
    
    showQuestion() {
        if (this.currentQuestionIndex >= this.questions.length) {
            this.showResults();
            return;
        }
        
        const question = this.questions[this.currentQuestionIndex];
        
        // Update progress
        const progress = ((this.currentQuestionIndex + 1) / this.questions.length) * 100;
        document.getElementById('progressFill').style.width = progress + '%';
        document.getElementById('progressText').textContent = 
            `Question ${this.currentQuestionIndex + 1} of ${this.questions.length}`;
        
        // Update question content
        document.getElementById('questionNumber').textContent = 
            `Question ${this.currentQuestionIndex + 1}`;
        document.getElementById('questionText').textContent = question.question;
        
        // Create options
        this.createOptions(question.options);
        
        // Update score
        document.getElementById('quizScore').textContent = this.score;
        
        // Show question container, hide others
        document.getElementById('questionContainer').style.display = 'block';
        document.getElementById('feedbackContainer').style.display = 'none';
        document.getElementById('quizComplete').style.display = 'none';
        
        // Reset selected answer
        this.selectedAnswer = null;
        document.getElementById('submitBtn').disabled = true;
    }
    
    createOptions(options) {
        const container = document.getElementById('optionsContainer');
        container.innerHTML = '';
        
        options.forEach((option, index) => {
            const optionDiv = document.createElement('div');
            optionDiv.className = 'option';
            optionDiv.onclick = () => this.selectOption(index);
            
            const radio = document.createElement('input');
            radio.type = 'radio';
            radio.name = 'answer';
            radio.value = index;
            radio.id = `option${index}`;
            
            const label = document.createElement('label');
            label.htmlFor = `option${index}`;
            label.textContent = option;
            
            optionDiv.appendChild(radio);
            optionDiv.appendChild(label);
            container.appendChild(optionDiv);
        });
    }
    
    selectOption(index) {
        // Remove previous selection
        document.querySelectorAll('.option').forEach(opt => opt.classList.remove('selected'));
        
        // Add selection to clicked option
        const options = document.querySelectorAll('.option');
        options[index].classList.add('selected');
        options[index].querySelector('input').checked = true;
        
        this.selectedAnswer = index;
        document.getElementById('submitBtn').disabled = false;
    }
    
    submitAnswer() {
        if (this.selectedAnswer === null) return;
        
        const question = this.questions[this.currentQuestionIndex];
        const isCorrect = this.selectedAnswer === question.correct;
        
        // Store user answer
        this.userAnswers.push({
            questionIndex: this.currentQuestionIndex,
            selectedAnswer: this.selectedAnswer,
            correct: isCorrect
        });
        
        if (isCorrect) {
            this.score += 100;
        }
        
        this.showFeedback(isCorrect, question.explanation);
    }
    
    showFeedback(isCorrect, explanation) {
        const feedbackResult = document.getElementById('feedbackResult');
        const feedbackExplanation = document.getElementById('feedbackExplanation');
        
        if (isCorrect) {
            feedbackResult.textContent = '✅ Correct!';
            feedbackResult.className = 'feedback-result correct';
        } else {
            feedbackResult.textContent = '❌ Incorrect';
            feedbackResult.className = 'feedback-result incorrect';
        }
        
        feedbackExplanation.textContent = explanation;
        
        // Update score display
        document.getElementById('quizScore').textContent = this.score;
        
        // Show feedback container
        document.getElementById('questionContainer').style.display = 'none';
        document.getElementById('feedbackContainer').style.display = 'block';
        
        // Update next button text
        const nextBtn = document.getElementById('nextBtn');
        if (this.currentQuestionIndex >= this.questions.length - 1) {
            nextBtn.textContent = 'Show Results';
        } else {
            nextBtn.textContent = 'Next Question';
        }
    }
    
    nextQuestion() {
        this.currentQuestionIndex++;
        this.showQuestion();
    }
    
    showResults() {
        const correctCount = this.userAnswers.filter(answer => answer.correct).length;
        const totalQuestions = this.questions.length;
        const percentage = Math.round((correctCount / totalQuestions) * 100);
        
        // Update result displays
        document.getElementById('finalPercentage').textContent = percentage + '%';
        document.getElementById('correctCount').textContent = correctCount;
        document.getElementById('incorrectCount').textContent = totalQuestions - correctCount;
        document.getElementById('totalQuestions').textContent = totalQuestions;
        
        // Generate performance message
        let performanceMessage = '';
        if (percentage >= 90) {
            performanceMessage = '🎉 Excellent! You have outstanding cybersecurity knowledge. Keep up the great work!';
        } else if (percentage >= 80) {
            performanceMessage = '👍 Great job! You have solid cybersecurity awareness. Review the areas you missed to improve further.';
        } else if (percentage >= 70) {
            performanceMessage = '👌 Good work! You have decent cybersecurity knowledge, but there\'s room for improvement.';
        } else if (percentage >= 60) {
            performanceMessage = '📚 Fair performance. Consider studying cybersecurity best practices to better protect yourself online.';
        } else {
            performanceMessage = '⚠️ Your cybersecurity knowledge needs improvement. Please review the explanations and consider additional training.';
        }
        
        document.getElementById('performanceMessage').textContent = performanceMessage;
        
        // Save best score
        this.saveBestScore(percentage);
        
        // Show completion screen
        document.getElementById('questionContainer').style.display = 'none';
        document.getElementById('feedbackContainer').style.display = 'none';
        document.getElementById('quizComplete').style.display = 'block';
        
        // Update progress to 100%
        document.getElementById('progressFill').style.width = '100%';
        document.getElementById('progressText').textContent = 'Quiz Complete!';
    }
    
    saveBestScore(percentage) {
        const bestScore = parseInt(localStorage.getItem('cautio-best-quiz-score') || '0');
        if (percentage > bestScore) {
            localStorage.setItem('cautio-best-quiz-score', percentage.toString());
        }
    }
    
    showError(message) {
        const container = document.getElementById('questionContainer');
        container.innerHTML = `
            <div style="text-align: center; color: #ff0040;">
                <h3>Error</h3>
                <p>${message}</p>
                <button onclick="goToMenu()" class="menu-btn">Back to Menu</button>
            </div>
        `;
    }
    
    restartQuiz() {
        this.currentQuestionIndex = 0;
        this.score = 0;
        this.userAnswers = [];
        this.selectedAnswer = null;
        
        // Shuffle questions again
        this.questions = this.questions.sort(() => Math.random() - 0.5);
        
        this.showQuestion();
    }
}

// Global functions for button handlers
function submitAnswer() {
    if (window.quiz) {
        window.quiz.submitAnswer();
    }
}

function nextQuestion() {
    if (window.quiz) {
        window.quiz.nextQuestion();
    }
}

function restartQuiz() {
    if (window.quiz) {
        window.quiz.restartQuiz();
    }
}

function goToMenu() {
    window.location.href = '/';
}

// Initialize quiz when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    window.quiz = new QuizGame();
});