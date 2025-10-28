// ==================
// VARIABLES
// ==================
const server = "http://localhost:5000/api";
const emailAuthInput = document.getElementById("email-auth-input");
const passwordAuthInput = document.getElementById("password-auth-input");
const repeatAuthInput = document.getElementById("repeat-auth-input");
const nameAuthInput = document.getElementById("name-auth-input");
// Referencia al botón de envío
const authButton = document.getElementById("auth-button");
const loginForm = document.getElementById("login-form");
const registerForm = document.getElementById("register-form");

// ==================
// NAME VALIDATION (SINCRONA)
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
    "El nombre debe poseer entre 3 y 20 caracteres y solo puede contener letras.";
  const name = nameAuthInput.value.trim();
  console.log(name);
  if (!name || !checkName(name)) {
    nameAuthInput.after(nameMessage);
    return false;
  }
  return true;
};

// ==================
// EMAIL VALIDATION (ASÍNCRONA)
// ==================
const checkEmail = (email) => {
  // Regex para email (robusta)
  const regEx = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
  return regEx.test(email); // Usar .test() devuelve true/false
};

const emailValidation = async () => {
  // <--- MODIFICADO: FUNCIÓN ASÍNCRONA
  const usedEmailMessage = document.getElementById("email-validation-message");
  if (usedEmailMessage) {
    usedEmailMessage.remove();
  }

  const email = emailAuthInput.value.trim(); // 1. Validación de formato (Síncrona)
  if (!email || !checkEmail(email)) {
    const emailMessage = document.createElement("p");
    emailMessage.className = "validation-message";
    emailMessage.id = "email-validation-message";
    emailMessage.textContent = "La cuenta de correo no es válida";
    emailAuthInput.after(emailMessage);
    return false;
  } // 2. Validación de existencia (Asíncrona) - Solo relevante para REGISTRO

  if (registerForm) {
    // Usamos await para esperar el resultado de la llamada de red
    const emailExists = await searchEmail(email); // <--- MODIFICADO: USO DE AWAIT

    if (emailExists === true) {
      const emailMessage = document.createElement("p");
      emailMessage.className = "validation-message";
      emailMessage.id = "email-validation-message";
      emailMessage.textContent = "Esta dirección de correo ya existe";
      emailAuthInput.after(emailMessage);
      return false;
    }
  }
  return true;
};

// ==================
// PASSWORD VALIDATION (SINCRONA)
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
// REPEAT PASSWORD VALIDATION (SINCRONA)
// ==================
const repeatPasswordValidation = () => {
  const usedPasswordMessage = document.getElementById(
    "repeat-validation-message"
  );
  if (usedPasswordMessage) {
    usedPasswordMessage.remove();
  }
  const repeatPasswordMessage = document.createElement("p");
  repeatPasswordMessage.className = "validation-message";
  repeatPasswordMessage.id = "repeat-validation-message";
  repeatPasswordMessage.textContent = "La contraseñas no coinciden";
  const password = passwordAuthInput.value;
  const repeatPassword = repeatAuthInput.value;
  if (password != repeatPassword) {
    repeatAuthInput.after(repeatPasswordMessage);
    return false;
  }
  return true;
};

// ==================
// FORM SUBMISSION VALIDATION (ASÍNCRONA)
// ==================

/**
 * Ejecuta todas las validaciones de campos y verifica si todas son válidas.
 * @returns {Promise<boolean>} True si todos los campos son válidos, False si hay errores.
 */
const formValidation = async () => {
  // <--- MODIFICADO: FUNCIÓN ASÍNCRONA
  // Las validaciones síncronas se ejecutan primero
  const isNameValid = registerForm ? nameValidation() : true;
  const isPasswordValid = passwordValidation();
  const isRepeatValid = registerForm ? repeatPasswordValidation() : true; // Agregado check de repetición

  // La validación del email es ASÍNCRONA y debe ser esperada
  const isEmailValid = await emailValidation(); // <--- MODIFICADO: USO DE AWAIT

  if (registerForm) {
    return isNameValid && isEmailValid && isPasswordValid && isRepeatValid; // Uso de isRepeatValid
  }
  if (loginForm) {
    return isEmailValid && isPasswordValid;
  }
};

