function clampInt(v, min = 1) {
  return Math.max(min, Math.floor(v));
}
function makeColorArray(nVerts, color) {
  const arr = new Float32Array(nVerts * 3);
  for (let i = 0; i < nVerts; i++) {
    arr[i * 3 + 0] = color[0];
    arr[i * 3 + 1] = color[1];
    arr[i * 3 + 2] = color[2];
  }
  return arr;
}
function pushVertex(arr, x, y, z) {
  arr.push(x, y, z);
}

// ---------------- Sphere ----------------
export function generateSphere(
  radius = 1,
  segLon = 32,
  segLat = 16,
  color = [0.2, 0.6, 1.0]
) {
  segLon = clampInt(segLon, 3);
  segLat = clampInt(segLat, 2);
  const verts = [];
  const faces = [];
  for (let lat = 0; lat <= segLat; lat++) {
    const v = lat / segLat;
    const theta = v * Math.PI;
    const sinT = Math.sin(theta),
      cosT = Math.cos(theta);
    for (let lon = 0; lon <= segLon; lon++) {
      const u = lon / segLon;
      const phi = u * 2 * Math.PI;
      const sinP = Math.sin(phi),
        cosP = Math.cos(phi);
      const x = radius * sinT * cosP;
      const y = radius * cosT;
      const z = radius * sinT * sinP;
      pushVertex(verts, x, y, z);
    }
  }
  for (let lat = 0; lat < segLat; lat++) {
    for (let lon = 0; lon < segLon; lon++) {
      const a = lat * (segLon + 1) + lon;
      const b = a + (segLon + 1);
      faces.push(a, b, a + 1);
      faces.push(b, b + 1, a + 1);
    }
  }
  const colors = makeColorArray(verts.length / 3, color);
  return {
    vertices: new Float32Array(verts),
    faces: new Uint16Array(faces),
    colors,
  };
}

// ---------------- Ellipsoid ----------------
export function generateEllipsoid(
  rx = 1,
  ry = 1,
  rz = 1,
  segLon = 32,
  segLat = 16,
  color = [0.2, 0.6, 1.0]
) {
  const sp = generateSphere(1, segLon, segLat, color);
  const verts = [];
  for (let i = 0; i < sp.vertices.length; i += 3) {
    verts.push(
      sp.vertices[i] * rx,
      sp.vertices[i + 1] * ry,
      sp.vertices[i + 2] * rz
    );
  }
  return {
    vertices: new Float32Array(verts),
    faces: sp.faces.slice(),
    colors: sp.colors.slice(),
  };
}

// ---------------- Elliptic Paraboloid ----------------
export function generateEllipticParaboloid(
  a = 1,
  b = 0.6,
  height = 1.0,
  segU = 36,
  segV = 24,
  color = [1.0, 0.95, 0.35]
) {
  segU = clampInt(segU, 3);
  segV = clampInt(segV, 1);
  const verts = [];
  const faces = [];
  for (let i = 0; i <= segV; i++) {
    const v = i / segV;
    const y = v * height;
    const taper = 1 - 0.6 * v;
    for (let j = 0; j <= segU; j++) {
      const u = (j / segU - 0.5) * 2;
      const x = a * u * taper;
      const z = -b * (u * u) * (1.1 - v);
      pushVertex(verts, x, y, z);
    }
  }
  for (let i = 0; i < segV; i++) {
    for (let j = 0; j < segU; j++) {
      const aIdx = i * (segU + 1) + j;
      const bIdx = aIdx + (segU + 1);
      faces.push(aIdx, bIdx, aIdx + 1);
      faces.push(bIdx, bIdx + 1, aIdx + 1);
    }
  }
  const colors = makeColorArray(verts.length / 3, color);
  return {
    vertices: new Float32Array(verts),
    faces: new Uint16Array(faces),
    colors,
  };
}

