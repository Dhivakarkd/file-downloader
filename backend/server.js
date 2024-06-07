const express = require('express');
const axios = require('axios').default;
const fs = require('fs');
const path = require('path');
const { pipeline } = require('stream');
const { promisify } = require('util');

const app = express();
const PORT = process.env.PORT || 5000;

const downloadFile = async (url, destination) => {
  const response = await axios({
    url,
    method: 'GET',
    responseType: 'stream'
  });

  const pipelineAsync = promisify(pipeline);
  await pipelineAsync(response.data, fs.createWriteStream(destination));

  return 'Success';
};

app.use(express.json());

app.post('/download', async (req, res) => {
  const { url } = req.body;
  if (!url) {
    return res.status(400).send('Invalid URL');
  }

  const destination = 'downloads/downloaded_file'; // Specify your download location
  try {
    const result = await downloadFile(url, destination);
    res.send(result);
  } catch (error) {
    console.error(error);
    res.status(500).send('Failed to download file');
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
