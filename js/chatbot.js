// Chatbot functionality

document.addEventListener('DOMContentLoaded', function() {
    // Initialize chat
    loadChatHistory();
    
    // Chat form submission
    const chatForm = document.getElementById('chatForm');
    if (chatForm) {
        chatForm.addEventListener('submit', function(e) {
            e.preventDefault();
            sendMessage();
        });
    }
});

// Function to load chat history
function loadChatHistory() {
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user) return;
    
    const conversations = JSON.parse(localStorage.getItem('conversations')) || [];
    const userConversations = conversations.filter(conv => conv.userId === user.id);
    
    const conversationList = document.getElementById('conversationList');
    if (!conversationList) return;
    
    // Clear existing list except for "New Chat"
    const newChatElement = conversationList.querySelector('.new-chat');
    conversationList.innerHTML = '';
    conversationList.appendChild(newChatElement);
    
    // Add conversations to list
    userConversations.forEach(conv => {
        const li = document.createElement('li');
        li.textContent = conv.title;
        li.dataset.id = conv.id;
        li.addEventListener('click', () => loadConversation(conv.id));
        conversationList.appendChild(li);
    });
}

// Function to load a specific conversation
function loadConversation(conversationId) {
    const conversations = JSON.parse(localStorage.getItem('conversations')) || [];
    const conversation = conversations.find(conv => conv.id === conversationId);
    
    if (!conversation) return;
    
    const chatMessages = document.getElementById('chatMessages');
    chatMessages.innerHTML = '';
    
    // Add messages to chat
    conversation.messages.forEach(msg => {
        addMessageToChat(msg.role, msg.content, msg.timestamp);
    });
    
    // Update active conversation in UI
    const conversationItems = document.querySelectorAll('#conversationList li');
    conversationItems.forEach(item => {
        item.classList.remove('active');
        if (item.dataset.id === conversationId) {
            item.classList.add('active');
        }
    });
    
    // Store current conversation ID
    localStorage.setItem('currentConversationId', conversationId);
}

// Function to start a new chat
function startNewChat() {
    const chatMessages = document.getElementById('chatMessages');
    if (chatMessages) {
        chatMessages.innerHTML = `
            <div class="message system">
                <div class="message-content">
                    <p>Hello! I'm your AI assistant. How can I help you today?</p>
                </div>
                <div class="message-time">Just now</div>
            </div>
        `;
    }
    
    // Remove active class from all conversation items
    const conversationItems = document.querySelectorAll('#conversationList li');
    conversationItems.forEach(item => {
        item.classList.remove('active');
    });
    
    // Clear current conversation ID
    localStorage.removeItem('currentConversationId');
}

// Function to send a message
async function sendMessage() {
    const userInput = document.getElementById('userInput');
    const language = document.getElementById('language');
    const chatMessages = document.getElementById('chatMessages');
    
    if (!userInput || !language || !chatMessages) return;
    
    const message = userInput.value.trim();
    if (!message) return;
    
    // Add user message to chat
    const timestamp = new Date().toLocaleTimeString();
    addMessageToChat('user', message, timestamp);
    
    // Clear input
    userInput.value = '';
    
    // Add loading message
    const loadingId = 'loading-' + Date.now();
    chatMessages.innerHTML += `
        <div id="${loadingId}" class="message assistant">
            <div class="message-content">
                <p>Thinking...</p>
            </div>
            <div class="message-time">${new Date().toLocaleTimeString()}</div>
        </div>
    `;
    
    // Scroll to bottom
    chatMessages.scrollTop = chatMessages.scrollHeight;
    
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
                    { role: 'system', content: `Please respond in ${language.value}.` },
                    { role: 'user', content: message }
                ],
            }),
        });
        
        const data = await response.json();
        
        // Remove loading message
        const loadingElement = document.getElementById(loadingId);
        if (loadingElement) {
            loadingElement.remove();
        }
        
        // Get response text
        const responseText = data.choices?.[0]?.message?.content || 'Sorry, I could not generate a response.';
        
        // Add assistant message to chat
        addMessageToChat('assistant', responseText, new Date().toLocaleTimeString());
        
        // Save conversation
        saveConversationToStorage(message, responseText);
        
        // Speak response if voice output is enabled
        if (document.getElementById('voiceOutput').checked) {
            speakResponse(responseText);
        }
    } catch (error) {
        console.error('Error:', error);
        
        // Remove loading message
        const loadingElement = document.getElementById(loadingId);
        if (loadingElement) {
            loadingElement.remove();
        }
        
        // Add error message
        addMessageToChat('system', 'Error: Could not connect to the AI service. Please try again later.', new Date().toLocaleTimeString());
    }
}

