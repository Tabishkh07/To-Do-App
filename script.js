/* =====================
   SELECT ELEMENTS
===================== */
const addBtn = document.querySelector(".fab");
const modal = document.querySelector(".modal");
const closeBtn = document.querySelector(".close");
const cancelBtn = document.querySelector(".cancel");
const overlay = document.querySelector(".modal-overlay");

const form = document.querySelector(".task-form");
const tasksList = document.querySelector(".tasks-list");
const template = document.querySelector("#task-template");

const searchInput = document.querySelector(".search");
const categoryFilter = document.querySelector(".filter.category");
const statusFilter = document.querySelector(".filter.status");
const sortFilter = document.querySelector(".filter.sort");

/* Dashboard */
const totalEl = document.querySelectorAll(".stat-number")[0];
const pendingEl = document.querySelectorAll(".stat-number")[1];
const completedEl = document.querySelectorAll(".stat-number")[2];
const productivityEl = document.querySelectorAll(".stat-number")[3];
const progressFill = document.querySelector(".progress-fill");
const progressText = document.querySelector(".progress-text span:last-child");

const focusContainer = document.querySelector(".focus-tasks");
const themeToggle = document.querySelector(".theme-toggle");
const themeIcon = themeToggle.querySelector("i");

function setTheme(theme) {
  if (theme === "dark") {
    document.body.classList.add("dark");
    themeIcon.className = "fa-regular fa-sun";
  } else {
    document.body.classList.remove("dark");
    themeIcon.className = "fa-regular fa-moon";
  }
  localStorage.setItem("theme", theme);
}
themeToggle.addEventListener("click", () => {
  const isDark = document.body.classList.contains("dark");
  setTheme(isDark ? "light" : "dark");
});
const savedTheme = localStorage.getItem("theme") || "light";
setTheme(savedTheme);


/* =====================
   STATE
===================== */
let tasks = JSON.parse(localStorage.getItem("tasks")) || [];
let editId = null;

/* =====================
   MODAL CONTROLS
===================== */
addBtn.addEventListener("click", () => {
  editId = null;
  form.reset();
  modal.style.display = "flex";
});

closeBtn.addEventListener("click", closeModal);
cancelBtn.addEventListener("click", closeModal);
overlay.addEventListener("click", closeModal);

function closeModal() {
  modal.style.display = "none";
}

/* =====================
   SAVE
===================== */
function saveTasks() {
  localStorage.setItem("tasks", JSON.stringify(tasks));
}

/* =====================
   FORM SUBMIT
===================== */
form.addEventListener("submit", (e) => {
  e.preventDefault();

  const title = form.title.value.trim();
  if (!title) return;

  const data = {
    title,
    description: form.description.value.trim(),
    category: form.category.value,
    priority: form.priority.value,
    dueDate: form.dueDate.value,
  };

  if (editId) {
    const task = tasks.find(t => t.id === editId);
    Object.assign(task, data);
    editId = null;
  } else {
    tasks.unshift({
      id: Date.now(),
      completed: false,
      createdAt: Date.now(),
      ...data
    });
  }

  saveTasks();
  render();
  closeModal();
});

/* =====================
   CORE RENDER
===================== */
function render() {
  let filtered = [...tasks];

  /* SEARCH */
  const search = searchInput.value.toLowerCase();
  if (search) {
    filtered = filtered.filter(t =>
      t.title.toLowerCase().includes(search) ||
      t.description.toLowerCase().includes(search)
    );
  }

  /* CATEGORY FILTER */
  if (categoryFilter.value !== "All Categories") {
    filtered = filtered.filter(t => t.category === categoryFilter.value);
  }

  /* STATUS FILTER */
  if (statusFilter.value === "Pending") {
    filtered = filtered.filter(t => !t.completed);
  }
  if (statusFilter.value === "Completed") {
    filtered = filtered.filter(t => t.completed);
  }

  /* SORT */
  if (sortFilter.value === "Sort by Date") {
    filtered.sort((a, b) => new Date(a.dueDate || 0) - new Date(b.dueDate || 0));
  }
  if (sortFilter.value === "Sort by Priority") {
    const order = { High: 1, Medium: 2, Low: 3 };
    filtered.sort((a, b) => order[a.priority] - order[b.priority]);
  }

  renderTasks(filtered);
  updateDashboard();
  updateFocus();
}

/* =====================
   TASK LIST
===================== */
function renderTasks(list) {
  tasksList.innerHTML = "";

  if (list.length === 0) {
    tasksList.innerHTML = `<p class="empty-text">No tasks found.</p>`;
    return;
  }

  list.forEach(task => {
    const node = template.content.cloneNode(true);
    const card = node.querySelector(".task-card");
    const checkbox = node.querySelector(".task-checkbox");

    if (task.completed) {
      card.classList.add("completed");
      checkbox.classList.add("checked");
    }

    node.querySelector(".task-title").textContent = task.title;
    node.querySelector(".task-description").textContent = task.description;
    node.querySelector(".task-category").textContent = task.category;

    const priorityEl = node.querySelector(".task-priority");
    priorityEl.textContent = task.priority;
    priorityEl.classList.add(task.priority.toLowerCase());

    node.querySelector(".task-date").textContent = task.dueDate || "";

    checkbox.addEventListener("click", () => {
      task.completed = !task.completed;
      saveTasks();
      render();
    });

    node.querySelector(".delete-btn").addEventListener("click", () => {
      tasks = tasks.filter(t => t.id !== task.id);
      saveTasks();
      render();
    });

    node.querySelector(".edit-btn").addEventListener("click", () => {
      editId = task.id;
      form.title.value = task.title;
      form.description.value = task.description;
      form.category.value = task.category;
      form.priority.value = task.priority;
      form.dueDate.value = task.dueDate;
      modal.style.display = "flex";
    });

    tasksList.appendChild(node);
  });
}

/* =====================
   DASHBOARD
===================== */
function updateDashboard() {
  const total = tasks.length;
  const completed = tasks.filter(t => t.completed).length;
  const pending = total - completed;
  const percent = total ? Math.round((completed / total) * 100) : 0;

  totalEl.textContent = total;
  completedEl.textContent = completed;
  pendingEl.textContent = pending;
  productivityEl.textContent = `${percent}%`;

  progressFill.style.width = `${percent}%`;
  progressText.textContent = `${completed} / ${total} tasks completed`;
}

/* =====================
   TODAY'S FOCUS
===================== */
function updateFocus() {
  focusContainer.innerHTML = "";

  const focusTasks = tasks
    .filter(t => !t.completed)
    .sort((a, b) => {
      const p = { High: 1, Medium: 2, Low: 3 };
      return p[a.priority] - p[b.priority];
    })
    .slice(0, 3);

  focusTasks.forEach(task => {
    const div = document.createElement("div");
    div.className = "focus-task";
    div.innerHTML = `
      <h3 class="task-title">${task.title}</h3>
      <span class="priority ${task.priority.toLowerCase()}">${task.priority}</span>
      <p class="description">${task.description}</p>
      <span class="category">${task.category}</span>
    `;
    focusContainer.appendChild(div);
  });
}

/* =====================
   EVENTS
===================== */
searchInput.addEventListener("input", render);
categoryFilter.addEventListener("change", render);
statusFilter.addEventListener("change", render);
sortFilter.addEventListener("change", render);

/* =====================
   INIT
===================== */
render();
