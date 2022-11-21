//

const ROTATION_SPEED_XY = 0.25;
const ROTATION_SPEED_XZ = 0.125;
const ROTATION_SPEED_YZ = 0.05;

let rotation_amnt_xy = 0.0;
let rotation_amnt_xz = 0.0;
let rotation_amnt_yz = 0.0;
let last_update = performance.now(); 
let time_delta = 0;



 /** 
  * Creates a new vertex buffer and loads it full of the given data.
  * Preserves bound buffer.
  * 
  * @param {WebGLRenderingContext} gl  
  * @param {number[]} data
  * @param {number} usage
  * 
  * @returns {WebGlBuffer}
 */
function create_and_load_vertex_buffer(gl, data, usage) {
    let current_array_buf = gl.getParameter( gl.ARRAY_BUFFER_BINDING );

    let buf_id = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, buf_id );
    gl.bufferData( gl.ARRAY_BUFFER, new Float32Array(data), usage );
    
    gl.bindBuffer( gl.ARRAY_BUFFER, current_array_buf );

    return buf_id;
}


function create_and_load_elements_buffer(gl, data, usage) {
    let current_array_buf = gl.getParameter( gl.ELEMENT_ARRAY_BUFFER_BINDING );

    let buf_id = gl.createBuffer();
    gl.bindBuffer( gl.ELEMENT_ARRAY_BUFFER, buf_id );
    gl.bufferData( gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(data), usage );
    
    gl.bindBuffer( gl.ELEMENT_ARRAY_BUFFER, current_array_buf );

    return buf_id;
}

/**
 * 
 * @param {WebGLRenderingContext} gl
 * @param {WebGLShader} shader_id 
 */
function assert_shader_compiled_correctly( gl, shader_id ) {
    if( !gl.getShaderParameter( shader_id, gl.COMPILE_STATUS ) ) {
        let err = gl.getShaderInfoLog( shader_id );
        let shader_kind = gl.getShaderParameter( shader_id, gl.SHADER_TYPE );
        let shader_kind_name = 
            shader_kind == gl.VERTEX_SHADER ? 'vertex shader' :
            shader_kind == gl.FRAGMENT_SHADER ? 'fragment shader' :
            'unknown shader'; 

        throw new Error( 'Compile error in ' + shader_kind_name + ':\n' + err );
    }

    return true;
}

/**
 * Creates a new shader program, creates and attaches vertex and fragment shaders 
 * from the given sources, links the resulting program, and returns it. 
 * 
 * @param {WebGLRenderingContext} gl
 * @param {string} v_shader_src 
 * @param {string} f_shader_src 
 * 
 * @returns {WebGLProgram}
 */
function create_compile_and_link_program( gl, v_shader_src, f_shader_src ) {
    let program = gl.createProgram()
    
    let v_shader = gl.createShader( gl.VERTEX_SHADER );
    gl.shaderSource( v_shader, v_shader_src );
    gl.compileShader( v_shader );
    assert_shader_compiled_correctly( gl, v_shader );

    let f_shader = gl.createShader( gl.FRAGMENT_SHADER );
    gl.shaderSource( f_shader, f_shader_src );
    gl.compileShader( f_shader );
    assert_shader_compiled_correctly( gl, f_shader );

    gl.attachShader( program, v_shader );
    gl.attachShader( program, f_shader );
    gl.linkProgram( program );

    if( !gl.getProgramParameter( program, gl.LINK_STATUS ) ) {
        let err = gl.getProgramInfoLog( program );
        throw new Error( 'Link error in shader program:\n' + err );
    }

    return program;
}

/**
 * 
 * @param {WebGLRenderingContext} gl 
 * @param {WebGLProgram} program 
 */
function delete_program_and_attached_shaders( gl, program ) {
    let shaders = gl.getAttachedShaders( program );
    gl.deleteProgram( program );

    shaders.forEach( function( shader ) { gl.deleteShader( shader ); } );
}

