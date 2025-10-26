export class MyObject {
    GL = null;
    SHADER_PROGRAM = null;

    _position = null;
    _color = null;
    _MMatrix = null;

    OBJECT_VERTEX = null;
    OBJECT_FACES = null;


    vertex = [];
    faces = [];
    MODEL_MATRIX = LIBS.get_I4();
    POSITION_MATRIX = LIBS.get_I4();
    MOVE_MATRIX = LIBS.get_I4();

    childs = [];


    constructor(GL, SHADER_PROGRAM, _position, _color, vertices = [], faces = []) {
        this.GL = GL;
        this.SHADER_PROGRAM = SHADER_PROGRAM;


        this._position = _position;
        this._color = _color;


        this.vertex = vertices.length ? vertices : [
            -1, -1, -1, 0, 0, 0,
            1, -1, -1, 1, 0, 0,
            1, 1, -1, 1, 1, 0,
            -1, 1, -1, 0, 1, 0,
            -1, -1, 1, 0, 0, 1,
            1, -1, 1, 1, 0, 1,
            1, 1, 1, 1, 1, 1,
            -1, 1, 1, 0, 1, 1
        ];


        this.faces = faces.length ? faces : [
            0, 1, 2, 0, 2, 3,
            4, 5, 6, 4, 6, 7,
            0, 3, 7, 0, 4, 7,
            1, 2, 6, 1, 5, 6,
            2, 3, 6, 3, 7, 6,
            0, 1, 5, 0, 4, 5
        ];

        this.childs = [];
        this.MOVE_MATRIX = LIBS.get_I4();
    }


    setup() {
        this.OBJECT_VERTEX = this.GL.createBuffer();
        this.GL.bindBuffer(this.GL.ARRAY_BUFFER, this.OBJECT_VERTEX);
        this.GL.bufferData(this.GL.ARRAY_BUFFER,
            new Float32Array(this.vertex),
            this.GL.STATIC_DRAW);


        this.OBJECT_FACES = this.GL.createBuffer();
        this.GL.bindBuffer(this.GL.ELEMENT_ARRAY_BUFFER, this.OBJECT_FACES);
        this.GL.bufferData(this.GL.ELEMENT_ARRAY_BUFFER,
            new Uint16Array(this.faces),
            this.GL.STATIC_DRAW);

        this.childs.forEach(child => {
            child.setup();
        });
    }

    render(_MMatrix, PARENT_MATRIX) {
        // ✅ Prevent crash if uniform location is invalid
        if (!(_MMatrix instanceof WebGLUniformLocation)) {
            console.warn("Invalid or missing uniform location:", _MMatrix, "in object:", this);
            return;
        }

        // Compute combined transformation
        this.MODEL_MATRIX = LIBS.multiply(this.MOVE_MATRIX, PARENT_MATRIX);

        // Activate program and pass matrices
        this.GL.useProgram(this.SHADER_PROGRAM);
        this.GL.uniformMatrix4fv(_MMatrix, false, this.MODEL_MATRIX);

        // === BIND BUFFERS ===
        this.GL.bindBuffer(this.GL.ARRAY_BUFFER, this.OBJECT_VERTEX);
        const stride = 4 * 6; // 6 floats per vertex (3 position + 3 color)
        this.GL.vertexAttribPointer(this._position, 3, this.GL.FLOAT, false, stride, 0);
        this.GL.vertexAttribPointer(this._color, 3, this.GL.FLOAT, false, stride, 4 * 3);

        this.GL.bindBuffer(this.GL.ELEMENT_ARRAY_BUFFER, this.OBJECT_FACES);
        this.GL.drawElements(this.GL.TRIANGLES, this.faces.length, this.GL.UNSIGNED_SHORT, 0);

        // === RENDER CHILD OBJECTS ===
        this.childs.forEach(child => {
            child.render(_MMatrix, this.MODEL_MATRIX);
        });
    }

}