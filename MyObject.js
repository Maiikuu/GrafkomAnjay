// === Unified MyObject.js ===
// Works for all Pokémon scenes (Sobble, Drizzile, Inteleon)

export class MyObject {
    GL = null;
    SHADER_PROGRAM = null;

    _position = null;
    _color = null;
    _PMatrix = null;
    _VMatrix = null;
    _MMatrix = null;

    OBJECT_VERTEX = null;
    OBJECT_FACES = null;

    vertex = [];
    faces = [];

    MODEL_MATRIX = LIBS.get_I4();
    POSITION_MATRIX = LIBS.get_I4();
    MOVE_MATRIX = LIBS.get_I4();

    childs = [];

    constructor(
        GL,
        SHADER_PROGRAM,
        _position,
        _color,
        _PMatrix = null,
        _VMatrix = null,
        _MMatrix = null,
        vertices = [],
        faces = []
    ) {
        this.GL = GL;
        this.SHADER_PROGRAM = SHADER_PROGRAM;

        this._position = _position;
        this._color = _color;

        this._PMatrix = _PMatrix;
        this._VMatrix = _VMatrix;
        this._MMatrix = _MMatrix;

        // Default cube geometry
        this.vertex = vertices.length
            ? vertices
            : [
                  -1, -1, -1, 0, 0, 0,
                  1, -1, -1, 1, 0, 0,
                  1, 1, -1, 1, 1, 0,
                  -1, 1, -1, 0, 1, 0,
                  -1, -1, 1, 0, 0, 1,
                  1, -1, 1, 1, 0, 1,
                  1, 1, 1, 1, 1, 1,
                  -1, 1, 1, 0, 1, 1,
              ];

        this.faces = faces.length
            ? faces
            : [
                  0, 1, 2, 0, 2, 3,
                  4, 5, 6, 4, 6, 7,
                  0, 3, 7, 0, 4, 7,
                  1, 2, 6, 1, 5, 6,
                  2, 3, 6, 3, 7, 6,
                  0, 1, 5, 0, 4, 5,
              ];

        this.MOVE_MATRIX = LIBS.get_I4();
    }

    setup() {
        const GL = this.GL;

        this.OBJECT_VERTEX = GL.createBuffer();
        GL.bindBuffer(GL.ARRAY_BUFFER, this.OBJECT_VERTEX);
        GL.bufferData(GL.ARRAY_BUFFER, new Float32Array(this.vertex), GL.STATIC_DRAW);

        this.OBJECT_FACES = GL.createBuffer();
        GL.bindBuffer(GL.ELEMENT_ARRAY_BUFFER, this.OBJECT_FACES);
        GL.bufferData(GL.ELEMENT_ARRAY_BUFFER, new Uint16Array(this.faces), GL.STATIC_DRAW);

        // Setup children recursively
        this.childs.forEach((child) => child.setup());
    }

    render(_MMatrix, PARENT_MATRIX) {
        const GL = this.GL;

        // ✅ Prevent crash if uniform is invalid
        if (!(_MMatrix instanceof WebGLUniformLocation)) {
            console.warn("Invalid or missing uniform location:", _MMatrix);
            return;
        }

        // Compute world transform
        this.MODEL_MATRIX = LIBS.multiply(this.MOVE_MATRIX, PARENT_MATRIX);

        GL.useProgram(this.SHADER_PROGRAM);
        GL.uniformMatrix4fv(_MMatrix, false, this.MODEL_MATRIX);

        // Bind vertex data
        GL.bindBuffer(GL.ARRAY_BUFFER, this.OBJECT_VERTEX);
        const stride = 4 * 6; // 3 position + 3 color
        GL.vertexAttribPointer(this._position, 3, GL.FLOAT, false, stride, 0);
        GL.vertexAttribPointer(this._color, 3, GL.FLOAT, false, stride, 4 * 3);

        GL.bindBuffer(GL.ELEMENT_ARRAY_BUFFER, this.OBJECT_FACES);
        GL.drawElements(GL.TRIANGLES, this.faces.length, GL.UNSIGNED_SHORT, 0);

        // Render all children with this MODEL_MATRIX as parent
        this.childs.forEach((child) => {
            if (child.render) child.render(_MMatrix, this.MODEL_MATRIX);
        });
    }

    draw(time, P, V) {
        // A default wrapper if some scenes call .draw() instead of .render()
        this.render(this._MMatrix, LIBS.get_I4());
    }
}
