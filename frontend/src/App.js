import React, { useState } from 'react';
import axios from 'axios';
import isValidUrl from 'valid-url'; // Import valid-url library
import './App.css';

function App() {
  const [url, setUrl] = useState('');
  const [progress, setProgress] = useState(0);
  const [isValidUrlInput, setIsValidUrlInput] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  const handleUrlChange = (e) => {
    const newUrl = e.target.value;
    setUrl(newUrl);
    validateUrl(newUrl);
  };

  const validateUrl = (url) => {
    setIsValidUrlInput(isValidUrl.isUri(url)); // Check if URL is valid
  };

  const handleDownload = async () => {
    setErrorMessage('');

    if (!isValidUrlInput) {
      setErrorMessage('Please enter a valid URL');
      console.error('Invalid URL entered');
      return;
    }

    try {
      const response = await axios({
        url: 'http://localhost:5000/download', // Change this to your actual backend endpoint
        method: 'POST',
        data: { url: url },
        onDownloadProgress: (progressEvent) => {
          const progress = Math.round((progressEvent.loaded / progressEvent.total) * 100);
          setProgress(progress);
        }
      });

      if (response.data === 'Success') {
        alert('File downloaded successfully!');
        console.log('File downloaded successfully!');
      } else {
        setErrorMessage('Failed to download file!');
        console.error('Failed to download file!', response.data);
      }
    } catch (error) {
      setErrorMessage('Error downloading file!');
      console.error('Error downloading file:', error);
    }
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>File Downloader</h1>
        <input 
          type="text" 
          value={url} 
          onChange={handleUrlChange} 
          placeholder="Enter URL" 
          className={`url-input ${isValidUrlInput ? '' : 'invalid'}`}
        />
        <button onClick={handleDownload} disabled={!isValidUrlInput}>Download</button>
        {progress > 0 && <progress value={progress} max="100">{progress}%</progress>}
        {errorMessage && <p className="error-message">{errorMessage}</p>}
      </header>
    </div>
  );
}

export default App;
