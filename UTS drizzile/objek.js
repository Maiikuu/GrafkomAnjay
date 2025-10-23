import { createDrizzile } from "./inteleon_scene.js";

function main() {
  // === CANVAS SETUP ===
  const CANVAS = document.getElementById("mycanvas");
  CANVAS.width = window.innerWidth;
  CANVAS.height = window.innerHeight;

  // === MOUSE CONTROLS ===
  let drag = false,
    x_prev = 0,
    y_prev = 0;
  let dX = 0,
    dY = 0;
  let THETA = 0,
    PHI = 0;
  const SPEED = 0.05;
  const FRICTION = 0.15;

  CANVAS.addEventListener("mousedown", (e) => {
    drag = true;
    x_prev = e.pageX;
    y_prev = e.pageY;
  });
  CANVAS.addEventListener("mouseup", () => (drag = false));
  CANVAS.addEventListener("mouseout", () => (drag = false));
  CANVAS.addEventListener("mousemove", (e) => {
    if (!drag) return;
    dX = ((e.pageX - x_prev) * 2 * Math.PI) / CANVAS.width;
    dY = ((e.pageY - y_prev) * 2 * Math.PI) / CANVAS.height;
    THETA += dX;
    PHI += dY;
    x_prev = e.pageX;
    y_prev = e.pageY;
  });

  window.addEventListener("keydown", (e) => {
    if (e.key === "w") dY -= SPEED;
    else if (e.key === "a") dX -= SPEED;
    else if (e.key === "s") dY += SPEED;
    else if (e.key === "d") dX += SPEED;
  });

  // === INIT WEBGL ===
  /** @type {WebGLRenderingContext} */
  let GL;
  try {
    GL = CANVAS.getContext("webgl", { antialias: true });
  } catch (e) {
    alert("WebGL context cannot be initialized");
    return false;
  }

  // === SHADERS ===
  const vsSource = `
    attribute vec3 position;
    attribute vec3 color;
    varying vec3 vColor;
    uniform mat4 Pmatrix, Vmatrix, Mmatrix;
    void main(void) {
      gl_Position = Pmatrix * Vmatrix * Mmatrix * vec4(position, 1.0);
      vColor = color;
    }`;

  const fsSource = `
    precision mediump float;
    varying vec3 vColor;
    void main(void) {
      gl_FragColor = vec4(vColor, 1.0);
    }`;

  function compileShader(src, type) {
    const shader = GL.createShader(type);
    GL.shaderSource(shader, src);
    GL.compileShader(shader);
    if (!GL.getShaderParameter(shader, GL.COMPILE_STATUS)) {
      console.error("Shader compile error:", GL.getShaderInfoLog(shader));
    }
    return shader;
  }

  const vs = compileShader(vsSource, GL.VERTEX_SHADER);
  const fs = compileShader(fsSource, GL.FRAGMENT_SHADER);

  const SHADER_PROGRAM = GL.createProgram();
  GL.attachShader(SHADER_PROGRAM, vs);
  GL.attachShader(SHADER_PROGRAM, fs);
  GL.linkProgram(SHADER_PROGRAM);
  GL.useProgram(SHADER_PROGRAM);

  const _position = GL.getAttribLocation(SHADER_PROGRAM, "position");
  const _color = GL.getAttribLocation(SHADER_PROGRAM, "color");
  GL.enableVertexAttribArray(_position);
  GL.enableVertexAttribArray(_color);

  const _Pmatrix = GL.getUniformLocation(SHADER_PROGRAM, "Pmatrix");
  const _Vmatrix = GL.getUniformLocation(SHADER_PROGRAM, "Vmatrix");
  const _Mmatrix = GL.getUniformLocation(SHADER_PROGRAM, "Mmatrix");

  // === BUILD MODEL ===
  const Drizzile = createDrizzile(GL, SHADER_PROGRAM, _position, _color);
  const Body = Drizzile.root;
  const Field = Drizzile.field;
  const Grass = Drizzile.grass;
  const Tree = Drizzile.tree; // <-- AMBIL OBJEK POHON
  const LUpperArm = Drizzile.leftArm;
  const RUpperArm = Drizzile.rightArm;
  const Tail = Drizzile.tail;

  // Simpan matriks asli untuk animasi
  const body_original_matrix = Array.from(Body.MOVE_MATRIX);
  const l_arm_original_matrix = Array.from(LUpperArm.MOVE_MATRIX);
  const r_arm_original_matrix = Array.from(RUpperArm.MOVE_MATRIX);
  const tail_original_matrix = Array.from(Tail.MOVE_MATRIX);

  Body.setup();
  Field.setup();
  Grass.setup();
  Tree.setup();

  // === MATRICES ===
  const PROJMATRIX = LIBS.get_projection(
    40,
    CANVAS.width / CANVAS.height,
    1,
    100
  );
  const VIEWMATRIX = LIBS.get_I4();
  const MOVEMATRIX = LIBS.get_I4();
  LIBS.translateZ(VIEWMATRIX, -10);

  GL.enable(GL.DEPTH_TEST);
  GL.depthFunc(GL.LEQUAL);
  GL.clearColor(0.9, 0.95, 1.0, 1.0);
  GL.clearDepth(1.0);

  let time_prev = 0;

  function animate(time) {
    const dt = time - time_prev;
    time_prev = time;

    const time_in_seconds = time * 0.001;

    // 1. Animasi Tubuh (Bernapas)
    Body.MOVE_MATRIX = Array.from(body_original_matrix);
    const bobOffset = Math.sin(time_in_seconds * 1.5) * 0.03;
    LIBS.translateY(Body.MOVE_MATRIX, bobOffset);

    // 2. Animasi Ayunan Tangan Kanan (Maju-Mundur)
    RUpperArm.MOVE_MATRIX = Array.from(r_arm_original_matrix);
    const waveAngleR = Math.sin(time_in_seconds * 1.2) * 0.15;
    LIBS.rotateX(RUpperArm.MOVE_MATRIX, waveAngleR);

    // 3. Animasi Ayunan Tangan Kiri (Maju-Mundur)
    LUpperArm.MOVE_MATRIX = Array.from(l_arm_original_matrix);
    const waveAngleL = Math.cos(time_in_seconds * 1.2) * 0.15;
    LIBS.rotateX(LUpperArm.MOVE_MATRIX, waveAngleL);

    // 4. Animasi Gerakan Ekor
    Tail.MOVE_MATRIX = Array.from(tail_original_matrix);
    const tailWagAngle = Math.sin(time_in_seconds * 2.0) * 0.3;
    LIBS.rotateY(Tail.MOVE_MATRIX, tailWagAngle);

    GL.viewport(0, 0, CANVAS.width, CANVAS.height);
    GL.clear(GL.COLOR_BUFFER_BIT | GL.DEPTH_BUFFER_BIT);

    if (!drag) {
      dX *= 1 - FRICTION;
      dY *= 1 - FRICTION;
      THETA += dX;
      PHI += dY;
    }

    LIBS.set_I4(MOVEMATRIX);
    LIBS.rotateY(MOVEMATRIX, THETA);
    LIBS.rotateX(MOVEMATRIX, PHI * 0.5);

    GL.uniformMatrix4fv(_Pmatrix, false, PROJMATRIX);
    GL.uniformMatrix4fv(_Vmatrix, false, VIEWMATRIX);

    Field.render(_Mmatrix, MOVEMATRIX);
    Grass.render(_Mmatrix, MOVEMATRIX);
    Tree.render(_Mmatrix, MOVEMATRIX);
    Body.render(_Mmatrix, MOVEMATRIX);

    GL.flush();
    window.requestAnimationFrame(animate);
  }

  animate(0);
}

window.addEventListener("load", main);
