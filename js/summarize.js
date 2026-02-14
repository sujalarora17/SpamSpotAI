// Text summarization functionality

document.addEventListener('DOMContentLoaded', function() {
    // Word count functionality
    const inputText = document.getElementById('inputText');
    const wordCount = document.getElementById('wordCount');
    
    if (inputText && wordCount) {
        inputText.addEventListener('input', function() {
            const text = inputText.value.trim();
            const words = text ? text.split(/\s+/).length : 0;
            wordCount.textContent = words;
        });
    }
});

// Function to paste from clipboard
async function pasteFromClipboard() {
    try {
        const text = await navigator.clipboard.readText();
        document.getElementById('inputText').value = text;
        
        // Update word count
        const words = text.trim() ? text.trim().split(/\s+/).length : 0;
        document.getElementById('wordCount').textContent = words;
    } catch (error) {
        console.error('Failed to read clipboard:', error);
        alert('Could not access clipboard. Please paste manually.');
    }
}

// Function to clear input
function clearInput() {
    document.getElementById('inputText').value = '';
    document.getElementById('wordCount').textContent = '0';
}

// Function to load sample text
function loadSampleText() {
    const sampleText = `Artificial Intelligence (AI) has emerged as one of the most transformative technologies of the 21st century. It encompasses a wide range of capabilities, from machine learning and natural language processing to computer vision and robotics. The development of AI has been driven by advances in computing power, the availability of vast amounts of data, and breakthroughs in algorithms.

AI systems can now perform tasks that once required human intelligence, such as recognizing speech, translating languages, identifying objects in images, and making decisions. These capabilities have led to applications across various industries, including healthcare, finance, transportation, and entertainment.

In healthcare, AI is being used to analyze medical images, predict disease outbreaks, and develop personalized treatment plans. In finance, it helps detect fraudulent transactions, assess credit risk, and automate trading. In transportation, AI powers self-driving cars and optimizes logistics. In entertainment, it recommends content, generates realistic graphics, and creates interactive experiences.

Despite its benefits, AI also raises important ethical and societal concerns. These include issues related to privacy, bias, job displacement, and the potential for autonomous weapons. As AI continues to advance, addressing these concerns will be crucial to ensuring that the technology benefits humanity as a whole.

The future of AI holds immense potential. Researchers are working on developing more advanced forms of AI that can reason, learn, and adapt in ways that more closely resemble human intelligence. This could lead to breakthroughs in scientific research, more efficient resource allocation, and solutions to complex global challenges like climate change and disease.`;
    
    document.getElementById('inputText').value = sampleText;
    
    // Update word count
    const words = sampleText.trim().split(/\s+/).length;
    document.getElementById('wordCount').textContent = words;
}

// Function to summarize text
async function summarizeText() {
    const inputText = document.getElementById('inputText').value.trim();
    const summaryLength = document.getElementById('summaryLength').value;
    const summaryStyle = document.getElementById('summaryStyle').value;
    const language = document.getElementById('summaryLanguage').value;
    const summaryOutput = document.getElementById('summaryOutput');
    
    if (!inputText) {
        alert('Please enter or paste some text to summarize.');
        return;
    }
    
    // Show loading state
    summaryOutput.innerHTML = '<p>Generating summary...</p>';
    
    try {
        // Make API request
        const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
            method: 'POST',
            headers: {
                Authorization: 'Bearer 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',
                'HTTP-Referer': window.location.href,
                'X-Title': 'Spam Spot AI',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                model: 'deepseek/deepseek-r1:free',
                messages: [
                    { 
                        role: 'system', 
                        content: `You are a text summarization assistant. Summarize the provided text in ${language}. 
                                 Length: ${summaryLength === 'short' ? 'Very concise, 1-2 paragraphs' : 
                                          summaryLength === 'medium' ? 'Moderately detailed, 3-4 paragraphs' : 
                                          'Comprehensive, 5+ paragraphs'}. 
                                 Style: ${summaryStyle === 'concise' ? 'Concise and to the point' : 
                                         summaryStyle === 'detailed' ? 'Detailed with key information' : 
                                         'Bullet points of main ideas'}.` 
                    },
                    { role: 'user', content: inputText }
                ],
            }),
        });
        
        const data = await response.json();
        
        // Get response text
        const summaryText = data.choices?.[0]?.message?.content || 'Sorry, I could not generate a summary.';
        
        // Display summary
        summaryOutput.innerHTML = marked.parse(summaryText);
        
        // Save to history
        saveSummaryToHistory(inputText, summaryText);
    } catch (error) {
        console.error('Error:', error);
        summaryOutput.innerHTML = '<p class="error">Error: Could not generate summary. Please try again later.</p>';
    }
}

// Function to save summary to history
function saveSummaryToHistory(originalText, summaryText) {
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user) return;
    
    const summaries = JSON.parse(localStorage.getItem('summaries')) || [];
    
    // Create new summary entry
    const newSummary = {
        id: Date.now().toString(),
        userId: user.id,
        originalText: originalText.substring(0, 500) + (originalText.length > 500 ? '...' : ''),
        summaryText,
        createdAt: new Date().toISOString()
    };
    
    // Add to summaries array
    summaries.push(newSummary);
    
    // Save to localStorage
    localStorage.setItem('summaries', JSON.stringify(summaries));
}

// Function to copy summary to clipboard
function copyToClipboard() {
    const summaryOutput = document.getElementById('summaryOutput');
    if (!summaryOutput) return;
    
    // Get text content (without HTML tags)
    const text = summaryOutput.innerText;
    
    // Copy to clipboard
    navigator.clipboard.writeText(text)
        .then(() => {
            alert('Summary copied to clipboard!');
        })
        .catch(err => {
            console.error('Failed to copy:', err);
            alert('Could not copy to clipboard. Please select and copy manually.');
        });
}

// Function to download summary
function downloadSummary() {
    const summaryOutput = document.getElementById('summaryOutput');
    if (!summaryOutput) return;
    
    // Get text content (without HTML tags)
    const text = summaryOutput.innerText;
    
    // Create a blob and download it
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `summary-${Date.now()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

// Function to speak summary
function speakSummary() {
    const summaryOutput = document.getElementById('summaryOutput');
    if (!summaryOutput) return;
    
    // Get text content (without HTML tags)
    const text = summaryOutput.innerText;
    
    // Use speech synthesis to speak the summary
    const speech = new SpeechSynthesisUtterance();
    const language = document.getElementById('summaryLanguage');
    
    speech.lang = language.value === "Hindi" ? "hi-IN" :
                  language.value === "Spanish" ? "es-ES" :
                  language.value === "French" ? "fr-FR" :
                  language.value === "German" ? "de-DE" :
                  language.value === "Chinese" ? "zh-CN" : "en-US";
    
    speech.text = text;
    window.speechSynthesis.speak(speech);
}