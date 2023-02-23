import React, { useState, useEffect } from 'react';
import axios from 'axios';
import moment from 'moment';
import stubs from './defaultStubs';
import './App.css';

const App = () => {
  const [code, setCode] = useState('');
  const [output, setOutput] = useState('');
  const [language, setLanguage] = useState('cpp');
  const [status, setStatus] = useState('');
  const [jobID, setJobID] = useState('');
  const [jobDetails, setJobDetails] = useState(null);

  useEffect(() => {
    const defaultLang = localStorage.getItem("default-language") || "cpp";
    setLanguage(defaultLang);
  }, []);

  useEffect(() => {
    setCode(stubs[language]);
  }, [language]);

  const setDefaultLanguage = () => {
    localStorage.setItem('default-language', language);
    console.log(`${language} set as default language!`);
  };

  const renderTimeDetails = () => {
    if (!jobDetails) {
      return "";
    }
    let result = '';
    let { submittedAt, completedAt, startedAt } = jobDetails;
    submittedAt = moment(submittedAt).toString();
    result += `Submitted At: ${submittedAt}`;

    if (!completedAt || !startedAt) {
      return result;
    }
    const start = moment(startedAt);
    const end = moment(completedAt);
    const executionTime = end.diff(start, 'seconds', true);
    result += ` Execution Time: ${executionTime} seconds`;
    return result;
  };

  const handleCodeChange = (event) => {
    setCode(event?.target?.value);
  };

  const handleRunCode = async () => {
    const payload = {
      language, code
    };
    try {
      setJobID("");
      setStatus("");
      setOutput("");
      setJobDetails(null);

      const { data } = await axios.post("http://localhost:5000/run", payload);
      console.log(data);
      setJobID(data?.jobID);
      let intervalID;

      intervalID = setInterval(async () => {
        const { data: dataRes } = await axios.get("http://localhost:5000/status", {
          params: {
            id: data.jobID,
          }
        });

        const { success, job, error } = dataRes;
        console.log(dataRes);
        if (success) {
          const { status: jobStatus, output: jobOutput } = job;
          setStatus(jobStatus);
          setJobDetails(job);
          if (jobStatus === 'pending') return;
          setOutput(jobOutput);
          clearInterval(intervalID);
        } else {
          setStatus("Error, Please try again!☹️");
          console.log(error);
          clearInterval(intervalID);
          setOutput(error);
        }
      }, 1000);
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
      <h2 className="code-editor-heading font-bold text-white myFont">Online Code Editor💻</h2>
      <div className='flex items-center'>
        <label className='myFont text-white text-xl font-semibold'>Language:&nbsp;</label>
        <select value={language}
          className='focus:outline-0 bg-white font-semibold rounded-lg py-1 mb-2'
          onClick={setDefaultLanguage}
          onChange={(e) => {
            let response = window.confirm("Warning⚠️, Switching the language will remove your whole current code! Do you want to proceed?");

            if (response) {
              setLanguage(
                e.target.value
              );
            }
          }}>
          <option value="c" className='bg-white font-semibold'>C</option>
          <option value="cpp" className='bg-white font-semibold'>C++</option>
          <option value="py" className='bg-white font-semibold'>Python</option>
        </select>
      </div>
      <textarea
        className="focus:outline-0 myFont code-editor-textarea bg-white"
        value={code}
        onChange={handleCodeChange}
      />
      <button className="myFont code-editor-button font-semibold" onClick={handleRunCode}>
        Run Code🏃🏻‍♂️
      </button>

      <div>
        <h2 className='myFont text-white text-xl font-semibold uppercase'><span className='capitalize'>Status:</span> {status}</h2>
        <p className='myFont text-white text-lg font-semibold'>{jobID && `JobID: ${jobID}`}</p>
        <p className='myFont text-white text-lg font-semibold'>Output: {output}</p>
        <p className='myFont text-white text-lg font-semibold'>{renderTimeDetails()}</p>
      </div>
    </div>
  )
}

export default App;