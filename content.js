function createChatBox() {
  console.log("Attempting to create chat box...");
  
  // Check if chat box already exists to prevent duplicates
  if (document.querySelector('.overleaf-chat-container')) {
    console.log("Chat box already exists");
    return;
  }

  const chatContainer = document.createElement('div');
  chatContainer.className = 'overleaf-chat-container';
  
  const chatHistory = document.createElement('div');
  chatHistory.className = 'chat-history';
  
  const inputContainer = document.createElement('div');
  inputContainer.className = 'chat-input-container';
  
  const input = document.createElement('textarea');
  input.className = 'chat-input';
  input.placeholder = 'Ask a question...';
  
  const sendButton = document.createElement('button');
  sendButton.className = 'chat-send-button';
  sendButton.textContent = 'Send';
  
  inputContainer.appendChild(input);
  inputContainer.appendChild(sendButton);
  chatContainer.appendChild(chatHistory);
  chatContainer.appendChild(inputContainer);
  
  // Try multiple possible selectors for the Overleaf editor
  const possibleSelectors = [
    '.editor-wrapper',
    '#editor',
    '.pdf-viewer',
    '.full-size',
    'body'  // fallback
  ];

  let targetContainer = null;
  for (const selector of possibleSelectors) {
    targetContainer = document.querySelector(selector);
    if (targetContainer) {
      console.log(`Found target container with selector: ${selector}`);
      break;
    }
  }

  if (targetContainer) {
    targetContainer.appendChild(chatContainer);
    console.log("Chat box successfully added");
  } else {
    console.error("Could not find suitable container for chat box");
  }
  
  // Handle sending messages
  sendButton.addEventListener('click', async () => {
    const message = input.value.trim();
    if (!message) return;
    
    appendMessage('user', message);
    input.value = '';
    
    try {
      const response = await fetch('http://localhost:3000/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ message })
      });
      
      const data = await response.json();
      if (data.error) {
        throw new Error(data.error);
      }
      appendMessage('assistant', data.response);
    } catch (error) {
      appendMessage('error', 'Error: Could not get response from AI');
      console.error('Error:', error);
    }
  });
  
  // Handle enter key
  input.addEventListener('keypress', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendButton.click();
    }
  });
}

function appendMessage(role, content) {
  const chatHistory = document.querySelector('.chat-history');
  const messageDiv = document.createElement('div');
  messageDiv.className = `chat-message ${role}-message`;
  messageDiv.textContent = content;
  chatHistory.appendChild(messageDiv);
  chatHistory.scrollTop = chatHistory.scrollHeight;
}

// Try multiple times to create the chat box as Overleaf loads dynamically
function initializeChatBox() {
  console.log("Initializing chat box...");
  createChatBox();
}

// Initial attempt
document.addEventListener('DOMContentLoaded', initializeChatBox);

// Multiple delayed attempts to catch after dynamic content loads
[1000, 2000, 3000].forEach(delay => {
  setTimeout(initializeChatBox, delay);
});

// Also try when URL changes (for when switching between editor and PDF view)
let lastUrl = location.href; 
new MutationObserver(() => {
  const url = location.href;
  if (url !== lastUrl) {
    lastUrl = url;
    initializeChatBox();
  }
}).observe(document, {subtree: true, childList: true}); 