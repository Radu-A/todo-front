// GLOBAL VARIABLES

const todoSection = document.getElementById("todo-section");
const doneSection = document.getElementById("done-section");
const currentDate = document.getElementById("current-day");
const today = new Date();
let taskList = JSON.parse(localStorage.getItem("taskList"));
console.log(taskList);

// HEADER

// get date to a variable
const formatedDate = today.toLocaleDateString("en-EN", {
  weekday: "long",
  month: "long",
  day: "numeric",
});
// insert date into DOM
currentDate.textContent = formatedDate;

// CREATE TASK

const newInput = document.getElementById("new-input");
const newButton = document.getElementById("new-button");

newInput.addEventListener("keydown", (event) => {
  event.preventDefault;
  if (event.key === "Enter") {
    createTask(newInput.value, "todo");
    newInput.value = "";
  }
});

newButton.addEventListener("click", (event) => {
  event.preventDefault;
  createTask(newInput.value, "todo");
  newInput.value = "";
});

const printTask = (taskName, state) => {
  let taskArticle = document.createElement("article");
  taskArticle.className = "todo-article";
  taskArticle.id = taskName;
  taskArticle.innerHTML = `
		<div class="task-header">
            <div class="status-icon ${state}" id="${taskName}-icon"></div>
            <h3 class="task-name">${taskName}</h3>
		</div>`;
  if (state == "todo") {
    todoSection.appendChild(taskArticle);
  } else {
    doneSection.appendChild(taskArticle);
  }
  asingState(taskArticle, taskName);
};

const createTask = (taskName, state) => {
  taskList.push([taskName, state]);
  localStorage.setItem("taskList", JSON.stringify(taskList));
  printTask(taskName, state);
};

// ASIGN STATE

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
    } else {
      state = "todo";
      stateIcon.classList.remove("done");
      stateIcon.classList.add("todo");
      doneSection.removeChild(taskArticle);
      todoSection.appendChild(taskArticle);
    }

    taskList.map((task) => {
      if (task[0] == taskName) {
        task[1] = state;
      }
    });
    localStorage.setItem("taskList", JSON.stringify(taskList));
  });
};

// UPDATE TASK

const loadTask = () => {
  taskList.map((task) => {
    printTask(task[0], task[1]);
  });
};

if (taskList) {
  loadTask();
}

// DELETE TASK