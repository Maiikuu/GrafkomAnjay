/*================== CYLINDER ==================*/
export function createCylinder(radius = 1, height = 2, segments = 32, color = [1,1,1]) {
    const vertices = [];
    const faces = [];
    const halfH = height / 2;

    for (let i = 0; i <= segments; i++) {
        const angle = (i / segments) * 2 * Math.PI;
        const x = Math.cos(angle) * radius;
        const z = Math.sin(angle) * radius;

        // top vertex
        vertices.push(
            x, halfH, z,
            color[0], color[1], color[2]
        );

        // bottom vertex - use passed color instead of calculating
        vertices.push(
            x, -halfH, z,
            color[0], color[1], color[2]
        );
    }

    // side faces
    for (let i = 0; i < segments; i++) {
        const top1 = i * 2;
        const bottom1 = top1 + 1;
        const top2 = (i + 1) * 2;
        const bottom2 = top2 + 1;

        faces.push(top1, bottom1, top2);
        faces.push(bottom1, bottom2, top2);
    }

    // add centers
    const topCenterIndex = vertices.length / 6;
    vertices.push(0, halfH, 0, 1, 1, 1);
    const bottomCenterIndex = topCenterIndex + 1;
    vertices.push(0, -halfH, 0, 0, 0, 0);

    // caps
    for (let i = 0; i < segments; i++) {
        const top1 = i * 2;
        const top2 = ((i + 1) % segments) * 2;
        const bottom1 = i * 2 + 1;
        const bottom2 = ((i + 1) % segments) * 2 + 1;

        faces.push(topCenterIndex, top2, top1);
        faces.push(bottomCenterIndex, bottom1, bottom2);
    }

    return { vertices, faces };
}
/*================== TRAPEZOID (Trapezoidal Prism) ==================*/
export function createTrapezoid(bottomWidth = 2, topWidth = 1, height = 2, bottomDepth = 2, topDepth = 1, radius = 2, segments = 10, color = [1,1,1]) {
    const vertices = [];
    const faces = [];

    const halfH = height / 2;
    const r = Math.min(radius, Math.min(bottomWidth, topWidth, height, bottomDepth, topDepth) * 0.56);

    const stepY = height / segments;

    const pushVertex = (x, y, z) => {
        vertices.push(
            x, y, z,
            color[0], color[1], color[2] // use passed color instead of calculating
        );
    };

    // rounding function that respects local width/depth
    const roundCorner = (x, y, z, localHalfWidth, localHalfDepth) => {
        const cx = Math.max(-localHalfWidth + r, Math.min(localHalfWidth - r, x));
        const cy = Math.max(-halfH + r, Math.min(halfH - r, y));
        const cz = Math.max(-localHalfDepth + r, Math.min(localHalfDepth - r, z));

        const dx = x - cx;
        const dy = y - cy;
        const dz = z - cz;
        const len = Math.hypot(dx, dy, dz);

        if (len > 0.00001) {
            const scale = r / len;
            x = cx + dx * scale;
            y = cy + dy * scale;
            z = cz + dz * scale;
        }

        return [x, y, z];
    };

    for (let i = 0; i <= segments; i++) {
        const t = i / segments;
        const y = -halfH + t * height;

        // evenly blend top and bottom size
        const halfWidth = (bottomWidth / 2) * (1 - t) + (topWidth / 2) * t;
        const halfDepth = (bottomDepth / 2) * (2 - t) + (topDepth / 2) * t/2;

        for (let j = 0; j <= segments; j++) {
            const x = -halfWidth + (j / segments) * (2 * halfWidth);
            for (let k = 0; k <= segments; k++) {
                const z = -halfDepth + (k / segments) * (2 * halfDepth);

                // keep the rounding
                const [rx, ry, rz] = roundCorner(x, y, z, halfWidth, halfDepth);
                pushVertex(rx, ry, rz);
            }
        }
    }


    const row = segments + 1;
    const layer = row * row;

    // side faces
    for (let i = 0; i < segments; i++) {
        for (let j = 0; j < row - 1; j++) {
            for (let k = 0; k < row - 1; k++) {
                const base = i * layer;
                const a = base + j * row + k;
                const b = base + (j + 1) * row + k;
                const c = base + (j + 1) * row + (k + 1);
                const d = base + j * row + (k + 1);
                const a2 = a + layer;
                const b2 = b + layer;
                const c2 = c + layer;
                const d2 = d + layer;

                faces.push(a, b, b2, a, b2, a2);
                faces.push(c, d, d2, c, d2, c2);
                faces.push(d, a, a2, d, a2, d2);
            }
        }
    }

    // top & bottom lids
    const bottomStart = 0;
    const topStart = segments * layer;
    for (let j = 0; j < row - 1; j++) {
        for (let k = 0; k < row - 1; k++) {
            const a = bottomStart + j * row + k;
            const b = bottomStart + (j + 1) * row + k;
            const c = bottomStart + (j + 1) * row + (k + 1);
            const d = bottomStart + j * row + (k + 1);
            faces.push(a, c, b, a, d, c);

            const A = topStart + j * row + k;
            const B = topStart + (j + 1) * row + k;
            const C = topStart + (j + 1) * row + (k + 1);
            const D = topStart + j * row + (k + 1);
            faces.push(A, B, C, A, C, D);
        }
    }

    return { vertices, faces };
}
/*================== ROUNDED CUBE ==================*/
export function createRoundedCube(size = 2, radius = 0.25, segments = 8) {
    const vertices = [];
    const faces = [];
    const h = size / 2;
    const r = Math.min(radius, h * 0.99);
    const step = size / segments;

    const pushVertex = (x, y, z) => {
        vertices.push(x, y, z, (x + h) / size, (y + h) / size, (z + h) / size);
    };

    // helper to clamp inside the cube's core and curve edges
    const roundCorner = (x, y, z) => {
        // clamp to cube core
        const cx = Math.max(-h + r, Math.min(h - r, x));
        const cy = Math.max(-h + r, Math.min(h - r, y));
        const cz = Math.max(-h + r, Math.min(h - r, z));

        // compute distance from clamped core to corner
        const dx = x - cx;
        const dy = y - cy;
        const dz = z - cz;
        const len = Math.hypot(dx, dy, dz);

        if (len > 0.00001) {
            const scale = r / len;
            x = cx + dx * scale;
            y = cy + dy * scale;
            z = cz + dz * scale;
        }
        return [x, y, z];
    };

    const makeFace = (nx, ny, nz) => {
        const startIndex = vertices.length / 6;

        for (let i = 0; i <= segments; i++) {
            for (let j = 0; j <= segments; j++) {
                const u = -h + i * step;
                const v = -h + j * step;
                let x, y, z;

                if (nx !== 0) {      // ±X faces
                    x = nx * h;
                    y = u;
                    z = v;
                } else if (ny !== 0) { // ±Y faces
                    x = u;
                    y = ny * h;
                    z = v;
                } else {              // ±Z faces
                    x = u;
                    y = v;
                    z = nz * h;
                }

                // now actually bend corners
                [x, y, z] = roundCorner(x, y, z);

                pushVertex(x, y, z);
            }
        }

        const vertsPerRow = segments + 1;
        for (let i = 0; i < segments; i++) {
            for (let j = 0; j < segments; j++) {
                const a = startIndex + i * vertsPerRow + j;
                const b = startIndex + (i + 1) * vertsPerRow + j;
                const c = startIndex + (i + 1) * vertsPerRow + (j + 1);
                const d = startIndex + i * vertsPerRow + (j + 1);
                faces.push(a, b, c, a, c, d);
            }
        }
    };

    makeFace(1, 0, 0);
    makeFace(-1, 0, 0);
    makeFace(0, 1, 0);
    makeFace(0, -1, 0);
    makeFace(0, 0, 1);
    makeFace(0, 0, -1);

    return { vertices, faces };
}
export function createHyperboloid1Sheet(
    a = 1, b = 1, c = 1, height = 4,
    slices = 48, stacks = 48,
    flareFactor = 0.5,    // top wider
    stretchFactor = 1.0,  // elongates waist vertically
    color = [0.5, 0.5, 0.5]  // 🟢 RGB input (default gray)
) {
    const vertices = [];
    const faces = [];

    const yMin = -height / 2;
    const yMax = height / 2;
    const dy = (yMax - yMin) / stacks;

    for (let i = 0; i <= stacks; i++) {
        const y = yMin + i * dy;

        // normalized 0 (bottom) → 1 (top)
        const t = (y - yMin) / (yMax - yMin);

        // make top flare out more
        const flare = 1.0 + flareFactor * t;

        // apply stretch (affects curvature)
        const r = Math.sqrt(1 + (y * y) / ((c * stretchFactor) * (c * stretchFactor))) * flare;

        for (let j = 0; j <= slices; j++) {
            const u = (j / slices) * 2 * Math.PI;
            const x = a * r * Math.cos(u);
            const z = b * r * Math.sin(u);

            // push vertex with color
            vertices.push(
                x, y, z,
                color[0], color[1], color[2]
            );
        }
    }

    // Faces (triangles)
    const row = slices + 1;
    for (let i = 0; i < stacks; i++) {
        for (let j = 0; j < slices; j++) {
            const aIdx = i * row + j;
            const bIdx = aIdx + row;
            const cIdx = bIdx + 1;
            const dIdx = aIdx + 1;

            faces.push(aIdx, bIdx, dIdx);
            faces.push(bIdx, cIdx, dIdx);
        }
    }

    return { vertices, faces };
}
export function createEllipticParaboloid(
    a = 1,       // radius in X
    b = 1,       // radius in Y
    h = 2,       // height scale
    slices = 48, // around
    stacks = 48, // radial
    color = [1,1,1] // add color parameter with default white
) {
    const vertices = [];
    const faces = [];

    // build vertices with constant color
    for (let i = 0; i <= stacks; i++) {
        const r = i / stacks;
        const z = h * r * r;

        for (let j = 0; j <= slices; j++) {
            const theta = (j / slices) * 2 * Math.PI;
            const x = a * r * Math.cos(theta);
            const y = b * r * Math.sin(theta);

            // Use passed color instead of calculating
            vertices.push(x, y, z, color[0], color[1], color[2]);
        }
    }

    // build faces
    const row = slices + 1;
    for (let i = 0; i < stacks; i++) {
        for (let j = 0; j < slices; j++) {
            const aIdx = i * row + j;
            const bIdx = aIdx + row;
            const cIdx = bIdx + 1;
            const dIdx = aIdx + 1;

            faces.push(aIdx, bIdx, dIdx);
            faces.push(bIdx, cIdx, dIdx);
        }
    }

    return { vertices, faces };
}
/*================== STREAMLINED HEAD (Inteleon-like) ==================*/
export function createStreamlinedHead(
    rx = 0.45, ry = 0.55, rz = 0.9,  // base radii (X, Y, Z)
    segU = 48, segV = 32,            // horizontal, vertical subdivisions
    colorFront = [0.1, 0.45, 0.8],   // front tone
    colorBack = [0.05, 0.25, 0.5]    // back tone (slightly darker)
) {
    const vertices = [];
    const faces = [];

    // Loop through vertical slices (theta)
    for (let i = 0; i <= segV; i++) {
        const v = i / segV;
        const theta = v * Math.PI;
        const sinT = Math.sin(theta);
        const cosT = Math.cos(theta);

        for (let j = 0; j <= segU; j++) {
            const u = j / segU;
            const phi = u * 2 * Math.PI;
            const sinP = Math.sin(phi);
            const cosP = Math.cos(phi);

            // --- Base ellipsoid ---
            let x = rx * sinT * cosP;
            let y = ry * cosT;
            let z = rz * sinT * sinP;

            // --- Compute forward blend (front-back progression) ---
            const frontBlend = (z + rz) / (2 * rz); // 0 = back, 1 = front

            // --- Shape deformation ---
            const stretch = 1.0 + 0.4 * Math.pow(frontBlend, 1.5);   // forward elongation
            const bendAmount = 0.4 * Math.pow(frontBlend, 2.0);      // tilt downwards
            const taper = 1.0 - 0.5 * Math.pow(frontBlend, 1.5);     // narrow snout

            // --- Apply deformation ---
            const yBend = y - bendAmount * frontBlend;
            const zBend = z - bendAmount * 0.3;

            x *= taper;
            y = yBend * (1 - 0.1 * frontBlend);
            z = zBend * stretch;

            // --- Compute vertex color blend ---
            const r = colorBack[0] + (colorFront[0] - colorBack[0]) * frontBlend;
            const g = colorBack[1] + (colorFront[1] - colorBack[1]) * frontBlend;
            const b = colorBack[2] + (colorFront[2] - colorBack[2]) * frontBlend;

            vertices.push(x, y, z, r, g, b);
        }
    }

    // Build triangle faces
    const row = segU + 1;
    for (let i = 0; i < segV; i++) {
        for (let j = 0; j < segU; j++) {
            const a = i * row + j;
            const b = a + row;
            const c = b + 1;
            const d = a + 1;

            faces.push(a, b, d);
            faces.push(b, c, d);
        }
    }

    return { vertices, faces };
}

