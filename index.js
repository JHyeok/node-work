const express = require('express');
const fs = require('fs');
const fsasync = require('fs').promises;
const { Worker } = require('worker_threads');
const crypto = require('crypto');
const pkcs7 = require('pkcs7-padding');

const app = express();
const port = 3055;

app.get('/hello', (req, res) => {
  res.status(200).send('OK');
});

app.get('/async', async (req, res) => {
  const file = await fsasync.readFile('image/meat.jpg');
  // const file = await readFileAsync();
  res.status(200).send(file);
});

app.get('/sync', (req, res) => {
  const file = readFileSync();
  res.status(200).send(file);
});

const readFileAsync = async () => {
  fs.readFile('image/meat.jpg', (err, data) => {
    if (err) throw err;
    // console.log(data);
    return data;
  });
};

const readFileSync = () => {
  const data = fs.readFileSync('image/meat.jpg');
  // console.log(data);
  return data;
};

app.get('/long-count', (req, res) => {
  let counter = 0;
  for (let i = 0; i < 20_000_000_000; i++) {
    counter++;
  }

  // 20초동안 counter 변수를 증가시킴
  // const endTime = Date.now() + 20000
  //
  // while (Date.now() < endTime) {
  //     counter++;
  // }

  res.status(200).send({ counter });
});

app.get('/promise-long-count', async (req, res) => {
  const counter = await calculateCount();
  res.status(200).send(`result is ${counter}`);
});

function calculateCount() {
  return new Promise((resolve, reject) => {
    let counter = 0;
    for (let i = 0; i < 20_000_000_000; i++) {
      counter++;
    }
    resolve(counter);
  });
}

app.get('/worker-long-count', async (req, res) => {
  const worker = new Worker('./worker.js');
  worker.on('message', (data) => {
    res.status(200).send(`result is ${data}`);
  });
  worker.on('error', (msg) => {
    res.status(404).send(`An error occurred: ${msg}`);
  });
});

app.get('/crypto', (req, res) => {
  console.time('crypto');
  const result = scryptEncryption('sadjaksjdlksajdkwqeoiwqjeoiqjeoijeoijas1213kljsaldjslkasadjakjhhjhjsjdl');
  console.timeEnd('crypto');
  res.status(200).send(`result is ${result}`);
});

const scryptEncryption = (value) => {
  const salt = crypto.randomBytes(12).toString('base64');
  const secret = crypto.scryptSync(value, salt, 64).toString('base64');
  return { salt, secret };
};

app.get('/crypto-aes', (req, res) => {
  console.time('crypto-aes');
  const result = encryptAES('sadjaksjdlksajdkwqeoiwqjeoiqjeoijeoijas1213kljsaldjslkasadjakjhhjhjsjdl');
  console.timeEnd('crypto-aes');
  res.status(200).send(`result is ${result}`);
});

const encryptAES = (value) => {
  // 테스트로 만든 임시 값
  const privateKey = '45zsAwEo21a3iQiHwXFdKeqKET61qdXe';
  const privateIV = 'lQ2asdZFDZizLxaR';
  const cipher = crypto.createCipheriv('AES-256-CBC', privateKey, privateIV);
  cipher.setAutoPadding(false);
  let encrypted = cipher.update(pkcs7.pad(value), undefined, 'base64');
  encrypted += cipher.final('base64');
  return encrypted;
};

app.listen(port, () => console.log(`Example app listening on port ${port}!`));
