
const VERTEX_STRIDE = 48;
let newLoaded = false;


class UvMesh {
    /**
     * Creates a new mesh and loads it into video memory.
     *
     * @param {WebGLRenderingContext} gl
     * @param {number} program
     * @param {number[]} vertices
     * @param {number[]} indices
     */
    constructor( gl, program, vertices, indices, material ) {
        this.verts = create_and_load_vertex_buffer( gl, vertices, gl.STATIC_DRAW );
        this.indis = create_and_load_elements_buffer( gl, indices, gl.STATIC_DRAW );

        this.n_verts = vertices.length;
        this.n_indis = indices.length;
        this.program = program;
        this.material = material;
    }

    set_vertex_attributes() {
        set_vertex_attrib_to_buffer(
            gl, this.program,
            "coordinates",
            this.verts, 3,
            gl.FLOAT, false, VERTEX_STRIDE, 0
        );

        set_vertex_attrib_to_buffer(
            gl, this.program,
            "color",
            this.verts, 4,
            gl.FLOAT, false, VERTEX_STRIDE, 12
        );

        set_vertex_attrib_to_buffer(
            gl, this.program,
            "uv",
            this.verts, 2,
            gl.FLOAT, false, VERTEX_STRIDE, 28
        );

        set_vertex_attrib_to_buffer(
            gl, this.program,
            "normal",
            this.verts, 3,
            gl.FLOAT, false, VERTEX_STRIDE, 36
        );

    }


    static uvSphere( gl, program, subdivisions, material) {
        let verts = [];
        let indices = [];

        let verticalAng = Math.PI / 2;
        let layerDiff = -(Math.PI / subdivisions);

        // for each layer
        for(let layer = 0; layer <= subdivisions; layer++) {
            let TAU = Math.PI * 2;
            let y_turns = layer / subdivisions / 2;
            // dividing this by 2 was making it an oval
            let y = Math.cos( y_turns * TAU );

            for(let subdiv = 0; subdiv <= subdivisions; subdiv++) {
                let cosOfAngle = Math.cos(verticalAng);

                let turns = subdiv / subdivisions;
                let rads = turns * TAU;

                let x = Math.cos( rads ) * cosOfAngle;
                let z = Math.sin( rads ) * cosOfAngle;

                let u = subdiv/subdivisions;
                let v = layer/subdivisions;

                verts.push( x, y, z );
                verts.push(1, 1, 1, 1);
                verts.push(u, v);

                // DONT FORGET TO ADD NORMALS
                verts.push(x, y, z);

            }

            // Update the angle
            verticalAng += layerDiff;

        }

        // Referenced this post to understand the indice calculations for avoiding
        // extra indices at poles:
        // https://stackoverflow.com/questions/56068635/declaring-the-indices-of-an-uv-sphere
        for(let i = 0; i < subdivisions; i++) {
            let index1 = i * (subdivisions + 1);
            let index2 = index1 + subdivisions + 1;

            for(let j = 0; j < subdivisions; j++) {
                // ifs are to disregard extra indices at the poles
                if(i != 0) {
                    indices.push(index1);
                    indices.push(index2);
                    indices.push(index1 + 1);

                }

                if(i != subdivisions - 1) {
                    indices.push(index1 + 1);
                    indices.push(index2);
                    indices.push(index2 + 1);
                }

                index1++;
                index2++;
            }


        }

        // console.log(indices);
        // console.log(verts);
        return new UvMesh( gl, program, verts, indices, material );

    }


    /**
     * Render the mesh. Does NOT preserve array/index buffer, program, or texture bindings!
     *
     * @param {WebGLRenderingContext} gl
     */
    render( gl ) {
        gl.cullFace( gl.BACK );
        gl.enable( gl.CULL_FACE );

        gl.useProgram( this.program );
        gl.bindBuffer( gl.ARRAY_BUFFER, this.verts );
        gl.bindBuffer( gl.ELEMENT_ARRAY_BUFFER, this.indis );
        // gl.generateMipmap(gl.TEXTURE_2D);
        this.set_vertex_attributes();
        bind_texture_samplers( gl, this.program, "tex_0" );

        // gl.activeTexture( gl.TEXTURE0 );
        this.material.bind( gl );

        gl.drawElements( gl.TRIANGLES, this.n_indis, gl.UNSIGNED_SHORT, 0 );
    }
}