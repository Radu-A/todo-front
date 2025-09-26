// GLOBAL VARIABLES

const todoSection = document.getElementById("todo-section");
const doneSection = document.getElementById("done-section");
const currentDate = document.getElementById("current-day");
const today = new Date();
let taskList = [];

// HEADER

// get date to a variable
const formatedDate = today.toLocaleDateString("en-EN", {
  weekday: "long",
  month: "long",
  day: "numeric",
});
// insert date into DOM
currentDate.textContent = formatedDate;

// NEW TASK

const newInput = document.getElementById("new-input");
const newButton = document.getElementById("new-button");

newInput.addEventListener("keydown", function (event) {
  event.preventDefault;
  if (event.key === "Enter") {
    createNewTask(newInput.value);
    newInput.value = "";
  }
});

newButton.addEventListener("click", (event) => {
  event.preventDefault;
  createNewTask(newInput.value);
  newInput.value = "";
});

const createNewTask = (taskName) => {
  let taskArticle = document.createElement("article");
  taskArticle.className = "todo-article";
  taskArticle.id = taskName;
  taskArticle.innerHTML = `
		<div class="task-header">
            <div class="status-icon pending" id="${taskName}-icon"></div>
            <h3 class="task-name">${taskName}</h3>
		</div>`;
  taskList.push({ task: taskName, done: false });
  todoSection.appendChild(taskArticle);
  asignIconEvent(taskArticle, taskName);
};

// STATUS ICON

const asignIconEvent = (taskArticle, taskName) => {
  const statusIcon = document.getElementById(`${taskName}-icon`);
  console.log(statusIcon);
  console.log(doneSection);

  statusIcon.addEventListener("click", (event) => {
    event.preventDefault();
    console.log(taskArticle);
    if (statusIcon.classList.contains("pending")) {
      statusIcon.classList.remove("pending");
      statusIcon.classList.add("done");
      todoSection.removeChild(taskArticle);
      doneSection.appendChild(taskArticle);
    } else {
      statusIcon.classList.remove("done");
      statusIcon.classList.add("pending");
      doneSection.removeChild(taskArticle);
      todoSection.appendChild(taskArticle);
    }
  });
};
