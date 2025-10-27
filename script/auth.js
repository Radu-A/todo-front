// ==================
// VARIABLES
// ==================
const server = "http://localhost:5000/api/auth";
const emailAuthInput = document.getElementById("email-auth-input");
const passwordAuthInput = document.getElementById("password-auth-input");
const nameAuthInput = document.getElementById("name-auth-input");
// Referencia al botón de envío
const authButton = document.getElementById("auth-button");
const loginForm = document.getElementById("login-form");
const registerForm = document.getElementById("register-form");

// ==================
// NAME VALIDATION
// ==================
const checkName = (name) => {
  // Regex: Mínimo 3 caracteres, solo letras, opcionalmente acentos y ñ/Ñ
  const regEx = /^[\p{L}\s]{3,20}$/u;
  return regEx.test(name);
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
    "El nombre debe poseer entre 3 y 20 caracteres y solo puede contener letras y espacios.";
  const name = nameAuthInput.value.trim();
  console.log(name);
  if (!name || !checkName(name)) {
    nameAuthInput.after(nameMessage);
    return false;
  }
  return true;
};

// ==================
// EMAIL VALIDATION
// ==================
const checkEmail = (email) => {
  // Regex para email (robusta)
  const regEx = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
  return regEx.test(email); // Usar .test() devuelve true/false
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
  const email = emailAuthInput.value.trim();
  if (!email || !checkEmail(email)) {
    emailAuthInput.after(emailMessage);
    return false;
  }
  return true;
};

// ==================
// PASSWORD VALIDATION
// ==================
const checkPassword = (password) => {
  // Regex: Mín 8 chars, sin espacios, 1 minúscula, 1 número, 1 especial
  const regEx = /^(?!.*\s)(?=.*[a-z])(?=.*\d)(?=.*[^\w\s])[\S]{8,}$/;
  return regEx.test(password); // Usar .test() devuelve true/false
};

const passwordValidation = () => {
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
    "La contraseña debe tener al menos 8 caracteres, y contener una minúscula, un número y un caracter especial";
  const password = passwordAuthInput.value;
  if (!password || !checkPassword(password)) {
    passwordAuthInput.after(passwordMessage);
    return false;
  }
  return true;
};

// ==================
// FORM SUBMISSION VALIDATION
// ==================

/**
 * Ejecuta todas las validaciones de campos y verifica si todas son válidas.
 * @returns {boolean} True si todos los campos son válidos, False si hay errores.
 */
const formValidation = () => {
  if (registerForm) {
    const isNameValid = nameValidation();
    const isEmailValid = emailValidation();
    const isPasswordValid = passwordValidation();
    return isNameValid && isEmailValid && isPasswordValid;
  }
  if (loginForm) {
    const isEmailValid = emailValidation();
    const isPasswordValid = passwordValidation();
    return isEmailValid && isPasswordValid;
  }
};

// ==================
// LOGIN
// ==================
const handleLogin = async (event) => {
  // Prepare data
  const data = {
    email: emailAuthInput.value,
    password: passwordAuthInput.value,
  };

  console.log("Sending login request to server...");

  try {
    const res = await fetch(server, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    // 2. Manejo de Fallo de Autenticación (401/500)
    if (!res.ok) {
      const errorData = await res.json();
      // Lanza el mensaje del servidor para que el catch lo maneje
      throw new Error(errorData.message || `HTTP Error: ${res.status}`);
    }

    // 3. ÉXITO (Status 200)
    const result = await res.json();
    console.log("Authentication successful. User data:", result.user);
    // Save token
    console.log("Token recibido", result.token);

    localStorage.setItem("userToken", result.token);

    // 4. REDIRECCIÓN AL ÉXITO (Punto 1)
    const baseUrl = `${window.location.origin}/todo-front`;
    window.location.href = `${baseUrl}/index.html`;
  } catch (err) {
    // 5. MANEJO DEL ERROR y Muestra de Mensaje
    console.error("Login failed or network error:", err.message);

    // Muestra el mensaje de error capturado (ej: "Credenciales inválidas")
    showLoginError(err.message);
  }
};

const showLoginError = (message) => {
  const existingMessage = document.getElementById("login-message");
  if (existingMessage) existingMessage.remove();
  const loginMessage = document.createElement("p");
  loginMessage.textContent = message;
  loginMessage.className = "validation-message";
  loginMessage.id = "login-message";
  loginForm.appendChild(loginMessage);
};

// ==================
// EVENT LISTENERS
// ==================

if (nameAuthInput) {
  nameAuthInput.addEventListener("blur", () => {
    nameValidation();
  });
}

emailAuthInput.addEventListener("blur", () => {
  emailValidation();
});

passwordAuthInput.addEventListener("blur", () => {
  passwordValidation();
});

// Listener para el envío del formulario
loginForm.addEventListener("submit", (event) => {
  event.preventDefault();

  if (formValidation()) {
    console.log("¡Validación exitosa! Enviando datos al servidor...");
    handleLogin(event);
  } else {
    console.log("Error de validación. Por favor, revisa los campos.");
  }
});
