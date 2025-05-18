document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('upload-form');
    const fileInput = document.getElementById('image-upload');
    const predictionBox = document.getElementById('prediction-result');
    const errorMessage = document.getElementById('error-message');
    const loadingSpan = document.querySelector('.loading');
    const normalText = document.querySelector('.normal-text');
    const preview = document.getElementById('image-preview');
    const resultsBox = document.getElementById('results-box');
    const emptyState = resultsBox.querySelector('.empty-state');
    const fileNameDisplay = document.querySelector('.selected-file-name');

    // Backend API URL - we'll update this after deploying the backend
    const API_URL = 'https://fire-detection-backend.herokuapp.com/predict';

    // Handle file selection
    fileInput.addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (file) {
            fileNameDisplay.textContent = `Selected: ${file.name}`;
            fileNameDisplay.style.display = 'block';
            
            // Preview the image
            const reader = new FileReader();
            reader.onload = function(e) {
                preview.src = e.target.result;
                preview.style.display = 'block';
                emptyState.style.display = 'none';
                resultsBox.classList.remove('empty');
            }
            reader.readAsDataURL(file);
        } else {
            fileNameDisplay.style.display = 'none';
        }
    });

    // Handle form submission
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        if (!fileInput.files[0]) {
            errorMessage.textContent = 'Please select an image file.';
            errorMessage.style.display = 'block';
            return;
        }

        // Show loading state
        loadingSpan.style.display = 'inline-block';
        normalText.style.display = 'none';
        predictionBox.style.display = 'none';
        errorMessage.style.display = 'none';

        try {
            // Create form data
            const formData = new FormData();
            formData.append('file', fileInput.files[0]);

            // Send request to backend
            const response = await fetch(API_URL, {
                method: 'POST',
                body: formData
            });

            if (!response.ok) {
                throw new Error('Server returned ' + response.status);
            }

            const data = await response.json();
            
            // Display result
            predictionBox.className = 'prediction-box ' + (data.prediction === 'Fire' ? 'fire' : 'no-fire');
            document.querySelector('.result-text').textContent = `Prediction: ${data.prediction}`;
            predictionBox.style.display = 'block';
            
        } catch (error) {
            console.error('Error:', error);
            errorMessage.textContent = 'An error occurred while processing your request. Please try again.';
            errorMessage.style.display = 'block';
        } finally {
            // Hide loading state
            loadingSpan.style.display = 'none';
            normalText.style.display = 'inline-block';
        }
    });

    // Handle drag and drop
    const uploadBox = document.querySelector('.upload-box');

    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        uploadBox.addEventListener(eventName, preventDefaults, false);
    });

    function preventDefaults (e) {
        e.preventDefault();
        e.stopPropagation();
    }

    ['dragenter', 'dragover'].forEach(eventName => {
        uploadBox.addEventListener(eventName, highlight, false);
    });

    ['dragleave', 'drop'].forEach(eventName => {
        uploadBox.addEventListener(eventName, unhighlight, false);
    });

    function highlight(e) {
        uploadBox.classList.add('border-primary');
    }

    function unhighlight(e) {
        uploadBox.classList.remove('border-primary');
    }

    uploadBox.addEventListener('drop', handleDrop, false);

    function handleDrop(e) {
        const dt = e.dataTransfer;
        const files = dt.files;

        fileInput.files = files;
        fileInput.dispatchEvent(new Event('change'));
    }
}); 