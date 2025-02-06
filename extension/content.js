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

      insertSuggestion(data.response);
    } catch (error) {
      console.error('Detailed error:', error);
      alert(`Error: ${error.message}`);
    }
  }

  function insertSuggestion(suggestedContent) {
    const editor = document.querySelector('.cm-content');
    if (!editor) {
      console.error('Editor not found');
      return;
    }

    const selection = window.getSelection();
    if (!selection.rangeCount) {
      console.error('No selection available for suggestion insertion.');
      return;
    }
    const range = selection.getRangeAt(0);

    // Capture the original text that is about to be replaced.
    const originalText = selection.toString();
    // Delete the current selection content.
    range.deleteContents();

    // Create a suggestion span and store the original text in a data attribute.
    const suggestionSpan = document.createElement('span');
    suggestionSpan.className = 'suggestion-highlight';
    suggestionSpan.textContent = suggestedContent;
    suggestionSpan.dataset.originalText = originalText;

    // Insert the suggestion into the editor.
    range.insertNode(suggestionSpan);

    // Move the cursor to the end of the inserted text.
    range.setStartAfter(suggestionSpan);
    range.setEndAfter(suggestionSpan);
    selection.removeAllRanges();
    selection.addRange(range);

    // Trigger a change event so that Overleaf updates.
    const event = new Event('input', {
      bubbles: true,
      cancelable: true,
    });
    editor.dispatchEvent(event);

    // Show the floating suggestion popup.
    showSuggestionPopup(suggestionSpan);
  }

  /*
   * Floating Suggestion Popup
   */
  function showSuggestionPopup(suggestionElement) {
    // Remove any existing popup.
    const existingPopup = document.querySelector('.suggestion-popup');
    if (existingPopup) {
      existingPopup.remove();
    }

    // Create the popup container.
    const popup = document.createElement('div');
    popup.classList.add('suggestion-popup');

    // Create the Accept button.
    const acceptButton = document.createElement('button');
    acceptButton.classList.add('suggestion-button', 'accept-button');
    acceptButton.textContent = 'Accept';
    acceptButton.addEventListener('click', () => {
      acceptSuggestion(suggestionElement);
      popup.remove();
    });

    // Create the Decline button.
    const declineButton = document.createElement('button');
    declineButton.classList.add('suggestion-button', 'decline-button');
    declineButton.textContent = 'Decline';
    declineButton.addEventListener('click', () => {
      declineSuggestion(suggestionElement);
      popup.remove();
    });

    // Append buttons to the popup.
    popup.appendChild(acceptButton);
    popup.appendChild(declineButton);

    // Position the popup below the suggestion element.
    const rect = suggestionElement.getBoundingClientRect();
    popup.style.top = rect.bottom + window.scrollY + 5 + 'px';
    popup.style.left = rect.left + window.scrollX + 'px';

    // Append the popup to the document body.
    document.body.appendChild(popup);
  }

  /*
   * Dummy functions for accepting or declining a suggestion.
   */
  function acceptSuggestion(suggestionElement) {
    console.log('Suggestion accepted:', suggestionElement);
    // On acceptance, simply remove the highlight indicator.
    suggestionElement.classList.remove('suggestion-highlight');
  }

  function declineSuggestion(suggestionElement) {
    console.log('Suggestion declined:', suggestionElement);
    // Revert all changes: restore the original text.
    const originalText = suggestionElement.dataset.originalText || '';
    const textNode = document.createTextNode(originalText);
    suggestionElement.replaceWith(textNode);
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

// Initialize editor integration
document.addEventListener('DOMContentLoaded', setupEditorIntegration);
setTimeout(setupEditorIntegration, 1000); 