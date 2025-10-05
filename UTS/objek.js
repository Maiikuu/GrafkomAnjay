import { MyObject } from "./MyObject.js";
import { generateSphere, generateEllipticParaboloid, generateBSpline } from "./main.js";
function main() {
    //GET CANVAS
    var CANVAS = document.getElementById("mycanvas");

    CANVAS.width = window.innerWidth;
    CANVAS.height = window.innerHeight;

    var drag = false;
    var x_prev, y_prev;
    var mouseDown = function (e) {
        drag = true;
        x_prev = e.pageX, y_prev = e.pageY;
        e.preventDefault();
        return false;
    };
    var mouseUp = function (e) {
        drag = false;
    };
    var mouseMove = function (e) {
        if (!drag) return false;
        dX = (e.pageX - x_prev) * 2 * Math.PI / CANVAS.width;
        dY = (e.pageY - y_prev) * 2 * Math.PI / CANVAS.height;
        THETA += dX;
        PHI += dY;
        x_prev = e.pageX, y_prev = e.pageY;
        e.preventDefault();
    };

    CANVAS.addEventListener("mousedown", mouseDown, false);
    CANVAS.addEventListener("mouseup", mouseUp, false);
    CANVAS.addEventListener("mouseout", mouseUp, false);
    CANVAS.addEventListener("mousemove", mouseMove, false);

    var keyDown = function (e) {
        if (e.key === 'w') {
            dY -= SPEED;
        }
        else if (e.key === 'a') {
            dX -= SPEED;
        }
        else if (e.key === 's') {
            dY += SPEED;
        }
        else if (e.key === 'd') {
            dX += SPEED;
        }
    }
    window.addEventListener("keydown", keyDown, false);


    //INIT WEBGL
    /** @type {WebGLRenderingContext} */
    var GL;
    try {
        GL = CANVAS.getContext("webgl", { antialias: true });
    } catch (e) {
        alert("WebGL context cannot be initialized");
        return false;
    }

    //INIT SHADERS: berupa teks
    var shader_vertex_source = `
        attribute vec3 position;
        uniform mat4 Pmatrix, Vmatrix, Mmatrix;
        attribute vec3 color;  
        varying vec3 vColor; 
       
        void main(void) {
            gl_Position = Pmatrix * Vmatrix * Mmatrix * vec4(position, 1.);
            vColor = color;
        }`;

    var shader_fragment_source = `
        precision mediump float;
        varying vec3 vColor;
       
        void main(void) {
            gl_FragColor = vec4(vColor, 1.);
        }`;


    //SHADER COMPILER: menjadikan object
    var compile_shader = function (source, type, typeString) {
        var shader = GL.createShader(type);
        GL.shaderSource(shader, source);
        GL.compileShader(shader);
        if (!GL.getShaderParameter(shader, GL.COMPILE_STATUS)) {
            alert("ERROR IN " + typeString + " SHADER: " + GL.getShaderInfoLog(shader));
            return false;
        }
        return shader;
    };
    var shader_vertex = compile_shader(shader_vertex_source, GL.VERTEX_SHADER, "VERTEX");
    var shader_fragment = compile_shader(shader_fragment_source, GL.FRAGMENT_SHADER, "FRAGMENT");

    //PROGRAM SHADER: mengaktifkan shader
    var SHADER_PROGRAM = GL.createProgram();
    GL.attachShader(SHADER_PROGRAM, shader_vertex);
    GL.attachShader(SHADER_PROGRAM, shader_fragment);

    GL.linkProgram(SHADER_PROGRAM);

    var _position = GL.getAttribLocation(SHADER_PROGRAM, "position");
    GL.enableVertexAttribArray(_position);

    var _color = GL.getAttribLocation(SHADER_PROGRAM, "color");
    GL.enableVertexAttribArray(_color);


    var _Pmatrix = GL.getUniformLocation(SHADER_PROGRAM, "Pmatrix");
    var _Vmatrix = GL.getUniformLocation(SHADER_PROGRAM, "Vmatrix");
    var _Mmatrix = GL.getUniformLocation(SHADER_PROGRAM, "Mmatrix");

    GL.useProgram(SHADER_PROGRAM);

    /*========================= OBJECTS ========================= */
    var sphereData = generateSphere(1, 1.4, .2, 10, 10);
    var ctrl = [
        [0, 0, 0],
        [1, 2, 0],
        [3, 3, 1],
        [5, 2, 1]
    ];
    var tubeData = generateBSpline(ctrl, 0.2, 50, 20);
    var paraboloidData = generateEllipticParaboloid(.2, 1, 2, 50, 50);

    var Object1 = new MyObject(GL, SHADER_PROGRAM, _position, _color);
    var Object2 = new MyObject(GL, SHADER_PROGRAM, _position, _color);
    var Object3 = new MyObject(GL, SHADER_PROGRAM, _position, _color);
    var Object4 = new MyObject(GL, SHADER_PROGRAM, _position, _color);
    var Object5 = new MyObject(
        GL, SHADER_PROGRAM,
        _position, _color,
        sphereData.vertices, sphereData.faces);
    var Object6 = new MyObject(
        GL, SHADER_PROGRAM,
        _position, _color,
        paraboloidData.vertices, paraboloidData.faces);
    var tube = new MyObject(GL, SHADER_PROGRAM, _position, _color, 
                          tubeData.vertices, tubeData.faces);

    Object1.childs.push(Object2);
    Object2.childs.push(Object5);
    Object5.childs.push(Object6);
    Object6.childs.push(tube);

    Object1.setup();
    // Object2.setup();
    // Object5.setup();


    var PROJMATRIX = LIBS.get_projection(40, CANVAS.width / CANVAS.height, 1, 100);
    var MOVEMATRIX = LIBS.get_I4();
    var VIEWMATRIX = LIBS.get_I4();


    LIBS.translateZ(VIEWMATRIX, -10);

    var THETA = 0, PHI = 0;
    var FRICTION = 0.15;
    var dX = 0, dY = 0;
    var SPEED = 0.05;

    GL.enable(GL.DEPTH_TEST);
    GL.depthFunc(GL.LEQUAL);
    GL.clearColor(0.0, 0.0, 0.0, 0.0);
    GL.clearDepth(1.0);

    var time_prev = 0;

    var animate = function (time) {
        GL.viewport(0, 0, CANVAS.width, CANVAS.height);
        GL.clear(GL.COLOR_BUFFER_BIT | GL.DEPTH_BUFFER_BIT);

        var dt = time - time_prev;
        time_prev = time;

        if (!drag) {
            dX *= (1 - FRICTION), dY *= (1 - FRICTION);
            THETA += dX, PHI += dY;
        }


        // Animasi juga bisa dibuat di masing-masing object
        LIBS.set_I4(Object1.MOVE_MATRIX);
        LIBS.translateY(Object1.MOVE_MATRIX, -2);
        LIBS.translateY(Object1.MOVE_MATRIX, -PHI);
        LIBS.translateX(Object1.MOVE_MATRIX, THETA);

        LIBS.set_I4(Object2.MOVE_MATRIX);
        LIBS.translateX(Object2.MOVE_MATRIX, 2.5);
        LIBS.rotateY(Object2.MOVE_MATRIX, time * 0.001);
        LIBS.rotateX(Object2.MOVE_MATRIX, time * 0.001);

        LIBS.set_I4(Object5.MOVE_MATRIX);
        LIBS.translateY(Object5.MOVE_MATRIX, 2.5);
        LIBS.rotateZ(Object5.MOVE_MATRIX, time * 0.001);
        LIBS.rotateX(Object5.MOVE_MATRIX, time * 0.001);

        LIBS.set_I4(Object6.MOVE_MATRIX);
        LIBS.translateY(Object6.MOVE_MATRIX, 2.5);
        LIBS.rotateZ(Object6.MOVE_MATRIX, time * 0.001);
        LIBS.rotateX(Object6.MOVE_MATRIX, time * 0.001);

        LIBS.set_I4(tube.MOVE_MATRIX);
        LIBS.rotateY(tube.MOVE_MATRIX, time * 0.001);
        LIBS.rotateX(tube.MOVE_MATRIX, time * 0.001);


        GL.uniformMatrix4fv(_Pmatrix, false, PROJMATRIX);
        GL.uniformMatrix4fv(_Vmatrix, false, VIEWMATRIX);


        Object1.render(_Mmatrix, LIBS.get_I4());
        // Object2.render(_Mmatrix);

        GL.flush();
        window.requestAnimationFrame(animate);
    };
    animate(0);
}
window.addEventListener('load', main);