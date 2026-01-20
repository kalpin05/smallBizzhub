document.addEventListener('DOMContentLoaded', function() {
  const navAuth = document.getElementById("navAuth");
  const session = JSON.parse(localStorage.getItem("session"));

  if (session && session.loggedIn) {
    navAuth.innerHTML = `
      <span style="margin-right: 15px;">Welcome, ${session.name}</span>
      <a href="#" onclick="logout()">Logout</a>
    `;
  }
});