// ---------------- Fin (multi-bump sheet) ----------------
export function generateFin(
  length = 1.5,
  height = 0.85,
  width = 0.25,
  segments = 60,
  curveHeights = [1.0, 0.7, 1.1],
  color = [1.0, 0.95, 0.35]
) {
  segments = clampInt(segments, 3);
  const verts = [];
  const faces = [];
  const nCurves = curveHeights.length;
  for (let i = 0; i <= segments; i++) {
    const t = i / segments;
    const bucket = Math.min(nCurves - 1, Math.floor(t * nCurves));
    const localT = t * nCurves - bucket;
    const bump = curveHeights[bucket] * Math.sin(Math.PI * localT);
    const y = bump * height;
    const z = (t - 0.5) * length;
    const half = width * (1 - 0.6 * t);
    pushVertex(verts, -half, y, z);
    pushVertex(verts, half, y, z);
  }
  for (let i = 0; i < segments; i++) {
    const a = i * 2,
      b = a + 1,
      c = a + 2,
      d = a + 3;
    faces.push(a, b, d);
    faces.push(a, d, c);
  }
  const colors = makeColorArray(verts.length / 3, color);
  return {
    vertices: new Float32Array(verts),
    faces: new Uint16Array(faces),
    colors,
  };
}

// ---------------- Catmull-Rom sampler ----------------
function catmullRomSampler(ctrl, samplesPerSeg = 12, closed = false) {
  const out = [];
  if (!ctrl || ctrl.length < 2) return out;
  const get = (i) => {
    if (i < 0) return ctrl[0];
    if (i >= ctrl.length) return ctrl[ctrl.length - 1];
    return ctrl[i];
  };
  const lastSeg = closed ? ctrl.length : ctrl.length - 1;
  for (let i = 0; i < lastSeg; i++) {
    const p0 = get(i - 1),
      p1 = get(i),
      p2 = get(i + 1),
      p3 = get(i + 2);
    for (let s = 0; s < samplesPerSeg; s++) {
      const t = s / samplesPerSeg;
      const t2 = t * t,
        t3 = t2 * t;
      const x =
        0.5 *
        (2 * p1[0] +
          (-p0[0] + p2[0]) * t +
          (2 * p0[0] - 5 * p1[0] + 4 * p2[0] - p3[0]) * t2 +
          (-p0[0] + 3 * p1[0] - 3 * p2[0] + p3[0]) * t3);
      const y =
        0.5 *
        (2 * p1[1] +
          (-p0[1] + p2[1]) * t +
          (2 * p0[1] - 5 * p1[1] + 4 * p2[1] - p3[1]) * t2 +
          (-p0[1] + 3 * p1[1] - 3 * p2[1] + p3[1]) * t3);
      const z =
        0.5 *
        (2 * p1[2] +
          (-p0[2] + p2[2]) * t +
          (2 * p0[2] - 5 * p1[2] + 4 * p2[2] - p3[2]) * t2 +
          (-p0[2] + 3 * p1[2] - 3 * p2[2] + p3[2]) * t3);
      out.push([x, y, z]);
    }
  }
  out.push(ctrl[ctrl.length - 1].slice());
  return out;
}

