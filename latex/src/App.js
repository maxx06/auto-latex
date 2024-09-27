import logo from './logo.svg';
import './App.css';
import { React, useState } from 'react';

function App() {
  const {
    GoogleGenerativeAI,
    HarmCategory,
    HarmBlockThreshold,
  } = require("@google/generative-ai");

  const apiKey = 'AIzaSyBfOqWy6ImeVvnaitBZ3uOjGE9jxdHT3jI';
  const genAI = new GoogleGenerativeAI(apiKey);

  const model = genAI.getGenerativeModel({
    model: "gemini-1.5-flash",
  });
  
  const generationConfig = {
    temperature: 1,
    topP: 0.95,
    topK: 64,
    maxOutputTokens: 8192,
    responseMimeType: "text/plain",
  };

  const parts = [
    {text: "Convert the following natural language description into LaTeX code. Focus on accurately representing mathematical expressions, equations, and formatting as specified. Here’s the input: [insert natural language description]. Please provide only the LaTeX output without any additional explanations."},
    {text: "input: integral of x squared from 0 to 1"},
    {text: "output: $\\int_0^1 x^2 \\, dx$"},
    {text: "input: x equals minus b plus or minus the square root of b squared minus four a c, all over two a"},
    {text: "output: $x = \\frac{-b \\pm \\sqrt {b ^2 - 4ac}}{2a}$"},
    {text: "input: g sub i j"},
    {text: "output: $g_{ij}$"},
    {text: "input: g sub i j"},
    {text: "output: "},
  ];

  const result = model.generateContent({
    contents: [{ role: "user", parts }],
    generationConfig,
 // safetySettings: Adjust safety settings
 // See https://ai.google.dev/gemini-api/docs/safety-settings
  });
  const store = result.response.text();

  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>
          Edit <code>src/App.js</code> and save to reload.
        </p>
        <a
          className="App-link"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          {store}
        </a>
      </header>
    </div>
  );
}

export default App;
