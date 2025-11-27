document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("formContacto");
  const popup = document.getElementById("popupSuccess");
  const closePopup = document.getElementById("closePopup");

  form.addEventListener("submit", (e) => {
    e.preventDefault();

    // simulación de envío exitoso
    popup.style.display = "flex";

    form.reset();
  });

  closePopup.addEventListener("click", () => {
    popup.style.display = "none";
  });
});