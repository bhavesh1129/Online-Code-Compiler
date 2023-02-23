import React, { useState } from 'react';
import axios from 'axios';
import './App.css';

const App = () => {
  const [code, setCode] = useState('');
  const [output, setOutput] = useState('');
  const [language, setLanguage] = useState('cpp');

  const handleCodeChange = (event) => {
    setCode(event?.target?.value);
  };

  const handleRunCode = async () => {
    const payload = {
      language, code
    };
    try {
      const { data } = await axios.post("http://localhost:5000/run", payload);
      console.log(data);
      setOutput(data?.jobID);
    } catch ({ response }) {
      if (response) {
        console.log(response);
        const errMsg = response?.data?.error?.stderr;
        setOutput(errMsg);
      } else {
        setOutput("Error connecting to server!");
      }
    }
  };

  return (
    <div className="code-editor-container">
      <h2 className="code-editor-heading font-bold">Online Code Editor</h2>
      <div>
        <label>Language: </label>
        <select value={language}
          onChange={(e) => {
            setLanguage(
              e.target.value
            );
          }}>
          <option value="c">C</option>
          <option value="cpp">C++</option>
          <option value="py">Python</option>
        </select>
      </div>
      <textarea
        className="code-editor-textarea border-2 border-black"
        value={code}
        onChange={handleCodeChange}
      />
      <button className="code-editor-button" onClick={handleRunCode}>
        Run Code
      </button>

      <div>
        <p>{output}</p>
      </div>
    </div>
  )
}

export default App