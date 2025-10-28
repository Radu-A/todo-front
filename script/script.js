// ==========================
// 1. CONFIGURATION AND INITIALIZATION
// ==========================

// --- DOM ELEMENTS ---
const logoutButton = document.getElementById("logout-button");
const todoSection = document.getElementById("todo-section");
const doneSection = document.getElementById("done-section");
const currentDate = document.getElementById("current-day");
const newInput = document.getElementById("new-input");
const newButton = document.getElementById("new-button");
const filterButtons = [...document.getElementsByClassName("filter-button")];

// --- STATE AND API ---
// Almacena las tareas cargadas de la API.
let taskList = [];
// URL del backend (puertos separados requieren la URL absoluta).
const API_URL = "https://todo-server-mb4v.onrender.com/api/tasks";

// ==========================
// 2. COMMON UTILITIES
// ==========================

/** Formatea e imprime la fecha actual en el encabezado. */
const printCurrentDate = () => {
  const today = new Date();
  const formatedDate = today.toLocaleDateString("en-EN", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });
  currentDate.textContent = formatedDate;
};

/** Restaura las secciones ToDo y Done a su estado inicial. */
const clearTasks = () => {
  todoSection.innerHTML = `
    <div class="section-header"><h2>ToDo</h2><span class="counter" id="todo-counter"></span></div>`;
  doneSection.innerHTML = `
    <div class="section-header"><h2>Done</h2><span class="counter" id="done-counter"></span></div>`;
};

/** Filtra la lista local de tareas por status ('all', 'todo', 'done'). */
const filterTasks = (filterStatus = "all") => {
  return filterStatus === "all"
    ? taskList
    : taskList.filter((task) => task.status == filterStatus);
};

/** Actualiza el contador de tareas pendientes y completadas. */
const printCounters = () => {
  const todoCounter = document.getElementById("todo-counter");
  const doneCounter = document.getElementById("done-counter");
  todoCounter.textContent = taskList.filter(
    (task) => task.status == "todo"
  ).length;
  doneCounter.textContent = taskList.filter(
    (task) => task.status == "done"
  ).length;
};

/** Resalta el botón de filtro activo. */
const activateFilterButton = (clickedButton) => {
  filterButtons.forEach((button) => {
    button.classList.toggle("filter-active", button === clickedButton);
  });
};

const getToken = () => {
  const token = localStorage.getItem("userToken");

  if (!token) {
    console.error("No hay token de sesión. Redirigiendo a login");
    const baseUrl = `${window.location.origin}`;
    window.location.href = `${baseUrl}/pages/login.html`;
  }
  return token;
};

const handleLogout = () => {
  console.log("Loggin out user...");
  localStorage.removeItem("userToken");
  // localStorage.removeItem('userName');
  const baseUrl = `${window.location.origin}`;
  window.location.href = `${baseUrl}/pages/login.html`;
};

// ==========================
// 3. TASK RENDERING AND LIFECYCLE
// ==========================

/**
 * Crea y añade un elemento de tarea al DOM.
 * @param {string} _id ID de MongoDB usado como ID del DOM.
 * @param {string} taskName El título de la tarea.
 * @param {string} status El estado ('todo' o 'done').
 */
const printTask = (_id, taskName, status) => {
  let taskArticle = document.createElement("article");
  taskArticle.className = "todo-article";
  taskArticle.id = _id;
  taskArticle.innerHTML = `
    <div class="task-header" id="${_id}-task-header">
      <div class="status-icon ${status}" id="${_id}-icon"></div>
      <h3 class="task-name" id="${_id}-task-name">${taskName}</h3>
    </div>
    <button class="delete-button" id="${_id}-delete-button"></button>`;

  // Determina la sección de destino
  const section = status === "todo" ? todoSection : doneSection;
  section.appendChild(taskArticle);

  // Activa la animación CSS
  requestAnimationFrame(() => {
    taskArticle.classList.add("article-show");
  });

  // Asigna eventos
  activateDeleteButton(_id, status);
  asingStatus(taskArticle, _id);
  asignEditEvent(_id);
};

// ==========================
// 4. CRUD OPERATIONS (API CALLS)
// ==========================

/** Carga todas las tareas desde la API (GET). */
const getTasks = async (filterStatus = "all") => {
  const token = getToken();
  clearTasks();
  try {
    const response = await fetch(API_URL, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });
    if (!response.ok) throw new Error(`HTTP error: ${response.status}`);

    taskList = await response.json();
    let filteredTaskList = filterTasks(filterStatus);

    filteredTaskList.forEach((task) =>
      printTask(task._id, task.title, task.status)
    );
    printCounters();
  } catch (error) {
    console.error("Fallo en getTasks:", error);
  }
};

