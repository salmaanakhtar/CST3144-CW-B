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

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});