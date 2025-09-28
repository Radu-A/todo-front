// ==========================
// CONFIGURATION AND VARIABLES
// ==========================

const todoSection = document.getElementById("todo-section");
const doneSection = document.getElementById("done-section");
const currentDate = document.getElementById("current-day");
const newInput = document.getElementById("new-input");
const newButton = document.getElementById("new-button");

// State on memory
let taskList = JSON.parse(localStorage.getItem("taskList")) || [];
console.log(taskList);

// ==========================
// UTILITY FUNCTIONS
// ==========================

// Save array of tasks on localStorage
const saveTasks = () => {
  localStorage.setItem("taskList", JSON.stringify(taskList));
};

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

// ==========================
// TASKS FUNCTIONS
// ==========================

// Print delete-button on completed tasks
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

// Delete task from localStorage
const deleteFromLocalStorage = (taskName) => {
  taskList = taskList.filter((task) => task.name != taskName);
  saveTasks();
};

// Delete task-article from done-section
const deleteFromDocument = (taskName, state) => {
  const taskArticle = document.getElementById(`${taskName}`);
  if (state == "todo") {
    todoSection.removeChild(taskArticle);
  } else {
    doneSection.removeChild(taskArticle);
  }
};

// Print task on apropiate section
const printTask = (taskName, state) => {
  let taskArticle = document.createElement("article");
  taskArticle.className = "todo-article";
  taskArticle.id = taskName;
  taskArticle.innerHTML = `
		<div class="task-header">
            <div class="status-icon ${state}" id="${taskName}-icon"></div>
            <h3 class="task-name">${taskName}</h3>
		</div>
		<button class="delete-button" id="${taskName}-delete-button">Delete</button>`;
  if (state == "todo") {
    todoSection.appendChild(taskArticle);
  } else {
    doneSection.appendChild(taskArticle);
  }
  activateDeleteButton(taskName, state);
  asingState(taskArticle, taskName);
};

// Create a new task and save it
const createTask = (taskName, state) => {
  taskList.push({ name: taskName, state: state });
  saveTasks();
  printTask(taskName, state);
};

//  Asign event and state to a task
const asingState = (taskArticle, taskName) => {
  const stateIcon = document.getElementById(`${taskName}-icon`);

  stateIcon.addEventListener("click", (event) => {
    event.preventDefault();
    let state = "todo";

    if (stateIcon.classList.contains("todo")) {
      state = "done";
      stateIcon.classList.remove("todo");
      stateIcon.classList.add("done");
      todoSection.removeChild(taskArticle);
      doneSection.appendChild(taskArticle);
      activateDeleteButton(taskName);
    } else {
      state = "todo";
      stateIcon.classList.remove("done");
      stateIcon.classList.add("todo");
      doneSection.removeChild(taskArticle);
      todoSection.appendChild(taskArticle);
    }

    taskList.forEach((task) => {
      if (task.name == taskName) {
        task.state = state;
      }
    });
    localStorage.setItem("taskList", JSON.stringify(taskList));
  });
};

// Charge all task saved on localStorage
const loadTask = () => {
  taskList.forEach((task) => {
    printTask(task.name, task.state);
  });
};

// ==========================
// EVENTOS
// ==========================

newInput.addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    createTask(newInput.value, "todo");
    newInput.value = "";
  }
});

newButton.addEventListener("click", (event) => {
  event.preventDefault();
  createTask(newInput.value, "todo");
  newInput.value = "";
});

// ==========================
// INICIALIZATION
// ==========================

printCurrentDate();
loadTask();
