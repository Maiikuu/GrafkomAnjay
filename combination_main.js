import { createEvolutionScene } from "./evolution_scene.js";

function main() {
  console.log("=== POKEMON EVOLUTION VIEWER ===");
  console.log("Initializing application...\n");
  
  // === CANVAS SETUP ===
  const CANVAS = document.getElementById("mycanvas");
  if (!CANVAS) {
    console.error("Canvas element not found!");
    alert("Canvas element not found!");
    return;
  }
  
  CANVAS.width = window.innerWidth;
  CANVAS.height = window.innerHeight;
  console.log(`Canvas size: ${CANVAS.width}x${CANVAS.height}`);

  // === MOUSE CONTROLS ===
  let drag = false, x_prev = 0, y_prev = 0;
  let dX = 0, dY = 0;
  let THETA = 0, PHI = 0;
  let zoomDistance = 45;
  const FRICTION = 0.15;

  CANVAS.addEventListener("mousedown", e => {
    drag = true;
    x_prev = e.pageX;
    y_prev = e.pageY;
  });

  CANVAS.addEventListener("mouseup", () => drag = false);
  CANVAS.addEventListener("mouseout", () => drag = false);

  CANVAS.addEventListener("mousemove", e => {
    if (!drag) return;
    dX = (e.pageX - x_prev) * 2 * Math.PI / CANVAS.width;
    dY = (e.pageY - y_prev) * 2 * Math.PI / CANVAS.height;
    THETA += dX;
    PHI += dY;
    x_prev = e.pageX;
    y_prev = e.pageY;
  });

  CANVAS.addEventListener("wheel", e => {
    e.preventDefault();
    zoomDistance += e.deltaY * 0.02;
    zoomDistance = Math.max(25, Math.min(90, zoomDistance));
  });

  function applyFriction() {
    dX *= (1 - FRICTION);
    dY *= (1 - FRICTION);
    THETA += dX;
    PHI += dY;
  }

  // === WEBGL SETUP ===
  console.log("Initializing WebGL context...");
  const GL = CANVAS.getContext("webgl", { antialias: true });
  if (!GL) {
    console.error("WebGL not supported!");
    alert("Your browser doesn't support WebGL!");
    return;
  }
  console.log("✓ WebGL context created\n");

  GL.clearColor(0.6, 0.85, 0.95, 1.0);
  GL.clearDepth(1.0);
  GL.enable(GL.DEPTH_TEST);
  GL.depthFunc(GL.LEQUAL);

  // === SHADERS ===
  console.log("Compiling shaders...");
  
  const shader_vertex_source = `
    attribute vec3 position;
    attribute vec3 color;
    uniform mat4 PMatrix;
    uniform mat4 VMatrix;
    uniform mat4 MMatrix;
    varying vec3 vColor;
    void main(void) {
      gl_Position = PMatrix * VMatrix * MMatrix * vec4(position, 1.0);
      vColor = color;
    }`;

  const shader_fragment_source = `
    precision mediump float;
    varying vec3 vColor;
    void main(void) {
      gl_FragColor = vec4(vColor, 1.0);
    }`;

  function get_shader(source, type, name) {
    const shader = GL.createShader(type);
    GL.shaderSource(shader, source);
    GL.compileShader(shader);
    if (!GL.getShaderParameter(shader, GL.COMPILE_STATUS)) {
      console.error(`${name} shader error:`, GL.getShaderInfoLog(shader));
      return null;
    }
    console.log(`✓ ${name} shader compiled`);
    return shader;
  }

  const shader_vertex = get_shader(shader_vertex_source, GL.VERTEX_SHADER, "Vertex");
  const shader_fragment = get_shader(shader_fragment_source, GL.FRAGMENT_SHADER, "Fragment");

  if (!shader_vertex || !shader_fragment) {
    console.error("Shader compilation failed!");
    alert("Shader compilation failed!");
    return;
  }

  console.log("Linking shader program...");
  const SHADER_PROGRAM = GL.createProgram();
  GL.attachShader(SHADER_PROGRAM, shader_vertex);
  GL.attachShader(SHADER_PROGRAM, shader_fragment);
  GL.linkProgram(SHADER_PROGRAM);

  if (!GL.getProgramParameter(SHADER_PROGRAM, GL.LINK_STATUS)) {
    console.error("Program link error:", GL.getProgramInfoLog(SHADER_PROGRAM));
    alert("Shader program linking failed!");
    return;
  }
  console.log("✓ Shader program linked\n");

  const _position = GL.getAttribLocation(SHADER_PROGRAM, "position");
  const _color = GL.getAttribLocation(SHADER_PROGRAM, "color");
  const _PMatrix = GL.getUniformLocation(SHADER_PROGRAM, "PMatrix");
  const _VMatrix = GL.getUniformLocation(SHADER_PROGRAM, "VMatrix");
  const _MMatrix = GL.getUniformLocation(SHADER_PROGRAM, "MMatrix");

  console.log("Shader locations:", {
    position: _position,
    color: _color,
    PMatrix: _PMatrix ? "OK" : "NULL",
    VMatrix: _VMatrix ? "OK" : "NULL",
    MMatrix: _MMatrix ? "OK" : "NULL"
  });
  console.log("");

  GL.enableVertexAttribArray(_position);
  GL.enableVertexAttribArray(_color);
  GL.useProgram(SHADER_PROGRAM);

  // === MATRICES ===
  const PROJECTION_MATRIX = LIBS.get_projection(50, CANVAS.width / CANVAS.height, 1, 100);
  const VIEW_MATRIX = LIBS.get_I4();
  const MODEL_MATRIX = LIBS.get_I4();

  // === BUILD EVOLUTION SCENE ===
  let evolutionScene;
  try {
    evolutionScene = createEvolutionScene(
      GL,
      SHADER_PROGRAM,
      _position,
      _color,
      _PMatrix,
      _VMatrix,
      _MMatrix
    );
  } catch (error) {
    console.error("Failed to create evolution scene:", error);
    alert("Failed to create evolution scene! Check console.");
    return;
  }

  // === SETUP SCENE ===
  try {
    evolutionScene.setup();
  } catch (error) {
    console.error("Failed to setup scene:", error);
    alert("Failed to setup scene! Check console.");
    return;
  }

  // Hide loading screen
  const loadingEl = document.getElementById("loading");
  if (loadingEl) {
    loadingEl.classList.add("hidden");
  }

  // === RENDER LOOP ===
  console.log("Starting render loop...\n");
  let time = 0;
  let frameCount = 0;
  
  function animate() {
    time += 0.016;
    frameCount++;
    
    // Log FPS every 60 frames
    if (frameCount % 60 === 0) {
      console.log(`Frame: ${frameCount}, Time: ${time.toFixed(2)}s, Zoom: ${zoomDistance.toFixed(1)}, Theta: ${THETA.toFixed(2)}, Phi: ${PHI.toFixed(2)}`);
    }
    
    applyFriction();

    GL.viewport(0, 0, CANVAS.width, CANVAS.height);
    GL.clear(GL.COLOR_BUFFER_BIT | GL.DEPTH_BUFFER_BIT);

    // Update view matrix
    LIBS.set_I4(VIEW_MATRIX);
    LIBS.translateZ(VIEW_MATRIX, -zoomDistance);
    LIBS.translateY(VIEW_MATRIX, -3);

    // Update model matrix
    LIBS.set_I4(MODEL_MATRIX);
    LIBS.rotateY(MODEL_MATRIX, THETA);
    LIBS.rotateX(MODEL_MATRIX, PHI);

    // Set uniforms
    GL.uniformMatrix4fv(_PMatrix, false, PROJECTION_MATRIX);
    GL.uniformMatrix4fv(_VMatrix, false, VIEW_MATRIX);
    GL.uniformMatrix4fv(_MMatrix, false, MODEL_MATRIX);

    // Render scene
    try {
      evolutionScene.render(time);
    } catch (error) {
      if (frameCount % 60 === 0) {
        console.error("Render error:", error);
      }
    }

    GL.flush();
    requestAnimationFrame(animate);
  }

  animate();
  console.log("✓ Application started successfully!\n");
}

// Start when page loads
window.addEventListener("load", () => {
  console.log("Page loaded, starting application...\n");
  main();
});
