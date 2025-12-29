console.log("script.js loaded");

document.addEventListener("DOMContentLoaded", () => {
  const appContainer = document.querySelector(".app-container");
  const resultPage = document.getElementById("result-page");

  // Force correct initial state
  if (resultPage) resultPage.classList.add("hidden");
  if (appContainer) appContainer.classList.remove("hidden");
});
