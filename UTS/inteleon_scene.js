import {
  generateSphere,
  generateEllipsoid,
  generateEllipticParaboloid,
  generateCone,
  generateHyperboloid,
  generateBSplineTube,
  generateSineFin
} from "./main.js";
import { MyObject } from "./MyObject.js";

function interleaveVertsColors(verticesF32, colorsF32) {
  const verts = Array.from(verticesF32);
  const cols = Array.from(colorsF32);
  const nVerts = verts.length / 3;
  const out = new Float32Array(nVerts * 6);
  for (let i = 0; i < nVerts; i++) {
    out[i * 6 + 0] = verts[i * 3 + 0];
    out[i * 6 + 1] = verts[i * 3 + 1];
    out[i * 6 + 2] = verts[i * 3 + 2];
    out[i * 6 + 3] = cols[i * 3 + 0];
    out[i * 6 + 4] = cols[i * 3 + 1];
    out[i * 6 + 5] = cols[i * 3 + 2];
  }
  return out;
}

export function createInteleon(GL, SHADER_PROGRAM, _position, _color) {
  const blue = [0.1, 0.45, 0.8];
  const yellow = [1.0, 0.95, 0.4];
  const darkBlue = [0.05, 0.25, 0.5];

  // --- Head base (ellipsoid) ---
  const headBase = generateEllipsoid(0.45, 0.55, 0.4, 24, 20, blue);
  const Head = new MyObject(GL, SHADER_PROGRAM, _position, _color, headBase.vertices, headBase.faces, headBase.colors);
  LIBS.translateY(Head.MOVE_MATRIX, 1.8);

  // --- Crest fin (elliptic paraboloid) ---
  const crestData = generateEllipticParaboloid(0.3, 0.05, 1.2, 36, 24, yellow);
  const Crest = new MyObject(GL, SHADER_PROGRAM, _position, _color, crestData.vertices, crestData.faces, crestData.colors);
  LIBS.translateY(Crest.MOVE_MATRIX, 0.8);
  LIBS.translateZ(Crest.MOVE_MATRIX, -0.2);
  LIBS.rotateX(Crest.MOVE_MATRIX, -Math.PI / 8);

  // --- Nose (cone) ---
  const noseData = generateCone(0.12, 0.25, 24, darkBlue);
  const Nose = new MyObject(GL, SHADER_PROGRAM, _position, _color, noseData.vertices, noseData.faces, noseData.colors);
  LIBS.translateZ(Nose.MOVE_MATRIX, 0.45);
  LIBS.translateY(Nose.MOVE_MATRIX, 0.1);

  // --- Neck (hyperboloid) ---
  const neckData = generateHyperboloid(0.12, 0.12, 0.25, 30, 20, blue);
  const Neck = new MyObject(GL, SHADER_PROGRAM, _position, _color, neckData.vertices, neckData.faces, neckData.colors);
  LIBS.translateY(Neck.MOVE_MATRIX, 1.3);

  // --- Body (soft triangular paraboloid shape) ---
  const bodyData = generateEllipticParaboloid(0.6, 0.4, 2.0, 36, 24, blue);
  const Body = new MyObject(GL, SHADER_PROGRAM, _position, _color, bodyData.vertices, bodyData.faces, bodyData.colors);

  // --- Arms & legs (tubes) ---
  const leftArm = generateBSplineTube([[0,0,0], [-0.6,-0.9,0.1]], 0.07, 20, 12, blue);
  const rightArm = generateBSplineTube([[0,0,0], [0.6,-0.9,0.1]], 0.07, 20, 12, blue);
  const LeftArm = new MyObject(GL, SHADER_PROGRAM, _position, _color, leftArm.vertices, leftArm.faces, leftArm.colors);
  const RightArm = new MyObject(GL, SHADER_PROGRAM, _position, _color, rightArm.vertices, rightArm.faces, rightArm.colors);
  LIBS.translateY(LeftArm.MOVE_MATRIX, 0.9);
  LIBS.translateY(RightArm.MOVE_MATRIX, 0.9);

  const leftLeg = generateBSplineTube([[0,0,0], [-0.3,-1.3,0]], 0.1, 20, 12, blue);
  const rightLeg = generateBSplineTube([[0,0,0], [0.3,-1.3,0]], 0.1, 20, 12, blue);
  const LeftLeg = new MyObject(GL, SHADER_PROGRAM, _position, _color, leftLeg.vertices, leftLeg.faces, leftLeg.colors);
  const RightLeg = new MyObject(GL, SHADER_PROGRAM, _position, _color, rightLeg.vertices, rightLeg.faces, rightLeg.colors);
  LIBS.translateY(LeftLeg.MOVE_MATRIX, -1.3);
  LIBS.translateY(RightLeg.MOVE_MATRIX, -1.3);

  // --- Tail (BSpline) ---
  const tailData = generateBSplineTube([[0,0,0],[0,-0.6,0.2],[0,-1.2,0.8],[0,-1.8,0.3]],0.06,40,16,darkBlue);
  const Tail = new MyObject(GL, SHADER_PROGRAM, _position, _color, tailData.vertices, tailData.faces, tailData.colors);
  LIBS.translateY(Tail.MOVE_MATRIX, -2.0);
  LIBS.translateZ(Tail.MOVE_MATRIX, -0.5);
  LIBS.rotateX(Tail.MOVE_MATRIX, Math.PI / 3);

  // --- Tail fin (sine) ---
  const tailFinData = generateSineFin(1.0, 0.2, 0.05, 60, yellow);
  const TailFin = new MyObject(GL, SHADER_PROGRAM, _position, _color, tailFinData.vertices, tailFinData.faces, tailFinData.colors);
  LIBS.translateY(TailFin.MOVE_MATRIX, -2.3);
  LIBS.translateZ(TailFin.MOVE_MATRIX, -0.8);
  LIBS.rotateX(TailFin.MOVE_MATRIX, Math.PI / 2);

  // --- Hierarchy assembly ---
  Head.childs.push(Crest, Nose);
  Body.childs.push(Head, Neck, LeftArm, RightArm, LeftLeg, RightLeg, Tail, TailFin);

  return Body;
}
