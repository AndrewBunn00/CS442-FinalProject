
class Camera {

    constructor() {
        this.x = 0;
        this.y = 0;
        this.z = 0;

        this.yaw = 0;
        this.pitch = 0;
        this.roll = 0;
    }

    // slightly less than a quarter turn up or down allowed
    static get PITCH_LIMIT() { return .24; }

    add_yaw( amount ) { 
        this.yaw += amount; 

        if( this.yaw < 0 ) {
            this.yaw = 1 + this.yaw;
        }

        if( this.yaw > 1 ) {
            this.yaw = this.yaw % 1;
        }
    }
    
    add_pitch( amount ) { 
        this.pitch += amount; 
        if( this.pitch > this.PITCH_LIMIT ) {
            this.pitch = this.PITCH_LIMIT;
        }
        else if( this.pitch < - this.PITCH_LIMIT ) {
            this.pitch = -this.PITCH_LIMIT;
        }
    }

    add_roll( amount ) { 
        this.roll += amount; 

        if( this.roll < -.5 ) { this.roll = -.5; }
        if( this.roll > 5 ) { this.roll = .5; }
    }

    move_in_direction( strafe, up, forward ) {
        let matrix = Camera.get_dir_matrix( this.roll, this.pitch, this.yaw );
        let txed = matrix.transform_vec( new Vec4( strafe, up, forward, 0 ) );

        // console.log( txed.x, txed.y, txed.z, txed.w );

        this.translate_vec( txed );
        
        // note: this is wrong:
        // this.x += strafe;
        // this.y += up;
        // this.z += forward;
    }

    translate( x, y, z ) {
        this.x += x;
        this.y += y;
        this.z += z;
    }

    translate_vec( v ) {
        this.translate( v.x, v.y, v.z );
    }

    warp( x, y, z ) {
        this.x = x;
        this.y = y;
        this.z = z;
    }

    warp_vec( v ) {
        this.warp( v.x, v.y, v.z );
    }

    static get_dir_matrix( roll, pitch, yaw ) {
        let matrix = new Mat4();

        
        matrix = matrix.mul( Mat4.rotation_xz( yaw ) );
        matrix = matrix.mul( Mat4.rotation_yz( pitch ) );
        matrix = matrix.mul( Mat4.rotation_xy( roll ) );
        
        return matrix;
    }


    get_view_matrix() {
        let matrix = new Mat4();

        matrix = matrix.mul( Mat4.translation( this.x, this.y, this.z ) );
        
        matrix = matrix.mul( Mat4.rotation_xz( this.yaw ) );
        matrix = matrix.mul( Mat4.rotation_yz( this.pitch ) );
        matrix = matrix.mul( Mat4.rotation_xy( this.roll ) );
        
        return matrix.inverse();
    }
}
