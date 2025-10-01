// ==========================
// CONFIGURATION AND VARIABLES
// ==========================

const todoSection = document.getElementById("todo-section");
const doneSection = document.getElementById("done-section");
const currentDate = document.getElementById("current-day");
const newInput = document.getElementById("new-input");
const newButton = document.getElementById("new-button");
const filterButtons = [...document.getElementsByClassName("filter-button")];
console.log(filterButtons);

// State on memory
let taskList = JSON.parse(localStorage.getItem("taskList")) || [];
console.log(taskList);

// ==========================
// COMMON FUNCTIONS
// ==========================

// Formate current date and print on header
const printCurrentDate = () => {
  // get date to a variable
  const today = new Date();
  const formatedDate = today.toLocaleDateString("en-EN", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });
  // insert date into DOM
  currentDate.textContent = formatedDate;
};

// Save array of tasks on localStorage
const saveTasks = () => {
  localStorage.setItem("taskList", JSON.stringify(taskList));
};

// Charge all task saved on localStorage
const loadTasks = (state = "all") => {
  let filteredTaskList = filterTasks(state);
  filteredTaskList.forEach((task) => {
    printTask(task.name, task.state);
  });
  printCounters();
  console.log("after printCounters");
};

// Clear tasks from DOM
const clearTasks = () => {
  todoSection.innerHTML = `
        <div class="section-header">
          <h2>ToDo</h2>
          <span class="counter" id="todo-counter"></span>
        </div>`;
  doneSection.innerHTML = `
        <div class="section-header">
          <h2>Done</h2>
          <span class="counter" id="done-counter"></span>
        </div>`;
};

// ==============
// FILTER TASKS
// ==============

// Filter taskList
const filterTasks = (state = "all") => {
  return state === "all"
    ? taskList
    : taskList.filter((task) => task.state == state);
};

// Activate filter button
const activateFilterButton = (clickedButton) => {
  filterButtons.forEach((button) => {
    button == clickedButton
      ? button.classList.add("filter-active")
      : button.classList.remove("filter-active");
  });
};

// ==========================
// PRINT COUNTERS
// ==========================

const printCounters = () => {
  const todoCounter = document.getElementById("todo-counter");
  const doneCounter = document.getElementById("done-counter");
  const todoNumber = taskList.filter((task) => task.state == "todo").length;
  todoCounter.textContent = todoNumber;
  const doneNumber = taskList.filter((task) => task.state == "done").length;
  doneCounter.textContent = doneNumber;
};

// ==========================
// CREATE TASK
// ==========================

// Print task on apropiate section
const printTask = (taskName, state) => {
  let taskArticle = document.createElement("article");
  taskArticle.className = "todo-article";
  taskArticle.id = taskName;
  taskArticle.innerHTML = `
		<div class="task-header" id="${taskName}-task-header">
            <div class="status-icon ${state}" id="${taskName}-icon"></div>
            <h3 class="task-name" id="${taskName}-task-name">${taskName}</h3>
		</div>
		<button class="delete-button" id="${taskName}-delete-button"></button>`;
  if (state == "todo") {
    todoSection.appendChild(taskArticle);
  } else {
    doneSection.appendChild(taskArticle);
  }
  // Force reflow
  requestAnimationFrame(() => {
    taskArticle.classList.add("article-show");
  });
  activateDeleteButton(taskName, state);
  asingState(taskArticle, taskName);
  asignEditEvent(taskName);
};

// Create a new task and save it
const createTask = (taskName, state) => {
  taskList.push({ name: taskName, state: state });
  saveTasks();
  printTask(taskName, state);
  printCounters();
};

//  Asign event and state to a task
const asingState = (taskArticle, taskName) => {
  // get state-icon div
  const stateIcon = document.getElementById(`${taskName}-icon`);
  // add event to state-icon div
  stateIcon.addEventListener("click", (event) => {
    event.preventDefault();
    let state = "todo";

    if (stateIcon.classList.contains("todo")) {
      state = "done";
      taskArticle.classList.remove("article-show");
      stateIcon.classList.remove("todo");
      stateIcon.classList.add("done");
      todoSection.removeChild(taskArticle);
      doneSection.appendChild(taskArticle);
      requestAnimationFrame(() => {
        taskArticle.classList.add("article-show");
      });
    } else {
      state = "todo";
      taskArticle.classList.remove("article-show");
      stateIcon.classList.remove("done");
      stateIcon.classList.add("todo");
      doneSection.removeChild(taskArticle);
      todoSection.appendChild(taskArticle);
      requestAnimationFrame(() => {
        taskArticle.classList.add("article-show");
      });
    }

    taskList.forEach((task) => {
      if (task.name == taskName) {
        task.state = state;
      }
    });
    localStorage.setItem("taskList", JSON.stringify(taskList));
    printCounters();
  });
};

