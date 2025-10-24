function clampInt(v, min = 1) { return Math.max(min, Math.floor(v)); }

function makeColorArray(nVerts, color) {
    const arr = new Float32Array(nVerts * 3);
    for (let i = 0; i < nVerts; i++) {
        arr[i * 3 + 0] = color[0];
        arr[i * 3 + 1] = color[1];
        arr[i * 3 + 2] = color[2];
    }
    return arr;
}

function pushVertex(arr, x, y, z) { arr.push(x, y, z); }

// ---------------- Sphere ----------------
export function generateSphere(radius = 1, segLon = 32, segLat = 16, color = [0.2, 0.6, 1.0]) {
    segLon = clampInt(segLon, 3);
    segLat = clampInt(segLat, 2);
    const verts = [];
    const faces = [];

    for (let lat = 0; lat <= segLat; lat++) {
        const v = lat / segLat;
        const theta = v * Math.PI;
        const sinT = Math.sin(theta), cosT = Math.cos(theta);
        for (let lon = 0; lon <= segLon; lon++) {
            const u = lon / segLon;
            const phi = u * 2 * Math.PI;
            const sinP = Math.sin(phi), cosP = Math.cos(phi);
            const x = radius * sinT * cosP;
            const y = radius * cosT;
            const z = radius * sinT * sinP;
            pushVertex(verts, x, y, z);
        }
    }

    for (let lat = 0; lat < segLat; lat++) {
        for (let lon = 0; lon < segLon; lon++) {
            const i0 = lat * (segLon + 1) + lon;
            const i1 = i0 + segLon + 1;
            faces.push(i0, i0 + 1, i1 + 1);
            faces.push(i0, i1 + 1, i1);
        }
    }

    const nVerts = verts.length / 3;
    const cols = makeColorArray(nVerts, color);
    const combined = new Float32Array(nVerts * 6);
    for (let i = 0; i < nVerts; i++) {
        combined[i * 6 + 0] = verts[i * 3 + 0];
        combined[i * 6 + 1] = verts[i * 3 + 1];
        combined[i * 6 + 2] = verts[i * 3 + 2];
        combined[i * 6 + 3] = cols[i * 3 + 0];
        combined[i * 6 + 4] = cols[i * 3 + 1];
        combined[i * 6 + 5] = cols[i * 3 + 2];
    }

    return {
        vertices: Array.from(combined),
        faces: faces
    };
}

// ---------------- Ellipsoid ----------------
export function generateEllipsoid(rx = 1, ry = 1, rz = 1, segLon = 32, segLat = 16, color = [0.2, 0.6, 1.0]) {
    segLon = clampInt(segLon, 3);
    segLat = clampInt(segLat, 2);
    const verts = [];
    const faces = [];

    for (let lat = 0; lat <= segLat; lat++) {
        const v = lat / segLat;
        const theta = v * Math.PI;
        const sinT = Math.sin(theta), cosT = Math.cos(theta);
        for (let lon = 0; lon <= segLon; lon++) {
            const u = lon / segLon;
            const phi = u * 2 * Math.PI;
            const sinP = Math.sin(phi), cosP = Math.cos(phi);
            const x = rx * sinT * cosP;
            const y = ry * cosT;
            const z = rz * sinT * sinP;
            pushVertex(verts, x, y, z);
        }
    }

    for (let lat = 0; lat < segLat; lat++) {
        for (let lon = 0; lon < segLon; lon++) {
            const i0 = lat * (segLon + 1) + lon;
            const i1 = i0 + segLon + 1;
            faces.push(i0, i0 + 1, i1 + 1);
            faces.push(i0, i1 + 1, i1);
        }
    }

    const nVerts = verts.length / 3;
    const cols = makeColorArray(nVerts, color);
    const combined = new Float32Array(nVerts * 6);
    for (let i = 0; i < nVerts; i++) {
        combined[i * 6 + 0] = verts[i * 3 + 0];
        combined[i * 6 + 1] = verts[i * 3 + 1];
        combined[i * 6 + 2] = verts[i * 3 + 2];
        combined[i * 6 + 3] = cols[i * 3 + 0];
        combined[i * 6 + 4] = cols[i * 3 + 1];
        combined[i * 6 + 5] = cols[i * 3 + 2];
    }

    return {
        vertices: Array.from(combined),
        faces: faces
    };
}

