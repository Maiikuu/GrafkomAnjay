import { MyObject } from "./MyObject.js";
import { createInteleon } from "./UTS inteleon/inteleon_scene.js";
import { createDrizzile } from "./UTS drizzile/drizzile_scene.js";
import { createSobble } from "./Sobble/sobble_scene.js";

export function createEvolutionScene(GL, SHADER_PROGRAM, _position, _color, _PMatrix, _VMatrix, _MMatrix) {
    // === CREATE INDIVIDUAL SCENES ===
    const inteleon = createInteleon(GL, SHADER_PROGRAM, _position, _color, _PMatrix, _VMatrix, _MMatrix);
    const drizzileScene = createDrizzile(GL, SHADER_PROGRAM, _position, _color, _PMatrix, _VMatrix, _MMatrix);
    const sobbleScene = createSobble(GL, SHADER_PROGRAM, _position, _color, _PMatrix, _VMatrix, _MMatrix);

    // === WRAP DRIZZILE ROOT (so it behaves like MyObject) ===
    const drizzile = drizzileScene.root;

    // === WRAP SOBBLE (special setup/render style) ===
    const sobble = new MyObject(GL, SHADER_PROGRAM, _position, _color);
    sobble.setup = sobbleScene.setup;
    sobble.draw = sobbleScene.render;
    sobble.MOVE_MATRIX = LIBS.get_I4();

    // === POSITION EACH POKÉMON ===
    LIBS.translateX(inteleon.MOVE_MATRIX, -4.0); // left side
    LIBS.translateX(drizzile.MOVE_MATRIX, 0.0);  // center
    LIBS.translateX(sobble.MOVE_MATRIX, 4.0);    // right side

    // === SCALE TO MATCH PROPORTIONS ===
    ["X", "Y", "Z"].forEach(axis => LIBS[`scale${axis}`](sobble.MOVE_MATRIX, 1.2));
    ["X", "Y", "Z"].forEach(axis => LIBS[`scale${axis}`](drizzile.MOVE_MATRIX, 1.0));
    ["X", "Y", "Z"].forEach(axis => LIBS[`scale${axis}`](inteleon.MOVE_MATRIX, 0.8));

    // === CREATE CONTAINER OBJECT ===
    const evolutionGroup = new MyObject(GL, SHADER_PROGRAM, _position, _color);
    evolutionGroup.childs.push(inteleon, drizzile, sobble);

    // === SETUP FUNCTION ===
    evolutionGroup.setup = function () {
        if (inteleon.setup) inteleon.setup();
        if (drizzile.setup) drizzile.setup();
        if (drizzileScene.field) drizzileScene.field.setup();
        if (drizzileScene.grass) drizzileScene.grass.setup();
        if (drizzileScene.tree) drizzileScene.tree.setup();
        if (sobble.setup) sobble.setup();
    };

    // === DRAW FUNCTION ===
    evolutionGroup.draw = function (time, P, V) {
        if (inteleon.draw) inteleon.draw(time, P, V);
        if (drizzile.draw) drizzile.draw(time, P, V);
        if (sobble.draw) sobble.draw(time, P, V);
        if (drizzileScene.field) drizzileScene.field.draw(time, P, V);
        if (drizzileScene.grass) drizzileScene.grass.draw(time, P, V);
        if (drizzileScene.tree) drizzileScene.tree.draw(time, P, V);
    };

    return evolutionGroup;
}
