import {
  generateBSplineTube,
  generateEllipsoid,
  generateEllipticParaboloid,
  generateFin,
  generateSphere,
  generateGrass,
} from "./main.js";
import { MyObject } from "./MyObject.js";

function interleaveVertsColors(verticesF32, colorsF32) {
  const verts = Array.from(verticesF32);
  const cols = Array.from(colorsF32);
  const nVerts = verts.length / 3;
  const out = new Float32Array(nVerts * 6);
  for (let i = 0; i < nVerts; i++) {
    out[i * 6 + 0] = verts[i * 3 + 0]; // pos.x
    out[i * 6 + 1] = verts[i * 3 + 1]; // pos.y
    out[i * 6 + 2] = verts[i * 3 + 2]; // pos.z
    out[i * 6 + 3] = cols[i * 3 + 0]; // col.r
    out[i * 6 + 4] = cols[i * 3 + 1]; // col.g
    out[i * 6 + 5] = cols[i * 3 + 2]; // col.b
  }
  return out;
}

export function createDrizzile(GL, SHADER_PROGRAM, _position, _color) {
  // Palet Warna
  const blue = [0.25, 0.65, 0.85];
  const darkBlue = [0.1, 0.3, 0.55];
  const green = [0.6, 0.85, 0.4];
  const purple = [0.4, 0.3, 0.6];
  const white = [0.95, 0.95, 0.95];
  const black = [0.1, 0.1, 0.1];

  // --- Badan ---
  const bodyPoints = [
    [0, -0.7, 0],
    [0, 0.7, 0],
  ];
  const bodyData = generateBSplineTube(bodyPoints, 0.45, 4, 16, blue);
  const interleavedBody = interleaveVertsColors(
    bodyData.vertices,
    bodyData.colors
  );
  const Body = new MyObject(
    GL,
    SHADER_PROGRAM,
    _position,
    _color,
    interleavedBody,
    bodyData.faces
  );
  LIBS.translateY(Body.MOVE_MATRIX, -0.1);

  // --- Perut ---
  const bellyData = generateEllipsoid(0.2, 0.4, 0.1, 16, 10, white);
  const interleavedBelly = interleaveVertsColors(
    bellyData.vertices,
    bellyData.colors
  );
  const Belly = new MyObject(
    GL,
    SHADER_PROGRAM,
    _position,
    _color,
    interleavedBelly,
    bellyData.faces
  );
  LIBS.translateZ(Belly.MOVE_MATRIX, 0.35);
  LIBS.translateY(Belly.MOVE_MATRIX, -0.1);

  // --- Kepala ---
  const headData = generateEllipsoid(0.4, 0.4, 0.35, 24, 16, blue);
  const interleavedHead = interleaveVertsColors(
    headData.vertices,
    headData.colors
  );
  const Head = new MyObject(
    GL,
    SHADER_PROGRAM,
    _position,
    _color,
    interleavedHead,
    headData.faces
  );
  LIBS.translateY(Head.MOVE_MATRIX, 0.75);

  // --- Helm ---
  const capData = generateEllipticParaboloid(0.42, 0.2, 0.3, 24, 16, darkBlue);
  const interleavedCap = interleaveVertsColors(
    capData.vertices,
    capData.colors
  );
  const Cap = new MyObject(
    GL,
    SHADER_PROGRAM,
    _position,
    _color,
    interleavedCap,
    capData.faces
  );
  LIBS.translateY(Cap.MOVE_MATRIX, 0.1);
  LIBS.translateZ(Cap.MOVE_MATRIX, -0.05);
  LIBS.rotateX(Cap.MOVE_MATRIX, -0.3);

  // --- Sirip Kepala ---
  const finData = generateFin(0.6, 0.8, 0.04, 10, [1.0, 0.8], darkBlue);
  const interleavedFin = interleaveVertsColors(
    finData.vertices,
    finData.colors
  );
  const HeadFin = new MyObject(
    GL,
    SHADER_PROGRAM,
    _position,
    _color,
    interleavedFin,
    finData.faces
  );
  LIBS.translateY(HeadFin.MOVE_MATRIX, 0.45);
  LIBS.translateZ(HeadFin.MOVE_MATRIX, -0.2);
  LIBS.rotateX(HeadFin.MOVE_MATRIX, 1.8);
  LIBS.rotateY(HeadFin.MOVE_MATRIX, -0.1);

  // --- Poni Ungu  ---
  const hairData = generateFin(0.9, 0.5, 0.05, 20, [1.0], purple);
  const interleavedHair = interleaveVertsColors(
    hairData.vertices,
    hairData.colors
  );
  const HeadBang = new MyObject(
    GL,
    SHADER_PROGRAM,
    _position,
    _color,
    interleavedHair,
    hairData.faces
  );
  LIBS.translateX(HeadBang.MOVE_MATRIX, -0.25);
  LIBS.translateY(HeadBang.MOVE_MATRIX, 0.2);
  LIBS.translateZ(HeadBang.MOVE_MATRIX, 0.15);
  LIBS.rotateZ(HeadBang.MOVE_MATRIX, 1.0);
  LIBS.rotateY(HeadBang.MOVE_MATRIX, -0.2);
  LIBS.rotateX(HeadBang.MOVE_MATRIX, 0.3);

  // --- Mata ---
  const eyeLData = generateEllipsoid(0.18, 0.05, 0.1, 12, 12, white);
  const interleavedEyeL = interleaveVertsColors(
    eyeLData.vertices,
    eyeLData.colors
  );
  const LeftEye = new MyObject(
    GL,
    SHADER_PROGRAM,
    _position,
    _color,
    interleavedEyeL,
    eyeLData.faces
  );
  LIBS.translateY(LeftEye.MOVE_MATRIX, 0.1);
  LIBS.translateX(LeftEye.MOVE_MATRIX, -0.15);
  LIBS.translateZ(LeftEye.MOVE_MATRIX, 0.35);
  LIBS.rotateY(LeftEye.MOVE_MATRIX, 0.1);

  const pupilLData = generateSphere(0.04, 8, 8, black);
  const interleavedPupilL = interleaveVertsColors(
    pupilLData.vertices,
    pupilLData.colors
  );
  const LeftPupil = new MyObject(
    GL,
    SHADER_PROGRAM,
    _position,
    _color,
    interleavedPupilL,
    pupilLData.faces
  );
  LIBS.translateZ(LeftPupil.MOVE_MATRIX, 0.06);

  const eyeRData = generateEllipsoid(0.18, 0.05, 0.1, 12, 12, white);
  const interleavedEyeR = interleaveVertsColors(
    eyeRData.vertices,
    eyeRData.colors
  );
  const RightEye = new MyObject(
    GL,
    SHADER_PROGRAM,
    _position,
    _color,
    interleavedEyeR,
    eyeRData.faces
  );
  LIBS.translateY(RightEye.MOVE_MATRIX, 0.1);
  LIBS.translateX(RightEye.MOVE_MATRIX, 0.15);
  LIBS.translateZ(RightEye.MOVE_MATRIX, 0.35);
  LIBS.rotateY(RightEye.MOVE_MATRIX, -0.1);

  const pupilRData = generateSphere(0.04, 8, 8, black);
  const interleavedPupilR = interleaveVertsColors(
    pupilRData.vertices,
    pupilRData.colors
  );
  const RightPupil = new MyObject(
    GL,
    SHADER_PROGRAM,
    _position,
    _color,
    interleavedPupilR,
    pupilRData.faces
  );
  LIBS.translateZ(RightPupil.MOVE_MATRIX, 0.06);

  // --- Pipi ---
  const cheekLData = generateSphere(0.1, 8, 8, darkBlue);
  const interleavedCheekL = interleaveVertsColors(
    cheekLData.vertices,
    cheekLData.colors
  );
  const LCheekSpot = new MyObject(
    GL,
    SHADER_PROGRAM,
    _position,
    _color,
    interleavedCheekL,
    cheekLData.faces
  );
  LIBS.translateY(LCheekSpot.MOVE_MATRIX, 0.0);
  LIBS.translateX(LCheekSpot.MOVE_MATRIX, -0.25);
  LIBS.translateZ(LCheekSpot.MOVE_MATRIX, 0.3);

  const cheekRData = generateSphere(0.1, 8, 8, darkBlue);
  const interleavedCheekR = interleaveVertsColors(
    cheekRData.vertices,
    cheekRData.colors
  );
  const RCheekSpot = new MyObject(
    GL,
    SHADER_PROGRAM,
    _position,
    _color,
    interleavedCheekR,
    cheekRData.faces
  );
  LIBS.translateY(RCheekSpot.MOVE_MATRIX, 0.0);
  LIBS.translateX(RCheekSpot.MOVE_MATRIX, 0.25);
  LIBS.translateZ(RCheekSpot.MOVE_MATRIX, 0.3);

  const mouthPoints = [
    [-0.15, 0.0, 0],
    [-0.07, 0.05, 0],
    [0.0, 0.06, 0],
    [0.07, 0.05, 0],
    [0.15, 0.0, 0],
  ];

  const MouthData = generateBSplineTube(mouthPoints, 0.01, 5, 8, black);
  const interleavedMouth = interleaveVertsColors(
    MouthData.vertices,
    MouthData.colors
  );
  const Mouth = new MyObject(
    GL,
    SHADER_PROGRAM,
    _position,
    _color,
    interleavedMouth,
    MouthData.faces
  );

  LIBS.translateY(Mouth.MOVE_MATRIX, -0.15);
  LIBS.translateZ(Mouth.MOVE_MATRIX, 0.41);

  // --- Ekor ---
  const tailPoints = [
    [0, 0, 0],
    [-0.3, -0.2, -0.3],
    [0.0, -0.5, -0.5],
    [0.3, -0.7, -0.3],
    [0.0, -0.8, -0.1],
  ];
  const tailData = generateBSplineTube(tailPoints, 0.12, 10, 10, darkBlue);
  const interleavedTail = interleaveVertsColors(
    tailData.vertices,
    tailData.colors
  );
  const Tail = new MyObject(
    GL,
    SHADER_PROGRAM,
    _position,
    _color,
    interleavedTail,
    tailData.faces
  );
  LIBS.translateZ(Tail.MOVE_MATRIX, -0.3);
  LIBS.translateY(Tail.MOVE_MATRIX, -0.5);
  LIBS.rotateX(Tail.MOVE_MATRIX, 0.4);

  // --- Geometri Jari Tangan ---
  const fingerData = generateEllipsoid(0.08, 0.11, 0.05, 6, 6, green);
  const fingerVerts = interleaveVertsColors(
    fingerData.vertices,
    fingerData.colors
  );

  // --- Geometri Jari Kaki ---
  const toeData = generateEllipsoid(0.1, 0.13, 0.06, 6, 6, green);
  const toeVerts = interleaveVertsColors(toeData.vertices, toeData.colors);

  // --- Tangan Kiri ---
  const LUpperArmPoints = [
    [0, 0, 0],
    [0.0, -0.5, 0.1],
  ];
  const LUpperArmData = generateBSplineTube(LUpperArmPoints, 0.07, 5, 8, blue);
  const interleavedUpperArmL = interleaveVertsColors(
    LUpperArmData.vertices,
    LUpperArmData.colors
  );
  const LUpperArm = new MyObject(
    GL,
    SHADER_PROGRAM,
    _position,
    _color,
    interleavedUpperArmL,
    LUpperArmData.faces
  );
  LIBS.translateY(LUpperArm.MOVE_MATRIX, 0.4);
  LIBS.translateX(LUpperArm.MOVE_MATRIX, -0.3);
  LIBS.rotateZ(LUpperArm.MOVE_MATRIX, -0.9);
  LIBS.rotateX(LUpperArm.MOVE_MATRIX, 1.3);

  const LForeArmPoints = [
    [0, 0, 0],
    [-0.4, -0.4, 0.2],
  ];
  const LForeArmData = generateBSplineTube(LForeArmPoints, 0.07, 5, 8, blue);
  const interleavedForeArmL = interleaveVertsColors(
    LForeArmData.vertices,
    LForeArmData.colors
  );
  const LForeArm = new MyObject(
    GL,
    SHADER_PROGRAM,
    _position,
    _color,
    interleavedForeArmL,
    LForeArmData.faces
  );
  LIBS.translateY(LForeArm.MOVE_MATRIX, -0.5);
  LIBS.translateZ(LForeArm.MOVE_MATRIX, 0.1);
  LIBS.rotateZ(LForeArm.MOVE_MATRIX, -0.8);

  // Jari Kiri
  const LFinger1 = new MyObject(
    GL,
    SHADER_PROGRAM,
    _position,
    _color,
    fingerVerts,
    fingerData.faces
  );
  LIBS.translateY(LFinger1.MOVE_MATRIX, -0.4);
  LIBS.translateX(LFinger1.MOVE_MATRIX, -0.4);
  LIBS.translateZ(LFinger1.MOVE_MATRIX, 0.2);
  LIBS.translateX(LFinger1.MOVE_MATRIX, -0.07);

  const LFinger2 = new MyObject(
    GL,
    SHADER_PROGRAM,
    _position,
    _color,
    fingerVerts,
    fingerData.faces
  );
  LIBS.translateY(LFinger2.MOVE_MATRIX, -0.4);
  LIBS.translateX(LFinger2.MOVE_MATRIX, -0.4);
  LIBS.translateZ(LFinger2.MOVE_MATRIX, 0.2);
  LIBS.translateX(LFinger2.MOVE_MATRIX, 0.07);

  const LFinger3 = new MyObject(
    GL,
    SHADER_PROGRAM,
    _position,
    _color,
    fingerVerts,
    fingerData.faces
  );
  LIBS.translateY(LFinger3.MOVE_MATRIX, -0.3);
  LIBS.translateX(LFinger3.MOVE_MATRIX, -0.4);
  LIBS.translateZ(LFinger3.MOVE_MATRIX, 0.2);

  // --- Tangan Kanan ---

  const RUpperArmPoints = [
    [0, 0, 0],
    [0.0, -0.5, 0.1],
  ];
  const RUpperArmData = generateBSplineTube(RUpperArmPoints, 0.07, 5, 8, blue);
  const interleavedUpperArmR = interleaveVertsColors(
    RUpperArmData.vertices,
    RUpperArmData.colors
  );
  const RUpperArm = new MyObject(
    GL,
    SHADER_PROGRAM,
    _position,
    _color,
    interleavedUpperArmR,
    RUpperArmData.faces
  );
  LIBS.translateY(RUpperArm.MOVE_MATRIX, 0.4);
  LIBS.translateX(RUpperArm.MOVE_MATRIX, 0.3);
  LIBS.rotateZ(RUpperArm.MOVE_MATRIX, 0.9);
  LIBS.rotateX(RUpperArm.MOVE_MATRIX, 1.3);

  const RForeArmPoints = [
    [0, 0, 0],
    [0.4, -0.4, 0.2],
  ];
  const RForeArmData = generateBSplineTube(RForeArmPoints, 0.07, 5, 8, blue);
  const interleavedForeArmR = interleaveVertsColors(
    RForeArmData.vertices,
    RForeArmData.colors
  );
  const RForeArm = new MyObject(
    GL,
    SHADER_PROGRAM,
    _position,
    _color,
    interleavedForeArmR,
    RForeArmData.faces
  );
  LIBS.translateY(RForeArm.MOVE_MATRIX, -0.5);
  LIBS.translateZ(RForeArm.MOVE_MATRIX, 0.1);
  LIBS.rotateZ(RForeArm.MOVE_MATRIX, 0.8);

  // Jari Kanan
  const RFinger1 = new MyObject(
    GL,
    SHADER_PROGRAM,
    _position,
    _color,
    fingerVerts,
    fingerData.faces
  );
  LIBS.translateY(RFinger1.MOVE_MATRIX, -0.4);
  LIBS.translateX(RFinger1.MOVE_MATRIX, 0.4);
  LIBS.translateZ(RFinger1.MOVE_MATRIX, 0.2);
  LIBS.translateX(RFinger1.MOVE_MATRIX, -0.07);

  const RFinger2 = new MyObject(
    GL,
    SHADER_PROGRAM,
    _position,
    _color,
    fingerVerts,
    fingerData.faces
  );
  LIBS.translateY(RFinger2.MOVE_MATRIX, -0.4);
  LIBS.translateX(RFinger2.MOVE_MATRIX, 0.4);
  LIBS.translateZ(RFinger2.MOVE_MATRIX, 0.2);
  LIBS.translateX(RFinger2.MOVE_MATRIX, 0.07);

  const RFinger3 = new MyObject(
    GL,
    SHADER_PROGRAM,
    _position,
    _color,
    fingerVerts,
    fingerData.faces
  );
  LIBS.translateY(RFinger3.MOVE_MATRIX, -0.3);
  LIBS.translateX(RFinger3.MOVE_MATRIX, 0.4);
  LIBS.translateZ(RFinger3.MOVE_MATRIX, 0.2);

  // --- Kaki Kiri ---
  const LLegPoints = [
    [0, 0, 0],
    [0.1, -0.7, 0.0],
  ];
  const LLegData = generateBSplineTube(LLegPoints, 0.18, 5, 10, blue);
  const interleavedLegL = interleaveVertsColors(
    LLegData.vertices,
    LLegData.colors
  );
  const LLeg = new MyObject(
    GL,
    SHADER_PROGRAM,
    _position,
    _color,
    interleavedLegL,
    LLegData.faces
  );
  LIBS.translateY(LLeg.MOVE_MATRIX, -0.7);
  LIBS.translateX(LLeg.MOVE_MATRIX, -0.25);
  LIBS.rotateZ(LLeg.MOVE_MATRIX, -0.3);

  // Telapak Kaki Kiri
  const LFootData = generateEllipsoid(0.18, 0.08, 0.25, 10, 8, green);
  const interleavedFootL = interleaveVertsColors(
    LFootData.vertices,
    LFootData.colors
  );
  const LFoot = new MyObject(
    GL,
    SHADER_PROGRAM,
    _position,
    _color,
    interleavedFootL,
    LFootData.faces
  );
  LIBS.translateY(LFoot.MOVE_MATRIX, -0.7);
  LIBS.translateX(LFoot.MOVE_MATRIX, 0.1);
  LIBS.rotateX(LFoot.MOVE_MATRIX, 1.57);
  LIBS.translateZ(LFoot.MOVE_MATRIX, 0.0);

  // --- Kaki Kanan ---
  const RLegPoints = [
    [0, 0, 0],
    [-0.1, -0.7, 0.0],
  ];
  const RLegData = generateBSplineTube(RLegPoints, 0.18, 5, 10, blue);
  const interleavedLegR = interleaveVertsColors(
    RLegData.vertices,
    RLegData.colors
  );
  const RLeg = new MyObject(
    GL,
    SHADER_PROGRAM,
    _position,
    _color,
    interleavedLegR,
    RLegData.faces
  );
  LIBS.translateY(RLeg.MOVE_MATRIX, -0.7);
  LIBS.translateX(RLeg.MOVE_MATRIX, 0.25);
  LIBS.rotateZ(RLeg.MOVE_MATRIX, 0.3);

  // Telapak Kaki Kanan
  const RFootData = generateEllipsoid(0.18, 0.08, 0.25, 10, 8, green);
  const interleavedFootR = interleaveVertsColors(
    RFootData.vertices,
    RFootData.colors
  );
  const RFoot = new MyObject(
    GL,
    SHADER_PROGRAM,
    _position,
    _color,
    interleavedFootR,
    RFootData.faces
  );
  LIBS.translateY(RFoot.MOVE_MATRIX, -0.7);
  LIBS.translateX(RFoot.MOVE_MATRIX, -0.1);
  LIBS.rotateX(RFoot.MOVE_MATRIX, 1.57);
  LIBS.translateZ(RFoot.MOVE_MATRIX, 0.0);

  // --- Perakitan Hierarki ---
  LeftEye.childs.push(LeftPupil);
  RightEye.childs.push(RightPupil);
  Head.childs.push(
    Cap,
    HeadBang,
    HeadFin,
    LeftEye,
    RightEye,
    LCheekSpot,
    RCheekSpot,
    Mouth
  );

  LForeArm.childs.push(LFinger1, LFinger2, LFinger3);
  LUpperArm.childs.push(LForeArm);

  RForeArm.childs.push(RFinger1, RFinger2, RFinger3);
  RUpperArm.childs.push(RForeArm);

  LLeg.childs.push(LFoot);
  RLeg.childs.push(RFoot);

  Body.childs.push(Head, Belly, Tail, LUpperArm, RUpperArm, LLeg, RLeg);

  // --- Ladang (Field) ---
  const fieldColor = [0.3, 0.6, 0.2]; // Warna rumput
  const fieldData = generateEllipsoid(15, 0.1, 15, 32, 16, fieldColor);
  const interleavedField = interleaveVertsColors(
    fieldData.vertices,
    fieldData.colors
  );
  const Field = new MyObject(
    GL,
    SHADER_PROGRAM,
    _position,
    _color,
    interleavedField,
    fieldData.faces
  );

  // Permukaan atas ladang adalah -1.68 (posisi) + 0.1 (radius) = -1.58
  const fieldSurfaceY = -1.58;
  LIBS.translateY(Field.MOVE_MATRIX, -1.68); // Pindahkan pusat ladang ke bawah

  // --- Rumput (Grass) ---
  const grassGreen = [0.1, 0.8, 0.15]; // Warna rumput yang sedikit beda
  const grassData = generateGrass(
    15,
    fieldSurfaceY,
    300,
    0.4,
    0.05,
    4,
    grassGreen
  );
  const interleavedGrass = interleaveVertsColors(
    grassData.vertices,
    grassData.colors
  );
  const Grass = new MyObject(
    GL,
    SHADER_PROGRAM,
    _position,
    _color,
    interleavedGrass,
    grassData.faces
  );

  // --- Pohon (Tree) ---
  const brown = [0.4, 0.2, 0.05];
  const darkGreen = [0.0, 0.4, 0.1];
  const treeHeight = 2.5;

  // Batang Pohon
  const trunkPoints = [
    [0, 0, 0],
    [0, treeHeight, 0],
  ];
  const trunkData = generateBSplineTube(trunkPoints, 0.2, 3, 10, brown);
  const interleavedTrunk = interleaveVertsColors(
    trunkData.vertices,
    trunkData.colors
  );
  const Trunk = new MyObject(
    GL,
    SHADER_PROGRAM,
    _position,
    _color,
    interleavedTrunk,
    trunkData.faces
  );

  // Daun Pohon
  const leavesData = generateEllipsoid(1.0, 1.2, 1.0, 16, 12, darkGreen);
  const interleavedLeaves = interleaveVertsColors(
    leavesData.vertices,
    leavesData.colors
  );
  const Leaves = new MyObject(
    GL,
    SHADER_PROGRAM,
    _position,
    _color,
    interleavedLeaves,
    leavesData.faces
  );
  LIBS.translateY(Leaves.MOVE_MATRIX, treeHeight);

  Trunk.childs.push(Leaves);

  LIBS.translateY(Trunk.MOVE_MATRIX, fieldSurfaceY);
  LIBS.translateX(Trunk.MOVE_MATRIX, 4.0);
  LIBS.translateZ(Trunk.MOVE_MATRIX, -3.0);

  return {
    root: Body,
    field: Field,
    grass: Grass,
    tree: Trunk,
    head: Head,
    tail: Tail,
    leftArm: LUpperArm,
    rightArm: RUpperArm,
    leftLeg: LLeg,
    rightLeg: RLeg,
  };
}
