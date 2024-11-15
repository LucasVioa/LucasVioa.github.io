// Image upload handling
const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/gif'];

async function handleImageUpload(input, previewElement, errorElement) {
    const file = input.files[0];
    errorElement.textContent = '';
    
    // Validate file
    if (!file) return;
    
    if (!ALLOWED_TYPES.includes(file.type)) {
        errorElement.textContent = 'Error: Please upload only JPG, PNG, or GIF images.';
        input.value = '';
        return;
    }
    
    if (file.size > MAX_IMAGE_SIZE) {
        errorElement.textContent = 'Error: Image size should be less than 5MB.';
        input.value = '';
        return;
    }

    try {
        // Create object URL for preview
        const objectUrl = URL.createObjectURL(file);
        
        // Update preview
        if (previewElement) {
            previewElement.src = objectUrl;
            previewElement.style.display = 'block';
        }
        
        // Upload to server (implement your upload logic here)
        // const formData = new FormData();
        // formData.append('image', file);
        // const response = await fetch('/upload', {
        //     method: 'POST',
        //     body: formData
        // });
        
        return objectUrl;
    } catch (error) {
        errorElement.textContent = 'Error uploading image. Please try again.';
        console.error('Image upload error:', error);
    }
}

// Add image upload capabilities to questions
function initializeImageUploads() {
    // Question image upload
    const questionImageInput = document.getElementById('question-image-upload');
    const questionPreview = document.getElementById('question-image-preview');
    const questionError = document.getElementById('question-image-error');

    if (questionImageInput) {
        questionImageInput.addEventListener('change', () => {
            handleImageUpload(questionImageInput, questionPreview, questionError);
        });
    }

    // Option image uploads
    const optionImageInputs = document.querySelectorAll('.option-image-upload');
    optionImageInputs.forEach((input, index) => {
        const preview = document.getElementById(`option-image-preview-${index}`);
        const error = document.getElementById(`option-image-error-${index}`);
        
        input.addEventListener('change', () => {
            handleImageUpload(input, preview, error);
        });
    });
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', initializeImageUploads);