export function createFin(baseWidth = 1.0, height = 3.0, depth = 0.3, curve = 0.4, segments = 24, color = [0.0, 0.0, 1.0]) {
    const vertices = [];
    const faces = [];

    // safety clamp
    baseWidth = Math.max(baseWidth, 0.001);
    segments = Math.max(2, Math.floor(segments));

    for (let i = 0; i <= segments; i++) {
        const t = i / segments;
        const y = t * height;
        const scale = 1.0 - 0.9 * t; // taper near tip
        const zOffset = -Math.sin(t * Math.PI * 0.5) * height * curve;

        const halfW = (baseWidth * scale) / 2;
        const halfD = (depth * scale) / 2;

        // color per-vertex
        const r = color[0], g = color[1], b = color[2];

        // Left
        vertices.push(-halfW, y, zOffset - halfD, r, g, b);
        // Right
        vertices.push(halfW, y, zOffset - halfD, r, g, b);
        // Top (spine)
        vertices.push(0.0, y, zOffset + halfD, r, g, b);
    }

    // connect each segment pair with consistent winding (no caps)
    for (let i = 0; i < segments; i++) {
        const base = i * 3;
        const next = base + 3;

        const L0 = base, R0 = base + 1, T0 = base + 2;
        const L1 = next, R1 = next + 1, T1 = next + 2;

        // left wall
        faces.push(L0, L1, T0);
        faces.push(T0, L1, T1);

        // right wall
        faces.push(R0, T0, R1);
        faces.push(T0, T1, R1);

        // bottom connecting quad
        faces.push(L0, R0, L1);
        faces.push(R0, R1, L1);
    }

    return { vertices, faces };
}

