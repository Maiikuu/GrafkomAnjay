// ==================== SPHERE / ELLIPSOID ====================
export function generateSphere(radiusX, radiusY, radiusZ, stacks, slices) {
    const vertices = [];
    const faces = [];

    for (let i = 0; i <= stacks; i++) {
        const phi = (i / stacks) * Math.PI - Math.PI / 2; // latitude
        for (let j = 0; j <= slices; j++) {
            const theta = (j / slices) * 2 * Math.PI; // longitude

            const x = radiusX * Math.cos(phi) * Math.cos(theta);
            const y = radiusY * Math.sin(phi);
            const z = radiusZ * Math.cos(phi) * Math.sin(theta);

            // position
            vertices.push(x, y, z);
            // color (simple gradient)
            vertices.push((x + 1) / 2, (y + 1) / 2, (z + 1) / 2);
        }
    }

    for (let i = 0; i < stacks; i++) {
        for (let j = 0; j < slices; j++) {
            const first = i * (slices + 1) + j;
            const second = first + slices + 1;
            faces.push(first, second, first + 1);
            faces.push(second, second + 1, first + 1);
        }
    }

    return { vertices, faces };
}


// ==================== ELLIPTIC PARABOLOID ====================
export function generateEllipticParaboloid(a, b, c, stacks, slices) {
    const vertices = [];
    const faces = [];

    for (let i = 0; i <= stacks; i++) {
        const u = i / stacks;
        for (let j = 0; j <= slices; j++) {
            const v = (j / slices) * 2 * Math.PI;

            const x = a * u * Math.cos(v);
            const y = b * u * Math.sin(v);
            const z = c * u * u;

            vertices.push(x, y, z);
            vertices.push((x + 1) / 2, (y + 1) / 2, (z % 1 + 1) / 2);
        }
    }

    for (let i = 0; i < stacks; i++) {
        for (let j = 0; j < slices; j++) {
            const first = i * (slices + 1) + j;
            const second = first + slices + 1;
            faces.push(first, second, first + 1);
            faces.push(second, second + 1, first + 1);
        }
    }

    return { vertices, faces };
}


// ==================== B-SPLINE TUBE ====================
export function generateBSpline(controlPoints, radius = 0.2, segments = 50, slices = 12) {
    const vertices = [];
    const faces = [];

    // Simple linear interpolation of control points (placeholder for B-spline basis)
    const curve = [];
    for (let i = 0; i < controlPoints.length - 1; i++) {
        const p0 = controlPoints[i];
        const p1 = controlPoints[i + 1];
        for (let j = 0; j <= segments / (controlPoints.length - 1); j++) {
            const t = j / (segments / (controlPoints.length - 1));
            const x = (1 - t) * p0[0] + t * p1[0];
            const y = (1 - t) * p0[1] + t * p1[1];
            const z = (1 - t) * p0[2] + t * p1[2];
            curve.push([x, y, z]);
        }
    }

    // Sweep a circle along the curve
    for (let i = 0; i < curve.length; i++) {
        const [px, py, pz] = curve[i];

        // tangent approximation
        let tx = 0, ty = 1, tz = 0;
        if (i < curve.length - 1) {
            tx = curve[i + 1][0] - px;
            ty = curve[i + 1][1] - py;
            tz = curve[i + 1][2] - pz;
        }
        const len = Math.hypot(tx, ty, tz) || 1;
        tx /= len; ty /= len; tz /= len;

        // arbitrary normal
        let nx = -ty, ny = tx, nz = 0;
        let nlen = Math.hypot(nx, ny, nz);
        if (nlen < 1e-6) { nx = 0; ny = -tz; nz = ty; nlen = Math.hypot(nx, ny, nz); }
        nx /= nlen; ny /= nlen; nz /= nlen;

        // binormal = tangent × normal
        const bx = ty * nz - tz * ny;
        const by = tz * nx - tx * nz;
        const bz = tx * ny - ty * nx;

        for (let j = 0; j <= slices; j++) {
            const theta = (j / slices) * 2 * Math.PI;
            const cx = Math.cos(theta) * radius;
            const cy = Math.sin(theta) * radius;

            const vx = px + nx * cx + bx * cy;
            const vy = py + ny * cx + by * cy;
            const vz = pz + nz * cx + bz * cy;

            vertices.push(vx, vy, vz);
            vertices.push(0.8, 0.1, 0.8); // purple tube
        }
    }

    for (let i = 0; i < curve.length - 1; i++) {
        for (let j = 0; j < slices; j++) {
            const first = i * (slices + 1) + j;
            const second = first + slices + 1;
            faces.push(first, second, first + 1);
            faces.push(second, second + 1, first + 1);
        }
    }

    return { vertices, faces };
}
