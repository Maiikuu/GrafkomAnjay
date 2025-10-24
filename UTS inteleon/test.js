import { createInteleon } from "./inteleon_scene.js";
import { MyObject } from "./MyObject.js";

function main() {
    // === CANVAS SETUP ===
    const CANVAS = document.getElementById("mycanvas");
    CANVAS.width = window.innerWidth;
    CANVAS.height = window.innerHeight;

    // === MOUSE CONTROLS ===
    let drag = false, x_prev = 0, y_prev = 0;
    let dX = 0, dY = 0;
    let THETA = 0, PHI = 0;
    let zoomDistance = 30;
    const SPEED = 0.05;
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
        zoomDistance += e.deltaY * 0.01;
        zoomDistance = Math.max(15, Math.min(50, zoomDistance));
    });

    window.addEventListener("keydown", e => {
        if (e.key === "w") dY -= SPEED;
        else if (e.key === "a") dX -= SPEED;
        else if (e.key === "s") dY += SPEED;
        else if (e.key === "d") dX += SPEED;
        else if (e.key === "q") zoomDistance = Math.max(15, zoomDistance - 1);
        else if (e.key === "e") zoomDistance = Math.min(50, zoomDistance + 1);
    });

    function mouseUp() {
        dX *= (1 - FRICTION);
        dY *= (1 - FRICTION);
        THETA += dX;
        PHI += dY;
    }

    // === WEBGL SETUP ===
    const GL = CANVAS.getContext("webgl", { antialias: true });
    GL.clearColor(0.6, 0.85, 0.95, 1.0); // Light blue background
    GL.clearDepth(1.0);
    GL.enable(GL.DEPTH_TEST);
    GL.depthFunc(GL.LEQUAL);

    // === SHADERS WITH LIGHTING ===
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

    // 2. Replace the fragment shader with simpler version:
    const shader_fragment_source = `
    precision mediump float;
    varying vec3 vColor;
    
    void main(void) {
        gl_FragColor = vec4(vColor, 1.0);
    }`;

    function get_shader(source, type) {
        const shader = GL.createShader(type);
        GL.shaderSource(shader, source);
        GL.compileShader(shader);
        if (!GL.getShaderParameter(shader, GL.COMPILE_STATUS)) {
            console.error("Shader error:", GL.getShaderInfoLog(shader));
            return null;
        }
        return shader;
    }

    const shader_vertex = get_shader(shader_vertex_source, GL.VERTEX_SHADER);
    const shader_fragment = get_shader(shader_fragment_source, GL.FRAGMENT_SHADER);

    const SHADER_PROGRAM = GL.createProgram();
    GL.attachShader(SHADER_PROGRAM, shader_vertex);
    GL.attachShader(SHADER_PROGRAM, shader_fragment);
    GL.linkProgram(SHADER_PROGRAM);

    const _position = GL.getAttribLocation(SHADER_PROGRAM, "position");
    const _color = GL.getAttribLocation(SHADER_PROGRAM, "color");
    const _PMatrix = GL.getUniformLocation(SHADER_PROGRAM, "PMatrix");
    const _VMatrix = GL.getUniformLocation(SHADER_PROGRAM, "VMatrix");
    const _MMatrix = GL.getUniformLocation(SHADER_PROGRAM, "MMatrix");

    GL.enableVertexAttribArray(_position);
    GL.enableVertexAttribArray(_color);
    GL.useProgram(SHADER_PROGRAM);

    // === MATRICES ===
    const PROJECTION_MATRIX = LIBS.get_projection(50, CANVAS.width / CANVAS.height, 1, 100);
    const VIEW_MATRIX = LIBS.get_I4();
    const MODEL_MATRIX = LIBS.get_I4();

    // === BUILD MODEL ===
    const inteleon = createInteleon(GL, SHADER_PROGRAM, _position, _color);
    inteleon.setup();

    // === RENDER LOOP ===
    function animate() {
        mouseUp();
        GL.viewport(0, 0, CANVAS.width, CANVAS.height);
        GL.clear(GL.COLOR_BUFFER_BIT | GL.DEPTH_BUFFER_BIT);

        LIBS.set_I4(VIEW_MATRIX);
        LIBS.translateZ(VIEW_MATRIX, -zoomDistance);
        LIBS.translateY(VIEW_MATRIX, -2);

        LIBS.set_I4(MODEL_MATRIX);
        LIBS.rotateY(MODEL_MATRIX, THETA);
        LIBS.rotateX(MODEL_MATRIX, PHI);

        GL.uniformMatrix4fv(_PMatrix, false, PROJECTION_MATRIX);
        GL.uniformMatrix4fv(_VMatrix, false, VIEW_MATRIX);
        GL.uniformMatrix4fv(_MMatrix, false, MODEL_MATRIX);

        inteleon.render(_MMatrix, MODEL_MATRIX);

        GL.flush();
        requestAnimationFrame(animate);
    }

    animate();
}

window.addEventListener("load", main);