// ---------------- B-Spline Tube ----------------
export function generateBSplineTube(ctrlPoints, radius = 0.5, radialSeg = 8, stepsSeg = 16, color = [0.2, 0.6, 1.0]) {
    const verts = [];
    const faces = [];

    function bsplineBasis(t, i, k, knots) {
        if (k === 1) {
            return (knots[i] <= t && t < knots[i + 1]) ? 1 : 0;
        }
        const denom1 = knots[i + k - 1] - knots[i];
        const denom2 = knots[i + k] - knots[i + 1];
        const term1 = denom1 !== 0 ? ((t - knots[i]) / denom1) * bsplineBasis(t, i, k - 1, knots) : 0;
        const term2 = denom2 !== 0 ? ((knots[i + k] - t) / denom2) * bsplineBasis(t, i + 1, k - 1, knots) : 0;
        return term1 + term2;
    }

    function evalBSpline(t, ctrlPoints, degree, knots) {
        let x = 0, y = 0, z = 0;
        for (let i = 0; i < ctrlPoints.length; i++) {
            const basis = bsplineBasis(t, i, degree + 1, knots);
            x += ctrlPoints[i][0] * basis;
            y += ctrlPoints[i][1] * basis;
            z += ctrlPoints[i][2] * basis;
        }
        return [x, y, z];
    }

    const n = ctrlPoints.length;
    const degree = Math.min(3, n - 1);
    const knots = [];
    for (let i = 0; i <= degree; i++) knots.push(0);
    for (let i = 1; i < n - degree; i++) knots.push(i / (n - degree));
    for (let i = 0; i <= degree; i++) knots.push(1);

    const steps = stepsSeg;
    for (let i = 0; i <= steps; i++) {
        const t = i / steps;
        const pt = evalBSpline(t, ctrlPoints, degree, knots);

        let tangent;
        if (i === 0) {
            const nextPt = evalBSpline((i + 1) / steps, ctrlPoints, degree, knots);
            tangent = [nextPt[0] - pt[0], nextPt[1] - pt[1], nextPt[2] - pt[2]];
        } else {
            const prevPt = evalBSpline((i - 1) / steps, ctrlPoints, degree, knots);
            tangent = [pt[0] - prevPt[0], pt[1] - prevPt[1], pt[2] - prevPt[2]];
        }

        const len = Math.sqrt(tangent[0] ** 2 + tangent[1] ** 2 + tangent[2] ** 2);
        if (len > 0) {
            tangent[0] /= len;
            tangent[1] /= len;
            tangent[2] /= len;
        }

        let perp = [0, 1, 0];
        if (Math.abs(tangent[1]) > 0.99) perp = [1, 0, 0];

        const binormal = [
            tangent[1] * perp[2] - tangent[2] * perp[1],
            tangent[2] * perp[0] - tangent[0] * perp[2],
            tangent[0] * perp[1] - tangent[1] * perp[0]
        ];
        const bLen = Math.sqrt(binormal[0] ** 2 + binormal[1] ** 2 + binormal[2] ** 2);
        if (bLen > 0) {
            binormal[0] /= bLen;
            binormal[1] /= bLen;
            binormal[2] /= bLen;
        }

        const normal = [
            binormal[1] * tangent[2] - binormal[2] * tangent[1],
            binormal[2] * tangent[0] - binormal[0] * tangent[2],
            binormal[0] * tangent[1] - binormal[1] * tangent[0]
        ];

        for (let j = 0; j < radialSeg; j++) {
            const angle = (j / radialSeg) * 2 * Math.PI;
            const c = Math.cos(angle), s = Math.sin(angle);
            const x = pt[0] + radius * (c * normal[0] + s * binormal[0]);
            const y = pt[1] + radius * (c * normal[1] + s * binormal[1]);
            const z = pt[2] + radius * (c * normal[2] + s * binormal[2]);
            pushVertex(verts, x, y, z);
        }
    }

    for (let i = 0; i < steps; i++) {
        for (let j = 0; j < radialSeg; j++) {
            const i0 = i * radialSeg + j;
            const i1 = i0 + radialSeg;
            const i0next = i * radialSeg + ((j + 1) % radialSeg);
            const i1next = i1 + ((j + 1 - j) % radialSeg);
            faces.push(i0, i0next, i1next);
            faces.push(i0, i1next, i1);
        }
    }

    const nVerts = verts.length / 3;
    const cols = makeColorArray(nVerts, color);
    const combined = new Float32Array(nVerts * 6);
    for (let i = 0; i < nVerts; i++) {
        combined[i * 6 + 0] = verts[i * 3 + 0];
        combined[i * 6 + 1] = verts[i * 3 + 1];
        combined[i * 6 + 2] = verts[i * 3 + 2];
        combined[i * 6 + 3] = cols[i * 3 + 0];
        combined[i * 6 + 4] = cols[i * 3 + 1];
        combined[i * 6 + 5] = cols[i * 3 + 2];
    }

    return {
        vertices: Array.from(combined),
        faces: faces
    };
}
