// ==================
// VARIABLES
// ==================
const emailAuthInput = document.getElementById("email-auth-input");
const passwordAuthInput = document.getElementById("password-auth-input");
const nameAuthInput = document.getElementById("name-auth-input");
console.log(emailAuthInput, nameAuthInput);

// ==================
// EMAIL VALIDATION
// ==================
const checkEmail = (email) => {
  const regEx = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
  return email.match(regEx);
};

const emailValidation = () => {
  const usedEmailMessage = document.getElementById("email-validation-message");
  if (usedEmailMessage) {
    usedEmailMessage.remove();
  }
  const emailMessage = document.createElement("p");
  emailMessage.className = "validation-message";
  emailMessage.id = "email-validation-message";
  emailMessage.textContent = "La cuenta de correo no es válida";
  const email = emailAuthInput.value;
  if (!checkEmail(email)) {
    emailAuthInput.after(emailMessage);
  }
};

// ==================
// PASSWORD VALIDATION
// ==================
const checkPassword = (password) => {
  const regEx = /^(?!.*\s)(?=.*[a-z])(?=.*\d)(?=.*[^\w\s])[\S]{8,}$/;
  return password.match(regEx);
};

const passwordValidation = () => {
  console.log("PASS AVL");

  const usedPasswordMessage = document.getElementById(
    "password-validation-message"
  );
  if (usedPasswordMessage) {
    usedPasswordMessage.remove();
  }
  const passwordMessage = document.createElement("p");
  passwordMessage.className = "validation-message";
  passwordMessage.id = "password-validation-message";
  passwordMessage.textContent =
    "La contraseña debe contener al menos una letra, un número y un caracter especial";
  const password = passwordAuthInput.value;
  if (!checkPassword(password)) {
    passwordAuthInput.after(passwordMessage);
  }
};

// ==================
// NAME VALIDATION
// ==================
const checkName = (name) => {
  const regEx = /[a-zA-Z]{3,20}/;
  return name.match(regEx);
};

const nameValidation = () => {
  const usedNameMessage = document.getElementById("name-validation-message");
  if (usedNameMessage) {
    usedNameMessage.remove();
  }
  const nameMessage = document.createElement("p");
  nameMessage.className = "validation-message";
  nameMessage.id = "name-validation-message";
  nameMessage.textContent =
    "El nombre debe poseer un mínimo de 3 caracteres y solo puede contener letras";
  const name = nameAuthInput.value;
  if (!checkName(name)) {
    nameAuthInput.after(nameMessage);
  }
};

// ==================
// EVENT LISTENERS
// ==================

nameAuthInput.addEventListener("blur", () => {
  nameValidation();
});

emailAuthInput.addEventListener("blur", () => {
  emailValidation();
});

passwordAuthInput.addEventListener("blur", () => {
  passwordValidation();
});
