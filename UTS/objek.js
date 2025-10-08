import { MyObject } from "./MyObject.js";
import { generateSphere, generateEllipticParaboloid, generateBSpline, generateFin } from "./main.js";
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

    /*========================= INTELEON ========================= */

    const crestCurve = [
    [0.0, 0.0, 0.0],     // base (top of head)
    [0.05, 0.4, -0.1],   // starts going back
    [0.0, 0.8, -0.25],   // curves outward
    [-0.08, 1.3, -0.45], // crest midpoint (widest)
    [-0.1, 1.8, -0.3],   // upper taper
    [0.0, 2.2, 0.0]      // tip curves back toward front
];
    const crestData = generateFin(crestCurve, 0.08, 60, 16);
    // const headData = generateSphere(0.45, 0.6, 0.5, 20, 20);
    // const crestData = generateBSpline([[0, 0.2, 0], [0, 1.0, -0.3], [0, 1.6, 0]], 0.05, 40, 12);
    // const bodyData = generateEllipticParaboloid(0.4, 0.6, 2, 30, 30);
    // const leftArmData = generateBSpline([[0, 0, 0], [-0.7, -0.8, 0.1]], 0.08, 20, 10);
    // const rightArmData = generateBSpline([[0, 0, 0], [0.7, -0.8, 0.1]], 0.08, 20, 10);
    // const leftLegData = generateBSpline([[0, 0, 0], [-0.3, -1.3, 0]], 0.1, 20, 10);
    // const rightLegData = generateBSpline([[0, 0, 0], [0.3, -1.3, 0]], 0.1, 20, 10);
    // const tailData = generateBSpline([[0, 0, 0], [0, -0.5, 0.3], [0, -1.2, 0.8], [0, -1.8, 0.2]], 0.07, 40, 16);
    // const capeData = generateEllipticParaboloid(1.2, 0.05, 1.2, 20, 20);


    const Crest = new MyObject(GL, SHADER_PROGRAM, _position, _color, crestData.vertices, crestData.faces);
    // const Body = new MyObject(GL, SHADER_PROGRAM, _position, _color, bodyData.vertices, bodyData.faces);
    // const Head = new MyObject(GL, SHADER_PROGRAM, _position, _color, headData.vertices, headData.faces);
    // const Crest = new MyObject(GL, SHADER_PROGRAM, _position, _color, crestData.vertices, crestData.faces);
    // const LeftArm = new MyObject(GL, SHADER_PROGRAM, _position, _color, leftArmData.vertices, leftArmData.faces);
    // const RightArm = new MyObject(GL, SHADER_PROGRAM, _position, _color, rightArmData.vertices, rightArmData.faces);
    // const LeftLeg = new MyObject(GL, SHADER_PROGRAM, _position, _color, leftLegData.vertices, leftLegData.faces);
    // const RightLeg = new MyObject(GL, SHADER_PROGRAM, _position, _color, rightLegData.vertices, rightLegData.faces);
    // const Tail = new MyObject(GL, SHADER_PROGRAM, _position, _color, tailData.vertices, tailData.faces);
    // const Cape = new MyObject(GL, SHADER_PROGRAM, _position, _color, capeData.vertices, capeData.faces);

    // Body.childs.push(Head, Crest, LeftArm, RightArm, LeftLeg, RightLeg, Tail, Cape);


    // Body.setup(); Head.setup(); Crest.setup();
    // LeftArm.setup(); RightArm.setup();
    // LeftLeg.setup(); RightLeg.setup();
    // Tail.setup(); Cape.setup();
    Crest.setup();


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


        LIBS.set_I4(Crest.MOVE_MATRIX);
        LIBS.translateY(Crest.MOVE_MATRIX, 0.2);
        LIBS.translateZ(Crest.MOVE_MATRIX, -0.25);
        LIBS.rotateX(Crest.MOVE_MATRIX, PHI); // lean backward
        LIBS.rotateY(Crest.MOVE_MATRIX, THETA); // gentle tilt


        // Animasi juga bisa dibuat di masing-masing object
        // LIBS.set_I4(Body.MOVE_MATRIX);
        // LIBS.rotateY(Body.MOVE_MATRIX, time * 0.001);

        // // Head
        // LIBS.set_I4(Head.MOVE_MATRIX);
        // LIBS.translateY(Head.MOVE_MATRIX, 2.2);

        // // Crest fin
        // LIBS.set_I4(Crest.MOVE_MATRIX);
        // LIBS.translateY(Crest.MOVE_MATRIX, 2.6);
        // LIBS.translateZ(Crest.MOVE_MATRIX, -0.1);

        // // Arms
        // LIBS.set_I4(LeftArm.MOVE_MATRIX);
        // LIBS.translateX(LeftArm.MOVE_MATRIX, -0.6);
        // LIBS.translateY(LeftArm.MOVE_MATRIX, 1.0);
        // LIBS.rotateZ(LeftArm.MOVE_MATRIX, Math.PI / 8);

        // LIBS.set_I4(RightArm.MOVE_MATRIX);
        // LIBS.translateX(RightArm.MOVE_MATRIX, 0.6);
        // LIBS.translateY(RightArm.MOVE_MATRIX, 1.0);
        // LIBS.rotateZ(RightArm.MOVE_MATRIX, -Math.PI / 8);

        // // Legs
        // LIBS.set_I4(LeftLeg.MOVE_MATRIX);
        // LIBS.translateX(LeftLeg.MOVE_MATRIX, -0.3);
        // LIBS.translateY(LeftLeg.MOVE_MATRIX, -1.8);

        // LIBS.set_I4(RightLeg.MOVE_MATRIX);
        // LIBS.translateX(RightLeg.MOVE_MATRIX, 0.3);
        // LIBS.translateY(RightLeg.MOVE_MATRIX, -1.8);

        // // Tail
        // LIBS.set_I4(Tail.MOVE_MATRIX);
        // LIBS.translateY(Tail.MOVE_MATRIX, -2);
        // LIBS.translateZ(Tail.MOVE_MATRIX, -0.5);
        // LIBS.rotateX(Tail.MOVE_MATRIX, Math.PI / 3);

        // // Cape fins
        // LIBS.set_I4(Cape.MOVE_MATRIX);
        // LIBS.translateY(Cape.MOVE_MATRIX, 0.5);
        // LIBS.translateZ(Cape.MOVE_MATRIX, -0.6);
        // LIBS.rotateX(Cape.MOVE_MATRIX, Math.PI / 6);

        GL.uniformMatrix4fv(_Pmatrix, false, PROJMATRIX);
        GL.uniformMatrix4fv(_Vmatrix, false, VIEWMATRIX);


        Crest.render(_Mmatrix, LIBS.get_I4());
        // Object2.render(_Mmatrix);

        GL.flush();
        window.requestAnimationFrame(animate);
    };
    animate(0);
}
window.addEventListener('load', main);