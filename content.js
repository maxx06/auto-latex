function createChatBox() {
  console.log("Attempting to create chat box...");
  
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
  input.placeholder = 'Ask Claude...';
  
  const sendButton = document.createElement('button');
  sendButton.className = 'chat-send-button';
  sendButton.textContent = 'Send';
  
  inputContainer.appendChild(input);
  inputContainer.appendChild(sendButton);
  chatContainer.appendChild(chatHistory);
  chatContainer.appendChild(inputContainer);
  
  document.body.appendChild(chatContainer);
  console.log("Chat box added to body");
  
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

// Initialize chat box
document.addEventListener('DOMContentLoaded', createChatBox);
setTimeout(createChatBox, 1000); 