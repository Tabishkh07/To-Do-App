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
    dueDate: form.dueDate.value
  };

  if (editId) {
    const task = tasks.find(t => t.id === editId);
    Object.assign(task, data);
    editId = null;
  } else {
    tasks.unshift({
      id: Date.now(),
      completed: false,
      ...data
    });
  }

  saveTasks();
  renderTasks();
  closeModal();
});

/* =====================
   RENDER TASKS
===================== */
function renderTasks() {
  tasksList.innerHTML = "";

  if (tasks.length === 0) {
    tasksList.innerHTML = `
      <p class="empty-text">
        No tasks yet. Click <strong>+</strong> to add one.
      </p>
    `;
    return;
  }

  tasks.forEach(task => {
    const node = template.content.cloneNode(true);
    const card = node.querySelector(".task-card");
    const checkbox = node.querySelector(".task-checkbox");

    /* COMPLETED STATE */
    if (task.completed) {
      card.classList.add("completed");
      checkbox.classList.add("checked");
    }

    /* CONTENT */
    node.querySelector(".task-title").textContent = task.title;
    node.querySelector(".task-description").textContent = task.description;
    node.querySelector(".task-category").textContent = task.category;

    const priorityEl = node.querySelector(".task-priority");
    priorityEl.textContent = task.priority;
    priorityEl.classList.add(
      "priority",
      task.priority.toLowerCase()
    );

    node.querySelector(".task-date").textContent =
      task.dueDate || "";

    /* CHECKBOX */
    checkbox.addEventListener("click", () => {
      task.completed = !task.completed;
      saveTasks();
      renderTasks();
    });

    /* DELETE */
    node.querySelector(".delete-btn").addEventListener("click", () => {
      tasks = tasks.filter(t => t.id !== task.id);
      saveTasks();
      renderTasks();
    });

    /* EDIT */
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
   INIT
===================== */
renderTasks();
