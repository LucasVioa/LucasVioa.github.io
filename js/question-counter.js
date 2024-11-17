async function updateQuestionCount() {
    try {
        const response = await fetch('questions.json');
        const data = await response.json();
        let totalQuestions = 0;
        
        // Count questions from all categories
        for (const category in data) {
            totalQuestions += data[category].length;
        }
        
        // Update the header text
        const headerText = document.querySelector('header p');
        headerText.textContent = `Aqui você encontra ${totalQuestions} questões de várias disciplinas para estudar para concursos.`;
    } catch (error) {
        console.error('Error loading question count:', error);
    }
}

// Call the function when the page loads
document.addEventListener('DOMContentLoaded', updateQuestionCount);