// Print delete-button
const activateDeleteButton = (taskName, state) => {
  const deleteButton = document.getElementById(`${taskName}-delete-button`);
  if (deleteButton) {
    deleteButton.classList.add("active");
    deleteButton.addEventListener("click", (event) => {
      event.preventDefault();
      deleteFromLocalStorage(taskName);
      deleteFromDocument(taskName, state);
    });
  }
};

// ============
// DELETE TASK
// ============

// Delete task from localStorage
const deleteFromLocalStorage = (taskName) => {
  taskList = taskList.filter((task) => task.name != taskName);
  saveTasks();
};

// Delete task-article from DOM
const deleteFromDocument = (taskName, state) => {
  const taskArticle = document.getElementById(`${taskName}`);
  taskArticle.classList.remove("article-show");
  taskArticle.classList.add("article-unshow");
  taskArticle.addEventListener(
    "animationend",
    () => {
      if (state == "todo") {
        todoSection.removeChild(taskArticle);
      } else {
        doneSection.removeChild(taskArticle);
      }
    },
    { once: true }
  );
  printCounters();
};

// ==========================
// UPDATE TASK
// ==========================

// Asign event to H3
const asignEditEvent = (taskName) => {
  const taskNameH3 = document.getElementById(`${taskName}-task-name`);
  taskNameH3.addEventListener("click", (event) => {
    event.preventDefault();
    createEditInput(taskNameH3, taskName);
  });
};

// Create edit input and asign events
const createEditInput = (taskNameH3, taskName) => {
  const taskHeader = document.getElementById(`${taskName}-task-header`);

  const editInput = document.createElement("input");
  editInput.classList.add("edit-input");

  // toggle h3 and input
  taskHeader.replaceChild(editInput, taskNameH3);

  editInput.value = taskNameH3.textContent;
  editInput.focus();

  asignKeydownEvent(taskHeader, taskNameH3, editInput, taskName);
  asignBlurEvent(taskHeader, taskNameH3, editInput, taskName);
};

// Asign keydown event to edit input
const asignKeydownEvent = (taskHeader, taskNameH3, editInput, oldTaskName) => {
  editInput.addEventListener("keydown", (event) => {
    if (event.key == "Enter") {
      if (editInput.value.trim()) {
        updateTaskName(taskHeader, taskNameH3, editInput, oldTaskName);
      }
    } else if (event.key === "Escape") {
      taskHeader.replaceChild(taskNameH3, editInput);
    }
  });
};

// Asign blur event to edit input
const asignBlurEvent = (taskHeader, taskNameH3, editInput, oldTaskName) => {
  editInput.addEventListener("blur", () => {
    if (editInput.value.trim()) {
      updateTaskName(taskHeader, taskNameH3, editInput, oldTaskName);
    } else {
      taskHeader.replaceChild(taskNameH3, editInput);
    }
  });
};

// Actualiza el nombre del task en DOM, ids y localStorage
const updateTaskName = (taskHeader, taskNameH3, editInput, oldTaskName) => {
  const newTaskName = editInput.value.trim();
  taskNameH3.textContent = newTaskName;

  // === actualizar DOM ids ===
  const taskArticle = document.getElementById(oldTaskName);
  taskArticle.id = newTaskName;

  const stateIcon = document.getElementById(`${oldTaskName}-icon`);
  if (stateIcon) stateIcon.id = `${newTaskName}-icon`;

  const header = document.getElementById(`${oldTaskName}-task-header`);
  if (header) header.id = `${newTaskName}-task-header`;

  const deleteButton = document.getElementById(`${oldTaskName}-delete-button`);
  if (deleteButton) deleteButton.id = `${newTaskName}-delete-button`;

  taskNameH3.id = `${newTaskName}-task-name`;

  // === actualizar taskList ===
  taskList = taskList.map((task) =>
    task.name === oldTaskName ? { ...task, name: newTaskName } : task
  );
  saveTasks();

  // === reemplazar input con h3 ===
  taskHeader.replaceChild(taskNameH3, editInput);

  // volver a asignar listeners a los nuevos IDs
  asignEditEvent(newTaskName);
  activateDeleteButton(newTaskName);
};

// ==========================
// ASIGN EVENTS
// ==========================

newInput.addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    if (newInput.value) {
      createTask(newInput.value, "todo");
      newInput.value = "";
    }
  }
});

newButton.addEventListener("click", (event) => {
  event.preventDefault();
  if (newInput.value) {
    createTask(newInput.value, "todo");
    newInput.value = "";
  }
});

filterButtons.forEach((button) => {
  button.addEventListener("click", (event) => {
    event.preventDefault();
    clearTasks();
    loadTasks(button.dataset.filter);
    activateFilterButton(button);
  });
});

// ==========================
// INICIALIZATION
// ==========================

printCurrentDate();
loadTasks();