// ---------------- Parallel-transport based BSpline tube ----------------
export function generateBSplineTube(
  ctrlPoints,
  radius = 0.08,
  samplesPerSeg = 12,
  circleSeg = 16,
  color = [0.15, 0.35, 0.75]
) {
  samplesPerSeg = clampInt(samplesPerSeg, 2);
  circleSeg = clampInt(circleSeg, 4);

  const center = catmullRomSampler(ctrlPoints, samplesPerSeg, false);
  const verts = [];
  const faces = [];

  if (center.length < 2)
    return {
      vertices: new Float32Array(verts),
      faces: new Uint16Array(faces),
      colors: new Float32Array([]),
    };

  // vector helpers
  const sub = (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
  const add = (a, b) => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
  const mulS = (a, s) => [a[0] * s, a[1] * s, a[2] * s];
  const dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
  const cross = (a, b) => [
    a[1] * b[2] - a[2] * b[1],
    a[2] * b[0] - a[0] * b[2],
    a[0] * b[1] - a[1] * b[0],
  ];
  const norm = (a) => {
    const L = Math.hypot(a[0], a[1], a[2]) || 1;
    return [a[0] / L, a[1] / L, a[2] / L];
  };

  // initial tangent and normal
  let t0 = norm(sub(center[1], center[0]));
  let up = [0, 1, 0];
  if (Math.abs(dot(up, t0)) > 0.9) up = [1, 0, 0];
  let n0 = norm(sub(up, mulS(t0, dot(up, t0))));
  let b0 = cross(t0, n0);

  const ring = circleSeg;
  for (let i = 0; i < center.length; i++) {
    const p = center[i];
    // tangent
    let ti;
    if (i < center.length - 1) ti = norm(sub(center[i + 1], p));
    else ti = norm(sub(p, center[i - 1]));

    // parallel transport rotation from t0 -> ti
    if (i !== 0) {
      const v = cross(t0, ti);
      const c = dot(t0, ti);
      const s = Math.hypot(v[0], v[1], v[2]) || 0;
      if (s > 1e-6) {
        const axis = [v[0] / s, v[1] / s, v[2] / s];
        const ang = Math.atan2(s, c);
        const rotateVec = (vec, axis, ang) => {
          const ca = Math.cos(ang),
            sa = Math.sin(ang);
          const ad = dot(axis, vec);
          const cv = cross(axis, vec);
          return add(
            add(mulS(vec, ca), mulS(cv, sa)),
            mulS(axis, (1 - ca) * ad)
          );
        };
        n0 = rotateVec(n0, axis, ang);
        b0 = rotateVec(b0, axis, ang);
      }
    }

    const tParam = i / Math.max(1, center.length - 1);
    const rad = radius * (1 - 0.7 * tParam);

    for (let j = 0; j < ring; j++) {
      const theta = (j / ring) * Math.PI * 2;
      const cx = Math.cos(theta) * rad;
      const cz = Math.sin(theta) * rad;
      const vx = p[0] + n0[0] * cx + b0[0] * cz;
      const vy = p[1] + n0[1] * cx + b0[1] * cz;
      const vz = p[2] + n0[2] * cx + b0[2] * cz;
      pushVertex(verts, vx, vy, vz);
    }
    t0 = ti;
  }

  const rings = Math.floor(verts.length / 3 / ring);
  for (let i = 0; i < rings - 1; i++) {
    for (let j = 0; j < ring; j++) {
      const a = i * ring + j;
      const b = i * ring + ((j + 1) % ring);
      const c = (i + 1) * ring + ((j + 1) % ring);
      const d = (i + 1) * ring + j;
      faces.push(a, b, c);
      faces.push(a, c, d);
    }
  }

  const colors = makeColorArray(verts.length / 3, color);
  return {
    vertices: new Float32Array(verts),
    faces: new Uint16Array(faces),
    colors,
  };
}

// ---------------- Tail with bumps ----------------
export function generateTailWithBumps(
  length = 2.0,
  turns = 1.2,
  radiusStart = 0.15,
  radiusEnd = 0.02,
  bumpCount = 6,
  tubeRadius = 0.05,
  samplesPerTurn = 18,
  circleSeg = 18,
  color = [0.12, 0.38, 0.9]
) {
  const ctrl = [];
  const totalSamples = Math.max(4, Math.floor(turns * samplesPerTurn));
  for (let i = 0; i <= totalSamples; i++) {
    const t = i / totalSamples;
    const ang = t * turns * 2 * Math.PI;
    const r = (1 - t) * 0.25;
    const x = r * Math.cos(ang);
    const z = r * Math.sin(ang);
    const y = -t * length;
    ctrl.push([x, y, z]);
  }

  // sample centerline:
  const center = catmullRomSampler(
    ctrl,
    Math.max(6, Math.floor(samplesPerTurn / 2)),
    false
  );
  const verts = [];
  const faces = [];

  if (center.length < 2)
    return {
      vertices: new Float32Array(verts),
      faces: new Uint16Array(faces),
      colors: new Float32Array([]),
    };

  // bump positions
  const bumpPositions = [];
  for (let k = 1; k <= bumpCount; k++) bumpPositions.push(k / (bumpCount + 1));

  // vector helpers
  const sub = (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
  const add = (a, b) => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
  const mulS = (a, s) => [a[0] * s, a[1] * s, a[2] * s];
  const dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
  const cross = (a, b) => [
    a[1] * b[2] - a[2] * b[1],
    a[2] * b[0] - a[0] * b[2],
    a[0] * b[1] - a[1] * b[0],
  ];
  const norm = (a) => {
    const L = Math.hypot(a[0], a[1], a[2]) || 1;
    return [a[0] / L, a[1] / L, a[2] / L];
  };

  // initial frame
  let t0 = norm(sub(center[1], center[0]));
  let up = [0, 1, 0];
  if (Math.abs(dot(up, t0)) > 0.9) up = [1, 0, 0];
  let n0 = norm(sub(up, mulS(t0, dot(up, t0))));
  let b0 = cross(t0, n0);

  const ring = circleSeg;
  for (let i = 0; i < center.length; i++) {
    const p = center[i];
    let ti;
    if (i < center.length - 1) ti = norm(sub(center[i + 1], p));
    else ti = norm(sub(p, center[i - 1]));

    if (i !== 0) {
      const v = cross(t0, ti);
      const c = dot(t0, ti);
      const s = Math.hypot(v[0], v[1], v[2]) || 0;
      if (s > 1e-6) {
        const axis = [v[0] / s, v[1] / s, v[2] / s];
        const ang = Math.atan2(s, c);
        const rotateVec = (vec, axis, ang) => {
          const ca = Math.cos(ang),
            sa = Math.sin(ang);
          const ad = dot(axis, vec);
          const cv = cross(axis, vec);
          return add(
            add(mulS(vec, ca), mulS(cv, sa)),
            mulS(axis, (1 - ca) * ad)
          );
        };
        n0 = rotateVec(n0, axis, ang);
        b0 = rotateVec(b0, axis, ang);
      }
    }

    const tParam = i / Math.max(1, center.length - 1);
    const baseRad = radiusStart * (1 - tParam) + radiusEnd * tParam;

    // radial bump boost
    let radialBoost = 0;
    for (let bp of bumpPositions) {
      const d = Math.abs(tParam - bp);
      const width = 1 / (bumpCount + 2);
      if (d < width) radialBoost += Math.cos((d / width) * Math.PI) * 0.9;
    }
    const rad = baseRad + radialBoost * 0.035;

    for (let j = 0; j < ring; j++) {
      const ang = (j / ring) * Math.PI * 2;
      const cx = Math.cos(ang) * (tubeRadius * (1 - tParam) + rad * 0.5);
      const cz = Math.sin(ang) * (tubeRadius * (1 - tParam) + rad * 0.5);
      const vx = p[0] + n0[0] * cx + b0[0] * cz;
      const vy = p[1] + n0[1] * cx + b0[1] * cz;
      const vz = p[2] + n0[2] * cx + b0[2] * cz;
      pushVertex(verts, vx, vy, vz);
    }
    t0 = ti;
  }

  const rings = Math.floor(verts.length / 3 / ring);
  for (let i = 0; i < rings - 1; i++) {
    for (let j = 0; j < ring; j++) {
      const a = i * ring + j;
      const b = i * ring + ((j + 1) % ring);
      const c = (i + 1) * ring + ((j + 1) % ring);
      const d = (i + 1) * ring + j;
      faces.push(a, b, c);
      faces.push(a, c, d);
    }
  }

  const colors = makeColorArray(verts.length / 3, color);
  return {
    vertices: new Float32Array(verts),
    faces: new Uint16Array(faces),
    colors,
  };
}
// ---------- Cone ----------
export function generateCone(
  radius = 0.3,
  height = 0.6,
  seg = 32,
  color = [0.2, 0.6, 1.0]
) {
  const verts = [0, height, 0]; // tip
  for (let i = 0; i <= seg; i++) {
    const theta = (i / seg) * 2 * Math.PI;
    verts.push(radius * Math.cos(theta), 0, radius * Math.sin(theta));
  }

  const faces = [];
  for (let i = 1; i <= seg; i++) {
    faces.push(0, i, i + 1);
  }

  const colors = makeColorArray(verts.length / 3, color);
  return {
    vertices: new Float32Array(verts),
    faces: new Uint16Array(faces),
    colors,
  };
}

// ---------- 1-sheet Hyperboloid ----------
export function generateHyperboloid(
  a = 0.2,
  b = 0.2,
  c = 0.5,
  segU = 36,
  segV = 24,
  color = [0.2, 0.6, 1.0]
) {
  const verts = [];
  const faces = [];
  for (let i = 0; i <= segV; i++) {
    const v = (i / segV - 0.5) * 2; // y parameter
    for (let j = 0; j <= segU; j++) {
      const u = (j / segU) * 2 * Math.PI;
      const x = a * Math.cosh(v) * Math.cos(u);
      const z = b * Math.cosh(v) * Math.sin(u);
      const y = c * Math.sinh(v);
      verts.push(x, y, z);
    }
  }
  for (let i = 0; i < segV; i++) {
    for (let j = 0; j < segU; j++) {
      const aIdx = i * (segU + 1) + j;
      const bIdx = aIdx + (segU + 1);
      faces.push(aIdx, bIdx, aIdx + 1);
      faces.push(bIdx, bIdx + 1, aIdx + 1);
    }
  }
  const colors = makeColorArray(verts.length / 3, color);
  return {
    vertices: new Float32Array(verts),
    faces: new Uint16Array(faces),
    colors,
  };
}

// ---------- Sine Fin ----------
export function generateSineFin(
  length = 1.5,
  amplitude = 0.2,
  width = 0.05,
  segments = 80,
  color = [1.0, 0.95, 0.35]
) {
  const verts = [];
  const faces = [];
  for (let i = 0; i <= segments; i++) {
    const t = (i / segments) * length;
    const y = amplitude * Math.sin((t / length) * Math.PI * 2);
    verts.push(-width, y, t);
    verts.push(width, y, t);
  }
  for (let i = 0; i < segments; i++) {
    const a = i * 2,
      b = a + 1,
      c = a + 2,
      d = a + 3;
    faces.push(a, b, c);
    faces.push(b, d, c);
  }
  const colors = makeColorArray(verts.length / 3, color);
  return {
    vertices: new Float32Array(verts),
    faces: new Uint16Array(faces),
    colors,
  };
}

// ---------- Rumput (Grass Clumps) ----------
export function generateGrass(
  fieldRadius = 15,
  surfaceY = -1.58,
  bladeCount = 300,
  bladeHeight = 0.5,
  bladeRadius = 0.05,
  segments = 4,
  color = [0.1, 0.8, 0.15]
) {
  const verts = [];
  const faces = [];
  const colors = [];

  let vertexOffset = 0;

  for (let i = 0; i < bladeCount; i++) {
    const angle = Math.random() * Math.PI * 2;
    const radius = Math.random() * fieldRadius;
    const x = Math.cos(angle) * radius;
    const z = Math.sin(angle) * radius;
    const y = surfaceY;

    verts.push(x, y + bladeHeight, z);
    colors.push(color[0], color[1], color[2]);
    const tipIndex = vertexOffset;
    vertexOffset++;

    const baseIndices = [];
    for (let j = 0; j <= segments; j++) {
      const theta = (j / segments) * 2 * Math.PI;
      const randX = x + bladeRadius * Math.cos(theta);
      const randZ = z + bladeRadius * Math.sin(theta);
      verts.push(randX, y, randZ);

      colors.push(color[0] * 0.7, color[1] * 0.7, color[2] * 0.7);
      baseIndices.push(vertexOffset);
      vertexOffset++;
    }

    for (let j = 0; j < segments; j++) {
      faces.push(tipIndex, baseIndices[j], baseIndices[j + 1]);
    }
  }

  return {
    vertices: new Float32Array(verts),
    faces: new Uint16Array(faces),
    colors: new Float32Array(colors),
  };
}
