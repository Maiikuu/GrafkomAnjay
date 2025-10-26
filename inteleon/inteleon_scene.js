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

export function createInteleon(GL, SHADER_PROGRAM, _position, _color) {
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
    LIBS.translateZ(Body.MOVE_MATRIX, -5.5); // move forward slightly

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
    LIBS.translateY(BackFin.MOVE_MATRIX, 1.9);
    LIBS.translateZ(BackFin.MOVE_MATRIX, -0.8);
    LIBS.rotateX(BackFin.MOVE_MATRIX, 1.8);
    LIBS.rotateY(BackFin.MOVE_MATRIX, Math.PI);
    LIBS.scaleZ(BackFin.MOVE_MATRIX, 1.5);
    LIBS.scaleY(BackFin.MOVE_MATRIX, 1.2);

    // ARM — left and right
    const { vertices: armVerts, faces: armFaces } = createCylinder(
        0.18, 2.6, 32,
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
    LIBS.translateX(LeftArm.MOVE_MATRIX, -1.0);       // Move left
    LIBS.scaleY(LeftArm.MOVE_MATRIX, 0.6);            // Adjust arm length

    // Right Arm transform
    LIBS.set_I4(RightArm.MOVE_MATRIX);
    LIBS.scaleY(RightArm.MOVE_MATRIX, 1 / 1.4);
    LIBS.translateY(RightArm.MOVE_MATRIX, 1 / -3.0);
    LIBS.rotateZ(RightArm.MOVE_MATRIX, -Math.PI / 2);
    LIBS.translateY(RightArm.MOVE_MATRIX, 1.6);
    LIBS.translateX(RightArm.MOVE_MATRIX, 1.0);
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
    LIBS.translateX(LeftLeg.MOVE_MATRIX, -2.9);
    LIBS.translateY(LeftLeg.MOVE_MATRIX, -2.2);

    LIBS.set_I4(RightLeg.MOVE_MATRIX);
    LIBS.scaleY(RightLeg.MOVE_MATRIX, 1 / 1.4);
    LIBS.translateY(RightLeg.MOVE_MATRIX, 1 / -3.0);
    LIBS.translateX(RightLeg.MOVE_MATRIX, -2.2);
    LIBS.translateY(RightLeg.MOVE_MATRIX, -2.2);


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
    LIBS.translateX(RightFoot.MOVE_MATRIX, 0.3);
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
    LeftFin.setup();
    RightFin.setup();
    Cape.setup();
    BackFin.setup();
    BackFin2.setup();
    LeftArm.setup();
    RightArm.setup();
    LeftHand.setup();
    RightHand.setup();
    LeftLeg.setup();
    RightLeg.setup();
    LeftFoot.setup();
    RightFoot.setup();
    Tail.setup();

    return Body;
}