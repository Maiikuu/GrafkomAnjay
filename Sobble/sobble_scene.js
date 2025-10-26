import { generateSphere, generateEllipsoid, generateBSplineTube } from "./main.js";
import { MyObject } from "./MyObject.js";

export function createSobble(GL, SHADER_PROGRAM, _position, _color) {
  // === COLORS ===
  const SOBBLE_BLUE = [0.35, 0.65, 0.8];
  const SOBBLE_BLUE_DARK = [0.25, 0.55, 0.7];
  const BELLY_LIGHT = [0.65, 0.8, 0.85];
  const DARK_BLUE = [0.08, 0.15, 0.4];
  const YELLOW_FIN = [0.85, 0.75, 0.0];
  const WHITE = [1.0, 1.0, 1.0];

  // ========================================
  // BODY - Small ellipsoid at origin
  // ========================================
  const bodyData = generateEllipsoid(1.5, 1.6, 1.2, 32, 16, SOBBLE_BLUE);
  const Body = new MyObject(GL, SHADER_PROGRAM, _position, _color, bodyData);
  LIBS.set_I4(Body.MOVE_MATRIX);

  // ========================================
  // HEAD - Much larger, positioned FAR ABOVE body
  // ========================================
  const headData = generateEllipsoid(2.4, 2.2, 2.0, 32, 16, SOBBLE_BLUE);
  const Head = new MyObject(GL, SHADER_PROGRAM, _position, _color, headData);
  
  // Head is 6 units above body center
  LIBS.translateY(Head.MOVE_MATRIX, 6.0);
  
  Body.childs.push(Head);

  // ========================================
  // FIN BORDER (Dark blue crest on head)
  // ========================================
  const finBorderData = generateEllipsoid(0.2, 3.8, 1.3, 24, 32, DARK_BLUE);
  const FinBorder = new MyObject(GL, SHADER_PROGRAM, _position, _color, finBorderData);
  
  // On top of head
  LIBS.translateY(FinBorder.MOVE_MATRIX, 3.5);
  LIBS.translateZ(FinBorder.MOVE_MATRIX, -0.3);
  
  Head.childs.push(FinBorder);

  // ========================================
  // FIN SAIL (Yellow part behind dark border)
  // ========================================
  const finSailData = generateEllipsoid(0.15, 4.2, 1.8, 24, 32, YELLOW_FIN);
  const FinSail = new MyObject(GL, SHADER_PROGRAM, _position, _color, finSailData);
  
  LIBS.translateY(FinSail.MOVE_MATRIX, 3.8);
  LIBS.translateZ(FinSail.MOVE_MATRIX, -1.0);
  
  Head.childs.push(FinSail);

  // ========================================
  // LEFT EYE (White part)
  // ========================================
  const leftEyeData = generateSphere(0.7, 32, 16, WHITE);
  const LeftEye = new MyObject(GL, SHADER_PROGRAM, _position, _color, leftEyeData);
  
  // Position on left side of head, facing forward
  LIBS.translateX(LeftEye.MOVE_MATRIX, -1.8);
  LIBS.translateY(LeftEye.MOVE_MATRIX, 0.8);
  LIBS.translateZ(LeftEye.MOVE_MATRIX, 1.5);
  
  Head.childs.push(LeftEye);

  // === LEFT PUPIL (Dark blue)
  const leftPupilData = generateSphere(0.4, 32, 16, DARK_BLUE);
  const LeftPupil = new MyObject(GL, SHADER_PROGRAM, _position, _color, leftPupilData);
  
  LIBS.translateZ(LeftPupil.MOVE_MATRIX, 0.6);
  
  LeftEye.childs.push(LeftPupil);

  // === LEFT HIGHLIGHT (White shine)
  const leftHighlightData = generateSphere(0.15, 16, 16, WHITE);
  const LeftHighlight = new MyObject(GL, SHADER_PROGRAM, _position, _color, leftHighlightData);
  
  LIBS.translateX(LeftHighlight.MOVE_MATRIX, 0.15);
  LIBS.translateY(LeftHighlight.MOVE_MATRIX, 0.2);
  LIBS.translateZ(LeftHighlight.MOVE_MATRIX, 0.25);
  
  LeftPupil.childs.push(LeftHighlight);

  // ========================================
  // RIGHT EYE (Mirror of left)
  // ========================================
  const rightEyeData = generateSphere(0.7, 32, 16, WHITE);
  const RightEye = new MyObject(GL, SHADER_PROGRAM, _position, _color, rightEyeData);
  
  LIBS.translateX(RightEye.MOVE_MATRIX, 1.8);
  LIBS.translateY(RightEye.MOVE_MATRIX, 0.8);
  LIBS.translateZ(RightEye.MOVE_MATRIX, 1.5);
  
  Head.childs.push(RightEye);

  // === RIGHT PUPIL
  const rightPupilData = generateSphere(0.4, 32, 16, DARK_BLUE);
  const RightPupil = new MyObject(GL, SHADER_PROGRAM, _position, _color, rightPupilData);
  
  LIBS.translateZ(RightPupil.MOVE_MATRIX, 0.6);
  
  RightEye.childs.push(RightPupil);

  // === RIGHT HIGHLIGHT
  const rightHighlightData = generateSphere(0.15, 16, 16, WHITE);
  const RightHighlight = new MyObject(GL, SHADER_PROGRAM, _position, _color, rightHighlightData);
  
  LIBS.translateX(RightHighlight.MOVE_MATRIX, -0.15);
  LIBS.translateY(RightHighlight.MOVE_MATRIX, 0.2);
  LIBS.translateZ(RightHighlight.MOVE_MATRIX, 0.25);
  
  RightPupil.childs.push(RightHighlight);

  // ========================================
  // MOUTH (Horizontal ellipsoid)
  // ========================================
  const mouthData = generateEllipsoid(0.7, 0.5, 0.1, 32, 16, DARK_BLUE);
  const Mouth = new MyObject(GL, SHADER_PROGRAM, _position, _color, mouthData);
  
  // Below eyes, forward on face
  LIBS.translateY(Mouth.MOVE_MATRIX, -1.0);
  LIBS.translateZ(Mouth.MOVE_MATRIX, 2.0);
  
  Head.childs.push(Mouth);

  // ========================================
  // LEFT BLUSH (Cheek mark)
  // ========================================
  const leftBlushData = generateEllipsoid(0.55, 0.35, 0.15, 32, 16, DARK_BLUE);
  const LeftBlush = new MyObject(GL, SHADER_PROGRAM, _position, _color, leftBlushData);
  
  LIBS.translateX(LeftBlush.MOVE_MATRIX, -2.2);
  LIBS.translateY(LeftBlush.MOVE_MATRIX, -0.3);
  LIBS.translateZ(LeftBlush.MOVE_MATRIX, 1.2);
  
  Head.childs.push(LeftBlush);

  // ========================================
  // RIGHT BLUSH
  // ========================================
  const rightBlushData = generateEllipsoid(0.55, 0.35, 0.15, 32, 16, DARK_BLUE);
  const RightBlush = new MyObject(GL, SHADER_PROGRAM, _position, _color, rightBlushData);
  
  LIBS.translateX(RightBlush.MOVE_MATRIX, 2.2);
  LIBS.translateY(RightBlush.MOVE_MATRIX, -0.3);
  LIBS.translateZ(RightBlush.MOVE_MATRIX, 1.2);
  
  Head.childs.push(RightBlush);

  // ========================================
  // BELLY (Light blue on front of body)
  // ========================================
  const bellyData = generateEllipsoid(1.0, 1.3, 0.7, 32, 16, BELLY_LIGHT);
  const Belly = new MyObject(GL, SHADER_PROGRAM, _position, _color, bellyData);
  
  // Forward on body
  LIBS.translateY(Belly.MOVE_MATRIX, 0.5);
  LIBS.translateZ(Belly.MOVE_MATRIX, 1.5);
  
  Body.childs.push(Belly);

  // ========================================
  // TAIL (Curly spiral behind body)
  // ========================================
  const tailPoints = [];
  for (let i = 0; i < 50; i++) {
    const t = i / 50;
    const angle = t * Math.PI * 4.5 + Math.PI;
    const radius = 1.5 * (0.12 + 0.88 * (1 - t));
    tailPoints.push([
      0,
      1.6 + Math.sin(angle) * radius,
      -3.0 - Math.cos(angle) * radius
    ]);
  }

  const tailData = generateBSplineTube(tailPoints.slice(0, -4), 0.5, 16, 30, SOBBLE_BLUE);
  const Tail = new MyObject(GL, SHADER_PROGRAM, _position, _color, tailData);
  
  // Starts from body back
  LIBS.translateY(Tail.MOVE_MATRIX, -1.0);
  LIBS.translateZ(Tail.MOVE_MATRIX, 2.0);
  
  Body.childs.push(Tail);

  // === TAIL MID (Darker section)
  const tailMidData = generateBSplineTube(tailPoints.slice(-8, -2), 0.45, 16, 30, SOBBLE_BLUE_DARK);
  const TailMid = new MyObject(GL, SHADER_PROGRAM, _position, _color, tailMidData);
  
  LIBS.translateY(TailMid.MOVE_MATRIX, -1.0);
  LIBS.translateZ(TailMid.MOVE_MATRIX, 2.0);
  
  Body.childs.push(TailMid);

  // === TAIL TIP (Darkest section)
  const tailTipData = generateBSplineTube(tailPoints.slice(-5), 0.38, 16, 30, DARK_BLUE);
  const TailTip = new MyObject(GL, SHADER_PROGRAM, _position, _color, tailTipData);
  
  LIBS.translateY(TailTip.MOVE_MATRIX, -1.0);
  LIBS.translateZ(TailTip.MOVE_MATRIX, 2.0);
  
  Body.childs.push(TailTip);

  // ========================================
  // FRONT LEFT ARM
  // ========================================
  const frontLeftArmData = generateEllipsoid(0.22, 0.6, 0.22, 16, 16, SOBBLE_BLUE);
  const FrontLeftArm = new MyObject(GL, SHADER_PROGRAM, _position, _color, frontLeftArmData);
  
  // On left side of body, slightly forward
  LIBS.translateX(FrontLeftArm.MOVE_MATRIX, -2.0);
  LIBS.translateY(FrontLeftArm.MOVE_MATRIX, 1.5);
  LIBS.translateZ(FrontLeftArm.MOVE_MATRIX, 1.0);
  
  Body.childs.push(FrontLeftArm);

  // === LEFT HAND
  const leftHandData = generateEllipsoid(0.36, 0.15, 0.3, 16, 16, SOBBLE_BLUE);
  const LeftHand = new MyObject(GL, SHADER_PROGRAM, _position, _color, leftHandData);
  
  LIBS.translateX(LeftHand.MOVE_MATRIX, -0.6);
  LIBS.translateY(LeftHand.MOVE_MATRIX, -0.8);
  LIBS.translateZ(LeftHand.MOVE_MATRIX, 0.3);
  
  FrontLeftArm.childs.push(LeftHand);

  // ========================================
  // FRONT RIGHT ARM
  // ========================================
  const frontRightArmData = generateEllipsoid(0.22, 0.6, 0.22, 16, 16, SOBBLE_BLUE);
  const FrontRightArm = new MyObject(GL, SHADER_PROGRAM, _position, _color, frontRightArmData);
  
  LIBS.translateX(FrontRightArm.MOVE_MATRIX, 2.0);
  LIBS.translateY(FrontRightArm.MOVE_MATRIX, 1.5);
  LIBS.translateZ(FrontRightArm.MOVE_MATRIX, 1.0);
  
  Body.childs.push(FrontRightArm);

  // === RIGHT HAND
  const rightHandData = generateEllipsoid(0.36, 0.15, 0.3, 16, 16, SOBBLE_BLUE);
  const RightHand = new MyObject(GL, SHADER_PROGRAM, _position, _color, rightHandData);
  
  LIBS.translateX(RightHand.MOVE_MATRIX, 0.6);
  LIBS.translateY(RightHand.MOVE_MATRIX, -0.8);
  LIBS.translateZ(RightHand.MOVE_MATRIX, 0.3);
  
  FrontRightArm.childs.push(RightHand);

  // ========================================
  // BACK LEFT LEG
  // ========================================
  const backLeftLegData = generateEllipsoid(0.32, 0.5, 0.32, 16, 16, SOBBLE_BLUE);
  const BackLeftLeg = new MyObject(GL, SHADER_PROGRAM, _position, _color, backLeftLegData);
  
  // Behind and to the left of body
  LIBS.translateX(BackLeftLeg.MOVE_MATRIX, -1.5);
  LIBS.translateY(BackLeftLeg.MOVE_MATRIX, -0.5);
  LIBS.translateZ(BackLeftLeg.MOVE_MATRIX, -2.0);
  
  Body.childs.push(BackLeftLeg);

  // === LEFT CALF
  const leftCalfData = generateEllipsoid(0.32, 0.75, 0.28, 16, 16, SOBBLE_BLUE);
  const LeftCalf = new MyObject(GL, SHADER_PROGRAM, _position, _color, leftCalfData);
  
  LIBS.translateX(LeftCalf.MOVE_MATRIX, -0.9);
  LIBS.translateY(LeftCalf.MOVE_MATRIX, -0.7);
  LIBS.translateZ(LeftCalf.MOVE_MATRIX, -0.3);
  
  BackLeftLeg.childs.push(LeftCalf);

  // === LEFT FOOT
  const leftFootData = generateEllipsoid(0.6, 0.2, 0.44, 16, 16, SOBBLE_BLUE);
  const LeftFoot = new MyObject(GL, SHADER_PROGRAM, _position, _color, leftFootData);
  
  LIBS.translateX(LeftFoot.MOVE_MATRIX, -0.6);
  LIBS.translateY(LeftFoot.MOVE_MATRIX, -0.8);
  LIBS.translateZ(LeftFoot.MOVE_MATRIX, 0.3);
  
  LeftCalf.childs.push(LeftFoot);

  // ========================================
  // BACK RIGHT LEG
  // ========================================
  const backRightLegData = generateEllipsoid(0.32, 0.5, 0.32, 16, 16, SOBBLE_BLUE);
  const BackRightLeg = new MyObject(GL, SHADER_PROGRAM, _position, _color, backRightLegData);
  
  LIBS.translateX(BackRightLeg.MOVE_MATRIX, 1.5);
  LIBS.translateY(BackRightLeg.MOVE_MATRIX, -0.5);
  LIBS.translateZ(BackRightLeg.MOVE_MATRIX, -2.0);
  
  Body.childs.push(BackRightLeg);

  // === RIGHT CALF
  const rightCalfData = generateEllipsoid(0.32, 0.75, 0.28, 16, 16, SOBBLE_BLUE);
  const RightCalf = new MyObject(GL, SHADER_PROGRAM, _position, _color, rightCalfData);
  
  LIBS.translateX(RightCalf.MOVE_MATRIX, 0.9);
  LIBS.translateY(RightCalf.MOVE_MATRIX, -0.7);
  LIBS.translateZ(RightCalf.MOVE_MATRIX, -0.3);
  
  BackRightLeg.childs.push(RightCalf);

  // === RIGHT FOOT
  const rightFootData = generateEllipsoid(0.6, 0.2, 0.44, 16, 16, SOBBLE_BLUE);
  const RightFoot = new MyObject(GL, SHADER_PROGRAM, _position, _color, rightFootData);
  
  LIBS.translateX(RightFoot.MOVE_MATRIX, 0.6);
  LIBS.translateY(RightFoot.MOVE_MATRIX, -0.8);
  LIBS.translateZ(RightFoot.MOVE_MATRIX, 0.3);
  
  RightCalf.childs.push(RightFoot);

  console.log("✅ Sobble created - Hierarchical structure with proper spacing");
  console.log("   Body parts:", Body.childs.length);
  
  return Body;
}
