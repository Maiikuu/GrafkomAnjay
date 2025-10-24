import { MyObject } from "./MyObject.js";
import { createInteleon } from "./UTS inteleon/inteleon_scene.js";
import { createDrizzile } from "./UTS drizzile/drizzile_scene.js";
import { createSobble } from "./Sobble/sobble_scene.js";

export function createEvolutionScene(GL, SHADER_PROGRAM, _position, _color) {
    // Create all three Pokemon
    const inteleon = createInteleon(GL, SHADER_PROGRAM, _position, _color);
    const drizzile = createDrizzile(GL, SHADER_PROGRAM, _position, _color);
    const sobble = createSobble(GL, SHADER_PROGRAM, _position, _color);

    // Position them side by side
    LIBS.translateX(inteleon.MOVE_MATRIX, -4.0);  // left
    LIBS.translateX(drizzile.MOVE_MATRIX, 0.0);   // center
    LIBS.translateX(sobble.MOVE_MATRIX, 4.0);     // right

    // Scale them to similar sizes
    LIBS.scaleXYZ(sobble.MOVE_MATRIX, 1.2);
    LIBS.scaleXYZ(drizzile.MOVE_MATRIX, 1.0);
    LIBS.scaleXYZ(inteleon.MOVE_MATRIX, 0.8);

    // Create a container object to hold all three
    const evolutionGroup = new MyObject(GL, SHADER_PROGRAM, _position, _color);
    evolutionGroup.childs.push(inteleon, drizzile, sobble);

    return evolutionGroup;
}