/** Crea una nueva tarea en la API (POST). */
const createTask = async (taskName) => {
  const token = getToken();
  const taskData = { title: taskName };

  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(taskData),
    });

    if (!response.ok) throw new Error("Fallo en la creación de la tarea.");

    const newTask = await response.json();
    taskList.push(newTask);
    printTask(newTask._id, newTask.title, newTask.status);
    printCounters();
  } catch (error) {
    console.error("Fallo en createTask:", error);
  }
};

/** Elimina una tarea de la API y el DOM (DELETE). */
const deleteTask = async (_id, status) => {
  const token = getToken();
  try {
    const response = await fetch(`${API_URL}/${_id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) throw new Error("Fallo al eliminar la tarea.");

    // Actualiza la lista local y el DOM
    taskList = taskList.filter((task) => task._id !== _id);
    deleteFromDocument(_id, status);
  } catch (error) {
    console.error("Fallo en deleteTask:", error);
  }
};

/**
 * Actualiza el título o el status de la tarea en la API (PATCH).
 * @param {string} _id ID de la tarea a actualizar.
 * @param {object} updateData Objeto con los campos a modificar ({title} o {status}).
 * @returns {boolean} True si la actualización fue exitosa.
 */
const updateTaskInApi = async (_id, updateData) => {
  const token = getToken();
  try {
    const response = await fetch(`${API_URL}/${_id}`, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(updateData),
    });

    if (!response.ok)
      throw new Error(
        `Fallo al actualizar en el servidor: ${response.statusText}`
      );
    return true;
  } catch (error) {
    console.error("Error en updateTaskInApi:", error);
    return false;
  }
};

// ==========================
// 5. EVENT HANDLERS AND DOM LOGIC
// ==========================

/** Maneja el cambio de status (todo <-> done) y la animación de movimiento. */
const asingStatus = (taskArticle, _id) => {
  const statusIcon = document.getElementById(`${_id}-icon`);

  statusIcon.addEventListener("click", async (event) => {
    event.preventDefault();

    const oldStatus = statusIcon.classList.contains("todo") ? "todo" : "done";
    const newStatus = oldStatus === "todo" ? "done" : "todo";
    const updateSuccessful = await updateTaskInApi(_id, { status: newStatus });

    if (updateSuccessful) {
      // 1. Actualiza la lista local
      const taskIndex = taskList.findIndex((task) => task._id === _id);
      if (taskIndex !== -1) taskList[taskIndex].status = newStatus;

      // 2. Realiza la animación y el movimiento del DOM
      taskArticle.classList.remove("article-show");
      statusIcon.classList.replace(oldStatus, newStatus);

      const oldSection = oldStatus === "todo" ? todoSection : doneSection;
      const newSection = newStatus === "todo" ? todoSection : doneSection;

      oldSection.removeChild(taskArticle);
      newSection.appendChild(taskArticle);

      requestAnimationFrame(() => {
        taskArticle.classList.add("article-show");
      });

      printCounters();
    }
  });
};

/** Asigna el evento de click al botón de eliminar. */
const activateDeleteButton = (_id, status) => {
  const deleteButton = document.getElementById(`${_id}-delete-button`);
  if (deleteButton) {
    deleteButton.classList.add("active");
    deleteButton.addEventListener(
      "click",
      (event) => {
        event.preventDefault();
        deleteTask(_id, status);
      },
      { once: true }
    ); // Usamos once: true para asegurar que el listener se elimina tras el click
  }
};

/** Maneja la animación de eliminación y remueve el elemento del DOM. */
const deleteFromDocument = (_id, status) => {
  const taskArticle = document.getElementById(`${_id}`);
  taskArticle.classList.remove("article-show");
  taskArticle.classList.add("article-unshow");

  taskArticle.addEventListener(
    "animationend",
    () => {
      const section = status === "todo" ? todoSection : doneSection;
      if (section.contains(taskArticle)) {
        // Verificación extra antes de remover
        section.removeChild(taskArticle);
      }
      printCounters();
    },
    { once: true }
  );
};

// --- Edit Title Logic ---

/** Asigna el evento click (para iniciar edición) al H3. */
const asignEditEvent = (_id) => {
  const taskNameH3 = document.getElementById(`${_id}-task-name`);

  // Usamos { once: true } para que el listener se auto-destruya después del click
  // Esto es clave para evitar conflictos cuando el H3 se reinserta en el DOM.
  taskNameH3.addEventListener(
    "click",
    (event) => {
      event.preventDefault();
      createEditInput(taskNameH3, _id);
    },
    { once: true }
  );
};

/** Reemplaza el H3 con el input de edición. */
const createEditInput = (taskNameH3, _id) => {
  const taskHeader = document.getElementById(`${_id}-task-header`);
  const editInput = document.createElement("input");
  editInput.classList.add("edit-input");

  taskHeader.replaceChild(editInput, taskNameH3);
  editInput.value = taskNameH3.textContent;
  editInput.focus();

  // Asignamos eventos de guardado/cancelación
  asignKeydownEvent(taskHeader, taskNameH3, editInput, _id);
  asignBlurEvent(taskHeader, taskNameH3, editInput, _id);
};

/** Maneja Enter (guardar) y Escape (cancelar) en el input. */
const asignKeydownEvent = (taskHeader, taskNameH3, editInput, _id) => {
  editInput.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      if (editInput.value.trim()) {
        updateTaskName(_id, taskHeader, taskNameH3, editInput);
      }
    } else if (event.key === "Escape") {
      // Reemplaza input por H3 si se presiona Escape
      try {
        taskHeader.replaceChild(taskNameH3, editInput);
        asignEditEvent(_id); // Reasigna el listener de click al H3
      } catch (e) {
        /* ignore if already gone */
      }
    }
  });
};

/** Maneja la pérdida de foco (blur) para guardar o revertir. */
const asignBlurEvent = (taskHeader, taskNameH3, editInput, _id) => {
  editInput.addEventListener("blur", () => {
    if (editInput.value.trim()) {
      updateTaskName(_id, taskHeader, taskNameH3, editInput);
    } else {
      // Si está vacío, revierte al H3 original
      try {
        taskHeader.replaceChild(taskNameH3, editInput);
        asignEditEvent(_id); // Reasigna el listener de click al H3
      } catch (e) {
        /* ignore if already gone */
      }
    }
  });
};

/** Actualiza el título en la API y restaura el H3 en el DOM. */
const updateTaskName = async (_id, taskHeader, taskNameH3, editInput) => {
  const newTaskName = editInput.value.trim();
  const titleChanged = taskNameH3.textContent !== newTaskName;

  // 1. Si no ha cambiado, o está vacío, restauramos el DOM y salimos.
  if (!titleChanged) {
    try {
      taskHeader.replaceChild(taskNameH3, editInput);
      asignEditEvent(_id);
    } catch (e) {
      /* ignore */
    }
    return;
  }

  // 2. Llamada a la API para guardar el nuevo título
  const updateSuccessful = await updateTaskInApi(_id, { title: newTaskName });

  // 3. Restauración del DOM y actualización local
  try {
    // Restauramos el H3 SÓLO si el input aún es un hijo.
    taskHeader.replaceChild(taskNameH3, editInput);
  } catch (e) {
    /* ignore error si el blur ya lo hizo */
  }

  if (updateSuccessful) {
    // Actualizamos el H3 visible y la lista local si la API tuvo éxito.
    taskNameH3.textContent = newTaskName;
    const taskIndex = taskList.findIndex((task) => task._id === _id);
    if (taskIndex !== -1) taskList[taskIndex].title = newTaskName;
  }

  // 4. Reasignamos el listener de click al H3 (siempre, para evitar el error NotFound)
  asignEditEvent(_id);
};

// ==========================
// 6. EVENT LISTENERS SETUP
// ==========================

// Listener to logout
logoutButton.addEventListener("click", (event) => {
  event.preventDefault();
  handleLogout();
});

// Listener para añadir tarea con Enter en el input.
newInput.addEventListener("keydown", (event) => {
  if (event.key === "Enter" && newInput.value.trim()) {
    createTask(newInput.value.trim());
    newInput.value = "";
  }
});

// Listener para añadir tarea con el botón "Add".
newButton.addEventListener("click", (event) => {
  event.preventDefault();
  if (newInput.value.trim()) {
    createTask(newInput.value.trim());
    newInput.value = "";
  }
});

// Listeners para los botones de filtro.
filterButtons.forEach((button) => {
  button.addEventListener("click", (event) => {
    event.preventDefault();
    getTasks(button.dataset.filter); // Carga y filtra
    activateFilterButton(button); // Activa el botón
  });
});

// ==========================
// 7. APPLICATION START
// ==========================

printCurrentDate();
getTasks();
