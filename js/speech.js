// Speech recognition and synthesis functionality

// Function to handle speech recognition
function startSpeechRecognition() {
    const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
    const micButton = document.getElementById('micButton');
    
    if (!recognition || !micButton) return;
    
    // Set language based on selected language
    const language = document.getElementById('language');
    recognition.lang = language.value === "Hindi" ? "hi-IN" :
                      language.value === "Spanish" ? "es-ES" :
                      language.value === "French" ? "fr-FR" :
                      language.value === "German" ? "de-DE" :
                      language.value === "Chinese" ? "zh-CN" : "en-US";
    
    recognition.start();
    
    // Update button state
    micButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
    micButton.disabled = true;
    
    recognition.onstart = function() {
        console.log('Speech recognition started');
    };
    
    recognition.onspeechend = function() {
        recognition.stop();
        micButton.innerHTML = '<i class="fas fa-microphone"></i>';
        micButton.disabled = false;
    };
    
    recognition.onerror = function(event) {
        console.error('Speech recognition error:', event.error);
        micButton.innerHTML = '<i class="fas fa-microphone"></i>';
        micButton.disabled = false;
    };
    
    recognition.onresult = function(event) {
        const transcript = event.results[0][0].transcript;
        document.getElementById('userInput').value = transcript;
        
        // Auto-submit after speech recognition
        setTimeout(() => {
            sendMessage();
        }, 500);
    };
}

// Function to speak response
function speakResponse(text) {
    const speech = new SpeechSynthesisUtterance();
    const language = document.getElementById('language');
    
    speech.lang = language.value === "Hindi" ? "hi-IN" :
                  language.value === "Spanish" ? "es-ES" :
                  language.value === "French" ? "fr-FR" :
                  language.value === "German" ? "de-DE" :
                  language.value === "Chinese" ? "zh-CN" : "en-US";
    
    // Remove markdown syntax for better speech
    const plainText = text.replace(/\*\*(.*?)\*\*/g, '$1')  // Bold
                         .replace(/\*(.*?)\*/g, '$1')      // Italic
                         .replace(/\[(.*?)\]$$(.*?)$$/g, '$1') // Links
                         .replace(/#{1,6}\s(.*?)$/gm, '$1') // Headers
                         .replace(/```[\s\S]*?```/g, 'Code block') // Code blocks
                         .replace(/`(.*?)`/g, '$1');      // Inline code
    
    speech.text = plainText;
    window.speechSynthesis.speak(speech);
}