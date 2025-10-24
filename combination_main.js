import { createEvolutionScene } from "./evolution_scene.js";

function main() {
    const CANVAS = document.getElementById("mycanvas");
    CANVAS.width = window.innerWidth;
    CANVAS.height = window.innerHeight;

    const GL = CANVAS.getContext("webgl", { antialias: true });
    if (!GL) {
        alert("WebGL context failed to initialize");
        return;
    }

    const vertexShader = `
        attribute vec3 position;
        attribute vec3 color;
        uniform mat4 Pmatrix;
        uniform mat4 Vmatrix;
        uniform mat4 Mmatrix;
        varying vec3 vColor;
        void main() {
            gl_Position = Pmatrix*Vmatrix*Mmatrix*vec4(position, 1.);
            vColor = color;
        }`;

    const fragmentShader = `
        precision mediump float;
        varying vec3 vColor;
        void main() {
            gl_FragColor = vec4(vColor, 1.);
        }`;

    const _shader = GL.createShader;
    const vertShader = _shader(GL, vertexShader, "vertex");
    const fragShader = _shader(GL, fragmentShader, "fragment");

    const SHADER_PROGRAM = GL.createProgram();
    GL.attachShader(SHADER_PROGRAM, vertShader);
    GL.attachShader(SHADER_PROGRAM, fragShader);
    GL.linkProgram(SHADER_PROGRAM);

    const _position = GL.getAttribLocation(SHADER_PROGRAM, "position");
    const _color = GL.getAttribLocation(SHADER_PROGRAM, "color");
    
    GL.enableVertexAttribArray(_position);
    GL.enableVertexAttribArray(_color);
    GL.useProgram(SHADER_PROGRAM);

    const evolutionScene = createEvolutionScene(GL, SHADER_PROGRAM, _position, _color);
    evolutionScene.setup();

    // Camera and view setup
    var PROJMATRIX = LIBS.get_projection(40, CANVAS.width/CANVAS.height, 1, 100);
    var VIEWMATRIX = LIBS.get_I4();
    LIBS.translateZ(VIEWMATRIX, -20);

    // Animation variables
    var swingTime = 0;
    var drag = false;
    var x_prev, y_prev;
    
    // Mouse controls
    CANVAS.addEventListener("mousedown", e => {
        drag = true;
        x_prev = e.clientX;
        y_prev = e.clientY;
    });

    CANVAS.addEventListener("mouseup", () => drag = false);
    CANVAS.addEventListener("mouseout", () => drag = false);

    CANVAS.addEventListener("mousemove", e => {
        if (drag) {
            const dX = (e.clientX - x_prev) * 0.02;
            const dY = (e.clientY - y_prev) * 0.02;
            LIBS.rotateY(evolutionScene.MOVE_MATRIX, dX);
            LIBS.rotateX(evolutionScene.MOVE_MATRIX, dY);
            x_prev = e.clientX;
            y_prev = e.clientY;
        }
    });

    function animate(time) {
        swingTime = time * 0.001;
        
        GL.clearColor(0.0, 0.0, 0.0, 1.0);
        GL.clear(GL.COLOR_BUFFER_BIT | GL.DEPTH_BUFFER_BIT);
        GL.enable(GL.DEPTH_TEST);
        GL.frontFace(GL.CCW);
        GL.cullFace(GL.BACK);

        evolutionScene.draw(time, PROJMATRIX, VIEWMATRIX);
        requestAnimationFrame(animate);
    }

    animate(0);
}

window.addEventListener("load", main);