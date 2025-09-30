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
    event.preventDefault;
    createEditInput(taskNameH3, taskName);
  });
};

// Create edit input and asign events
const createEditInput = (taskNameH3, taskName) => {
  // get taskheader
  const taskHeader = document.getElementById(`${taskName}-task-header`);
  // crate input
  const editInput = document.createElement("input");
  editInput.classList.add("edit-input");

  // toggle h3 and input
  taskHeader.removeChild(taskNameH3);
  taskHeader.appendChild(editInput);

  // put focus on input
  editInput.value = taskNameH3.textContent;
  editInput.focus();

  asignKeydownEvent(taskHeader, taskNameH3, editInput);
  // asignBlurEvent(taskHeader, taskNameH3, editInput);
};

// Asign keydown event to edit input
const asignKeydownEvent = (taskHeader, taskNameH3, editInput) => {
  // add event to edit input
  editInput.addEventListener("keydown", (event) => {
    if (event.key == "Enter") {
      console.log("Enter");
      if (editInput.value.trim()) {
        // change taskList and save
        taskList = taskList.map((task) =>
          task.name === taskNameH3.textContent
            ? { ...task, name: editInput.value }
            : task
        );
        saveTasks();
        // print h3
        taskNameH3.textContent = editInput.value;
        taskHeader.removeChild(editInput);
        taskHeader.appendChild(taskNameH3);
      }
    } else if (event.key === "Escape") {
      taskHeader.removeChild(editInput);
      taskHeader.appendChild(taskNameH3);
    }
  });
};

// Asign blur evet to edit input
// const asignBlurEvent = (taskHeader, taskNameH3, editInput) => {
//   // add event to edit input
//   editInput.addEventListener("blur", (event) => {
//     console.log("Enter");
//     if (editInput.value.trim()) {
//       // change taskList and save
//       taskList = taskList.map((task) =>
//         task.name === taskNameH3.textContent
//           ? { ...task, name: editInput.value }
//           : task
//       );
//       saveTasks();
//       // print h3
//       taskNameH3.textContent = editInput.value;
//       taskHeader.removeChild(editInput);
//       taskHeader.appendChild(taskNameH3);
//     }
//   });
// };

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
