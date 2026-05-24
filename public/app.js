const authSection = document.getElementById('auth-section');
const appSection = document.getElementById('app-section');
const showLoginButton = document.getElementById('show-login');
const showSignupButton = document.getElementById('show-signup');
const loginForm = document.getElementById('login-form');
const signupForm = document.getElementById('signup-form');
const loginMessage = document.getElementById('login-message');
const signupMessage = document.getElementById('signup-message');
const offlineBanner = document.getElementById('offline-banner');
const guestModeButton = document.getElementById('guest-mode-button');
const welcomeTitle = document.getElementById('welcome-title');
const logoutButton = document.getElementById('logout-button');
const taskForm = document.getElementById('task-form');
const taskMessage = document.getElementById('task-message');
const cancelEditButton = document.getElementById('cancel-edit');
const pendingList = document.getElementById('pending-tasks');
const completedList = document.getElementById('completed-tasks');

let editTaskId = null;
let user = null;

const state = {
  token: localStorage.getItem('taskflow_token'),
  dbConnected: true,
  offlineMode: false,
};

const api = async (path, method = 'GET', body) => {
  const headers = { 'Content-Type': 'application/json' };
  if (state.token) headers.Authorization = `Bearer ${state.token}`;

  const response = await fetch(path, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.message || 'Request failed');
  return data;
};

const showMessage = (element, text, isError = true) => {
  element.textContent = text;
  element.style.color = isError ? 'var(--danger)' : 'var(--success)';
};

const toggleForms = (showLogin) => {
  showLoginButton.classList.toggle('active', showLogin);
  showSignupButton.classList.toggle('active', !showLogin);
  loginForm.classList.toggle('hidden', !showLogin);
  signupForm.classList.toggle('hidden', showLogin);
  loginMessage.textContent = '';
  signupMessage.textContent = '';
};

const showOfflineNotice = () => {
  offlineBanner.classList.remove('hidden');
  showLoginButton.disabled = true;
  showSignupButton.disabled = true;
  loginForm.classList.add('hidden');
  signupForm.classList.add('hidden');
};

const hideOfflineNotice = () => {
  offlineBanner.classList.add('hidden');
  showLoginButton.disabled = false;
  showSignupButton.disabled = false;
};

const setAuthState = (session) => {
  user = session.user;
  state.token = session.token;
  localStorage.setItem('taskflow_token', session.token);
  welcomeTitle.textContent = `Hello, ${user.name}`;
  authSection.classList.add('hidden');
  appSection.classList.remove('hidden');
  loadTasks();
};

const setGuestState = () => {
  state.offlineMode = true;
  user = { name: 'Guest' };
  welcomeTitle.textContent = 'Hello, Guest';
  offlineBanner.classList.add('hidden');
  authSection.classList.add('hidden');
  appSection.classList.remove('hidden');
  loadTasks();
};

const resetTaskForm = () => {
  taskForm.reset();
  editTaskId = null;
  cancelEditButton.classList.add('hidden');
  taskMessage.textContent = '';
};

const logout = () => {
  localStorage.removeItem('taskflow_token');
  state.token = null;
  state.offlineMode = false;
  user = null;
  authSection.classList.remove('hidden');
  appSection.classList.add('hidden');
  toggleForms(true);
};

