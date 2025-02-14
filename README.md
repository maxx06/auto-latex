# LaTeX Copilot: AI-Powered LaTeX Assistant for Overleaf

This project provides a Chrome extension that integrates an AI-powered LaTeX assistant directly into the Overleaf editor.  It leverages the Anthropic Claude API to provide intelligent suggestions and automated formatting for LaTeX code.

## Features

* **Smart Suggestions:** Receive intelligent LaTeX code suggestions based on your current context and user requests.
* **Seamless Integration:**  Works directly within the Overleaf editor without requiring you to leave the page.
* **Easy to Use:**  Use the Ctrl+Enter keyboard shortcut to initiate a suggestion request from within the Overleaf editor.
* **Full Control:** Accept or reject suggestions with a simple click using an intuitive pop-up interface.
* **Contextual Awareness:** Suggestions take into account both selected text and the entire document content, providing relevant and accurate assistance.
* **Error Handling:** Includes robust error handling for failed API requests and gracefully handles scenarios where the Overleaf editor is not found.

## Usage

1. Install the Chrome extension (see Installation section).
2. Open your Overleaf project.
3. Select the text you want to modify (optional, but highly recommended for improved suggestions).
4. Press `Ctrl+Enter`. A modal will appear allowing you to enter your request for changes.
5. After entering your request, press "Submit". The AI will provide suggestions, which you can accept or decline.

## Installation

1.  **Clone the repository:** `git clone https://github.com/[your_github_username]/auto-latex.git`
2.  **Navigate to the extension directory:** `cd auto-latex/extension`
3.  **Load the extension into Chrome:** Open Chrome, go to `chrome://extensions/`, enable "Developer mode", and click "Load unpacked". Select the `extension` directory.
4.  **Start the backend server:** `cd ../overleaf-chat-backend` and `node app.js`.  You will need to set the `ANTHROPIC_API_KEY` environment variable.
5.  **Open Overleaf:** Navigate to your Overleaf project in a separate tab.


## Technologies Used

* **Frontend (Extension):**  JavaScript, HTML, CSS
* **Backend:** Node.js, Express.js, Axios, `dotenv`
* **AI Model:** Anthropic Claude
* **Website:** React, Create React App, CSS

## Configuration

The backend server requires an Anthropic API key. Set the `ANTHROPIC_API_KEY` environment variable in the `.env` file within the `overleaf-chat-backend` directory before running the server.  Ensure the server is running at `http://localhost:3000` for the extension to connect correctly.

## API Documentation

The backend server exposes a single POST endpoint:

`/chat`

**Request:**

```json
{
  "message": "Improve this LaTeX code...",
  "selectedContext": "This is the selected text.",
  "currentContent": "This is the full document content."
}
```

**Response (Success):**

```json
{
  "response": "Improved LaTeX code here."
}
```

**Response (Error):**

```json
{
  "error": "Failed to get response from Claude",
  "details": "Detailed error message from the API"
}
```


## Dependencies

The project uses the following dependencies:

**Extension:**

* `dotenv`: For loading environment variables.

**Backend:**

* `express`: A Node.js web framework for creating the API server.
* `cors`: For enabling Cross-Origin Resource Sharing (CORS).
* `axios`: For making HTTP requests to the Anthropic API.
* `dotenv`: For loading environment variables.

**Frontend (Website):**

* React
* Create React App
* Other standard React packages.

## Contributing

Contributions are welcome! Please open an issue or submit a pull request.

## Testing

The project includes basic testing for the React frontend using `react-scripts test`. Further testing of the backend and extension functionality is needed.



*README.md was made with [Etchr](https://etchr.dev)*