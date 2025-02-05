import './App.css';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <h1>LaTeX Copilot</h1>
        <p className="subtitle">Your AI-powered LaTeX assistant for Overleaf</p>
      </header>

      <main className="App-main">
        <section className="features">
          <h2>Features</h2>
          <div className="feature-grid">
            <div className="feature-card">
              <h3>Smart Suggestions</h3>
              <p>Get intelligent LaTeX code suggestions powered by Claude AI</p>
            </div>
            <div className="feature-card">
              <h3>Seamless Integration</h3>
              <p>Works directly within your Overleaf editor</p>
            </div>
            <div className="feature-card">
              <h3>Easy to Use</h3>
              <p>Press Ctrl+Enter to request changes anytime</p>
            </div>
            <div className="feature-card">
              <h3>Full Control</h3>
              <p>Accept or reject suggestions with a single click</p>
            </div>
          </div>
        </section>

        <section className="installation">
          <h2>Getting Started</h2>
          <div className="steps">
            <div className="step">
              <span className="step-number">1</span>
              <p>Download the Chrome extension</p>
            </div>
            <div className="step">
              <span className="step-number">2</span>
              <p>Open your Overleaf project</p>
            </div>
            <div className="step">
              <span className="step-number">3</span>
              <p>Press Ctrl+Enter to start using LaTeX Copilot</p>
            </div>
          </div>
        </section>
      </main>

      <footer className="App-footer">
        <p>Built with Claude AI • Open Source</p>
      </footer>
    </div>
  );
}

export default App;
