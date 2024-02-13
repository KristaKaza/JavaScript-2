function logout() {
  localStorage.removeItem("access-token");
  localStorage.removeItem("api-key");
  localStorage.removeItem("logged-in-email");
}

document.getElementById("logout").addEventListener("click", function (event) {
  event.preventDefault();
  logout();
  window.location.href = "/index.html";
});
