document.addEventListener('DOMContentLoaded', function() {
    // Check if user is logged in
    const currentUser = localStorage.getItem('currentUser');
    if (!currentUser) {
        window.location.href = 'login.html';
        return;
    }

    // Display username
    document.getElementById('profile-username').textContent = currentUser;

    // Get user statistics from localStorage
    const userStats = getUserStats();
    updateProfileStats(userStats);
});

function getUserStats() {
    const currentUser = localStorage.getItem('currentUser');
    const userStatsKey = `${currentUser}_stats`;
    const defaultStats = {
        totalQuestions: 0,
        correctQuestions: 0,
        wrongQuestions: 0,
        successRate: 0
    };

    const savedStats = localStorage.getItem(userStatsKey);
    return savedStats ? JSON.parse(savedStats) : defaultStats;
}

function updateProfileStats(stats) {
    // Update numbers
    document.getElementById('total-questions').textContent = stats.totalQuestions;
    document.getElementById('correct-questions').textContent = stats.correctQuestions;
    document.getElementById('wrong-questions').textContent = stats.wrongQuestions;

    // Calculate and update success rate
    const successRate = stats.totalQuestions > 0 
        ? Math.round((stats.correctQuestions / stats.totalQuestions) * 100) 
        : 0;

    document.getElementById('success-rate').style.width = `${successRate}%`;
    document.getElementById('success-rate-text').textContent = successRate;
}

