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

function setupEditorIntegration() {
  console.log("Setting up editor integration...");

  function findEditor() {
    const editorElement = document.querySelector('.cm-content');
    if (!editorElement) {
      console.log("Editor not found, retrying...");
      return null;
    }
    return editorElement;
  }

  async function suggestChanges(message) {
    try {
      const editor = findEditor();
      if (!editor) {
        console.error('Editor not found');
        return;
      }

      const currentContent = editor.textContent;
      console.log('Sending request to backend...');
      const response = await fetch('http://localhost:3000/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ message, currentContent })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Server error: ${errorData.error || 'Unknown error'}`);
      }

      const data = await response.json();
      if (data.error) {
        throw new Error(data.error);
      }

      showSuggestion(data.response);
    } catch (error) {
      console.error('Detailed error:', error);
      alert(`Error: ${error.message}`);
    }
  }

  function showSuggestion(suggestedContent) {
    const editor = findEditor();
    if (!editor) {
      console.error('Editor not found');
      return;
    }

    const suggestionOverlay = document.createElement('div');
    suggestionOverlay.className = 'suggestion-overlay';
    suggestionOverlay.innerHTML = `
      <div class="suggestion-content">
        <h3>Suggested Changes</h3>
        <pre>${suggestedContent}</pre>
        <button id="accept-suggestion">Accept</button>
        <button id="reject-suggestion">Reject</button>
      </div>
    `;
    document.body.appendChild(suggestionOverlay);

    document.getElementById('accept-suggestion').addEventListener('click', () => {
      insertAtCursor(suggestedContent);
      document.body.removeChild(suggestionOverlay);
    });

    document.getElementById('reject-suggestion').addEventListener('click', () => {
      document.body.removeChild(suggestionOverlay);
    });
  }

  function insertAtCursor(text) {
    const editor = findEditor();
    if (!editor) {
      console.error('Editor not found');
      return;
    }

    const selection = window.getSelection();
    const range = selection.getRangeAt(0);
    range.deleteContents();

    const textNode = document.createTextNode(text);
    range.insertNode(textNode);

    // Move the cursor to the end of the inserted text
    range.setStartAfter(textNode);
    range.setEndAfter(textNode);
    selection.removeAllRanges();
    selection.addRange(range);

    // Trigger a change event to ensure Overleaf updates
    const event = new Event('input', {
      bubbles: true,
      cancelable: true,
    });
    editor.dispatchEvent(event);
  }

  document.addEventListener('keydown', (event) => {
    if (event.ctrlKey && event.key === 'Enter') {
      const message = prompt("Enter your request for changes:");
      if (message) {
        suggestChanges(message);
      }
    }
  });
}

// Initialize chat box
document.addEventListener('DOMContentLoaded', createChatBox);
setTimeout(createChatBox, 1000);

// Initialize editor integration
document.addEventListener('DOMContentLoaded', setupEditorIntegration);
setTimeout(setupEditorIntegration, 1000); 