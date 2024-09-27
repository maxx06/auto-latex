import React, { useState } from 'react';
import { GoogleGenerativeAI } from '@google/generative-ai';
import './App.css';
import Latex from 'react-latex-next';
import 'katex/dist/katex.min.css';

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
      
      ---

      Examples: 
      input: integral of x squared from 0 to 1 
      output: $$\\\\int_0^1 x^2 \\\\, dx$$
      
      input: x equals minus b plus or minus the square root of b squared minus four a c, all over two a
      output: $$x = \\\\frac{-b \\\\pm \\\\sqrt {b ^2 - 4ac}}{2a}$$

      input: show the complete factorization of 6x^2+12x+6
      output: $$6x^2+12x+6 = 6(x^2+2x+1) = 6(x+1)^2$$

      input: the limit as x approaches 0 of sin x over x is 1
      output: $$\\lim_{x \\to 0} \\frac{\\sin x}{x} = 1$$

      input: give me the truth table for p implies q
      output: $$\\begin{array}{cc|c} p & q & p \\implies q \\\\\\hline T & T & T \\\\\\ T & F & F \\\\\\ F & T & T \\\\\\ F & F & T \\end{array}$$

      input: give me the truth table for p and q
      output: $$\\begin{array}{cc|c} p & q & p \\land q \\\\\\hline T & T & T \\\\\\ T & F & F \\\\\\ F & T & F \\\\\\ F & F & F \\end{array}$$

      ---

      Always surround expresisons with double dollar signs.

      For truth tables, use the array environment with the pipe character to separate columns. Use the hline command to draw horizontal lines. Use T for true and F for false. 

      `;
      const result = await model.generateContent(prompt);
      setInputValue('')
      const response = result.response;
      const text = response.text();
      console.log(text)
      setpromptResponses([text]);
  
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
      <h1 className="head-text">LaTeX</h1>
      <div className="row">
        <div className="col">
          <input
            type="text"
            value={inputValue}
            onChange={handleInputChange}
            placeholder="LaTeX Anything..."
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
            <div>
              {promptResponse}
              <Latex>{promptResponse}</Latex>
              
            </div>
          </div>
        ))
      )}
  </div>
  
  );

}


export default App;