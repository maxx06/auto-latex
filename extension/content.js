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

  async function suggestChanges(message, selectedContext = '') {
    try {
      const editor = findEditor();
      if (!editor) {
        console.error('Editor not found');
        return;
      }
  
      const currentContent = editor.textContent;
      console.log('Sending request to backend with context:', { message, currentContent, selectedContext });
      const response = await fetch('http://localhost:3000/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ message, currentContent, selectedContext })
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
      // Optionally, display an in-app error message.
    }
  }
  
  // Save original text before replacing it.
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
  
    // Capture the original text.
    const originalText = selection.toString();
    range.deleteContents();
  
    // Create a suggestion span and store the original text.
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
  
    // Trigger a change event for Overleaf integration.
    const event = new Event('input', {
      bubbles: true,
      cancelable: true,
    });
    editor.dispatchEvent(event);
  
    // Show the floating suggestion popup.
    showSuggestionPopup(suggestionSpan);
  }
  
  /*
   * Floating Suggestion Popup that continuously updates its position.
   */
  function showSuggestionPopup(suggestionElement) {
    const existingPopup = document.querySelector('.suggestion-popup');
    if (existingPopup) {
      existingPopup.remove();
    }
  
    const popup = document.createElement('div');
    popup.classList.add('suggestion-popup');
  
    const acceptButton = document.createElement('button');
    acceptButton.classList.add('suggestion-button', 'accept-button');
    acceptButton.textContent = 'Accept';
  
    const declineButton = document.createElement('button');
    declineButton.classList.add('suggestion-button', 'decline-button');
    declineButton.textContent = 'Decline';
  
    popup.appendChild(acceptButton);
    popup.appendChild(declineButton);
  
    function updatePopupPosition() {
      if (!document.body.contains(popup)) return;
      const rect = suggestionElement.getBoundingClientRect();
      popup.style.top = rect.bottom + 5 + 'px';
      popup.style.left = rect.left + 'px';
      requestAnimationFrame(updatePopupPosition);
    }
    requestAnimationFrame(updatePopupPosition);
  
    acceptButton.addEventListener('click', () => {
      acceptSuggestion(suggestionElement);
      popup.remove();
    });
    declineButton.addEventListener('click', () => {
      declineSuggestion(suggestionElement);
      popup.remove();
    });
  
    document.body.appendChild(popup);
  }
  
  function acceptSuggestion(suggestionElement) {
    console.log('Suggestion accepted:', suggestionElement);
    suggestionElement.classList.remove('suggestion-highlight');
  }
  
  function declineSuggestion(suggestionElement) {
    console.log('Suggestion declined:', suggestionElement);
    const originalText = suggestionElement.dataset.originalText || '';
    const textNode = document.createTextNode(originalText);
    suggestionElement.replaceWith(textNode);
  }
  
  /*
   * Show a clean custom modal text box instead of a native prompt.
   */
  function showRequestModal() {
    // Remove any existing modal.
    const existingModal = document.querySelector('.extension-modal-overlay');
    if (existingModal) {
      existingModal.remove();
    }
  
    // Capture any highlighted text in the editor to use as context.
    let selectedContext = "";
    const selection = window.getSelection();
    if (selection && selection.toString().trim() !== "") {
      selectedContext = selection.toString().trim();
    }
  
    const modalOverlay = document.createElement('div');
    modalOverlay.className = 'extension-modal-overlay';
  
    const modal = document.createElement('div');
    modal.className = 'extension-modal';
  
    const title = document.createElement('h2');
    title.textContent = 'Enter your request for changes:';
  
    const inputBox = document.createElement('textarea');
    inputBox.className = 'extension-modal-input';
    inputBox.placeholder = 'Type your request here...';
  
    const buttonContainer = document.createElement('div');
    buttonContainer.className = 'extension-modal-buttons';
  
    const cancelButton = document.createElement('button');
    cancelButton.className = 'extension-modal-cancel';
    cancelButton.textContent = 'Cancel';
    cancelButton.addEventListener('click', () => {
      modalOverlay.remove();
      const editor = document.querySelector('.cm-content');
      if (editor) {
        editor.focus();
      }
    });
  
    const submitButton = document.createElement('button');
    submitButton.className = 'extension-modal-submit';
    submitButton.textContent = 'Submit';
    submitButton.addEventListener('click', () => {
      const message = inputBox.value.trim();
      if (message !== '') {
        modalOverlay.remove();
        const editor = document.querySelector('.cm-content');
        if (editor) {
          editor.focus();
        }
        // Pass the selectedContext along with the request.
        suggestChanges(message, selectedContext);
      }
    });
  
    buttonContainer.appendChild(cancelButton);
    buttonContainer.appendChild(submitButton);
  
    modal.appendChild(title);
    modal.appendChild(inputBox);
    modal.appendChild(buttonContainer);
  
    modalOverlay.appendChild(modal);
    document.body.appendChild(modalOverlay);
  }
  
  // Use a capturing listener.
  document.addEventListener('keydown', (event) => {
    if (event.ctrlKey && event.key === 'Enter') {
      console.log("Ctrl+Enter detected: showing custom modal.");
      event.preventDefault();
      showRequestModal();
    }
  }, true);
}

// Initialize editor integration.
document.addEventListener('DOMContentLoaded', setupEditorIntegration);
setTimeout(setupEditorIntegration, 1000); 