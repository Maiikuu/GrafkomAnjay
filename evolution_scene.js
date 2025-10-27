import { MyObject } from "./MyObject.js";

// Import scene creators from subfolders
import { createInteleon } from "./inteleon/inteleon_scene.js";
import { createDrizzile } from "./drizzile/drizzile_scene.js";
import { createSobble } from "./Sobble/sobble_scene.js";
import { createEnvironment } from "./Sobble/environment.js";

export function createEvolutionScene(
  GL,
  SHADER_PROGRAM,
  _position,
  _color,
  _PMatrix,
  _VMatrix,
  _MMatrix
) {
  console.log("\n=== CREATING EVOLUTION SCENE ===");

  // === CREATE INDIVIDUAL SCENES ===
  console.log("Creating Sobble...");
  const sobbleResult = createSobble(GL, SHADER_PROGRAM, _position, _color);

  console.log("Creating Drizzile...");
  const drizzileResult = createDrizzile(GL, SHADER_PROGRAM, _position, _color);

  console.log("Creating Inteleon...");
  const inteleonResult = createInteleon(GL, SHADER_PROGRAM, _position, _color);

  const environment = createEnvironment(GL, SHADER_PROGRAM, _position, _color);

  // === WRAP SOBBLE ===
  const sobbleWrapper = new MyObject(
    GL,
    SHADER_PROGRAM,
    _position,
    _color,
    _PMatrix,
    _VMatrix,
    _MMatrix
  );
  sobbleWrapper.sobbleObj = sobbleResult;

  sobbleWrapper.render = function (_MMatrix, PARENT_MATRIX) {
    if (this.sobbleObj && this.sobbleObj.render) {
      this.sobbleObj.render(_MMatrix, PARENT_MATRIX);
    }
  };

  // === SOBBLE POSITIONING (Smallest - Left) ===
  // Sobble is the baby form, so smallest
  LIBS.translateX(sobbleWrapper.MOVE_MATRIX, -13.0); // Far left
  LIBS.translateY(sobbleWrapper.MOVE_MATRIX, 0); // Slightly up
  LIBS.scaleX(sobbleWrapper.MOVE_MATRIX, 1.0); // Normal size (smallest)
  LIBS.scaleY(sobbleWrapper.MOVE_MATRIX, 1.0);
  LIBS.scaleZ(sobbleWrapper.MOVE_MATRIX, 1.0);

  console.log("✓ Sobble: Position X=-18, Y=-1.5, Scale=1.0");

  // === GET DRIZZILE ROOT ===
  const drizzileRoot = drizzileResult.root || drizzileResult;

  // === DRIZZILE POSITIONING (Medium - Center) ===
  // Drizzile is middle evolution, medium size
  LIBS.translateX(drizzileRoot.MOVE_MATRIX, -1); // Center
  LIBS.translateY(drizzileRoot.MOVE_MATRIX, 1.5); // Middle height
  LIBS.scaleX(drizzileRoot.MOVE_MATRIX, 2); // Slightly bigger than Sobble
  LIBS.scaleY(drizzileRoot.MOVE_MATRIX, 2);
  LIBS.scaleZ(drizzileRoot.MOVE_MATRIX, 2);

  console.log("✓ Drizzile: Position X=0, Y=-2.5, Scale=1.3");

  // === GET INTELEON ROOT ===
  const inteleonRoot = inteleonResult;

  // === INTELEON POSITIONING (Largest - Right) ===
  // Inteleon is final evolution, tallest and most mature
  LIBS.translateX(inteleonRoot.MOVE_MATRIX, 3.0); // Far right
  LIBS.translateY(inteleonRoot.MOVE_MATRIX, 5); // Lower (taller model)
  LIBS.translateZ(inteleonRoot.MOVE_MATRIX, 5.5);
  LIBS.scaleX(inteleonRoot.MOVE_MATRIX, 1); // Largest
  LIBS.scaleY(inteleonRoot.MOVE_MATRIX, 1);
  LIBS.scaleZ(inteleonRoot.MOVE_MATRIX, 1);

  console.log("✓ Inteleon: Position X=18, Y=-3.5, Scale=1.5");

  console.log("=== SCENE CREATION COMPLETE ===\n");

  // === RETURN COMBINED SCENE ===
  return {
    environment: environment,
    sobble: sobbleWrapper,
    drizzile: drizzileRoot,
    inteleon: inteleonRoot,

    setup: function () {
      console.log("\n=== SETTING UP SCENE ===");

      try {
        if (this.environment && this.environment.setup) {
          this.environment.setup();
          console.log("✓ Environment setup complete");
        }
      } catch (e) {
        console.error("✗ Environment setup failed:", e);
      }

      try {
        if (sobbleResult && sobbleResult.setup) {
          sobbleResult.setup();
          console.log("✓ Sobble setup complete");
        }
      } catch (e) {
        console.error("✗ Sobble setup failed:", e);
      }

      try {
        if (drizzileRoot && drizzileRoot.setup) {
          drizzileRoot.setup();
          console.log("✓ Drizzile setup complete");
        }
      } catch (e) {
        console.error("✗ Drizzile setup failed:", e);
      }

      try {
        if (inteleonRoot && inteleonRoot.setup) {
          inteleonRoot.setup();
          console.log("✓ Inteleon setup complete");
        }
      } catch (e) {
        console.error("✗ Inteleon setup failed:", e);
      }

      console.log("=== SETUP COMPLETE ===\n");
    },

    render: function (time) {
      const identityMatrix = LIBS.get_I4();

      try {
        if (this.environment && this.environment.render) {
          this.environment.render(_MMatrix, identityMatrix);
        }
      } catch (e) {
        console.error("Environment render error:", e);
      }

      // Render Sobble
      try {
        if (sobbleWrapper && sobbleWrapper.render) {
          const sobbleMatrix = LIBS.multiply(
            sobbleWrapper.MOVE_MATRIX,
            identityMatrix
          );
          sobbleWrapper.render(_MMatrix, sobbleMatrix);
        }
      } catch (e) {
        if (Math.floor(time * 60) % 60 === 0) {
          console.error("Sobble render error:", e);
        }
      }

      // Render Drizzile
      try {
        if (drizzileRoot && drizzileRoot.render) {
          const drizzileMatrix = LIBS.multiply(
            drizzileRoot.MOVE_MATRIX,
            identityMatrix
          );
          drizzileRoot.render(_MMatrix, drizzileMatrix);
        }
      } catch (e) {
        if (Math.floor(time * 60) % 60 === 0) {
          console.error("Drizzile render error:", e);
        }
      }

      // Render Inteleon
      try {
        if (inteleonRoot && inteleonRoot.render) {
          const inteleonMatrix = LIBS.multiply(
            inteleonRoot.MOVE_MATRIX,
            identityMatrix
          );
          inteleonRoot.render(_MMatrix, inteleonMatrix);
        }
      } catch (e) {
        if (Math.floor(time * 60) % 60 === 0) {
          console.error("Inteleon render error:", e);
        }
      }
    },

    draw: function (time, P, V) {
      this.render(time);
    },
  };
}