// ==================
// LOGIN (ASÍNCRONA)
// ==================
const handleLogin = async (event) => {
  // Prepare data
  const data = {
    email: emailAuthInput.value,
    password: passwordAuthInput.value,
  };

  console.log("Sending login request to server...");

  try {
    const res = await fetch(`${server}/auth`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    }); // 2. Manejo de Fallo de Autenticación (401/500)

    if (!res.ok) {
      const errorData = await res.json(); // Lanza el mensaje del servidor para que el catch lo maneje
      throw new Error(errorData.message || `HTTP Error: ${res.status}`);
    } // 3. ÉXITO (Status 200)

    const result = await res.json();
    console.log("Authentication successful. User data:", result.user); // Save token
    console.log("Token recibido", result.token);

    localStorage.setItem("userToken", result.token); // 4. REDIRECCIÓN AL ÉXITO (Punto 1)

    const baseUrl = `${window.location.origin}/todo-front`;
    window.location.href = `${baseUrl}/index.html`;
  } catch (err) {
    // 5. MANEJO DEL ERROR y Muestra de Mensaje
    console.error("Login failed or network error:", err.message); // Muestra el mensaje de error capturado (ej: "Credenciales inválidas")

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
// REGISTER (ASÍNCRONA)
// ==================
// auth.js (Frontend)

const handleRegister = async () => {
  // Make the function async
  const data = {
    username: nameAuthInput.value, // Ensure your input name matches backend (username vs userName)
    email: emailAuthInput.value,
    password: passwordAuthInput.value,
  }; // Clear previous error messages (assuming you have a way to display them) // clearErrorMessages();

  console.log("Sending registration request to server...");

  try {
    const response = await fetch(`${server}/user`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    }); // 1. Check for non-2xx status codes (400, 409, 500)

    if (!response.ok) {
      const errorData = await response.json(); // Throw the message from the server (e.g., "This email is already registered")
      throw new Error(errorData.message || `HTTP Error: ${response.status}`);
    } // 2. SUCCESS (Status 201)

    const result = await response.json();
    console.log("Registration successful:", result.message); // Optional: Redirect to login page after successful registration // window.location.href = "login.html";
  } catch (error) {
    // 3. Catch and display the error message to the user
    console.error("Registration failed:", error.message); // showErrorMessage(error.message); // Implement a function to show this message on the page
  }
};

// ==================
// SEARCH EMAIL (ASÍNCRONA)
// ==================
const searchEmail = async (email) => {
  const data = { email: email };

  try {
    const response = await fetch(`${server}/user/email`, {
      // Cambiado el endpoint a uno más descriptivo
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    const result = await response.json(); // Si el servidor responde con 500 (DB Error)

    if (response.status === 500) {
      console.error("Server error during email check:", result.message);
      return false;
    } // Si el email existe (Status 200 y exists: true)

    if (result.exists === true) {
      console.log("Email exists! Proceed to password input."); // Lógica para mostrar el campo de contraseña, etc.
      return true;
    } // Si el email NO existe (Status 200 y exists: false)
    return false;
  } catch (error) {
    console.error("Network or parsing error:", error); // Manejo de errores de red: asumimos que no existe si no podemos confirmar
    return false;
  }
};

// ==================
// EVENT LISTENERS (ASÍNCRONOS)
// ==================

if (nameAuthInput) {
  nameAuthInput.addEventListener("blur", () => {
    nameValidation();
  });
}

// Listener de blur para email
emailAuthInput.addEventListener("blur", async () => {
  // <--- MODIFICADO: ASÍNCRONO
  await emailValidation(); // <--- MODIFICADO: USO DE AWAIT
});

passwordAuthInput.addEventListener("blur", () => {
  passwordValidation();
});

if (repeatAuthInput) {
  repeatAuthInput.addEventListener("blur", () => {
    repeatPasswordValidation();
  });
}

// Listener para el envío del formulario login
if (loginForm) {
  loginForm.addEventListener("submit", async (event) => {
    // <--- MODIFICADO: ASÍNCRONO
    event.preventDefault();

    if (await formValidation()) {
      // <--- MODIFICADO: USO DE AWAIT
      console.log("¡Validación exitosa! Enviando datos al servidor...");
      handleLogin(event);
    } else {
      console.log("Error de validación. Por favor, revisa los campos.");
    }
  });
}

// Listener para el envío del formulario registro
if (registerForm) {
  registerForm.addEventListener("submit", async (event) => {
    // <--- MODIFICADO: ASÍNCRONO
    event.preventDefault();

    if (await formValidation()) {
      // <--- MODIFICADO: USO DE AWAIT
      console.log("¡Validación exitosa! Enviando datos al servidor...");
      handleRegister(event);
    } else {
      console.log("Error de validación. Por favor, revisa los campos.");
    }
  });
}
