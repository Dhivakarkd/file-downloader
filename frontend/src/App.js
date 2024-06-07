import React, { useState } from 'react';
import axios from 'axios';

function App() {
  const [url, setUrl] = useState('');
  const [progress, setProgress] = useState(0);

  const handleUrlChange = (e) => {
    setUrl(e.target.value);
  };

  const handleDownload = async () => {
    try {
      const response = await axios({
        url: '/download',
        method: 'POST',
        data: {
          url: url
        },
        onDownloadProgress: (progressEvent) => {
          const progress = Math.round((progressEvent.loaded / progressEvent.total) * 100);
          setProgress(progress);
        }
      });

      if (response.data === 'Success') {
        alert('File downloaded successfully!');
      } else {
        alert('Failed to download file!');
      }
    } catch (error) {
      alert('Error downloading file!');
    }
  };

  return (
    <div>
      <h1>File Downloader</h1>
      <input type="text" value={url} onChange={handleUrlChange} placeholder="Enter URL" />
      <button onClick={handleDownload}>Download</button>
      <br />
      {progress > 0 && <progress value={progress} max="100">{progress}%</progress>}
    </div>
  );
}

export default App;
