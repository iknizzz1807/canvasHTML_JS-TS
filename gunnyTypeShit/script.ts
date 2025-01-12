function initCanvas() {
  const canvas = document.getElementById("canvas") as HTMLCanvasElement;

  const ctx = canvas.getContext("2d");

  if (!ctx) {
    return;
  }
}

initCanvas();
