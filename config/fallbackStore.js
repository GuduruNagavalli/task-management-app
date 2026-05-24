const tasks = [];
let nextId = 1;

const createTask = ({ title, description, dueDate }) => {
  const task = {
    _id: String(nextId++),
    title,
    description: description || '',
    dueDate: dueDate ? new Date(dueDate).toISOString() : null,
    completed: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  tasks.unshift(task);
  return task;
};

const getAll = () => tasks.slice();

const updateTask = (id, fields) => {
  const task = tasks.find((item) => item._id === id);
  if (!task) return null;
  if (fields.title !== undefined) task.title = fields.title;
  if (fields.description !== undefined) task.description = fields.description;
  if (fields.dueDate !== undefined) task.dueDate = fields.dueDate ? new Date(fields.dueDate).toISOString() : task.dueDate;
  if (typeof fields.completed === 'boolean') task.completed = fields.completed;
  task.updatedAt = new Date().toISOString();
  return task;
};

const deleteTask = (id) => {
  const index = tasks.findIndex((item) => item._id === id);
  if (index === -1) return false;
  tasks.splice(index, 1);
  return true;
};

module.exports = {
  createTask,
  getAll,
  updateTask,
  deleteTask,
};
