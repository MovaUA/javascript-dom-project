import '../assets/css/style.css';

const app = document.getElementById('app');

app.innerHTML = `
  <div class="todos">
    <div class="todos-header">
      <h3 class="todos-title">Todo List</h3>
      <div>
        <p>You have <span class="todos-count">0</span> items</p>
        <button type="button" class="todos-clear" style="display: none;">
          Clear Completed
        </button>
      </div>
    </div>
    <form class="todos-form" name="todos">
      <input type="text" placeholder="What's next?" name="todo">
    </form>
    <ul class="todos-list"></ul>
  </div>
`;

let todos = getFromStorage();

const root = app.querySelector('.todos');
const count = root.querySelector('.todos-count');
const clear = root.querySelector('.todos-clear');
const list = root.querySelector('.todos-list');
const form = document.forms.todos;
const input = form.elements.todo;

function renderTodos(todos) {
  let todoString = '';
  todos.forEach((todo, index) => {
    todoString += `
      <li data-id="${index}"${todo.complete ? ' class="todos-complete"' : ''}>
        <input type="checkbox"${todo.complete ? ' checked' : ''}>
        <span>${todo.label}</span>
        <button></button>
      </li>
    `;
  });
  list.innerHTML = todoString;
  count.innerText = todos.filter((todo) => !todo.complete).length;
  clear.style.display = todos.filter((todo) => todo.complete).length
    ? 'block'
    : 'none';
}

function addTodo(event) {
  event.preventDefault();
  const label = input.value.trim();
  if (!label) {
    return;
  }
  const complete = false;
  todos = [...todos, { label, complete }];
  renderTodos(todos);
  saveToStorage(todos);
  input.value = '';
}

function updateTodo(event) {
  const id = parseInt(event.target.parentNode.getAttribute('data-id'), 10);
  const complete = event.target.checked;
  todos = todos.map((todo, index) =>
    index === id ? { ...todo, complete } : todo
  );
  renderTodos(todos);
  saveToStorage(todos);
}

function editTodo(event) {
  if (event.target.nodeName.toLowerCase() !== 'span') {
    return;
  }

  const span = event.target;
  const id = parseInt(span.parentNode.getAttribute('data-id'), 10);
  const todoLabel = todos[id].label;

  const input = document.createElement('input');
  input.type = 'text';
  input.value = todoLabel;

  function handleEdit(event) {
    event.stopPropagation();
    const label = this.value.trim();
    if (label && label !== todoLabel) {
      todos = todos.map((todo, index) =>
        index === id ? { ...todo, label } : todo
      );
      renderTodos(todos);
      saveToStorage(todos);
    }
    span.style.display = '';
    this.removeEventListener('blur', handleEdit);
    this.remove();
  }

  span.style.display = 'none';
  span.parentNode.append(input);
  input.addEventListener('blur', handleEdit);
  input.focus();
}

function deleteTodo(event) {
  if (event.target.nodeName.toLowerCase() !== 'button') {
    return;
  }
  const id = parseInt(event.target.parentNode.getAttribute('data-id'), 10);
  // const label = event.target.previousElementSibling.innerText;
  const label = todos[id].label;
  if (!window.confirm(`Delete "${label}"?`)) {
    return;
  }
  todos = todos.filter((_todo, index) => index !== id);
  renderTodos(todos);
  saveToStorage(todos);
}

function clearTodos() {
  const count = todos.filter((todo) => todo.complete).length;
  if (count === 0) {
    return;
  }
  if (!window.confirm(`Clear ${count} todos?`)) {
    return;
  }
  todos = todos.filter((todo) => !todo.complete);
  renderTodos(todos);
  saveToStorage(todos);
}

function getFromStorage() {
  const todosJson = localStorage.getItem('todos');
  if (todosJson === null) {
    return [];
  }
  try {
    const todosObject = JSON.parse(todosJson);
    if (!Array.isArray(todosObject)) {
      throw {
        error: 'todos is not an array',
        todosJson,
        todosObject,
        type: typeof todosObject,
      };
    }
    return todosObject;
  } catch (error) {
    console.error('can not parse todos from localStorage', {
      error,
      todosJson,
    });
    return [];
  }
}

function saveToStorage(todos) {
  localStorage.setItem('todos', JSON.stringify(todos));
}

function init() {
  renderTodos(todos);
  form.addEventListener('submit', addTodo);
  list.addEventListener('change', updateTodo);
  list.addEventListener('dblclick', editTodo);
  list.addEventListener('click', deleteTodo);
  clear.addEventListener('click', clearTodos);
}

init();
