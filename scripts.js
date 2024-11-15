// Global variables
let questions = [];
let currentQuestion = 0;
let score = 0;
let correctAnswers = 0;
let wrongAnswers = 0;
let totalQuestionsAnswered = 0;
let answerSubmitted = false;

// Load questions from JSON file
async function loadQuestions(category) {
    try {
        console.log('Attempting to load questions...');
        const response = await fetch('questions.json');
        const data = await response.json();
        if (data[category] && data[category].length > 0) {
            questions = data[category];
            displayQuestion();
        } else {
            throw new Error(`No questions found for category: ${category}`);
        }
    } catch (error) {
        console.error('Error loading questions:', error);
        const questionContainer = document.getElementById('question-container');
        questionContainer.innerHTML = `<p>Error: ${error.message}</p>`;
    }
}

// Display question
function displayQuestion() {
    if (currentQuestion < questions.length) {
        const question = questions[currentQuestion];
        const questionContainer = document.getElementById('question-container');
        
        let html = `
            <h2>Question ${currentQuestion + 1}</h2>
            <p>${question.question}</p>
            ${question.questionImage ? `<div class="question-image"><img src="${question.questionImage}" alt="Question Image"></div>` : ''}
            <div class="options">
        `;

        const letters = ['A', 'B', 'C', 'D', 'E'];
        question.options.forEach((option, index) => {
            html += `
                <div class="option">
                    <div class="option-circle" data-index="${index}">${letters[index]}</div>
                    <div class="option-text">
                        <input type="hidden" name="answer" value="${index}">
                        <span>${option}</span>
                        ${question.optionImages && question.optionImages[index] ? `
                            <div class="option-image">
                                <img src="${question.optionImages[index]}" alt="Option ${letters[index]} Image">
                            </div>
                        ` : ''}
                    </div>
                </div>
            `;
        });

        html += `
            </div>
            <button onclick="checkAnswer()">Selecionar Resposta</button>
            <button id="next-question" onclick="nextQuestion()" style="display: none;">Próxima Questão</button>
        `;

        questionContainer.innerHTML = html;

        // Add click event listeners to the options
        document.querySelectorAll('.option').forEach(option => {
            option.addEventListener('click', function() {
                // Remove 'selected' class from all options
                document.querySelectorAll('.option').forEach(opt => {
                    opt.classList.remove('selected');
                });
                
                // Add 'selected' class to the clicked option
                this.classList.add('selected');
            });
        });
    } else {
        showResults();
    }
}

function updateRanking(username, correct, wrong, total) {
    let ranking = JSON.parse(localStorage.getItem('ranking')) || {};
    if (!ranking[username]) {
        ranking[username] = { correct: 0, wrong: 0, total: 0 };
    }
    ranking[username].correct += correct;
    ranking[username].wrong += wrong;
    ranking[username].total += total;
    localStorage.setItem('ranking', JSON.stringify(ranking));
}

function checkAnswer() {
    if (answerSubmitted) {
        alert('You have already submitted an answer for this question!');
        return;
    }

    const selectedOption = document.querySelector('.option.selected');
    if (!selectedOption) {
        alert('Please select an answer!');
        return;
    }

    answerSubmitted = true;
    totalQuestionsAnswered++;

    const selectedAnswer = selectedOption.querySelector('input[name="answer"]');
    const answer = parseInt(selectedAnswer.value);
    const question = questions[currentQuestion];

    // Disable all radio buttons and the submit button after an answer is selected
    document.querySelectorAll('.option').forEach(option => {
        option.style.pointerEvents = 'none';
    });
    document.querySelector('button[onclick="checkAnswer()"]').disabled = true;

    const explanationElement = document.createElement('div');
    explanationElement.className = 'explanation';

    if (answer === question.correctAnswer) {
        score++;
        correctAnswers++;
        selectedOption.classList.add('correct-answer');
        explanationElement.textContent = "Correct! Well done.";
        explanationElement.classList.add('correct');
    } else {
        wrongAnswers++;
        selectedOption.classList.add('incorrect-answer');
        document.querySelector(`.option input[name="answer"][value="${question.correctAnswer}"]`)
            .closest('.option').classList.add('correct-answer');
        explanationElement.textContent = question.explanation;
        explanationElement.classList.add('incorrect');
    }
    
    document.getElementById('question-container').appendChild(explanationElement);

    // Show the "Next Question" button
    document.getElementById('next-question').style.display = 'inline-block';

    // Update ranking for the current user
    const username = localStorage.getItem('currentUser');
    updateRanking(username, answer === question.correctAnswer ? 1 : 0, answer === question.correctAnswer ? 0 : 1, 1);
}

function showResults() {
    const container = document.getElementById('question-container');
    const username = localStorage.getItem('currentUser');
    const ranking = JSON.parse(localStorage.getItem('ranking')) || {};
    const userRanking = ranking[username] || { correct: 0, wrong: 0, total: 0 };

    container.innerHTML = `
        <h2>Quiz Complete!</h2>
        <p>Your score: ${score} out of ${questions.length}</p>
        <h3>Your Overall Performance:</h3>
        <p>Total Questions Answered: ${userRanking.total}</p>
        <p>Correct Answers: ${userRanking.correct}</p>
        <p>Wrong Answers: ${userRanking.wrong}</p>
        <button onclick="restartQuiz()">Try Again</button>
    `;
}

function restartQuiz() {
    currentQuestion = 0;
    score = 0;
    answerSubmitted = false;
    displayQuestion();
}

function nextQuestion() {
    currentQuestion++;
    answerSubmitted = false;
    displayQuestion();
    document.querySelector('button[onclick="checkAnswer()"]').disabled = false;
    document.querySelectorAll('.option').forEach(option => {
        option.style.pointerEvents = 'auto';
    });
}

