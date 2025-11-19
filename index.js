const express = require('express');
const { MongoClient } = require('mongodb');
const dns = require('dns');
const app = express();

// Enable CORS so the frontend can call the API from a different origin.
try {
  const cors = require('cors');
  app.use(cors());
  console.log('CORS enabled via cors package');
} catch (e) {
  console.warn('`cors` package not installed — falling back to manual CORS headers');
  app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    if (req.method === 'OPTIONS') {
      res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
      return res.sendStatus(200);
    }
    next();
  });
}

if (process.env.MONGODB_DNS_SERVERS) {
  try {
    const servers = process.env.MONGODB_DNS_SERVERS.split(',').map(s => s.trim()).filter(Boolean);
    if (servers.length) {
      dns.setServers(servers);
      console.log('Using custom DNS servers for Node resolver:', servers);
    }
  } catch (err) {
    console.warn('Failed to set custom DNS servers:', err.message || err);
  }
}

const port = process.env.PORT || 3000;

app.use(express.json());

const mongoUri = process.env.MONGODB_URI || 'mongodb+srv://akhtarsalmaan0:akhtarsalmaan0@labs.tyokjdi.mongodb.net/?appName=LABS';

const client = new MongoClient(mongoUri);

let lessonsCol;
let ordersCol;

async function startServer() {
  try {
    await client.connect();
    const db = client.db('Coursework');
    lessonsCol = db.collection('Lessons');
    ordersCol = db.collection('Orders');

    console.log('Connected to MongoDB');

    app.get('/', (req, res) => res.send(`Server is running on port ${port}`));

    app.get('/lessons', async (req, res) => {
      try {
        const docs = await lessonsCol.find({}).toArray();
        res.json(docs);
      } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to fetch lessons' });
      }
    });

    app.put('/lessons/:id/spaces', async (req, res) => {
      const idParam = req.params.id;
      const { spaces } = req.body;

      if (typeof spaces !== 'number' || !Number.isInteger(spaces) || spaces < 0) {
        return res.status(400).json({ error: '`spaces` must be a non-negative integer' });
      }

      try {
        let filter;
        const numericId = Number(idParam);
        if (Number.isInteger(numericId) && numericId > 0) {
          filter = { id: numericId };
        } else if (/^[0-9a-fA-F]{24}$/.test(idParam)) {
          const { ObjectId } = require('mongodb');
          filter = { _id: new ObjectId(idParam) };
        } else {
          filter = { id: idParam };
        }

        await lessonsCol.updateOne(filter, { $set: { spaces } });
        const updated = await lessonsCol.findOne(filter);
        if (!updated) return res.status(404).json({ error: 'Lesson not found' });
        return res.json(updated);
      } catch (err) {
        console.error(err);
        return res.status(500).json({ error: 'Failed to update spaces' });
      }
    });

    app.post('/orders', async (req, res) => {
      const { checkoutForm, cart } = req.body;

      if (!checkoutForm || !Array.isArray(cart)) {
        return res.status(400).json({ error: 'Request body must include `checkoutForm` and `cart` array' });
      }

      const total = cart.reduce((sum, item) => {
        const price = typeof item.price === 'number' ? item.price : 0;
        const qty = typeof item.quantity === 'number' ? item.quantity : (typeof item.qty === 'number' ? item.qty : 1);
        return sum + price * qty;
      }, 0);

      const orderDoc = {
        checkoutForm,
        cart,
        total,
        createdAt: new Date(),
      };

      try {
        const r = await ordersCol.insertOne(orderDoc);
        const inserted = await ordersCol.findOne({ _id: r.insertedId });
        res.status(201).json(inserted);
      } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to save order' });
      }
    });

    app.get('/orders', async (req, res) => {
      try {
        const all = await ordersCol.find({}).toArray();
        res.json(all);
      } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to fetch orders' });
      }
    });

    app.listen(port, () => {
      console.log(`Server is running on port ${port}`);
    });
  } catch (err) {
    console.error('Failed to connect to MongoDB', err);
    process.exit(1);
  }
}

startServer();