/**
 * Sets the buffer for a given vertex attribute name. 
 * 
 * @param {WebGLRenderingContext} gl 
 * @param {WebGLProgram} program 
 * @param {string} attrib_name 
 * @param {WebGLBuffer} buffer
 * @param {number} n_components 
 * @param {number} gl_type 
 * @param {number} stride 
 * @param {number} offset
 */
function set_vertex_attrib_to_buffer( 
    gl, program, attrib_name, buffer, n_components, gl_type, normalize, stride, offset ) 
{
    let attr_loc = gl.getAttribLocation( program, attrib_name );
    
    if ( attr_loc == - 1 ) { 
        throw new Error( 'either no attribute named "' + attrib_name + 
            '" in program or attribute name is reserved/built-in.' ) 
    } 

    let err = gl.getError()
    if ( err != 0 ) {
        throw new Error( 'invalid program. Error: ' + err );
    }

    let current_array_buf = gl.getParameter( gl.ARRAY_BUFFER_BINDING );

    gl.bindBuffer( gl.ARRAY_BUFFER, buffer );
    gl.enableVertexAttribArray( attr_loc );
    gl.vertexAttribPointer( attr_loc, n_components, gl_type, normalize, stride, offset );
    // gl.enableVertexAttribArray( attr_loc );

    gl.bindBuffer( gl.ARRAY_BUFFER, current_array_buf );
}

/**
 * Set global parameters such as "clear color". 
 * @param {WebGLRenderingContext} gl 
 */
function set_render_params( gl ) {
    // gl.clearColor( 0.0, 0.0, 0.0, 1 );
    gl.clearColor( 0.5, 0.8, 1.0, 1.0 );

    gl.enable( gl.DEPTH_TEST );
    gl.enable( gl.BLEND );

    gl.depthMask( true );
    gl.depthFunc( gl.LEQUAL );

    gl.blendFunc( gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA );

    // gl.viewport( 0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight );
}



/**
 * Sets uniform data for a row-major matrix4
 * 
 * @param {WebGLRenderingContext} gl 
 * @param {WebGLProgram} program
 * @param {string} name 
 * @param {number[]} data 
 */
function set_uniform_matrix4( gl, program, name, data ) {
    //let old_prog = gl.getParameter( gl.CURRENT_PROGRAM );
    //gl.useProgram( program );

    const loc = gl.getUniformLocation( program, name );
    gl.uniformMatrix4fv( loc, true, data );

    //gl.useProgram( old_prog );
}



function set_uniform_scalar( gl, program, name, x ) {
    const loc = gl.getUniformLocation( program, name );
    gl.uniform1f( loc, x );
}

function set_uniform_vec3( gl, program, name, x ) {
    const loc = gl.getUniformLocation( program, name );
    gl.uniform3fv( loc, x );
}


function saveMesh(meshToSave) {
    mesh = meshToSave;
}


function bind_texture_samplers( gl, program, sampler_name ) {
    // const old_prog = gl.getParameter( gl.CURRENT_PROGRAM );
    // gl.useProgram( program );

    const loc = gl.getUniformLocation( program, sampler_name );
    gl.uniform1i( loc, 0 );

    // gl.useProgram( old_prog );
}


function set_all_uniforms(gl, shader_program) {
    set_uniform_scalar(gl, shader_program, 'mat_ambient', 0.25);
    set_uniform_scalar(gl, shader_program, 'mat_diffuse', 1.0);
    set_uniform_scalar(gl, shader_program, 'mat_specular', 2.0);
    set_uniform_scalar(gl, shader_program, 'mat_shininess', 4.0);

    set_uniform_vec3(gl, shader_program, 'sun_dir', [150, 0, 2]);
    set_uniform_vec3(gl, shader_program, 'sun_color', [0.75, 0.75, 0.75]);

    set_uniform_vec3(gl, shader_program, 'point_color', [30, 0, 0]);
    set_uniform_vec3(gl, shader_program, 'point_location', [-3, -3, 4]);
}



