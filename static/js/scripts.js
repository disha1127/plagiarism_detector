document.addEventListener('DOMContentLoaded', () => {
    console.log("DOM fully loaded and parsed");
    const plagiarismForm = document.getElementById('plagiarism-form');
    const checkPlagiarismButton = document.getElementById('check-plagiarism');
    const text1Input = document.getElementById('text1');
    const text2Input = document.getElementById('text2');
    const resultDiv = document.getElementById('result');

    if (!plagiarismForm || !checkPlagiarismButton) {
        console.error("Form or button not found");
        return;
    }

    console.log("Form and button found");
    
    plagiarismForm.addEventListener('submit', async (event) => {
        event.preventDefault();  // This line is crucial to prevent the form from submitting traditionally
        console.log("Form submission prevented, handling check");
        
        const text1 = text1Input.value.trim();
        const text2 = text2Input.value.trim();

        if (text1 === '' || text2 === '') {
            console.log("Empty input detected");
            resultDiv.innerHTML = 'Please enter both texts to compare.';
            resultDiv.classList.add('error');
            return;
        }

        try {
            checkPlagiarismButton.disabled = true;
            checkPlagiarismButton.textContent = 'Checking...';
            
            console.log("Sending request to /check_plagiarism");
            const response = await fetch('/check_plagiarism', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ text1, text2 }),
            });

            if (!response.ok) {
                throw new Error('Network response was not ok');
            }

            const data = await response.json();
            console.log("Received response:", data);
            const plagiarismPercentage = data.plagiarism_percentage.toFixed(2);

            resultDiv.innerHTML = `
                <h2>Plagiarism Analysis Result</h2>
                <p>Similarity Score: <strong>${plagiarismPercentage}%</strong></p>
                <p>${getPlagiarismMessage(plagiarismPercentage)}</p>
            `;
            resultDiv.classList.remove('error');
            resultDiv.style.backgroundColor = getPlagiarismColor(plagiarismPercentage);
        } catch (error) {
            console.error('Error:', error);
            resultDiv.innerHTML = 'An error occurred while checking for plagiarism.';
            resultDiv.classList.add('error');
        } finally {
            checkPlagiarismButton.disabled = false;
            checkPlagiarismButton.textContent = 'Check Plagiarism';
        }
    });

    function getPlagiarismMessage(percentage) {
        if (percentage < 20) return 'No significant similarity detected.';
        if (percentage < 40) return 'Minor similarities found.';
        if (percentage < 60) return 'Moderate similarities detected.';
        if (percentage < 80) return 'Significant similarities found.';
        return 'Very high similarity detected!';
    }

    function getPlagiarismColor(percentage) {
        if (percentage < 20) return '#e8f5e9';
        if (percentage < 40) return '#fff3e0';
        if (percentage < 60) return '#fff3e0';
        if (percentage < 80) return '#ffebee';
        return '#ffebee';
    }
});

