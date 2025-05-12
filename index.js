require('dotenv').config();
const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();
const PORT = 9876;

app.use(cors()); // Enable CORS

const WINDOW_SIZE = 10;
let windowStore = [];

const URLS = {
  p: 'http://20.244.56.144/evaluation-service/primes',
  f: 'http://20.244.56.144/evaluation-service/fibo',
  e: 'http://20.244.56.144/evaluation-service/even',
  r: 'http://20.244.56.144/evaluation-service/rand'
};

const BEARER_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJNYXBDbGFpbXMiOnsiZXhwIjoxNzQ3MDMxNzczLCJpYXQiOjE3NDcwMzE0NzMsImlzcyI6IkFmZm9yZG1lZCIsImp0aSI6IjA5MzBmOTUyLWViZDQtNDQyMy05NmYxLTc2NjRmOWVhNjJjNiIsInN1YiI6InZhcnVubS4yMml0QGtvbmd1LmVkdSJ9LCJlbWFpbCI6InZhcnVubS4yMml0QGtvbmd1LmVkdSIsIm5hbWUiOiJ2YXJ1biBtIiwicm9sbE5vIjoiMjJpdHIxMTIiLCJhY2Nlc3NDb2RlIjoiam1wWmFGIiwiY2xpZW50SUQiOiIwOTMwZjk1Mi1lYmQ0LTQ0MjMtOTZmMS03NjY0ZjllYTYyYzYiLCJjbGllbnRTZWNyZXQiOiJGR0ZWZkhUSE5BV1JXeXBZIn0.MzKHwpOKwcRdcYeg5IW0seyrwqexLwJHk3DGgb-OMI0';


function calculateAverage(arr) {
  if (arr.length === 0) return 0;
  const sum = arr.reduce((a, b) => a + b, 0);
  return parseFloat((sum / arr.length).toFixed(2));
}

app.get('/numbers/:type', async (req, res) => {
  const type = req.params.type;

  if (!['p', 'f', 'e', 'r'].includes(type)) {
    return res.status(400).json({ error: 'Invalid number type.' });
  }

  const thirdPartyUrl = URLS[type];
  const prevState = [...windowStore];

  try {
    const response = await axios.get(thirdPartyUrl, {
      timeout: 1000,
      headers: {
        'Authorization': `Bearer ${BEARER_TOKEN}`
      }
    });

    const newNumbers = response.data?.numbers || [];
    const uniqueNew = newNumbers.filter(n => !windowStore.includes(n));

    windowStore.push(...uniqueNew);
    if (windowStore.length > WINDOW_SIZE) {
      windowStore = windowStore.slice(-WINDOW_SIZE);
    }

    return res.json({
      windowPrevState: prevState,
      windowCurrState: windowStore,
      numbers: newNumbers,
      avg: calculateAverage(windowStore)
    });
  } catch (err) {
    console.error('Error fetching from third-party API:', err.message);
    return res.status(500).json({
      error: 'Failed to fetch from external API',
      windowPrevState: prevState,
      windowCurrState: prevState,
      numbers: [],
      avg: calculateAverage(prevState)
    });
  }
});

app.listen(PORT, () => {
  console.log(`✅ Server is running on http://localhost:${PORT}`);
});
