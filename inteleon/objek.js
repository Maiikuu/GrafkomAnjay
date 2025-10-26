import { MyObject } from "./MyObject.js";
import {
    createCylinder, createTrapezoid,
    createHyperboloid1Sheet,
    createEllipticParaboloid,
    createStreamlinedHead,
    createFin,
    createBSpline,
    createCape,
    createHand
} from "./main.js";

function main() {
    //GET CANVAS
    var CANVAS = document.getElementById("mycanvas");

    CANVAS.width = window.innerWidth;
    CANVAS.height = window.innerHeight;

    var swingTime = 0
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
    // === BODY ===
    const { vertices: bodVerts, faces: bodFaces } = createTrapezoid(
        1.6, 0.6, 3.8,   
        0.6, 0.4, 9.0,   
        18,
        [0.0, 0.0, 0.4]  // dark blue color
    );
    const Body = new MyObject(GL, SHADER_PROGRAM, _position, _color, bodVerts, bodFaces);
    LIBS.set_I4(Body.MOVE_MATRIX);
    LIBS.scaleY(Body.MOVE_MATRIX, 1.4); // make it taller
    LIBS.translateY(Body.MOVE_MATRIX, -3.0); // lower to sit under neck

    // === NECK ===
    const { vertices: hypVerts, faces: hypFaces } = createHyperboloid1Sheet(
        0.4, 0.4, 0.35, 3, 32, 32,   
        0.4, 1.4,
        [0.0, 0.8, 0.8]  // cyan color
    );
    const Neck = new MyObject(GL, SHADER_PROGRAM, _position, _color, hypVerts, hypFaces);
    LIBS.set_I4(Neck.MOVE_MATRIX);
    LIBS.scaleY(Neck.MOVE_MATRIX, 1 / 1.4);
    LIBS.scaleX(Neck.MOVE_MATRIX, 0.26);
    LIBS.scaleY(Neck.MOVE_MATRIX, 0.8);
    LIBS.scaleZ(Neck.MOVE_MATRIX, 0.26);
    LIBS.translateY(Neck.MOVE_MATRIX, 2.2); // place above body

    // === HEAD ===
    const { vertices: headVerts, faces: headFaces } = createStreamlinedHead(
    0.68, 0.89, 1.1,   
    48, 32,
    [0.0, 0.8, 0.8], // front color (cyan)
    [0.0, 0.8, 0.8]  // back color (cyan)
);
    const Head = new MyObject(GL, SHADER_PROGRAM, _position, _color, headVerts, headFaces);
    // === Head placement ===
    LIBS.set_I4(Head.MOVE_MATRIX);
    LIBS.scaleX(Head.MOVE_MATRIX, 1 / 0.26); // cancel neck scale X
    LIBS.scaleY(Head.MOVE_MATRIX, 1 / 0.8); // cancel neck scale Y
    LIBS.scaleZ(Head.MOVE_MATRIX, 1 / 0.26); // cancel neck scale Z
    LIBS.translateY(Head.MOVE_MATRIX, 1.6); // lift head above neck
    LIBS.rotateX(Head.MOVE_MATRIX, Math.PI / 360); // slight tilt
    LIBS.translateZ(Head.MOVE_MATRIX, 2.0); // move forward

    const { vertices: eyeVerts, faces: eyeFaces } = createEllipticParaboloid(
    0.25, 0.35, 0.3, 24, 24,
    [1.0, 1.0, 0.0]  // yellow color - add this parameter
);
    const LeftFin = new MyObject(GL, SHADER_PROGRAM, _position, _color, eyeVerts, eyeFaces);
    const RightFin = new MyObject(GL, SHADER_PROGRAM, _position, _color, eyeVerts, eyeFaces);

    // --- LEFT eye ---
    LIBS.set_I4(LeftFin.MOVE_MATRIX);
    LIBS.scaleX(LeftFin.MOVE_MATRIX, 1.4);
    LIBS.scaleY(LeftFin.MOVE_MATRIX, 1.6);
    LIBS.scaleZ(LeftFin.MOVE_MATRIX, 0.6);
    LIBS.rotateY(LeftFin.MOVE_MATRIX, Math.PI / 2.6);    // tilt sideways
    LIBS.rotateX(LeftFin.MOVE_MATRIX, Math.PI / 1.5);    // curve backward
    LIBS.translateX(LeftFin.MOVE_MATRIX, -0.7);
    LIBS.translateY(LeftFin.MOVE_MATRIX, 0.1);
    LIBS.translateZ(LeftFin.MOVE_MATRIX, -0.1);

    // --- RIGHT eye ---
    LIBS.set_I4(RightFin.MOVE_MATRIX);
    LIBS.scaleX(RightFin.MOVE_MATRIX, 1.4);
    LIBS.scaleY(RightFin.MOVE_MATRIX, 1.6);
    LIBS.scaleZ(RightFin.MOVE_MATRIX, 0.6);
    LIBS.rotateY(RightFin.MOVE_MATRIX, -Math.PI / 2.6);   // mirror tilt
    LIBS.rotateX(RightFin.MOVE_MATRIX, Math.PI / 1.5);
    LIBS.translateX(RightFin.MOVE_MATRIX, 0.7);
    LIBS.translateY(RightFin.MOVE_MATRIX, 0.1);
    LIBS.translateZ(RightFin.MOVE_MATRIX, -0.1);

    const { vertices: capeVerts, faces: capeFaces } = createCape(2.0, 3.0, 0.1, 0.7, 28);
    const Cape = new MyObject(GL, SHADER_PROGRAM, _position, _color, capeVerts, capeFaces);
    LIBS.set_I4(Cape.MOVE_MATRIX);
    LIBS.translateY(Cape.MOVE_MATRIX, -5.0);
    LIBS.translateZ(Cape.MOVE_MATRIX, -1.3);
    LIBS.rotateX(Cape.MOVE_MATRIX, Math.PI / 4);

    // === FIN ===
    const { vertices: finVerts, faces: finFaces } = createFin(0.6, 2.0, 0.5, 0.5, 24);
    const Fin1 = new MyObject(GL, SHADER_PROGRAM, _position, _color, finVerts, finFaces);
    const Fin2 = new MyObject(GL, SHADER_PROGRAM, _position, _color, finVerts, finFaces);
    LIBS.set_I4(Fin1.MOVE_MATRIX);
    LIBS.set_I4(Fin2.MOVE_MATRIX);

    // FIn
    LIBS.scaleX(Fin1.MOVE_MATRIX, 0.3);
    LIBS.scaleY(Fin1.MOVE_MATRIX, 0.7);
    LIBS.scaleZ(Fin1.MOVE_MATRIX, 0.6);
    LIBS.scaleX(Fin2.MOVE_MATRIX, 0.4);
    LIBS.scaleY(Fin2.MOVE_MATRIX, 0.7);
    LIBS.scaleX(Fin2.MOVE_MATRIX, 1 / 0.3);
    LIBS.rotateX(Fin2.MOVE_MATRIX, -Math.PI / 2);
    LIBS.rotateY(Fin2.MOVE_MATRIX, -Math.PI);
    LIBS.rotateZ(Fin2.MOVE_MATRIX, Math.PI);
    LIBS.translateY(Fin2.MOVE_MATRIX, 0.0); // lower second fin
    LIBS.translateZ(Fin2.MOVE_MATRIX, -0.2); // move second fin forward
    // Attach to head (start near top-back)
    LIBS.translateY(Fin1.MOVE_MATRIX, 0.6);  // raise slightly above center of head
    LIBS.translateZ(Fin1.MOVE_MATRIX, 0.2); // shift toward back of head
    LIBS.rotateX(Fin1.MOVE_MATRIX, Math.PI / 4); // curve backward nicely
    LIBS.rotateY(Fin1.MOVE_MATRIX, Math.PI);

    //Yellow Fin
    const { vertices: backFinVerts, faces: backFinFaces } = createEllipticParaboloid(
    0.1, 0.7, 1.2, 20, 20,
    [1.0, 1.0, 0.0]  // yellow color - add this parameter
);
    const BackFin = new MyObject(GL, SHADER_PROGRAM, _position, _color, backFinVerts, backFinFaces);
    const BackFin2 = new MyObject(GL, SHADER_PROGRAM, _position, _color, backFinVerts, backFinFaces);
    LIBS.set_I4(BackFin.MOVE_MATRIX);
    LIBS.translateY(BackFin.MOVE_MATRIX, 1.8);
    LIBS.translateZ(BackFin.MOVE_MATRIX, -0.6);
    LIBS.rotateX(BackFin.MOVE_MATRIX, 1.62);
    LIBS.rotateY(BackFin.MOVE_MATRIX, Math.PI);
    LIBS.scaleZ(BackFin.MOVE_MATRIX, 3.5);
    LIBS.scaleY(BackFin.MOVE_MATRIX, 6.8);

    // ARM — left and right
    const { vertices: armVerts, faces: armFaces } = createCylinder(
        0.18, 2.4, 32,
        [0.0, 0.8, 0.8]  // cyan color
    );
    const LeftArm = new MyObject(GL, SHADER_PROGRAM, _position, _color, armVerts, armFaces);
    const RightArm = new MyObject(GL, SHADER_PROGRAM, _position, _color, armVerts, armFaces);
    // Left Arm transform
    LIBS.set_I4(LeftArm.MOVE_MATRIX);
    LIBS.scaleY(LeftArm.MOVE_MATRIX, 1 / 1.4);
    LIBS.translateY(LeftArm.MOVE_MATRIX, 1 / -3.0);
    LIBS.rotateZ(LeftArm.MOVE_MATRIX, Math.PI / 2);   // Rotate to point outward
    LIBS.translateY(LeftArm.MOVE_MATRIX, 1.6);       // Position slightly down
    LIBS.translateX(LeftArm.MOVE_MATRIX, -1.2);       // Move left
    LIBS.scaleY(LeftArm.MOVE_MATRIX, 0.6);            // Adjust arm length

    // Right Arm transform
    LIBS.set_I4(RightArm.MOVE_MATRIX);
    LIBS.scaleY(RightArm.MOVE_MATRIX, 1 / 1.4);
    LIBS.translateY(RightArm.MOVE_MATRIX, 1 / -3.0);
    LIBS.rotateZ(RightArm.MOVE_MATRIX, -Math.PI / 2);
    LIBS.translateY(RightArm.MOVE_MATRIX, 1.6);
    LIBS.translateX(RightArm.MOVE_MATRIX, 1.2);
    LIBS.scaleY(RightArm.MOVE_MATRIX, 0.6);

    // create hands
    const { vertices: handVerts, faces: handFaces } = createHand(
        0.6, 0.08, 8,   
        4,              
        0.34, 0.06, 0.12, 10, 8,
        [0.0, 0.0, 0.0]  // black color
    );
    const LeftHand = new MyObject(GL, SHADER_PROGRAM, _position, _color, handVerts, handFaces);
    const RightHand = new MyObject(GL, SHADER_PROGRAM, _position, _color, handVerts, handFaces);

    // position left hand at end of left arm (tweak values)
    LIBS.set_I4(LeftHand.MOVE_MATRIX);
    LIBS.translateY(LeftHand.MOVE_MATRIX, 1.2);   // adjust as needed
    LIBS.translateX(LeftHand.MOVE_MATRIX, 0);
    // LIBS.translateZ(LeftHand.MOVE_MATRIX, 0.2);
    // LIBS.rotateZ(LeftHand.MOVE_MATRIX, Math.PI / 2);

    // right hand (mirror)
    LIBS.set_I4(RightHand.MOVE_MATRIX);
    LIBS.translateY(RightHand.MOVE_MATRIX, 1.2);
    LIBS.translateX(RightHand.MOVE_MATRIX, 0);
    // LIBS.translateZ(RightHand.MOVE_MATRIX, 0.2);
    // LIBS.rotateZ(RightHand.MOVE_MATRIX, -Math.PI / 2);


    // LEG — left and right
    const { vertices: legVerts, faces: legFaces } = createCylinder(
        0.2, 3, 32,
        [0.0, 0.0, 0.0]  // black color
    ); // radius, height, segments
    const LeftLeg = new MyObject(GL, SHADER_PROGRAM, _position, _color, legVerts, legFaces);
    const RightLeg = new MyObject(GL, SHADER_PROGRAM, _position, _color, legVerts, legFaces);

    // Position legs under the body
    LIBS.set_I4(LeftLeg.MOVE_MATRIX);
    LIBS.scaleY(LeftLeg.MOVE_MATRIX, 1 / 1.4);
    LIBS.translateY(LeftLeg.MOVE_MATRIX, 1 / -3.0);
    LIBS.translateX(LeftLeg.MOVE_MATRIX, -0.4);
    LIBS.translateY(LeftLeg.MOVE_MATRIX, -3.2);

    LIBS.set_I4(RightLeg.MOVE_MATRIX);
    LIBS.scaleY(RightLeg.MOVE_MATRIX, 1 / 1.4);
    LIBS.translateY(RightLeg.MOVE_MATRIX, 1 / -3.0);
    LIBS.translateX(RightLeg.MOVE_MATRIX, 0.4);
    LIBS.translateY(RightLeg.MOVE_MATRIX, -3.2);


    // === TAIL ===
    const tailControlPoints = [
        [0.0, 0.0, 0.0],    // base at body
        [0.0, -0.2, -0.8],  // gentle downward curve
        [0.0, -0.4, -1.6],  // continue curving backward
        [0.1, -0.2, -2.4],  // slight rightward bend
        [0.3, 0.0, -3.2],   // begin smooth horizontal curve
        [0.5, 0.3, -3.8],   // smooth turn outward
        [0.4, 0.6, -4.4],   // gentle upward bend
        [0.2, 0.8, -4.9],   // curve upward tip
        [-0.1, 1.0, -5.0],  // taper slightly inward
        [-0.3, 0.9, -4.7],  // soft return arc
        [-0.4, 0.7, -4.3],  // flow inward
        [-0.2, 0.6, -4.0]   // final graceful tip
    ];

    // Create the tail directly with control points
    const { vertices: tailVerts, faces: tailFaces } = createBSpline(
        tailControlPoints,  // control points
        0.4,              // base radius
        0.6,               // taper (smaller number = more taper)
        32                 // segments around the tube
    );

    const Tail = new MyObject(GL, SHADER_PROGRAM, _position, _color, tailVerts, tailFaces);

    LIBS.set_I4(Tail.MOVE_MATRIX);
    LIBS.scaleY(Tail.MOVE_MATRIX, 1 / 1.4); // make it taller
    LIBS.translateY(Tail.MOVE_MATRIX, 1 / -3.0);
    LIBS.translateZ(Tail.MOVE_MATRIX, -0.5); // move back from body
    LIBS.translateY(Tail.MOVE_MATRIX, -1.0);  // attach at body bottom
    LIBS.rotateX(Tail.MOVE_MATRIX, Math.PI / 8); // slight upward tilt

    // === FEET ===
    const { vertices: footVerts, faces: footFaces } = createTrapezoid(
        0.4, 0.4, 1.2, 0.4, 0.4, 0.4, 20,
        [0.0, 0.0, 0.0]  // black color
    );
    const LeftFoot = new MyObject(GL, SHADER_PROGRAM, _position, _color, footVerts, footFaces);
    const RightFoot = new MyObject(GL, SHADER_PROGRAM, _position, _color, footVerts, footFaces);

    // Position feet at the bottom of legs
    LIBS.set_I4(LeftFoot.MOVE_MATRIX);
    LIBS.translateX(LeftLeg.MOVE_MATRIX, 1 / 0.4);
    LIBS.translateY(LeftLeg.MOVE_MATRIX, 1 / -2.2);
    LIBS.translateY(LeftFoot.MOVE_MATRIX, -1.4);  // move to bottom of leg
    LIBS.translateX(LeftFoot.MOVE_MATRIX, -0.3);  // match leg position
    LIBS.rotateZ(LeftFoot.MOVE_MATRIX, -Math.PI / 2);

    LIBS.set_I4(RightFoot.MOVE_MATRIX);
    LIBS.translateX(RightLeg.MOVE_MATRIX, 1 / 0.4);
    LIBS.translateY(RightLeg.MOVE_MATRIX, 1 / -2.2);
    LIBS.translateY(RightFoot.MOVE_MATRIX, -1.4);
    LIBS.translateX(RightFoot.MOVE_MATRIX, -0.3);
    LIBS.rotateX(RightFoot.MOVE_MATRIX, Math.PI);
    LIBS.rotateZ(RightFoot.MOVE_MATRIX, Math.PI / 2);

    // attach hierarchy
    Neck.childs.push(Head);
    Head.childs.push(LeftFin);
    Head.childs.push(RightFin);
    Body.childs.push(Neck);
    Body.childs.push(LeftArm);
    Body.childs.push(RightArm);
    Body.childs.push(LeftLeg);
    Body.childs.push(RightLeg);
    Head.childs.push(Fin1);
    Fin1.childs.push(Fin2);
    Head.childs.push(Cape);
    Body.childs.push(Tail);
    Head.childs.push(BackFin);
    LeftLeg.childs.push(LeftFoot);
    RightLeg.childs.push(RightFoot);
    LeftArm.childs.push(LeftHand);
    RightArm.childs.push(RightHand);

    Head.setup();
    Body.setup();
    Neck.setup();
    Fin1.setup();

    var PROJMATRIX = LIBS.get_projection(40, CANVAS.width / CANVAS.height, 1, 100);
    var MOVEMATRIX = LIBS.get_I4();
    var VIEWMATRIX = LIBS.get_I4();


    LIBS.translateZ(VIEWMATRIX, -20);

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
        swingTime += dt * 0.005; // adjust 0.005 for speed
        const swingAngle = Math.sin(swingTime) * 0.3; // 0.6 rad ~ 34°

        // Animasi juga bisa dibuat di masing-masing object
        // LIBS.rotateY(Object2.MOVE_MATRIX, time * 0.001); //horizontal rotate
        // LIBS.rotateX(Object2.MOVE_MATRIX, time * 0.001); //wheel like rotate
        // LIBS.rotateZ(Object2.MOVE_MATRIX, time * 0.001); //tilt rotate

        let modelTransform = LIBS.get_I4();
        LIBS.rotateY(modelTransform, THETA);
        LIBS.rotateX(modelTransform, PHI);
        LIBS.rotateX(RightArm.MOVE_MATRIX, THETA);// initial tilt


        // === LEFT ARM SWING ===
        LIBS.set_I4(LeftArm.MOVE_MATRIX);

        // Base transforms (orientation and scale)
        LIBS.rotateZ(LeftArm.MOVE_MATRIX, Math.PI / 2); // orient sideways
        LIBS.scaleY(LeftArm.MOVE_MATRIX, 0.6);          // shorten arm

        // Pivot correction — cylinder’s center → move shoulder to origin
        const armHeight = 2.4 * 0.6; // scaled length
        const shoulderOffset = armHeight / 2;

        // Move shoulder to origin
        LIBS.translateX(LeftArm.MOVE_MATRIX, shoulderOffset);
        // Swing around shoulder
        LIBS.rotateZ(LeftArm.MOVE_MATRIX, swingAngle);
        // Move back to original
        LIBS.translateX(LeftArm.MOVE_MATRIX, -shoulderOffset);

        // Now position relative to body
        LIBS.scaleY(LeftArm.MOVE_MATRIX, 1 / 1.4);
        LIBS.translateY(LeftArm.MOVE_MATRIX, 1.2);
        LIBS.translateX(LeftArm.MOVE_MATRIX, -1.2);

        // === RIGHT ARM SWING ===
        LIBS.set_I4(RightArm.MOVE_MATRIX);

        LIBS.rotateZ(RightArm.MOVE_MATRIX, -Math.PI / 2);
        LIBS.scaleY(RightArm.MOVE_MATRIX, 0.6);

        LIBS.translateX(RightArm.MOVE_MATRIX, -shoulderOffset);
        LIBS.rotateZ(RightArm.MOVE_MATRIX, -swingAngle);
        LIBS.translateX(RightArm.MOVE_MATRIX, shoulderOffset);

        LIBS.scaleY(RightArm.MOVE_MATRIX, 1 / 1.4);
        LIBS.translateY(RightArm.MOVE_MATRIX, 1.2);
        LIBS.translateX(RightArm.MOVE_MATRIX, 1.2);

        // === LEG SWING ===
        const legSwingAngle = -swingAngle; // opposite to arm phase
        const legLength = 1.8;             // from createCylinder(0.2, 1.8)
        const legScale = 1.0;              // current leg scale
        const legHeight = legLength * legScale;
        const hipOffset = legHeight / 2;

        // === LEFT LEG ===
        LIBS.set_I4(LeftLeg.MOVE_MATRIX);
        LIBS.rotateY(LeftLeg.MOVE_MATRIX, Math.PI / 2); // make legs point downward
        LIBS.scaleY(LeftLeg.MOVE_MATRIX, legScale);

        // move pivot to hip
        LIBS.translateX(LeftLeg.MOVE_MATRIX, hipOffset);
        LIBS.rotateX(LeftLeg.MOVE_MATRIX, legSwingAngle);
        LIBS.translateX(LeftLeg.MOVE_MATRIX, -hipOffset);

        // move into position under body
        LIBS.scaleY(LeftLeg.MOVE_MATRIX, 1 / 1.4);
        LIBS.translateY(LeftLeg.MOVE_MATRIX, -2.4);
        LIBS.translateX(LeftLeg.MOVE_MATRIX, -0.4);

        // === RIGHT LEG ===
        LIBS.set_I4(RightLeg.MOVE_MATRIX);
        LIBS.rotateY(RightLeg.MOVE_MATRIX, Math.PI / 2);
        LIBS.scaleY(RightLeg.MOVE_MATRIX, legScale);

        LIBS.translateX(RightLeg.MOVE_MATRIX, hipOffset);
        LIBS.rotateX(RightLeg.MOVE_MATRIX, -legSwingAngle);
        LIBS.translateX(RightLeg.MOVE_MATRIX, -hipOffset);

        LIBS.scaleY(RightLeg.MOVE_MATRIX, 1 / 1.4);
        LIBS.translateY(RightLeg.MOVE_MATRIX, -2.4);
        LIBS.translateX(RightLeg.MOVE_MATRIX, 0.4);


        GL.uniformMatrix4fv(_Pmatrix, false, PROJMATRIX);
        GL.uniformMatrix4fv(_Vmatrix, false, VIEWMATRIX);

        // Neck.render(_Mmatrix, neckTransform);
        Body.render(_Mmatrix, modelTransform);

        GL.flush();
        window.requestAnimationFrame(animate);
    };
    animate(0);
}
window.addEventListener('load', main);