const renderTask = (task) => {
  const card = document.createElement('article');
  card.className = 'task-card';

  const title = document.createElement('h4');
  title.textContent = task.title;
  card.appendChild(title);

  if (task.description) {
    const description = document.createElement('p');
    description.textContent = task.description;
    card.appendChild(description);
  }

  const meta = document.createElement('div');
  meta.className = 'task-meta';
  const status = document.createElement('span');
  status.textContent = task.completed ? 'Completed' : 'Pending';
  meta.appendChild(status);

  if (task.dueDate) {
    const dueDate = document.createElement('span');
    dueDate.textContent = `Due ${new Date(task.dueDate).toLocaleDateString()}`;
    meta.appendChild(dueDate);
  }
  card.appendChild(meta);

  const actions = document.createElement('div');
  actions.className = 'task-actions';

  const toggleButton = document.createElement('button');
  toggleButton.className = `btn-small ${task.completed ? 'btn-muted' : 'btn-success'}`;
  toggleButton.textContent = task.completed ? 'Mark Pending' : 'Mark Done';
  toggleButton.addEventListener('click', async () => {
    try {
      await api(`/api/tasks/${task._id}`, 'PUT', { completed: !task.completed });
      loadTasks();
    } catch (error) {
      showMessage(taskMessage, error.message);
    }
  });
  actions.appendChild(toggleButton);

  const editButton = document.createElement('button');
  editButton.className = 'btn-small btn-secondary';
  editButton.textContent = 'Edit';
  editButton.addEventListener('click', () => {
    document.getElementById('task-title').value = task.title;
    document.getElementById('task-description').value = task.description || '';
    document.getElementById('task-due').value = task.dueDate ? new Date(task.dueDate).toISOString().substring(0, 10) : '';
    editTaskId = task._id;
    cancelEditButton.classList.remove('hidden');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
  actions.appendChild(editButton);

  const deleteButton = document.createElement('button');
  deleteButton.className = 'btn-small btn-danger';
  deleteButton.textContent = 'Delete';
  deleteButton.addEventListener('click', async () => {
    if (!confirm('Delete this task?')) return;
    try {
      await api(`/api/tasks/${task._id}`, 'DELETE');
      loadTasks();
    } catch (error) {
      showMessage(taskMessage, error.message);
    }
  });
  actions.appendChild(deleteButton);

  card.appendChild(actions);
  return card;
};

const loadTasks = async () => {
  pendingList.innerHTML = '';
  completedList.innerHTML = '';
  try {
    const tasks = await api('/api/tasks');
    if (tasks.length === 0) {
      pendingList.innerHTML = '<p class="message" style="color: var(--muted)">No tasks yet — create one to get started.</p>';
      completedList.innerHTML = '<p class="message" style="color: var(--muted)">Completed tasks appear here.</p>';
      return;
    }

    const pending = tasks.filter((task) => !task.completed);
    const completed = tasks.filter((task) => task.completed);

    if (pending.length === 0) {
      pendingList.innerHTML = '<p class="message" style="color: var(--muted)">No pending tasks.</p>';
    } else {
      pending.forEach((task) => pendingList.appendChild(renderTask(task)));
    }

    if (completed.length === 0) {
      completedList.innerHTML = '<p class="message" style="color: var(--muted)">No completed tasks yet.</p>';
    } else {
      completed.forEach((task) => completedList.appendChild(renderTask(task)));
    }
  } catch (error) {
    showMessage(taskMessage, error.message);
  }
};

showLoginButton.addEventListener('click', () => {
  if (!state.dbConnected) return;
  toggleForms(true);
});
showSignupButton.addEventListener('click', () => {
  if (!state.dbConnected) return;
  toggleForms(false);
});
logoutButton.addEventListener('click', logout);
guestModeButton.addEventListener('click', setGuestState);

loginForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  loginMessage.textContent = '';
  if (!state.dbConnected) {
    showMessage(loginMessage, 'Login is disabled while the database is offline.');
    return;
  }

  try {
    const email = document.getElementById('login-email').value.trim();
    const password = document.getElementById('login-password').value;
    const session = await api('/api/auth/login', 'POST', { email, password });
    setAuthState(session);
  } catch (error) {
    showMessage(loginMessage, error.message);
  }
});

signupForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  signupMessage.textContent = '';
  if (!state.dbConnected) {
    showMessage(signupMessage, 'Signup is disabled while the database is offline.');
    return;
  }

  try {
    const name = document.getElementById('signup-name').value.trim();
    const email = document.getElementById('signup-email').value.trim();
    const password = document.getElementById('signup-password').value;
    const session = await api('/api/auth/signup', 'POST', { name, email, password });
    setAuthState(session);
  } catch (error) {
    showMessage(signupMessage, error.message);
  }
});

cancelEditButton.addEventListener('click', () => {
  resetTaskForm();
});

taskForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  taskMessage.textContent = '';

  const title = document.getElementById('task-title').value.trim();
  const description = document.getElementById('task-description').value.trim();
  const dueDate = document.getElementById('task-due').value;

  if (!title) {
    showMessage(taskMessage, 'Task title is required.');
    return;
  }

  try {
    if (editTaskId) {
      await api(`/api/tasks/${editTaskId}`, 'PUT', { title, description, dueDate });
      resetTaskForm();
    } else {
      await api('/api/tasks', 'POST', { title, description, dueDate });
      taskForm.reset();
    }
    loadTasks();
    showMessage(taskMessage, 'Task saved.', false);
  } catch (error) {
    showMessage(taskMessage, error.message);
  }
});

const init = async () => {
  try {
    const response = await fetch('/api/status');
    const status = await response.json();
    state.dbConnected = status.dbConnected;
  } catch (error) {
    state.dbConnected = false;
  }

  if (!state.dbConnected) {
    showOfflineNotice();
    authSection.classList.remove('hidden');
    appSection.classList.add('hidden');
    return;
  }

  hideOfflineNotice();
  if (state.token) {
    appSection.classList.remove('hidden');
    authSection.classList.add('hidden');
    loadTasks().catch(() => {
      logout();
    });
  } else {
    authSection.classList.remove('hidden');
    appSection.classList.add('hidden');
    toggleForms(true);
  }
};

init();
