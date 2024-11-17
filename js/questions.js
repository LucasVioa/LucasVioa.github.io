function recordAnswer(isCorrect) {
    const currentUser = localStorage.getItem('currentUser');
    if (!currentUser) return;

    const userStatsKey = `${currentUser}_stats`;
    let stats = getUserStats();

    // Update statistics
    stats.totalQuestions++;
    if (isCorrect) {
        stats.correctQuestions++;
    } else {
        stats.wrongQuestions++;
    }

    // Save updated stats
    localStorage.setItem(userStatsKey, JSON.stringify(stats));
}

// Call this function when user answers a question
function handleQuestionSubmission(userAnswer, correctAnswer) {
    const isCorrect = userAnswer === correctAnswer;
    recordAnswer(isCorrect);
    
    // Show feedback to user
    alert(isCorrect ? 'Correct answer!' : 'Wrong answer. Try again!');
}
