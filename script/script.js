// VARIABLES

const currentDate = document.getElementById("current-day");
const today = new Date();

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

newButton.addEventListener("click", function (event) {
  event.preventDefault;
  createNewTask(newInput.value);
  newInput.value = "";
});

const createNewTask = (taskName) => {
  const todoSection = document.getElementById("todo-section");
  let taskArticle = document.createElement("article");
  taskArticle.className = "todo-article";
  taskArticle.id = taskName;
  taskArticle.innerHTML = `
		<div class="task-header">
            <div class="status-icon pending"></div>
            <h3 class="task-name">${taskName}</h3>
		</div>`;
  todoSection.appendChild(taskArticle);
  asignEvent(taskName);
};

// STATUS ICON

// no funciona!!!!!

const asignEvent = (taskName) => {
  const statusIcon = document.getElementById(taskName);
  console.log(statusIcon);

  statusIcon.addEventListener("click", function (event) {
    event.preventDefault();
    console.log("Holi");
    if (statusIcon.className == "status-icon pending") {
      statusIcon.className = "status-icon done";
    } else {
      statusIcon.className = "status-icon pending";
    }
  });
};
