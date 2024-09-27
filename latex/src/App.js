import React, { useState } from 'react';
import { GoogleGenerativeAI } from '@google/generative-ai';
import './App.css';
import Latex from 'react-latex-next';

function App() {
  const [inputValue, setInputValue] = useState('');
  const [promptResponses, setpromptResponses] = useState([]);
  const [loading, setLoading] = useState(false);

  const genAI = new GoogleGenerativeAI(
    "AIzaSyBfOqWy6ImeVvnaitBZ3uOjGE9jxdHT3jI"
  );

  const handleInputChange = (e) => {
    setInputValue(e.target.value);
  };

  const getResponseForGivenPrompt = async () => {
    try {
      setLoading(true)
      const model = genAI.getGenerativeModel({ model: "gemini-pro" });
      const prompt = `Convert the following natural language description into LaTeX code. Focus on accurately representing mathematical expressions, equations, and formatting as specified. 
      Here’s the input: ${inputValue}. Please provide only the LaTeX output without any additional explanations. 
      
      Examples: 
      input: integral of x squared from 0 to 1 
      output: $\\int_0^1 x^2 \\, dx$ 
      
      input: x equals minus b plus or minus the square root of b squared minus four a c, all over two a
      output: $x = \\frac{-b \\pm \\sqrt {b ^2 - 4ac}}{2a}$

      `;
      const result = await model.generateContent(prompt);
      setInputValue('')
      const response = result.response;
      const text = response.text();
      console.log(text)
      setpromptResponses([...promptResponses,text]);
  
      setLoading(false)
    }
    catch (error) {
      console.log(error)
      console.log("Something Went Wrong");
      setLoading(false)
    }
  };

  return (
    <div className="container">
      <div className="row">
        <div className="col">
          <input
            type="text"
            value={inputValue}
            onChange={handleInputChange}
            placeholder="LaTeX Anything"
            className="form-control"
          />
        </div>
        <div className="col-auto">
          <button onClick={getResponseForGivenPrompt} className="btn btn-primary">Go</button>
        </div>
      </div>
      {loading ? (
        <div className="text-center mt-3">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
        // This message is shown while your answer to your prompt is being generated
          </div>
        </div>
      ) : (
        promptResponses.map((promptResponse, index) => (
          <div key={index} >
            <div className={`response-text ${index === promptResponses.length - 1 ? 'fw-bold' : ''}`}>
              {promptResponse}
              <Latex>{promptResponse}</Latex>
              
            </div>
      //the latest response shown in bold letters
          </div>
        ))
      )}
  </div>
  
  );

}


export default App;