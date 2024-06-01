import { execSync } from 'child_process';
import axios from 'axios';
import fs from 'fs';

async function downloadFile(url, outputPath) {
  if (fs.existsSync(outputPath)) {
    console.log(`${outputPath} already exists. Skipping download.`);
    return;
  }

  const writer = fs.createWriteStream(outputPath);
  const response = await axios({
    url,
    method: 'GET',
    responseType: 'stream'
  });

  const totalLength = response.headers['content-length'];

  console.log(`Starting download of ${outputPath}...`);
  let downloadedLength = 0;
  response.data.on('data', (chunk) => {
    downloadedLength += chunk.length;
    process.stdout.write(`Downloaded ${(downloadedLength / totalLength * 100).toFixed(2)}% (${downloadedLength} of ${totalLength} bytes)\r`);
  });

  response.data.pipe(writer);

  return new Promise((resolve, reject) => {
    writer.on('finish', () => {
      console.log(`\nDownload of ${outputPath} completed.`);
      resolve();
    });
    writer.on('error', reject);
  });
}

async function setupModel() {
  try {
    console.log('Downloading llamafile.exe...');
    await downloadFile('https://github.com/Mozilla-Ocho/llamafile/releases/download/0.6/llamafile-0.6', 'llamafile.exe');

    console.log('Downloading tinyllama-1.1b-chat-v1.0.Q4_K_M.gguf...');
    await downloadFile('https://huggingface.co/TheBloke/TinyLlama-1.1B-Chat-v1.0-GGUF/resolve/main/tinyllama-1.1b-chat-v1.0.Q4_K_M.gguf', 'tinyllama-1.1b-chat-v1.0.Q4_K_M.gguf');

    console.log('Starting llamafile.exe server...');
    execSync('llamafile.exe -m tinyllama-1.1b-chat-v1.0.Q4_K_M.gguf', { stdio: 'inherit' });

  } catch (error) {
    console.error('An error occurred:', error);
  }
}

setupModel();
