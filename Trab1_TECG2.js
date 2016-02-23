
var canvas;
var gl;

var points = [];
var lines = [];

var vPosition;
var fColor;
var bufferId;

var angle;

var vertices = [
    vec2(-0.71,-0.40), // left-down corner
    vec2( 0,  0.8),  // center-up corner
    vec2( 0.71, -0.40) // right-down corner
];

window.onload = function init()
{
    canvas = document.getElementById( "gl-canvas" );

    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }

    //
    //  Initialize our data for the Sierpinski Gasket
    //

    divideTriangle( vertices[0], vertices[1], vertices[2],
                    document.getElementById("subdivisionsSlider").value);
    //
    //  Configure WebGL
    //
    gl.viewport( 0, 0, canvas.width, canvas.height );
    gl.clearColor( 1.0, 1.0, 1.0, 1.0 );

    //  Load shaders and initialize attribute buffers

    var program = initShaders( gl, "vertex-shader", "fragment-shader" );
    gl.useProgram( program );

    // Load the data into the GPU

    bufferId = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, bufferId );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(points), gl.STATIC_DRAW );

    // Associate out shader variables with our data buffer

    vPosition = gl.getAttribLocation( program, "vPosition" );
    gl.vertexAttribPointer( vPosition, 2, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vPosition );

    fColor = gl.getUniformLocation(program, "fColor");
    gl.uniform4fv(fColor, flatten(vec4(1.0, 1.0, 0.0, 1.0)));

    document.getElementById("subdivisionsSlider").oninput = function() {
        reset();
    };

    document.getElementById("fillForth?").onchange = function() {
        reset();
    };

    document.getElementById("angleSlider").oninput = function() {
        reset();
    };

    render();
};

function twist(vector){
    var angle = document.getElementById("angleSlider").value * Math.PI / 180;
    var x = vector[0],
        y = vector[1],
        d = Math.sqrt(x * x + y * y),
        sinAngle = Math.sin(d * angle),
        cosAngle = Math.cos(d * angle);
    //x' = x cos(d0) - y sin(d0); y' = x sin(d0) + y cos(d0)
    return [x * cosAngle - y * sinAngle, x * sinAngle + y * cosAngle];
}

function triangle( a, b, c )
{
    a = twist(a), b = twist(b), c = twist(c);
    points.push( a, b, c );
    lines.push(a, b);
    lines.push(b, c);
    lines.push(a, c);
}

function divideTriangle( a, b, c, count )
{

    // check for end of recursion

    if ( count === 0 ) {
        triangle( a, b, c );
    }
    else {

        //bisect the sides

        var ab = mix( a, b, 0.5 );
        var ac = mix( a, c, 0.5 );
        var bc = mix( b, c, 0.5 );

        --count;

        // three new triangles

        divideTriangle( a, ab, ac, count );
        divideTriangle( c, ac, bc, count );
        divideTriangle( b, bc, ab, count );
        if (document.getElementById("fillForth?").checked) {
          divideTriangle( ab, bc, ac, count );
        }
    }
}

function reset()
{
    gl.clearColor( 1.0, 1.0, 1.0, 1.0 );
    points = [];
    lines = [];
    divideTriangle( vertices[0], vertices[1], vertices[2], document.getElementById("subdivisionsSlider").value);
    gl.bufferData( gl.ARRAY_BUFFER, flatten(points), gl.STATIC_DRAW );
    gl.uniform4fv(fColor, flatten(vec4(1.0, 1.0, 0.0, 1.0)));
    render();
}

function render()
{
    gl.clear( gl.COLOR_BUFFER_BIT );
    gl.drawArrays( gl.TRIANGLES, 0, points.length );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(lines), gl.STATIC_DRAW );
    gl.uniform4fv(fColor, flatten(vec4(0.0, 0.0, 0.0, 1.0)));
    gl.drawArrays( gl.LINES, 0, lines.length );
}
