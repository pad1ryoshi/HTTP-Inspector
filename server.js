const express = require('express');
const axios = require('axios');
const cors = require('cors');
const app = express();

let requestHistory = [];

app.use(cors());
app.use(express.json({ limit: '50mb' }));

app.post('/track', async (req, res) => {
  try {
    const startTime = Date.now();
    const { method, url, headers = {}, body } = req.body;

    const response = await axios({
      method,
      url,
      headers,
      data: body,
      validateStatus: () => true,
      responseType: 'arraybuffer'
    });

    const contentType = response.headers['content-type'] || 'application/octet-stream';
    
    const entry = {
      id: Date.now(),
      method: method.toUpperCase(),
      url,
      response: {
        status: response.status,
        headers: response.headers,
        time: Date.now() - startTime,
        body: response.data.toString('base64'),
        type: contentType.split(';')[0],
        isText: /text|json|xml/.test(contentType)
      },
      request: { headers, body }
    };

    requestHistory.unshift(entry);
    res.json({ success: true, entry });

  } catch (error) {
    res.status(500).json({ 
      success: false,
      error: error.message
    });
  }
});

app.get('/history', (req, res) => {
  res.json(requestHistory);
});

app.post('/clear-history', (req, res) => {
  requestHistory = [];
  res.json({ success: true });
});

app.use(express.static('public'));
app.listen(3000, () => console.log('Servidor rodando na porta 3000'));