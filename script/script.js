// ==========================
// CONFIGURATION AND VARIABLES
// ==========================

const todoSection = document.getElementById("todo-section");
const doneSection = document.getElementById("done-section");
const currentDate = document.getElementById("current-day");
const newInput = document.getElementById("new-input");
const newButton = document.getElementById("new-button");
const filterButtons = [...document.getElementsByClassName("filter-button")];

// State on memory
let taskList = JSON.parse(localStorage.getItem("taskList")) || [];
console.log("Initial taskList loaded:", taskList);

// ==========================
// COMMON FUNCTIONS
// ==========================

// Formate current date and print on header
const printCurrentDate = () => {
  // Get today's date
  const today = new Date();
  // Format the date to a localized string (e.g., "Wednesday, October 22")
  const formatedDate = today.toLocaleDateString("en-EN", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });
  // Insert formatted date into the DOM header
  currentDate.textContent = formatedDate;
};

// Save array of tasks on localStorage
const saveTasks = () => {
  localStorage.setItem("taskList", JSON.stringify(taskList));
};

// Charge all task saved on localStorage
const loadTasks = (state = "all") => {
  // Get the task list filtered by the current state (all, todo, or done)
  let filteredTaskList = filterTasks(state);
  // Render each task in the filtered list to the DOM
  filteredTaskList.forEach((task) => {
    printTask(task.name, task.state);
  });
  // Update the displayed count for todo/done sections
  printCounters();
  // console.log("Tasks loaded and counters updated."); // Example console message
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
  // Force reflow/repaint to ensure the CSS transition runs for the new element
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
      // Prepare for transition out
      taskArticle.classList.remove("article-show");
      // Update visual state (icon)
      stateIcon.classList.remove("todo");
      stateIcon.classList.add("done");
      // Move task from ToDo to Done section in the DOM
      todoSection.removeChild(taskArticle);
      doneSection.appendChild(taskArticle);
      // Re-enable transition in the new section
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

// Delete task-article from DOM after a fade-out animation
const deleteFromDocument = (taskName, state) => {
  const taskArticle = document.getElementById(`${taskName}`);
  // Start fade-out animation
  taskArticle.classList.remove("article-show");
  taskArticle.classList.add("article-unshow");
  // Remove the element from the DOM once the CSS animation finishes
  taskArticle.addEventListener(
    "animationend",
    () => {
      if (state == "todo") {
        todoSection.removeChild(taskArticle);
      } else {
        doneSection.removeChild(taskArticle);
      }
    },
    { once: true } // Ensure the listener is removed after first execution
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

// Update task name on DOM, ids and localstore
const updateTaskName = (taskHeader, taskNameH3, editInput, oldTaskName) => {
  const newTaskName = editInput.value.trim();
  taskNameH3.textContent = newTaskName;

  // === update DOM ids ===
  const taskArticle = document.getElementById(oldTaskName);
  taskArticle.id = newTaskName;

  const stateIcon = document.getElementById(`${oldTaskName}-icon`);
  if (stateIcon) stateIcon.id = `${newTaskName}-icon`;

  const header = document.getElementById(`${oldTaskName}-task-header`);
  if (header) header.id = `${newTaskName}-task-header`;

  const deleteButton = document.getElementById(`${oldTaskName}-delete-button`);
  if (deleteButton) deleteButton.id = `${newTaskName}-delete-button`;

  taskNameH3.id = `${newTaskName}-task-name`;

  // === update taskList ===
  taskList = taskList.map((task) =>
    task.name === oldTaskName ? { ...task, name: newTaskName } : task
  );
  saveTasks();

  // === replace input con h3 ===
  taskHeader.replaceChild(taskNameH3, editInput);

  // reasign listeners to new IDs
  asignEditEvent(newTaskName);
  activateDeleteButton(newTaskName);
};

// ==========================
// ASIGN EVENT LISTENERS
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
// INITIALIZATION
// ==========================

printCurrentDate();
loadTasks();
