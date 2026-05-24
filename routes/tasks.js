const express = require('express');
const Task = require('../models/Task');
const auth = require('../middleware/auth');
const fallbackStore = require('../config/fallbackStore');

const router = express.Router();

router.use((req, res, next) => {
  if (req.app.locals.dbConnected) {
    return auth(req, res, next);
  }
  next();
});

router.get('/', async (req, res) => {
  try {
    if (!req.app.locals.dbConnected) {
      return res.json(fallbackStore.getAll());
    }

    const tasks = await Task.find({ user: req.user.id }).sort({ createdAt: -1 });
    res.json(tasks);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to load tasks.' });
  }
});

router.post('/', async (req, res) => {
  try {
    const { title, description, dueDate } = req.body;
    if (!title) {
      return res.status(400).json({ message: 'Title is required.' });
    }

    if (!req.app.locals.dbConnected) {
      const task = fallbackStore.createTask({ title, description, dueDate });
      return res.status(201).json(task);
    }

    const task = await Task.create({
      user: req.user.id,
      title,
      description: description || '',
      dueDate: dueDate ? new Date(dueDate) : null,
    });

    res.status(201).json(task);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to create task.' });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const { title, description, dueDate, completed } = req.body;

    if (!req.app.locals.dbConnected) {
      const task = fallbackStore.updateTask(req.params.id, { title, description, dueDate, completed });
      if (!task) {
        return res.status(404).json({ message: 'Task not found.' });
      }
      return res.json(task);
    }

    const task = await Task.findOne({ _id: req.params.id, user: req.user.id });
    if (!task) {
      return res.status(404).json({ message: 'Task not found.' });
    }

    task.title = title ?? task.title;
    task.description = description ?? task.description;
    task.dueDate = dueDate ? new Date(dueDate) : task.dueDate;
    task.completed = typeof completed === 'boolean' ? completed : task.completed;

    const updated = await task.save();
    res.json(updated);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to update task.' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    if (!req.app.locals.dbConnected) {
      const removed = fallbackStore.deleteTask(req.params.id);
      if (!removed) {
        return res.status(404).json({ message: 'Task not found.' });
      }
      return res.json({ message: 'Task removed.' });
    }

    const task = await Task.findOneAndDelete({ _id: req.params.id, user: req.user.id });
    if (!task) {
      return res.status(404).json({ message: 'Task not found.' });
    }
    res.json({ message: 'Task removed.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to delete task.' });
  }
});

module.exports = router;
