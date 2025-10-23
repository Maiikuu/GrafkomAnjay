import { generateSphere, generateEllipsoid, generateBSplineTube } from "./main.js";
import { MyObject } from "./MyObject.js";

export function createSobble(GL, SHADER_PROGRAM, _position, _color) {
    // Warna Sobble - lebih gelap dengan kontras lebih baik
    const SOBBLE_BLUE = [0.35, 0.65, 0.8];      // Body biru
    const SOBBLE_BLUE_DARK = [0.25, 0.55, 0.7]; // Untuk variasi ekor
    const BELLY_LIGHT = [0.65, 0.8, 0.85];
    const DARK_BLUE = [0.08, 0.15, 0.4];
    const YELLOW_FIN = [0.85, 0.75, 0.0];
    const PINK_MOUTH = [0.85, 0.45, 0.45];
    const WHITE = [1.0, 1.0, 1.0];

    const allParts = [];

    // === HEAD ===
    const headData = generateEllipsoid(2.375, 2.185, 1.995, 32, 16, SOBBLE_BLUE);
    const head = new MyObject(GL, SHADER_PROGRAM, _position, _color, headData);
    head.pos = [0, 2.8, 0.5];
    allParts.push(head);

    // === FIN SAIL (YELLOW - BEHIND) ===
    const finSailData = generateEllipsoid(0.15, 4.15, 1.8, 24, 32, YELLOW_FIN);
    const finSail = new MyObject(GL, SHADER_PROGRAM, _position, _color, finSailData);
    finSail.pos = [0, 5.625, -0.2];
    allParts.push(finSail);

    // === FIN BORDER (DARK BLUE - FRONT/BATANG) ===
    const finBorderData = generateEllipsoid(0.12, 3.5, 1.2, 24, 32, DARK_BLUE);
    const finBorder = new MyObject(GL, SHADER_PROGRAM, _position, _color, finBorderData);
    finBorder.pos = [0, 5.25, 0.3];
    allParts.push(finBorder);

    // === EYES LEFT (TANPA OUTLINE BESAR) ===
    const eyeWhiteLeftData = generateSphere(0.7, 32, 16, WHITE);
    const eyeWhiteLeft = new MyObject(GL, SHADER_PROGRAM, _position, _color, eyeWhiteLeftData);
    eyeWhiteLeft.pos = [-1.2, 3.5, 1.2];
    allParts.push(eyeWhiteLeft);

    // Pupil dengan outline tipis langsung di pupil
    const pupilLeftData = generateSphere(0.4, 32, 16, DARK_BLUE);
    const pupilLeft = new MyObject(GL, SHADER_PROGRAM, _position, _color, pupilLeftData);
    pupilLeft.pos = [-1.2, 3.5, 1.8];
    allParts.push(pupilLeft);

    const highlightLeftData = generateSphere(0.15, 16, 16, WHITE);
    const highlightLeft = new MyObject(GL, SHADER_PROGRAM, _position, _color, highlightLeftData);
    highlightLeft.pos = [-1.1, 3.65, 2.0];
    allParts.push(highlightLeft);

    // === EYES RIGHT (TANPA OUTLINE BESAR) ===
    const eyeWhiteRightData = generateSphere(0.7, 32, 16, WHITE);
    const eyeWhiteRight = new MyObject(GL, SHADER_PROGRAM, _position, _color, eyeWhiteRightData);
    eyeWhiteRight.pos = [1.2, 3.5, 1.2];
    allParts.push(eyeWhiteRight);

    const pupilRightData = generateSphere(0.4, 32, 16, DARK_BLUE);
    const pupilRight = new MyObject(GL, SHADER_PROGRAM, _position, _color, pupilRightData);
    pupilRight.pos = [1.2, 3.5, 1.8];
    allParts.push(pupilRight);

    const highlightRightData = generateSphere(0.15, 16, 16, WHITE);
    const highlightRight = new MyObject(GL, SHADER_PROGRAM, _position, _color, highlightRightData);
    highlightRight.pos = [1.3, 3.65, 2.0];
    allParts.push(highlightRight);

    // === MOUTH ===
    const mouthInsideData = generateEllipsoid(0.65, 0.45, 0.08, 32, 16, PINK_MOUTH);
    const mouthInside = new MyObject(GL, SHADER_PROGRAM, _position, _color, mouthInsideData);
    mouthInside.pos = [0, 2.15, 2.18];
    allParts.push(mouthInside);

    const mouthOutlineData = generateEllipsoid(0.72, 0.5, 0.08, 32, 16, DARK_BLUE);
    const mouthOutline = new MyObject(GL, SHADER_PROGRAM, _position, _color, mouthOutlineData);
    mouthOutline.pos = [0, 2.15, 2.19];
    allParts.push(mouthOutline);

    // === BLUSH MARKS ===
    const blushLeftData = generateEllipsoid(0.56, 0.36, 0.16, 32, 16, DARK_BLUE);
    const blushLeft = new MyObject(GL, SHADER_PROGRAM, _position, _color, blushLeftData);
    blushLeft.pos = [-1.7, 2.7, 1.4];
    allParts.push(blushLeft);

    const blushRightData = generateEllipsoid(0.56, 0.36, 0.16, 32, 16, DARK_BLUE);
    const blushRight = new MyObject(GL, SHADER_PROGRAM, _position, _color, blushRightData);
    blushRight.pos = [1.7, 2.7, 1.4];
    allParts.push(blushRight);

    // === BODY ===
    const bodyData = generateEllipsoid(1.495, 1.625, 1.235, 32, 16, SOBBLE_BLUE);
    const body = new MyObject(GL, SHADER_PROGRAM, _position, _color, bodyData);
    body.pos = [0, 0.9, -0.7];
    allParts.push(body);

    // === BELLY ===
    const bellyData = generateEllipsoid(1.0, 1.3, 0.75, 32, 16, BELLY_LIGHT);
    const belly = new MyObject(GL, SHADER_PROGRAM, _position, _color, bellyData);
    belly.pos = [0, 0.9, 0.4];
    allParts.push(belly);

    // === SPIRAL TAIL - dengan segmen lebih banyak dan warna bervariasi ===
    const tailCtrlPoints = [];
    const spiralSegments = 25; // Lebih banyak untuk detail lebih
    const centerX = 0, centerY = 1.6, centerZ = -3;
    
    for (let i = 0; i < spiralSegments; i++) {
        const t = i / spiralSegments;
        const angle = t * Math.PI * 4.5 + Math.PI;
        const maxRadius = 1.5;
        const minRadiusRatio = 0.12;
        const radius = maxRadius * (minRadiusRatio + (1 - minRadiusRatio) * (1 - t));
        const x = centerX;
        const y = centerY + Math.sin(angle) * radius;
        const z = centerZ - Math.cos(angle) * radius;
        tailCtrlPoints.push([x, y, z]);
    }

    // Tail main - body biru dengan detail lebih
    const tailMainPoints = tailCtrlPoints.slice(0, -4);
    const tailData = generateBSplineTube(tailMainPoints, 0.52, 16, 30, SOBBLE_BLUE);
    const tail = new MyObject(GL, SHADER_PROGRAM, _position, _color, tailData);
    tail.pos = [0, 0, 0];
    allParts.push(tail);

    // Tail middle - transisi warna
    const tailMidPoints = tailCtrlPoints.slice(-8, -2);
    const tailMidData = generateBSplineTube(tailMidPoints, 0.45, 16, 30, SOBBLE_BLUE_DARK);
    const tailMid = new MyObject(GL, SHADER_PROGRAM, _position, _color, tailMidData);
    tailMid.pos = [0, 0, 0];
    allParts.push(tailMid);

    // Tail tip (dark blue) - ujung
    const tailTipCtrlPoints = tailCtrlPoints.slice(-5);
    const tailTipData = generateBSplineTube(tailTipCtrlPoints, 0.38, 16, 30, DARK_BLUE);
    const tailTip = new MyObject(GL, SHADER_PROGRAM, _position, _color, tailTipData);
    tailTip.pos = [0, 0, 0];
    allParts.push(tailTip);

    // === FRONT LEGS ===
    const frontLegLeftData = generateEllipsoid(0.22, 0.6, 0.22, 16, 16, SOBBLE_BLUE);
    const frontLegLeft = new MyObject(GL, SHADER_PROGRAM, _position, _color, frontLegLeftData);
    frontLegLeft.pos = [-1.2, 0.3, 0.5];
    allParts.push(frontLegLeft);

    const handLeftData = generateEllipsoid(0.36, 0.15, 0.3, 16, 16, SOBBLE_BLUE);
    const handLeft = new MyObject(GL, SHADER_PROGRAM, _position, _color, handLeftData);
    handLeft.pos = [-1.65, -0.35, 0.85];
    allParts.push(handLeft);

    const frontLegRightData = generateEllipsoid(0.22, 0.6, 0.22, 16, 16, SOBBLE_BLUE);
    const frontLegRight = new MyObject(GL, SHADER_PROGRAM, _position, _color, frontLegRightData);
    frontLegRight.pos = [1.2, 0.3, 0.5];
    allParts.push(frontLegRight);

    const handRightData = generateEllipsoid(0.36, 0.15, 0.3, 16, 16, SOBBLE_BLUE);
    const handRight = new MyObject(GL, SHADER_PROGRAM, _position, _color, handRightData);
    handRight.pos = [1.65, -0.35, 0.85];
    allParts.push(handRight);

    // === BACK LEGS ===
    const backLegLeftData = generateEllipsoid(0.32, 0.5, 0.32, 16, 16, SOBBLE_BLUE);
    const backLegLeft = new MyObject(GL, SHADER_PROGRAM, _position, _color, backLegLeftData);
    backLegLeft.pos = [-1.3, 0.2, -1.1];
    allParts.push(backLegLeft);

    const calfLeftData = generateEllipsoid(0.32, 0.75, 0.28, 16, 16, SOBBLE_BLUE);
    const calfLeft = new MyObject(GL, SHADER_PROGRAM, _position, _color, calfLeftData);
    calfLeft.pos = [-2.1, -0.35, -1.1];
    allParts.push(calfLeft);

    const footLeftData = generateEllipsoid(0.6, 0.2, 0.44, 16, 16, SOBBLE_BLUE);
    const footLeft = new MyObject(GL, SHADER_PROGRAM, _position, _color, footLeftData);
    footLeft.pos = [-2.7, -1.0, -1.1];
    allParts.push(footLeft);

    const backLegRightData = generateEllipsoid(0.32, 0.5, 0.32, 16, 16, SOBBLE_BLUE);
    const backLegRight = new MyObject(GL, SHADER_PROGRAM, _position, _color, backLegRightData);
    backLegRight.pos = [1.3, 0.2, -1.1];
    allParts.push(backLegRight);

    const calfRightData = generateEllipsoid(0.32, 0.75, 0.28, 16, 16, SOBBLE_BLUE);
    const calfRight = new MyObject(GL, SHADER_PROGRAM, _position, _color, calfRightData);
    calfRight.pos = [2.1, -0.35, -1.1];
    allParts.push(calfRight);

    const footRightData = generateEllipsoid(0.6, 0.2, 0.44, 16, 16, SOBBLE_BLUE);
    const footRight = new MyObject(GL, SHADER_PROGRAM, _position, _color, footRightData);
    footRight.pos = [2.7, -1.0, -1.1];
    allParts.push(footRight);

    return {
        setup: () => allParts.forEach(part => part.setup()),
        render: (_Mmatrix, parentMat) => {
            allParts.forEach(part => part.render(_Mmatrix, parentMat));
        }
    };
}
