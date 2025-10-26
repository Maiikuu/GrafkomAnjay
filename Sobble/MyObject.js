export class MyObject {
    constructor(GL, SHADER_PROGRAM, _position, _color, data = null) {
        this.GL = GL;
        this.SHADER_PROGRAM = SHADER_PROGRAM;
        this._position = _position;
        this._color = _color;

        if (data) {
            this.vertex = data.vertices;
            this.faces = data.faces;
        } else {
            this.vertex = [-1,-1,-1,0,0,0, 1,-1,-1,1,0,0, 1,1,-1,1,1,0, -1,1,-1,0,1,0, -1,-1,1,0,0,1, 1,-1,1,1,0,1, 1,1,1,1,1,1, -1,1,1,0,1,1];
            this.faces = [0,1,2,0,2,3, 4,5,6,4,6,7, 0,3,7,0,4,7, 1,2,6,1,5,6, 2,3,6,3,7,6, 0,1,5,0,4,5];
        }

        this.childs = [];
        this.pos = [0, 0, 0];
        this.rot = [0, 0, 0];
        this.MODEL_MATRIX = LIBS.get_I4();
        this.MOVE_MATRIX = LIBS.get_I4();
    }

    setup() {
        this.OBJECT_VERTEX = this.GL.createBuffer();
        this.GL.bindBuffer(this.GL.ARRAY_BUFFER, this.OBJECT_VERTEX);
        this.GL.bufferData(this.GL.ARRAY_BUFFER, new Float32Array(this.vertex), this.GL.STATIC_DRAW);

        this.OBJECT_FACES = this.GL.createBuffer();
        this.GL.bindBuffer(this.GL.ELEMENT_ARRAY_BUFFER, this.OBJECT_FACES);
        this.GL.bufferData(this.GL.ELEMENT_ARRAY_BUFFER, new Uint16Array(this.faces), this.GL.STATIC_DRAW);

        this.childs.forEach(child => child.setup());
    }

    render(_MMatrix, PARENT_MATRIX) {
        LIBS.set_position(this.MOVE_MATRIX, this.pos[0], this.pos[1], this.pos[2]);
        LIBS.rotateX(this.MOVE_MATRIX, this.rot[0]);
        LIBS.rotateY(this.MOVE_MATRIX, this.rot[1]);
        LIBS.rotateZ(this.MOVE_MATRIX, this.rot[2]);

        this.MODEL_MATRIX = LIBS.multiply(this.MOVE_MATRIX, PARENT_MATRIX);
        this.GL.useProgram(this.SHADER_PROGRAM);
        
        this.GL.uniformMatrix4fv(_MMatrix, false, this.MODEL_MATRIX);

        this.GL.bindBuffer(this.GL.ARRAY_BUFFER, this.OBJECT_VERTEX);
        const stride = 24; // 4 bytes * 6 floats (3 position + 3 color)
        this.GL.vertexAttribPointer(this._position, 3, this.GL.FLOAT, false, stride, 0);
        this.GL.vertexAttribPointer(this._color, 3, this.GL.FLOAT, false, stride, 12);

        this.GL.bindBuffer(this.GL.ELEMENT_ARRAY_BUFFER, this.OBJECT_FACES);
        this.GL.drawElements(this.GL.TRIANGLES, this.faces.length, this.GL.UNSIGNED_SHORT, 0);

        this.childs.forEach(child => child.render(_MMatrix, this.MODEL_MATRIX));
    }
}
