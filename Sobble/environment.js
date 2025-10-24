import { generateSphere, generateEllipsoid } from "./main.js";
import { MyObject } from "./MyObject.js";

export function createEnvironment(GL, SHADER_PROGRAM, _position, _color) {
    const allParts = [];

    // Warna environment
    const GRASS_GREEN = [0.2, 0.6, 0.3];
    const GRASS_DARK = [0.15, 0.5, 0.25];
    const DIRT_BROWN = [0.4, 0.3, 0.2];
    const STONE_GRAY = [0.5, 0.5, 0.55];
    const STONE_DARK = [0.35, 0.35, 0.4];
    const WATER_BLUE = [0.2, 0.5, 0.7];

    // === GROUND - Tanah besar ===
    const groundData = generateEllipsoid(15, 0.3, 15, 32, 8, GRASS_GREEN);
    const ground = new MyObject(GL, SHADER_PROGRAM, _position, _color, groundData);
    ground.pos = [0, -1.8, 0];
    allParts.push(ground);

    // === DIRT PATCHES - Tanah coklat ===
    const dirtPatch1Data = generateEllipsoid(2.5, 0.15, 2, 24, 8, DIRT_BROWN);
    const dirtPatch1 = new MyObject(GL, SHADER_PROGRAM, _position, _color, dirtPatch1Data);
    dirtPatch1.pos = [3, -1.45, 2];
    allParts.push(dirtPatch1);

    const dirtPatch2Data = generateEllipsoid(2, 0.15, 1.8, 24, 8, DIRT_BROWN);
    const dirtPatch2 = new MyObject(GL, SHADER_PROGRAM, _position, _color, dirtPatch2Data);
    dirtPatch2.pos = [-4, -1.45, -3];
    allParts.push(dirtPatch2);

    // === SMALL POND - Kolam kecil ===
    const pondData = generateEllipsoid(3.5, 0.2, 3, 32, 8, WATER_BLUE);
    const pond = new MyObject(GL, SHADER_PROGRAM, _position, _color, pondData);
    pond.pos = [-2, -1.55, 3];
    allParts.push(pond);

    // === ROCKS - Batu-batu besar ===
    // Batu 1 - besar
    const rock1Data = generateEllipsoid(1.2, 0.9, 1.0, 16, 12, STONE_GRAY);
    const rock1 = new MyObject(GL, SHADER_PROGRAM, _position, _color, rock1Data);
    rock1.pos = [5, -1.0, -2];
    allParts.push(rock1);

    // Batu 2 - medium
    const rock2Data = generateEllipsoid(0.8, 0.6, 0.7, 16, 12, STONE_DARK);
    const rock2 = new MyObject(GL, SHADER_PROGRAM, _position, _color, rock2Data);
    rock2.pos = [6.5, -1.2, -1.5];
    allParts.push(rock2);

    // Batu 3 - kecil
    const rock3Data = generateEllipsoid(0.5, 0.4, 0.5, 16, 12, STONE_GRAY);
    const rock3 = new MyObject(GL, SHADER_PROGRAM, _position, _color, rock3Data);
    rock3.pos = [4.5, -1.3, -3];
    allParts.push(rock3);

    // Batu 4 - di sisi lain
    const rock4Data = generateEllipsoid(0.9, 0.7, 0.8, 16, 12, STONE_DARK);
    const rock4 = new MyObject(GL, SHADER_PROGRAM, _position, _color, rock4Data);
    rock4.pos = [-5, -1.1, 1];
    allParts.push(rock4);

    // Batu 5 - kecil di tepi kolam
    const rock5Data = generateEllipsoid(0.4, 0.3, 0.4, 16, 12, STONE_GRAY);
    const rock5 = new MyObject(GL, SHADER_PROGRAM, _position, _color, rock5Data);
    rock5.pos = [-4, -1.3, 4.5];
    allParts.push(rock5);

    // === GRASS TUFTS - Rumput kecil ===
    // Rumput 1
    const grass1Data = generateEllipsoid(0.3, 0.5, 0.3, 12, 12, GRASS_DARK);
    const grass1 = new MyObject(GL, SHADER_PROGRAM, _position, _color, grass1Data);
    grass1.pos = [2, -1.2, 4];
    allParts.push(grass1);

    // Rumput 2
    const grass2Data = generateEllipsoid(0.25, 0.45, 0.25, 12, 12, GRASS_DARK);
    const grass2 = new MyObject(GL, SHADER_PROGRAM, _position, _color, grass2Data);
    grass2.pos = [2.8, -1.25, 3.5];
    allParts.push(grass2);

    // Rumput 3
    const grass3Data = generateEllipsoid(0.28, 0.48, 0.28, 12, 12, GRASS_DARK);
    const grass3 = new MyObject(GL, SHADER_PROGRAM, _position, _color, grass3Data);
    grass3.pos = [-3, -1.2, -2];
    allParts.push(grass3);

    // Rumput 4
    const grass4Data = generateEllipsoid(0.26, 0.46, 0.26, 12, 12, GRASS_DARK);
    const grass4 = new MyObject(GL, SHADER_PROGRAM, _position, _color, grass4Data);
    grass4.pos = [0, -1.25, 5];
    allParts.push(grass4);

    // Rumput 5
    const grass5Data = generateEllipsoid(0.3, 0.5, 0.3, 12, 12, GRASS_DARK);
    const grass5 = new MyObject(GL, SHADER_PROGRAM, _position, _color, grass5Data);
    grass5.pos = [-6, -1.2, -4];
    allParts.push(grass5);

    // === SMALL STONES - Kerikil kecil ===
    const pebble1Data = generateSphere(0.15, 12, 8, STONE_GRAY);
    const pebble1 = new MyObject(GL, SHADER_PROGRAM, _position, _color, pebble1Data);
    pebble1.pos = [1, -1.4, 1];
    allParts.push(pebble1);

    const pebble2Data = generateSphere(0.12, 12, 8, STONE_DARK);
    const pebble2 = new MyObject(GL, SHADER_PROGRAM, _position, _color, pebble2Data);
    pebble2.pos = [1.5, -1.4, 0.8];
    allParts.push(pebble2);

    const pebble3Data = generateSphere(0.13, 12, 8, STONE_GRAY);
    const pebble3 = new MyObject(GL, SHADER_PROGRAM, _position, _color, pebble3Data);
    pebble3.pos = [-1, -1.4, -1];
    allParts.push(pebble3);

    return {
        setup: () => allParts.forEach(part => part.setup()),
        render: (_Mmatrix, parentMat) => {
            allParts.forEach(part => part.render(_Mmatrix, parentMat));
        }
    };
}
