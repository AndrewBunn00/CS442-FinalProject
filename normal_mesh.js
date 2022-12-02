
const VERTEX_STRIDE = 48;
let m = null;
let mList = [];


function saveMesh(meshToSave) {
    m = meshToSave;
}

function saveMeshToList(meshToSave) {
    mList.push(meshToSave);
}

class NormalMesh {
    /** 
     * Creates a new mesh and loads it into video memory.
     * 
     * @param {WebGLRenderingContext} gl  
     * @param {number} program
     * @param {number[]} vertices
     * @param {number[]} indices
    */
    constructor( gl, program, vertices, indices, material, use_color ) {
        this.verts = create_and_load_vertex_buffer( gl, vertices, gl.STATIC_DRAW );
        this.indis = create_and_load_elements_buffer( gl, indices, gl.STATIC_DRAW );
        // console.log("VERTS" + this.verts);
        // console.log("INDIS" + this.indis);


        this.n_verts = vertices.length / VERTEX_STRIDE * 4;
        this.n_indis = indices.length;
        this.program = program;
        this.material = material;

        this.use_color = use_color ?? false;
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
            "surf_normal",
            this.verts, 3, 
            gl.FLOAT, false, VERTEX_STRIDE, 36
        )
    }
    

    /**
     * Create a box mesh with the given dimensions and colors. Creates normals.
     * @param {WebGLRenderingContext} gl 
     */

    static box( gl, program, width, height, depth, material ) {
        let hwidth = width / 2.0;
        let hheight = height / 2.0;
        let hdepth = depth / 2.0;

        let verts = [
            hwidth, -hheight, -hdepth,  1.0, 0.0, 1.0, 1.0,     1.0, 1.0,   0.0, 0.0, -1.0,
            -hwidth, -hheight, -hdepth, 0.0, 1.0, 1.0, 1.0,     0.0, 1.0,   0.0, 0.0, -1.0,
            -hwidth, hheight, -hdepth,  0.5, 0.5, 1.0, 1.0,     0.0, 0.0,   0.0, 0.0, -1.0,
            hwidth, hheight, -hdepth,   1.0, 1.0, 0.5, 1.0,     1.0, 0.0,   0.0, 0.0, -1.0,

            hwidth, -hheight, hdepth,   1.0, 0.0, 1.0, 1.0,     1.0, 1.0,   1.0, 0.0, 0.0,
            hwidth, -hheight, -hdepth,  0.0, 1.0, 1.0, 1.0,     0.0, 1.0,   1.0, 0.0, 0.0,
            hwidth, hheight, -hdepth,   0.5, 0.5, 1.0, 1.0,     0.0, 0.0,   1.0, 0.0, 0.0,
            hwidth, hheight, hdepth,    1.0, 1.0, 0.5, 1.0,     1.0, 0.0,   1.0, 0.0, 0.0,

            -hwidth, -hheight, hdepth,  1.0, 0.0, 1.0, 1.0,     1.0, 1.0,   0.0, 0.0, 1.0,
            hwidth, -hheight, hdepth,   1.0, 1.0, 0.5, 1.0,     0.0, 1.0,   0.0, 0.0, 1.0,
            hwidth, hheight, hdepth,    0.5, 0.5, 1.0, 1.0,     0.0, 0.0,   0.0, 0.0, 1.0,
            -hwidth, hheight, hdepth,   0.0, 1.0, 1.0, 1.0,     1.0, 0.0,   0.0, 0.0, 1.0,
            
            -hwidth, -hheight, hdepth,  1.0, 0.0, 1.0, 1.0,     0.0, 1.0,   -1.0, 0.0, 0.0,
            -hwidth, -hheight, -hdepth, 0.0, 1.0, 1.0, 1.0,     1.0, 1.0,   -1.0, 0.0, 0.0,
            -hwidth, hheight, -hdepth,  0.5, 0.5, 1.0, 1.0,     1.0, 0.0,   -1.0, 0.0, 0.0,
            -hwidth, hheight, hdepth,   1.0, 1.0, 0.5, 1.0,     0.0, 0.0,   -1.0, 0.0, 0.0,

            -hwidth, hheight, -hdepth,  1.0, 0.0, 0.0, 1.0,     0.0, 1.0,   0.0, 1.0, 0.0,
            hwidth, hheight, -hdepth,   0.0, 1.0, 0.0, 1.0,     1.0, 1.0,   0.0, 1.0, 0.0,
            hwidth, hheight, hdepth,    0.0, 0.0, 1.0, 1.0,     1.0, 0.0,   0.0, 1.0, 0.0,
            -hwidth, hheight, hdepth,   1.0, 1.0, 0.0, 1.0,     0.0, 0.0,   0.0, 1.0, 0.0,

            -hwidth, -hheight, -hdepth, 1.0, 0.0, 0.0, 1.0,     0.0, 1.0,   0.0, -1.0, 0.0,
            hwidth, -hheight, -hdepth,  0.0, 1.0, 0.0, 1.0,     1.0, 1.0,   0.0, -1.0, 0.0,
            hwidth, -hheight, hdepth,   0.0, 0.0, 1.0, 1.0,     1.0, 0.0,   0.0, -1.0, 0.0,
            -hwidth, -hheight, hdepth,  1.0, 1.0, 0.0, 1.0,     0.0, 0.0,   0.0, -1.0, 0.0,
        ];

        let indis = [
            // clockwise winding
            0, 3, 2, 2, 1, 0,
            4, 7, 6, 6, 5, 4,
            8, 11, 10, 10, 9, 8,
            12, 13, 14, 14, 15, 12,
            16, 17, 18, 18, 19, 16,
            20, 23, 22, 22, 21, 20,
        ];

        return new NormalMesh( gl, program, verts, indis, material, false );
    }

    /**
     * Create a flat platform in the xz plane.
     * @param {WebGLRenderingContext} gl 
     */
    static platform( gl, program, width, depth, uv_min, uv_max, material ) {
        let hwidth = width / 2;
        let hdepth = depth / 2;
        
        let verts = [
            -hwidth, 0, -hdepth,  1.0, 1.0, 1.0, 1.0,     uv_min, uv_max,   0.0, 1.0, 0.0,
            hwidth, 0, -hdepth,   1.0, 1.0, 1.0, 1.0,     uv_max, uv_max,   0.0, 1.0, 0.0,
            hwidth, 0, hdepth,    1.0, 1.0, 1.0, 1.0,     uv_max, uv_min,   0.0, 1.0, 0.0,
            -hwidth, 0, hdepth,   1.0, 1.0, 1.0, 1.0,     uv_min, uv_min,   0.0, 1.0, 0.0,
        ];

        let indis = [ 0, 1, 2, 2, 3, 0, ];

        return new NormalMesh( gl, program, verts, indis, material, false );
    }

    /**
     * Load a mesh from a heightmap.
     * @param {WebGLRenderingContext} gl 
     * @param {WebGLProgram} program
     * @param {number][][]} map
     * @param {number} min 
     * @param {number} max
     */
    static from_heightmap( gl, program, map, min, max, material ) {
        let rows = map.length;
        let cols = map[0].length;
        const MIN_HEIGHT_COLOR = 0.2;

        let off_x = cols / 2;
        let off_z = rows / 2;

        let verts = [];
        let indis = [];

        function color( height ) {
            let normed_height = height / ( max - min );
            return MIN_HEIGHT_COLOR + normed_height * ( 1 - MIN_HEIGHT_COLOR );
        }

        function push_vert( verts, vert, u, v, normal ) {
            verts.push( vert.x, vert.y, vert.z );
            let vert_bright = color( vert.y );
            verts.push( vert_bright, vert_bright, vert_bright, 1.0 );
            verts.push( u, v );
            verts.push( normal.x, normal.y, normal.z );
        }

        for( let row = 1; row < rows; row++ ) {
            for( let col = 1; col < cols; col++ ) {
                let indi_start = indis.length;

                let pos_tl = map[row - 1][col - 1];
                let pos_tr = map[row - 1][col];
                let pos_bl = map[row][col - 1];
                let pos_br = map[row][col];

                let v_tl = new Vec4( -1, pos_tl, -1 );
                let v_tr = new Vec4( 0, pos_tr, -1 );
                let v_bl = new Vec4( -1, pos_bl, 0 );
                let v_br = new Vec4( 0, pos_br, 0 );

                let normal_t1 = Vec4.normal_of_triangle( v_tl, v_tr, v_bl );
                let normal_t2 = Vec4.normal_of_triangle( v_br, v_bl, v_tr );

                // debug
                // normal_t1 = new Vec4( 0, 1, 0 );
                // normal_t2 = new Vec4( 0, 1, 0 );

                v_tl.x += col - off_x;
                v_tl.z += row - off_z;
                v_tr.x += col - off_x;
                v_tr.z += row - off_z;
                v_bl.x += col - off_x;
                v_bl.z += row - off_z;
                v_br.x += col - off_x;
                v_br.z += row - off_z;

                push_vert( verts, v_tl, 0, 1, normal_t1 );
                push_vert( verts, v_tr, 1, 1, normal_t1 );
                push_vert( verts, v_bl, 0, 0, normal_t1 );

                push_vert( verts, v_br, 1, 0, normal_t2 );
                push_vert( verts, v_bl, 0, 0, normal_t2 );
                push_vert( verts, v_tr, 1, 1, normal_t2 );

                indis.push( 
                    indi_start,
                    indi_start + 1,
                    indi_start + 2,
                    indi_start + 3,
                    indi_start + 4,
                    indi_start + 5
                );
            }
        }

        return new NormalMesh( gl, program, verts, indis, material, true );
    }

    /**
     * Render the mesh. Does NOT preserve array/index buffer, program, or texture bindings! 
     * 
     * @param {WebGLRenderingContext} gl 
     */
    render( gl ) {
        // gl.enable( gl.CULL_FACE );
        
        gl.useProgram( this.program );
        this.set_vertex_attributes();
        gl.bindBuffer( gl.ARRAY_BUFFER, this.verts );
        gl.bindBuffer( gl.ELEMENT_ARRAY_BUFFER, this.indis );
        bind_texture_samplers( gl, this.program, "tex_0" );

        gl.activeTexture( gl.TEXTURE0 );
        this.material.bind( gl, this.program );

        set_uniform_int( gl, this.program, 'use_color', this.use_color );

        gl.drawElements( gl.TRIANGLES, this.n_indis, gl.UNSIGNED_SHORT, 0 );
    }

    /**
     * Create a UV sphere.
     * @param {*} gl 
     * @param {*} program 
     * @param {*} radius 
     * @param {*} subdivs the number of subdivisions, both vertically and radially
     * @param {*} material 
     * @returns 
     */
    static uv_sphere( gl, program, radius, subdivs, material ) {
        if( subdivs < 3 ) {
            throw new Error( "subdivs must be at least 3. value: " + subdivs );
        }

        let verts = []
        let indis = []

        for( let layer = 0; layer <= subdivs; layer++ ) {
            // let y = layer / subdivs - 0.5;
            let y_turns = layer /  subdivs / 2;
            let y = Math.cos( 2 * Math.PI * y_turns ) / 2;
            let radius_scale_for_layer = Math.sin( 2 * Math.PI * y_turns );

            for( let subdiv = 0; subdiv <= subdivs; subdiv++ ) {
                let turns = subdiv / subdivs; 
                let rads = 2 * Math.PI * turns;
    
                let x = Math.cos( rads ) / 2 * radius_scale_for_layer;
                let z = Math.sin( rads ) / 2 * radius_scale_for_layer;

                let point_norm = new Vec4( x, y, z, 0.0 ).norm();
                let scaled_point = point_norm.scaled( radius );
                
                // coordinates
                verts.push( scaled_point.x, scaled_point.y, scaled_point.z );

                // console.log( layer, subdiv, scaled_point.x, scaled_point.y, scaled_point.z );
                
                // color (we're making it white for simplicity)
                verts.push( 1, 1, 1, 1 );

                // uvs
                verts.push( subdiv / subdivs, layer / subdivs );
                
                // normal vector. make sure you understand why the normalized coordinate is 
                // equivalent to the normal vector for the sphere.
                verts.push( point_norm.x, point_norm.y, point_norm.z );
            }
        }

        function get_indi_no_from_layer_and_subdiv_no( layer, subdiv ) {
            let layer_start = layer * ( subdivs + 1 );
            return layer_start + subdiv % ( subdivs + 1 );
        }

        for( let layer = 1; layer <= subdivs; layer++ ) {
            for( let subdiv = 0; subdiv < subdivs; subdiv++ ) {
                let i0 = get_indi_no_from_layer_and_subdiv_no( layer - 1, subdiv );
                let i1 = get_indi_no_from_layer_and_subdiv_no( layer - 1, subdiv + 1 );
                let i2 = get_indi_no_from_layer_and_subdiv_no( layer, subdiv );
                let i3 = get_indi_no_from_layer_and_subdiv_no( layer, subdiv + 1 );

                indis.push( i0, i2, i3, i3, i1, i0 );
            }
        }

        return new NormalMesh( gl, program, verts, indis, material, false );
    }




    /**
     * Asynchronously load the obj file as a mesh.
     * @param {WebGLRenderingContext} gl
     * @param {string} file_name
     * @param {WebGLProgram} program
     * @param {function} f the function to call and give mesh to when finished.
     * @param material
     */
    static from_obj_file( gl, file_name, program, f, material ) {
        let request = new XMLHttpRequest();

        // the function that will be called when the file is being loaded
        request.onreadystatechange = function() {
            // console.log( request.readyState );

            if( request.readyState !== 4 ) { return; }
            if( request.status !== 200 ) {
                throw new Error( 'HTTP error when opening .obj file: ', request.statusText );
            }

            // now we know the file exists and is ready load the file
            let loaded_mesh = NormalMesh.from_obj_text_complex( gl, program, request.responseText, material );

            // console.log( 'loaded ', file_name );
            // console.log(loaded_mesh);
            f( loaded_mesh );
        };

        request.open( 'GET', file_name ); // initialize request.
        request.send();                   // execute request
    }

    /**
     * Parse the given text as the body of an obj file.
     * @param {WebGLRenderingContext} gl
     * @param {WebGLProgram} program
     * @param {string} text
     * @param material
     */
    static from_obj_text( gl, program, text, material ) {
        // create verts and indis from the text

        let verts = [];
        let indis = [];

        // split on endlines no matter OS
        let lines = text.split( /\r?\n/ );


        lines.forEach(element => {
            // may not need trim
            element = element.trim();
            // split the line on whitespace
            let parts_of_line = element.split( /(\s+)/ );

            parts_of_line.forEach((element2, index) => {

                if(element2.startsWith('v')) {
                    verts.push(parseFloat(parts_of_line[index+2]));
                    verts.push(parseFloat(parts_of_line[index+4]));
                    verts.push(parseFloat(parts_of_line[index+6]));
                    // hard code to no colors for now
                    verts.push(0.0);
                    verts.push(0.0);
                    verts.push(0.0);
                    verts.push(1.0);

                    // uv
                    verts.push(1.0);
                    verts.push(1.0);

                    // surface norms
                    verts.push(1.0);
                    verts.push(1.0);
                    verts.push(1.0);
                }
                else if(element2.startsWith('f')) {
                    indis.push(parseInt(parts_of_line[index+2]-1));
                    indis.push(parseInt(parts_of_line[index+4]-1));
                    indis.push(parseInt(parts_of_line[index+6]-1));
                }

            });

        });

        return new NormalMesh( gl, program, verts, indis, material, false );
    }


    static from_obj_text_complex( gl, program, text, material ) {
        // create verts and indis from the text

        let verts = [];
        let colors = [];
        let vns = [];
        let uvs = [];
        let index = [];

        let lines = text.split( /\r?\n/ );

        for(let line of lines) {
            let newLine = line.trim();
            let segs = newLine.split( /(\s+)/ );

            if( segs === null || segs.length < 2 ||
                segs[0] === '#' || segs[0] === '' ) {

            }
            else if(segs[0] === 'v') {
                verts.push( parseFloat( segs[2] ) );
                verts.push( parseFloat( segs[4] ) );
                verts.push( parseFloat( segs[6] ) );

                colors.push(0.0, 0.0, 0.0, 1.0);
            }
            else if ( segs[0] === 'f' ) {
                segs.forEach( seg => {
                    if (seg !== 'f' && seg !== ' ') {
                        let indices = seg.split('/');

                        index.push(parseInt(indices[0]) - 1);
                    }
                });
            } // uv coords
            else if (segs[0] === 'vt') {
                uvs.push(parseFloat(segs[2]), parseFloat(segs[4]));
            } // vertex normals
            else if (segs[0] === 'vn') {
                vns.push(parseFloat(segs[2]), parseFloat(segs[4]), parseFloat(segs[6]));
            }

        }

        let colorIndex = 0;
        let uvIndex = 0;
        let vnIndex = 0;

        let trueVerts = [];

        for(let i = 0; i < verts.length - 2; i += 3 ) {
            // coordinates, colors, uv coords, and vertex normals
            trueVerts.push(verts[i], verts[i+1], verts[i+2]);
            trueVerts.push(colors[colorIndex], colors[colorIndex+1], colors[colorIndex+2], colors[colorIndex+3]);
            trueVerts.push(uvs[uvIndex], uvs[uvIndex+1]);
            trueVerts.push(vns[vnIndex], vns[vnIndex+1], vns[vnIndex+2]);

            // increment each index according to their stride
            colorIndex += 4;
            uvIndex += 2;
            vnIndex += 3;
        }

        return new NormalMesh( gl, program, trueVerts, index, material, false );
    }

}