// Function to add a message to the chat
function addMessageToChat(role, content, timestamp) {
    const chatMessages = document.getElementById('chatMessages');
    if (!chatMessages) return;
    
    // Parse markdown if it's from the assistant
    let formattedContent = content;
    if (role === 'assistant') {
        formattedContent = marked.parse(content);
    }
    
    chatMessages.innerHTML += `
        <div class="message ${role}">
            <div class="message-content">
                ${role === 'assistant' ? formattedContent : `<p>${content}</p>`}
            </div>
            <div class="message-time">${timestamp}</div>
        </div>
    `;
    
    // Scroll to bottom
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

// Function to save conversation to localStorage
function saveConversationToStorage(userMessage, assistantResponse) {
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user) return;
    
    const conversations = JSON.parse(localStorage.getItem('conversations')) || [];
    const currentConversationId = localStorage.getItem('currentConversationId');
    
    if (currentConversationId) {
        // Update existing conversation
        const conversationIndex = conversations.findIndex(conv => conv.id === currentConversationId);
        if (conversationIndex !== -1) {
            conversations[conversationIndex].messages.push({
                role: 'user',
                content: userMessage,
                timestamp: new Date().toLocaleTimeString()
            });
            
            conversations[conversationIndex].messages.push({
                role: 'assistant',
                content: assistantResponse,
                timestamp: new Date().toLocaleTimeString()
            });
            
            // Update last message timestamp
            conversations[conversationIndex].updatedAt = new Date().toISOString();
        }
    } else {
        // Create new conversation
        const newConversation = {
            id: Date.now().toString(),
            userId: user.id,
            title: userMessage.substring(0, 30) + (userMessage.length > 30 ? '...' : ''),
            messages: [
                {
                    role: 'system',
                    content: 'Hello! I\'m your AI assistant. How can I help you today?',
                    timestamp: new Date().toLocaleTimeString()
                },
                {
                    role: 'user',
                    content: userMessage,
                    timestamp: new Date().toLocaleTimeString()
                },
                {
                    role: 'assistant',
                    content: assistantResponse,
                    timestamp: new Date().toLocaleTimeString()
                }
            ],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        
        conversations.push(newConversation);
        localStorage.setItem('currentConversationId', newConversation.id);
    }
    
    // Save conversations to localStorage
    localStorage.setItem('conversations', JSON.stringify(conversations));
    
    // Update conversation list
    loadChatHistory();
}

// Function to clear chat
function clearChat() {
    if (confirm('Are you sure you want to clear this chat?')) {
        const chatMessages = document.getElementById('chatMessages');
        if (chatMessages) {
            chatMessages.innerHTML = `
                <div class="message system">
                    <div class="message-content">
                        <p>Chat cleared. How can I help you today?</p>
                    </div>
                    <div class="message-time">${new Date().toLocaleTimeString()}</div>
                </div>
            `;
        }
        
        // Remove current conversation from storage if it exists
        const currentConversationId = localStorage.getItem('currentConversationId');
        if (currentConversationId) {
            const conversations = JSON.parse(localStorage.getItem('conversations')) || [];
            const updatedConversations = conversations.filter(conv => conv.id !== currentConversationId);
            localStorage.setItem('conversations', JSON.stringify(updatedConversations));
            localStorage.removeItem('currentConversationId');
            
            // Update conversation list
            loadChatHistory();
        }
    }
}

// Function to save conversation
function saveConversation() {
    const currentConversationId = localStorage.getItem('currentConversationId');
    if (!currentConversationId) {
        alert('No active conversation to save.');
        return;
    }
    
    alert('Conversation saved successfully!');
}

// Function to export conversation as PDF
function exportConversation() {
    const currentConversationId = localStorage.getItem('currentConversationId');
    if (!currentConversationId) {
        alert('No active conversation to export.');
        return;
    }
    
    const conversations = JSON.parse(localStorage.getItem('conversations')) || [];
    const conversation = conversations.find(conv => conv.id === currentConversationId);
    
    if (!conversation) {
        alert('Conversation not found.');
        return;
    }
    
    // In a real application, this would generate a PDF
    // For this demo, we'll just create a text file
    let content = `Spam Spot AI - Chat Export\n`;
    content += `Date: ${new Date().toLocaleDateString()}\n`;
    content += `Title: ${conversation.title}\n\n`;
    
    conversation.messages.forEach(msg => {
        content += `[${msg.timestamp}] ${msg.role.toUpperCase()}: ${msg.content}\n\n`;
    });
    
    // Create a blob and download it
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `chat-export-${Date.now()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}