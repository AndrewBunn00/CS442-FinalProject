function xor_texture() {
    let data = new Array( 256 * 256 * 4 );
    // 4 because there are 4 bytes per pixel: R, G, B, and A
    let width = 256;

    // generate pixels here 
    for( let row = 0; row < width; row++ ) {
        for( let col = 0; col < width; col++ ) {
        // calculations go here
        let pix = ( row * width + col ) * 4;
        data[pix] = data[pix + 1] = data[pix + 2] = row ^ col;
        data[pix + 3] = 255;
        }
    }

    return new Uint8Array( data );
}