export function createBSpline(curvePoints, baseRadius = 0.4, taper = 0.9, segments = 16) {
    const vertices = [];
    const faces = [];

    for (let i = 0; i < curvePoints.length; i++) {
        const [cx, cy, cz] = curvePoints[i];
        const radius = baseRadius * Math.pow(taper, i / curvePoints.length);

        for (let j = 0; j <= segments; j++) {
            const angle = (j / segments) * 2 * Math.PI;
            const x = cx + radius * Math.cos(angle);
            const y = cy + radius * Math.sin(angle);
            const z = cz;
            vertices.push(x, y, z, 0.2, 0.6, 1.0); // blueish color
        }
    }

    const rowVerts = segments + 1;
    for (let i = 0; i < curvePoints.length - 1; i++) {
        for (let j = 0; j < segments; j++) {
            const a = i * rowVerts + j;
            const b = a + rowVerts;
            faces.push(a, b, a + 1);
            faces.push(b, b + 1, a + 1);
        }
    }

    return { vertices, faces };
}
export function createCape(width = 2.0, height = 2.5, depth = 0.1, curve = 0.6, segments = 24) {
    const vertices = [];
    const faces = [];

    const pushVertex = (x, y, z, r, g, b) => {
        vertices.push(x, y, z, r, g, b);
    };

    // curve function along height (Y)
    const curveZ = (t) => Math.sin(t * Math.PI * 0.5) * height * curve;

    for (let i = 0; i <= segments; i++) {
        const t = i / segments;
        const y = t * height;
        const zOffset = -curveZ(t);
        const w = (1.0 - t) * width; // narrower toward tip

        for (let j = 0; j <= segments - i; j++) {
            const s = j / (segments - i || 1);
            const x = -w / 2 + s * w;

            // light yellow color
            pushVertex(x, y, zOffset, 1.0, 1.0, 0.6);
        }
    }

    // connect faces between rows
    let idx = 0;
    for (let i = 0; i < segments; i++) {
        const row1 = segments - i + 1;
        const row2 = segments - i;

        let start1 = idx;
        let start2 = idx + row1;
        for (let j = 0; j < row2; j++) {
            faces.push(start1 + j, start1 + j + 1, start2 + j);
            if (j < row2 - 1) faces.push(start1 + j + 1, start2 + j + 1, start2 + j);
        }
        idx += row1;
    }

    return { vertices, faces };
}
export function createPalm(
    size = 2, 
    radius = 0.25, 
    segments = 8,
    color = [0.0, 0.0, 0.0]  // Add default black color
) {
    const vertices = [];
    const faces = [];
    const h = size / 2;
    const r = Math.min(radius, h * 0.99);

    // Modified pushVertex to use solid color
    const pushVertex = (x, y, z) => {
        vertices.push(x, y, z, color[0], color[1], color[2]);
    };

    // Helper to clamp inside the cube's core and curve edges
    const roundCorner = (x, y, z) => {
        const cx = Math.max(-h + r, Math.min(h - r, x));
        const cy = Math.max(-h + r, Math.min(h - r, y));
        const cz = Math.max(-h + r, Math.min(h - r, z));

        const dx = x - cx;
        const dy = y - cy;
        const dz = z - cz;
        const len = Math.hypot(dx, dy, dz);

        if (len > 0.00001) {
            const scale = r / len;
            x = cx + dx * scale;
            y = cy + dy * scale;
            z = cz + dz * scale;
        }
        return [x, y, z];
    };

    const makeFace = (nx, ny, nz) => {
        const startIndex = vertices.length / 6;

        for (let i = 0; i <= segments; i++) {
            for (let j = 0; j <= segments; j++) {
                const x = (j / segments) * size - h;
                const y = (i / segments) * size - h;
                const z = (nx !== 0) ? (ny !== 0) ? (nz !== 0) ? 0 : 0 : 0 : 0; // Adjust based on face normal
                const [rx, ry, rz] = roundCorner(x, y, z);
                pushVertex(rx, ry, rz);
            }
        }

        const vertsPerRow = segments + 1;
        for (let i = 0; i < segments; i++) {
            for (let j = 0; j < segments; j++) {
                faces.push(startIndex + i * vertsPerRow + j, startIndex + (i + 1) * vertsPerRow + j, startIndex + (i + 1) * vertsPerRow + (j + 1));
                faces.push(startIndex + i * vertsPerRow + j, startIndex + (i + 1) * vertsPerRow + (j + 1), startIndex + i * vertsPerRow + (j + 1));
            }
        }
    };

    makeFace(1, 0, 0); // Right face
    makeFace(-1, 0, 0); // Left face
    makeFace(0, 1, 0); // Top face
    makeFace(0, -1, 0); // Bottom face
    makeFace(0, 0, 1); // Front face
    makeFace(0, 0, -1); // Back face

    return { vertices, faces };
}
export function createFinger(
    length = 1.2,
    radiusBase = 0.08,
    radiusTip = 0.05,
    curve = 0.4,
    radialSeg = 12,
    lengthSeg = 10,
    color = [0.95, 0.85, 0.75] // skin color
) {
    const vertices = [];
    const faces = [];
    const push = (x, y, z) => vertices.push(x, y, z, color[0], color[1], color[2]);

    // create vertex rings along finger length
    for (let i = 0; i <= lengthSeg; i++) {
        const t = i / lengthSeg;
        const y = t * length;
        const r = radiusBase * (1 - 0.5 * t); // taper
        const zOffset = -Math.sin(t * Math.PI * 0.5) * curve; // curve downward

        for (let j = 0; j <= radialSeg; j++) {
            const a = (j / radialSeg) * 2 * Math.PI;
            const x = Math.cos(a) * r;
            const z = zOffset + Math.sin(a) * r;
            push(x, y, z);
        }
    }

    // connect faces between rings
    const ringSize = radialSeg + 1;
    for (let i = 0; i < lengthSeg; i++) {
        for (let j = 0; j < radialSeg; j++) {
            const a = i * ringSize + j;
            const b = (i + 1) * ringSize + j;
            const c = (i + 1) * ringSize + j + 1;
            const d = i * ringSize + j + 1;

            faces.push(a, b, c);
            faces.push(a, c, d);
        }
    }

    return { vertices, faces };
}
// new: createHand merges a palm and N fingers into one mesh
export function createHand(
    palmSize = 0.6,            // control palm size (maps to createPalm 'size' param)
    palmRadius = 0.08,
    palmSegments = 8,
    fingerCount = 4,
    fingerLength = 0.35,
    fingerRadius = 0.06,
    fingerCurve = 0.15,
    fingerRadialSeg = 10,
    fingerLenSeg = 8,
    fingerColor = [0.95, 0.85, 0.75]
) {
    const palm = createPalm(palmSize, palmRadius, palmSegments);
    const fingers = [];

    // compute finger X offsets across front of palm
    const halfW = palmSize / 2;
    const spacing = (halfW * 1.6) / (fingerCount - 1); // spread across front area
    const startX = -spacing * (fingerCount - 1) / 2;

    for (let i = 0; i < fingerCount; i++) {
        const fx = startX + i * spacing;
        const f = createFinger(fingerLength, fingerRadius, fingerRadius * 0.6, fingerCurve, fingerRadialSeg, fingerLenSeg, fingerColor);
        // translate finger vertices so base sits at front-top of palm
        // palm is centered at origin; front Z is +palmSize/2
        const translateY = palmSize / 2 - 0.05; // slightly inset into palm top
        const translateZ = palmSize / 2 + 0.01; // sit in front of palm
        // apply translation per-vertex
        for (let vi = 0; vi < f.vertices.length; vi += 6) {
            f.vertices[vi + 0] += fx;            // x
            f.vertices[vi + 1] += translateY;   // y
            f.vertices[vi + 2] += translateZ;   // z
        }
        fingers.push(f);
    }

    // merge palm + fingers
    const vertices = Array.from(palm.vertices); // palm vertices already 6-component
    const faces = Array.from(palm.faces);
    const palmVertCount = vertices.length / 6;

    for (const f of fingers) {
        // append vertices
        const baseIndex = vertices.length / 6;
        for (let vi = 0; vi < f.vertices.length; vi += 6) {
            vertices.push(
                f.vertices[vi + 0], f.vertices[vi + 1], f.vertices[vi + 2],
                f.vertices[vi + 3] ?? fingerColor[0], f.vertices[vi + 4] ?? fingerColor[1], f.vertices[vi + 5] ?? fingerColor[2]
            );
        }
        // append faces (offset indices)
        for (let fi = 0; fi < f.faces.length; fi += 3) {
            faces.push(f.faces[fi + 0] + baseIndex, f.faces[fi + 1] + baseIndex, f.faces[fi + 2] + baseIndex);
        }
    }

    return { vertices, faces };
}
