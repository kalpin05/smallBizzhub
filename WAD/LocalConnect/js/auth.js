/* ===============================
   UTILS
================================ */

function getUsers() {
  return JSON.parse(localStorage.getItem("users")) || [];
}

function saveUsers(users) {
  localStorage.setItem("users", JSON.stringify(users));
}

function setSession(user) {
  localStorage.setItem("session", JSON.stringify({
    email: user.email,
    name: user.name,
    role: user.role,
    loggedIn: true
  }));
}

function getSession() {
  return JSON.parse(localStorage.getItem("session"));
}

function getCurrentUserDisplayName() {
  const session = getSession();
  return session ? session.name : "User";
}

/* ===============================
   VALIDATIONS
================================ */

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function isStrongPassword(password) {
  const regex =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?#&])[A-Za-z\d@$!%*?#&]{8,}$/;
  return regex.test(password);
}

function isValidAadhaar(aadhaar) {
  return /^\d{12}$/.test(aadhaar);
}

/* ===============================
   SIGNUP (COMMON)
================================ */

function signup(role) {
  const name = document.getElementById("name").value.trim();
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value;
  const aadhaarInput = document.getElementById("aadhaar");

  if (!name || !email || !password) {
    alert("All fields are required");
    return;
  }

  if (!isValidEmail(email)) {
    alert("Invalid email format");
    return;
  }

  if (!isStrongPassword(password)) {
    alert(
      "Password must be at least 8 characters and include uppercase, lowercase, number, and special character"
    );
    return;
  }

  const users = getUsers();

  if (users.find(u => u.email === email)) {
    alert("Account already exists");
    return;
  }

  const user = { name, email, password, role };

  if (role === "business") {
    const aadhaar = aadhaarInput.value.trim();

    if (!aadhaar) {
      alert("Aadhaar number is required for business accounts");
      return;
    }

    if (!isValidAadhaar(aadhaar)) {
      alert("Aadhaar must be exactly 12 digits");
      return;
    }

    user.aadhaar = aadhaar;
  }

  users.push(user);
  saveUsers(users);

  alert("Account created successfully. Please login.");

  window.location.href =
    role === "business"
      ? "business-login.html"
      : "client-login.html";
}

/* ===============================
   LOGIN (COMMON)
================================ */

function login(role) {
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value;

  const users = getUsers();

  const user = users.find(
    u => u.email === email && u.password === password && u.role === role
  );

  if (!user) {
    alert("Invalid credentials or role mismatch");
    return;
  }

  setSession(user);

  window.location.href =
    role === "business"
      ? "../business/dashboard.html"
      : "../client/dashboard.html";
}

/* ===============================
   LOGOUT
================================ */

function logout() {
  localStorage.removeItem("session");
  window.location.href = "../index.html";
}

/* ===============================
   PAGE PROTECTION
================================ */

function protectPage(requiredRole) {
  const session = getSession();

  if (!session || !session.loggedIn || session.role !== requiredRole) {
    window.location.href = "../auth/" + requiredRole + "-login.html";
  }
}
