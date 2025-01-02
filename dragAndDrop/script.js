const draggables = document.querySelectorAll(".draggable");
const dropzones = document.querySelectorAll(".dropzone");

draggables.forEach((draggable) => {
  draggable.addEventListener("dragstart", (e) => {
    // dataTransfer and target are built in stuffs for default drag and drop of HTML
    e.dataTransfer.setData("text", e.target.style.backgroundColor);
    e.dataTransfer.setData("id", e.target.id);
    e.target.style.opacity = "0.5";
  });

  draggable.addEventListener("dragend", (e) => {
    e.target.style.opacity = "1";
  });
});

dropzones.forEach((dropzone) => {
  dropzone.addEventListener("dragover", (e) => {
    e.preventDefault();
  });

  dropzone.addEventListener("drop", (e) => {
    e.preventDefault();
    const color = e.dataTransfer.getData("text");
    const id = e.dataTransfer.getData("id");
    e.target.style.backgroundColor = color;

    const draggableElement = document.getElementById(id);
    if (draggableElement) {
      draggableElement.remove();
    }
  });
});
