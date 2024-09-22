const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

console.log('Connecting to MongoDB...');
mongoose.connect(process.env.MONGODB_URI, {
  serverSelectionTimeoutMS: 5000,
})
.then(() => console.log('MongoDB connected'))
.catch(err => console.error('MongoDB connection error:', err));

const Todo = mongoose.model('Todo', {
  text: String,
  date: String,
  label: String,
  pinned: Boolean,
});

app.get('/', (req, res) => {
  res.send('This is a todo app');
});

app.get('/todos', async (req, res) => {
  console.log('GET /todos request received');
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;
  const skip = (page - 1) * limit;

  try {
    const todos = await Todo.find().skip(skip).limit(limit);
    console.log(`Found ${todos.length} todos`);
    res.json(todos);
  } catch (error) {
    console.error('Error fetching todos:', error);
    res.status(500).json({ message: error.message });
  }
});

app.post('/todos', async (req, res) => {
  console.log('POST /todos request received', req.body);
  try {
    const todo = new Todo(req.body);
    await todo.save();
    console.log('Todo saved:', todo);
    res.status(201).json(todo);
  } catch (error) {
    console.error('Error creating todo:', error);
    res.status(400).json({ message: error.message });
  }
});

app.put('/todos/:id', async (req, res) => {
  try {
    const updatedTodo = await Todo.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updatedTodo);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

app.delete('/todos/:id', async (req, res) => {
  try {
    await Todo.findByIdAndDelete(req.params.id);
    res.json({ message: 'Todo deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

app.post('/todos/bulk', async (req, res) => {
  console.log('POST /todos/bulk request received');
  try {
    const todos = req.body;
    const result = await Todo.insertMany(todos);
    console.log(`${result.length} todos saved`);
    res.status(201).json(result);
  } catch (error) {
    console.error('Error creating todos:', error);
    res.status(400).json({ message: error.message });
  }
});

module.exports = app;