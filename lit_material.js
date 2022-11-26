class LitMaterial {

    /**
     * Create a new material from the given texture and parameters
     * @param {WebGLRenderingContext} gl 
     * @param {HTMLImageElement} image 
     * @param {*} blend_mode 
     */
    constructor( gl, image_url, blend_mode, ambient, diffuse, specular, shininess ) {
        this.tex = gl.createTexture();
        this.blend_mode = blend_mode;
        this.loaded = false;
        
        this.ambient = ambient;
        this.diffuse = diffuse;
        this.specular = specular;
        this.shininess = shininess;


        const old_tex_binding = gl.getParameter( gl.TEXTURE_BINDING_2D );
        gl.bindTexture( gl.TEXTURE_2D, this.tex );

        gl.texImage2D( 
            gl.TEXTURE_2D, 0, gl.RGBA,
            256, 256, 0, 
            gl.RGBA, gl.UNSIGNED_BYTE,  
            LitMaterial.xor_texture( 256 )
        );
        gl.generateMipmap( gl.TEXTURE_2D );

        if( old_tex_binding === null ) {
            gl.bindTexture( gl.TEXTURE_2D, old_tex_binding );
        }

        let image = new Image();
        let _tex = this; // inside an anomymous function, 'this' refers to the function.
                         // so we create an alias to the material we're creating.

        // the image has to be loaded before we can load the pixel data
        image.addEventListener( 'load', function() {

            const old_tex_binding = gl.getParameter( gl.TEXTURE_BINDING_2D );
            gl.bindTexture( gl.TEXTURE_2D, _tex.tex );


            gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR );
            //gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, blend_mode );
            gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, blend_mode );
            
            gl.texImage2D(
                gl.TEXTURE_2D, 0, gl.RGBA, 
                gl.RGBA, gl.UNSIGNED_BYTE, image
            );
            
            _tex.width = image.width;
            _tex.height = image.height;

            gl.generateMipmap( gl.TEXTURE_2D );

            console.log( 'loaded texture: ', image.src );

            // we might want to keep track of this later
            _tex.loaded = true;

            if( old_tex_binding === null ) {
                gl.bindTexture( gl.TEXTURE_2D, old_tex_binding );
            }
        } );

        image.src = image_url;
    }

    bind( gl, program ) {
        gl.bindTexture( gl.TEXTURE_2D, this.tex );

        set_uniform_scalar( gl, program, 'mat_ambient', this.ambient );
        set_uniform_scalar( gl, program, 'mat_diffuse', this.diffuse );
        set_uniform_scalar( gl, program, 'mat_specular', this.specular );
        set_uniform_scalar( gl, program, 'mat_shininess', this.shininess );
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