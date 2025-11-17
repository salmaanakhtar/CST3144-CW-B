const express = require('express');
const app = express();

const port = 3000;

app.use(express.json());

const lessons = [
  { id: 1, subject: "Mathematics", location: "New York", price: 25, spaces: 5 },
  { id: 2, subject: "Physics", location: "Los Angeles", price: 30, spaces: 8 },
  { id: 3, subject: "Chemistry", location: "Chicago", price: 28, spaces: 6 },
  { id: 4, subject: "Biology", location: "Houston", price: 27, spaces: 7 },
  { id: 5, subject: "English", location: "Philadelphia", price: 22, spaces: 10 },
  { id: 6, subject: "History", location: "Phoenix", price: 20, spaces: 12 },
  { id: 7, subject: "Computer Science", location: "San Antonio", price: 35, spaces: 4 },
  { id: 8, subject: "Art", location: "San Diego", price: 24, spaces: 9 },
  { id: 9, subject: "Music", location: "Dallas", price: 26, spaces: 6 },
  { id: 10, subject: "Psychology", location: "San Jose", price: 29, spaces: 5 },
];

const orders = [];
let nextOrderId = 1;

app.get('', (req, res) => {
  res.send(`Server is running on port ${port}`);
});

app.get('/lessons', (req, res) => {
  res.json(lessons);
});

app.put('/lessons/:id/spaces', (req, res) => {
  const id = Number(req.params.id);
  const { spaces } = req.body;

  if (!Number.isInteger(id) || id <= 0) {
    return res.status(400).json({ error: 'Invalid lesson id' });
  }

  if (typeof spaces !== 'number' || !Number.isInteger(spaces) || spaces < 0) {
    return res.status(400).json({ error: '`spaces` must be a non-negative integer' });
  }

  const lesson = lessons.find((l) => l.id === id);
  if (!lesson) {
    return res.status(404).json({ error: 'Lesson not found' });
  }

  lesson.spaces = spaces;
  res.json(lesson);
});

app.post('/orders', (req, res) => {
  const { checkoutForm, cart } = req.body;

  if (!checkoutForm || !Array.isArray(cart)) {
    return res.status(400).json({ error: 'Request body must include `checkoutForm` and `cart` array' });
  }

  const total = cart.reduce((sum, item) => {
    const price = typeof item.price === 'number' ? item.price : 0;
    const qty = typeof item.quantity === 'number' ? item.quantity : (typeof item.qty === 'number' ? item.qty : 1);
    return sum + price * qty;
  }, 0);

  const order = {
    id: nextOrderId++,
    checkoutForm,
    cart,
    total,
  };

  orders.push(order);
  res.status(201).json(order);
});

app.get('/orders', (req, res) => {
  res.json(orders);
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});