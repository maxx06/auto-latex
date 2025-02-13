require('dotenv').config();
const express = require('express');
const cors = require('cors');
const axios = require('axios');
const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());

app.post('/chat', async (req, res) => {
  try {
    console.log('Received request:', req.body);
    
    // Extract message, selected context, and full content from the request.
    const { message, selectedContext, currentContent } = req.body;
    
    // Combine the user message with any highlighted context and full content.
    let combinedMessage = message;
    if (selectedContext && selectedContext.trim() !== '') {
      combinedMessage += `\n\nContext: ${selectedContext}`;
    }
    if (currentContent && currentContent.trim() !== '') {
      combinedMessage += `\n\nFull Content: ${currentContent}`;
    }
    
    console.log('Final combined prompt sent to Claude:', combinedMessage);
    
    // Call Claude API with the combined prompt
    const response = await axios.post(
      'https://api.anthropic.com/v1/messages',
      {
        model: 'claude-3-haiku-20240307',
        max_tokens: 1024,
        system: 'You are a LaTeX assistant. Only respond with valid LaTeX code. Do not include any explanations or markdown formatting. Your responses should be pure LaTeX that can be directly copied into a LaTeX document.',
        messages: [
          { role: 'user', content: combinedMessage }
        ]
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': process.env.ANTHROPIC_API_KEY,
          'anthropic-version': '2023-06-01'
        }
      }
    );

    console.log('Claude response:', response.data);
    res.json({ response: response.data.content[0].text });
    
  } catch (error) {
    console.error('Detailed backend error:', error.response?.data || error);
    res.status(500).json({ 
      error: 'Failed to get response from Claude',
      details: error.response?.data || error.message 
    });
  }
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});