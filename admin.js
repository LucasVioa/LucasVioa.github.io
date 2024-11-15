// Handle form submission
document.getElementById('question-form').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    // Disable submit button to prevent double submission
    const submitButton = document.querySelector('button[type="submit"]');
    submitButton.disabled = true;
    
    try {
        // Validate required fields
        const requiredFields = [
            { id: 'question-text', name: 'Question text' },
            { id: 'option-1-text', name: 'Option 1' },
            { id: 'option-2-text', name: 'Option 2' },
            { id: 'option-3-text', name: 'Option 3' },
            { id: 'option-4-text', name: 'Option 4' },
            { id: 'correct-answer', name: 'Correct answer' },
            { id: 'category', name: 'Category' }
        ];
        
        for (const field of requiredFields) {
            const element = document.getElementById(field.id);
            if (!element.value.trim()) {
                throw new Error(`${field.name} is required`);
            }
        }
        
        // Validate correct answer is between 0 and 3 (0-based index)
        const correctAnswer = parseInt(document.getElementById('correct-answer').value);
        if (isNaN(correctAnswer) || correctAnswer < 0 || correctAnswer > 3) {
            throw new Error('Invalid correct answer selection');
        }
    
        // Clean up image data before sending
        function cleanImageData(src) {
            if (!src) return '';
            // If it's a data URL, validate size and keep it, otherwise just store the filename
            if (src.startsWith('data:')) {
                // Check if image data is too large (max 500KB)
                const base64Length = src.length - (src.indexOf(',') + 1);
                const sizeInBytes = (base64Length * 3) / 4;
                if (sizeInBytes > 500000) { // 500KB
                    throw new Error('Image size too large. Please use an image under 500KB.');
                }
                return src;
            }
            return src.split('/').pop();
        }
        
        // Validate and process tags
        const tagsInput = document.getElementById('tags').value.trim();
        const tags = tagsInput ? tagsInput.split(',')
            .map(tag => tag.trim().toLowerCase())
            .filter(tag => tag.length > 0 && /^[a-zA-Z0-9\s]+$/.test(tag)) : [];
            
        if (tagsInput && tags.length === 0) {
            throw new Error('Tags must be alphanumeric with optional spaces');
        }

        const formData = {
            question: document.getElementById('question-text').value.trim(),
            questionImage: cleanImageData(document.getElementById('question-image-preview')?.src),
            options: [],
            optionImages: [],
            correctAnswer: parseInt(document.getElementById('correct-answer').value),
            explanation: document.getElementById('explanation').value.trim(),
            category: document.getElementById('category').value.trim(),
            tags: tags
        };

        // Gather options and their images
        for (let i = 1; i <= 4; i++) {
            formData.options.push(document.getElementById(`option-${i}-text`).value.trim());
            formData.optionImages.push(cleanImageData(document.getElementById(`option-image-preview-${i-1}`)?.src) || '');
        }

        // Save the question
        console.log('Sending form data:', formData);
        const saveResponse = await fetch('save_question.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(formData)
        });

        let responseData;
        const responseText = await saveResponse.text();
        console.log('Raw server response:', responseText); // For debugging
        
        if (!responseText) {
            throw new Error('Server returned empty response');
        }
        
        try {
            responseData = JSON.parse(responseText);
        } catch (parseError) {
            console.error('Failed to parse server response:', parseError);
            throw new Error(`Invalid JSON response: ${responseText.substring(0, 100)}...`);
        }
        
        if (!saveResponse.ok) {
            throw new Error(responseData.error || `HTTP error! status: ${saveResponse.status}`);
        }
        
        if (responseData.success) {
            alert('Question saved successfully!');
            // Reset form and clear previews
            e.target.reset();
            document.querySelectorAll('img[id$="-preview"]').forEach(img => {
                img.style.display = 'none';
                img.src = '';
            });
        } else {
            throw new Error(responseData.error || 'Failed to save question');
        }
    } catch (error) {
        console.error('Error saving question:', error);
        alert(error.message || 'Error saving question. Please try again.');
    } finally {
        // Always re-enable the submit button
        submitButton.disabled = false;
    }
});