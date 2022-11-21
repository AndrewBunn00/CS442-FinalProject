
class Material {

    /**
     * Create a new material from the given texture and parameters
     * @param {WebGLRenderingContext} gl
     * @param {HTMLImageElement} image
     * @param {*} blend_mode
     */
    constructor( gl, image_url, blend_mode ) {
        this.tex = gl.createTexture();
        this.blend_mode = blend_mode;
        this.loaded = false;

        const old_tex_binding = gl.getParameter( gl.TEXTURE_BINDING_2D );
        this.bind( gl );

        gl.texImage2D(
            gl.TEXTURE_2D, 0, gl.RGBA,
            256, 256, 0,
            gl.RGBA, gl.UNSIGNED_BYTE,
            Material.xor_texture( 256 )
        );
        gl.generateMipmap( gl.TEXTURE_2D );

        if( old_tex_binding === null ) {
            gl.bindTexture( gl.TEXTURE_2D, old_tex_binding );
        }

        if( image_url == 'xor' ) {
            return;
        }

        let image = new Image();
        let _tex = this; // inside an anonymous function, 'this' refers to the function.
                         // so we create an alias to the material we're creating.

        // the image has to be loaded before we can load the pixel data
        image.addEventListener( 'load', function() {

            const old_tex_binding = gl.getParameter( gl.TEXTURE_BINDING_2D );
            _tex.bind( gl );

            gl.texImage2D(
                gl.TEXTURE_2D, 0, gl.RGBA,
                gl.RGBA, gl.UNSIGNED_BYTE, image
            );

            _tex.width = image.width;
            _tex.height = image.height;

            gl.generateMipmap( gl.TEXTURE_2D );

            let err = gl.getError();
            if( err != 0 ) {
                gl.getError(); //clear potential 2nd error.
                throw new Error( 'Error generating mipmap: ' + err );
            }

            gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, blend_mode );
            gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR );

            err = gl.getError();
            if( err != 0 ) {
                gl.getError(); //clear potential 2nd error.
                throw new Error( 'Error setting texture parameters: ' + err );
            }

            console.log( 'loaded texture: ', image.src );

            // we might want to keep track of this later
            _tex.loaded = true;

            if( old_tex_binding === null ) {
                gl.bindTexture( gl.TEXTURE_2D, old_tex_binding );
            }
        } );

        image.src = image_url;
    }

    bind( gl ) {
        gl.bindTexture( gl.TEXTURE_2D, this.tex );
    }

    /**
     * Create the famous width * width XOR texture for testing.
     * @param {number} width
     */
    static xor_texture( width ) {
        let data = new Array( width * width * 4 );

        for( let row = 0; row < width; row++ ) {
            for( let col = 0; col < width; col++ ) {
                let pix = ( row * width + col ) * 4;
                data[pix] = data[pix + 1] = data[pix + 2] = row ^ col; // r, g, and b are the same
                data[pix + 3] = 255; // alpha is always max (fully opaque)
            }
        }

        return new Uint8Array( data );
    }




}


// function setAllUniforms(gl, shader_program) {
//     set_uniform_scalar(gl, shader_program, 'mat_ambient', 0.25);
//     set_uniform_scalar(gl, shader_program, 'mat_diffuse', 1.0);
//     set_uniform_scalar(gl, shader_program, 'mat_specular', 2.0);
//     set_uniform_scalar(gl, shader_program, 'mat_shininess', 4.0);
//
//     set_uniform_vec3(gl, shader_program, 'sun_dir', [150, 0, 2]);
//     set_uniform_vec3(gl, shader_program, 'sun_color', [0.75, 0.75, 0.75]);
//
//     set_uniform_vec3(gl, shader_program, 'point_color', [30, 0, 0]);
//     set_uniform_vec3(gl, shader_program, 'point_location', [-3, -3, 4]);
// }