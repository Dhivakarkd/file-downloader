const express = require('express');
const axios = require('axios');
const fs = require('fs');
const cors = require('cors');
const path = require('path');
const { pipeline } = require('stream');
const { promisify } = require('util');
const { v4: uuidv4 } = require('uuid'); // Import uuid library to generate unique filenames


const app = express();
const PORT = process.env.PORT || 5000;
const streamPipeline = promisify(pipeline);
app.use(cors());
app.use(express.json());

// Create downloads directory if not exists
const downloadsDir = path.join(__dirname, 'downloads');
if (!fs.existsSync(downloadsDir)) {
  fs.mkdirSync(downloadsDir);
}

app.post('/download', async (req, res) => {
  const { url } = req.body;
  console.log(`Received download request for URL: ${url}`);

  if (!url) {
    console.error('No URL provided in the request');
    return res.status(400).json({ error: 'No URL provided' });
  }

  try {
    const finalUrl = await resolveRedirects(url); // Get final redirected URL
    const filename = getFilenameFromUrl(finalUrl); // Extract filename from final URL
    const filePath = path.join(downloadsDir, filename);

    console.log(`Downloading file from ${finalUrl} to ${filePath}`);

    const response = await axios.get(finalUrl, { responseType: 'stream' });

    await streamPipeline(response.data, fs.createWriteStream(filePath));

    console.log('File downloaded successfully!');
    res.json('Success');
  } catch (error) {
    console.error('Error downloading file:', error.message);
    res.status(500).json({ error: 'Error downloading file' });
  }
});

async function resolveRedirects(url) {
  let finalUrl = url;
  try {
    const response = await axios.head(url, { maxRedirects: 10 });
    finalUrl = response.request.res.responseUrl; // Get final redirected URL from response
  } catch (error) {
    console.error('Error resolving redirects:', error.message);
  }
  return finalUrl;
}

function getFilenameFromUrl(url) {
  const uniqueId = uuidv4(); // Generate unique identifier
  const parsedUrl = new URL(url);
  const pathname = parsedUrl.pathname;
  const filename = pathname.split('/').pop(); // Extract filename from URL
  return `${uniqueId}-${filename}`;
}

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
