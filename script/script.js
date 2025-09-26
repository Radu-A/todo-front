const currentDate = document.getElementById("current-day");
const today = new Date();

const formatedDate = today.toLocaleDateString("en-EN", {
  weekday: "long",
  month: "long",
  day: "numeric"
});

console.log(formatedDate);

currentDate.textContent = formatedDate;
