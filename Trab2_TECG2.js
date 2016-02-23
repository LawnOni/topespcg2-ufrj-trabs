
var canvas;
var gl;

var NumVertices  = 36;

var points = [];
var colors = [];

var xAxis = 0;
var yAxis = 1;
var zAxis = 2;

var axis = 0;
var theta = [ 0, 70, 0 ];

var thetaLoc;

var flag = false;

var perspectiveMatrix;
var orthoMatrix;
var projectionMatrix;

var vBuffer;
var vPosition;
var cBuffer;
var vColor;

var linePoints;
var linesBuffer;
var lineColors;
var linesColorBuffer;
var lineColorLocation;

var axisPoints
var axisBuffer;
var axisColors;
var axisColorBuffer;
var axisColorLocation;

window.onload = function init()
{
  canvas = document.getElementById( "gl-canvas" );

  gl = WebGLUtils.setupWebGL( canvas );
  if ( !gl ) { alert( "WebGL isn't available" ); }

  colorCube();

  gl.viewport( 0, 0, canvas.width, canvas.height );
  gl.clearColor( 1.0, 1.0, 1.0, 1.0 );

  gl.enable(gl.DEPTH_TEST);

  modelViewMatrix   = lookAt(vec3(2.0, 2.0, 3.0), vec3(0,0,0), vec3(0,1,0));
  perspectiveMatrix = perspective(45, canvas.width/canvas.height, 0.3, 50.0);
  orthoMatrix = ortho(-2.0, 2.0, -2.0, 2.0, -100.0, 100.0);

  //
  //  Load shaders and initialize attribute buffers
  //
  var program = initShaders( gl, "vertex-shader", "fragment-shader" );
  gl.useProgram( program );

  cBuffer = gl.createBuffer();
  gl.bindBuffer( gl.ARRAY_BUFFER, cBuffer );
  gl.bufferData( gl.ARRAY_BUFFER, flatten(colors), gl.STATIC_DRAW );

  vColor = gl.getAttribLocation( program, "vColor" );
  gl.vertexAttribPointer( vColor, 4, gl.FLOAT, false, 0, 0 );
  gl.enableVertexAttribArray( vColor );

  vBuffer = gl.createBuffer();
  gl.bindBuffer( gl.ARRAY_BUFFER, vBuffer );
  gl.bufferData( gl.ARRAY_BUFFER, flatten(points), gl.STATIC_DRAW );

  vPosition = gl.getAttribLocation( program, "vPosition" );
  gl.vertexAttribPointer( vPosition, 4, gl.FLOAT, false, 0, 0 );
  gl.enableVertexAttribArray( vPosition );

  //LINHAS NO CHAO
  linePoints = [vec4(-1.0, -0.5, -100.0, 1.0), vec4(-1.0, -0.5, 100.0, 1.0),
                vec4(1.0, -0.5, -100.0, 1.0),  vec4(1.0, -0.5, 100.0, 1.0)];
  linesBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, linesBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, flatten(linePoints), gl.STATIC_DRAW);

  gl.vertexAttribPointer(vPosition, 4, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(vPosition);

  //Colors
  lineColors = [vec4(0.0, 0.0, 0.0, 1.0), vec4(0.0, 0.0, 0.0, 1.0),
                vec4(0.0, 0.0, 0.0, 1.0), vec4(0.0, 0.0, 0.0, 1.0)];
  linesColorBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, linesColorBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, flatten(lineColors), gl.STATIC_DRAW);

  lineColorLocation = gl.getAttribLocation(program, "vColor");
  gl.vertexAttribPointer(lineColorLocation, 4, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(lineColorLocation);

  //EIXOS DO CUBO
  axisPoints = [vec4(0.0, 0.0, 0.0, 1.0), vec4(1.0, 0.0, 0.0, 1.0),
                vec4(0.0, 0.0, 0.0, 1.0), vec4(0.0, 1.0, 0.0, 1.0),
                vec4(0.0, 0.0, 0.0, 1.0), vec4(0.0, 0.0, 1.0, 1.0)];
  axisBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, axisBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, flatten(axisPoints), gl.STATIC_DRAW);

    //cores de acordo com RGB = XYZ
  axisColors = [vec4(1.0, 0.0, 0.0, 1.0), vec4(1.0, 0.0, 0.0, 1.0),
                vec4(0.0, 1.0, 0.0, 1.0), vec4(0.0, 1.0, 0.0, 1.0),
                vec4(0.0, 0.0, 1.0, 1.0), vec4(0.0, 0.0, 1.0, 1.0)];
  axisColorBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, axisColorBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, flatten(axisColors), gl.STATIC_DRAW);

  axisColorLocation = gl.getAttribLocation(program, "vColor");
  gl.vertexAttribPointer(axisColorLocation, 4, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(axisColorLocation);



  vPositionLocation = gl.getAttribLocation(program, "a_position")
  gl.vertexAttribPointer(vPositionLocation, 4, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(vPositionLocation);

  projectionMatrixLoc  = gl.getUniformLocation(program, "projectionMatrix");
  modelViewMatrixLoc   = gl.getUniformLocation(program, "modelViewMatrix");
  thetaLoc = gl.getUniformLocation(program, "theta");

  gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(modelViewMatrix));

  //event listeners for buttons

  document.getElementById( "xButton" ).onclick = function () {
    axis = xAxis;
  };
  document.getElementById( "yButton" ).onclick = function () {
    axis = yAxis;
  };
  document.getElementById( "zButton" ).onclick = function () {
    axis = zAxis;
  };
  document.getElementById("ButtonT").onclick = function(){
    flag = !flag;
    console.log(document.getElementById("rotation").text)
    if(flag) document.getElementById("rotation").textContent = "On";
    else document.getElementById("rotation").textContent = "Off";
  };
  document.getElementById("isPerspective").onclick = function() {
      isPerspective = (isPerspective ? false : true);
  };

  render();
}

function colorCube()
{
  quad( 1, 0, 3, 2 );
  quad( 2, 3, 7, 6 );
  quad( 3, 0, 4, 7 );
  quad( 6, 5, 1, 2 );
  quad( 4, 5, 6, 7 );
  quad( 5, 4, 0, 1 );
}

function quad(a, b, c, d)
{
  var vertices = [
    [ -0.5, -0.5,  0.5, 1.0 ],
    [ -0.5,  0.5,  0.5, 1.0 ],
    [  0.5,  0.5,  0.5, 1.0 ],
    [  0.5, -0.5,  0.5, 1.0 ],
    [ -0.5, -0.5, -0.5, 1.0 ],
    [ -0.5,  0.5, -0.5, 1.0 ],
    [  0.5,  0.5, -0.5, 1.0 ],
    [  0.5, -0.5, -0.5, 1.0 ]
  ];

  var vertexColors = [
    [ 0.0, 0.0, 0.0, 1.0 ],  // black
    [ 1.0, 0.0, 0.0, 1.0 ],  // red
    [ 1.0, 1.0, 0.0, 1.0 ],  // yellow
    [ 0.0, 1.0, 0.0, 1.0 ],  // green
    [ 0.0, 0.0, 1.0, 1.0 ],  // blue
    [ 1.0, 0.0, 1.0, 1.0 ],  // magenta
    [ 0.0, 1.0, 1.0, 1.0 ],  // cyan
    [ 1.0, 1.0, 1.0, 1.0 ]   // white
  ];

  // We need to parition the quad into two triangles in order for
  // WebGL to be able to render it.  In this case, we create two
  // triangles from the quad indices

  //vertex color assigned by the index of the vertex

  var indices = [ a, b, c, a, c, d ];

  for ( var i = 0; i < indices.length; ++i ) {
    points.push( vertices[indices[i]] );
    //colors.push( vertexColors[indices[i]] );

    // for solid colored faces use
    colors.push(vertexColors[a]);

  }
}

function render()
{
  gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  if(flag) theta[axis] += 2.0;
  gl.uniform3fv(thetaLoc, theta);

  if(isPerspective)
  {
    gl.uniformMatrix4fv(projectionMatrixLoc, false, flatten(perspectiveMatrix));
  }
  else
  {
    gl.uniformMatrix4fv(projectionMatrixLoc, false, flatten(orthoMatrix));
  }

  renderCube();
  renderLines();
  renderAxis();

  requestAnimFrame( render );
}

function renderCube()
{
  gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
  gl.vertexAttribPointer(vPosition, 4, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(vColor);
  gl.bindBuffer(gl.ARRAY_BUFFER, cBuffer);
  gl.vertexAttribPointer(vColor, 4, gl.FLOAT, false, 0, 0);
  gl.drawArrays( gl.TRIANGLES, 0, NumVertices );
}

function renderLines()
{
  gl.bindBuffer(gl.ARRAY_BUFFER, linesBuffer);
  gl.vertexAttribPointer(vPosition, 4, gl.FLOAT, false, 0, 0);

  gl.enableVertexAttribArray(linesColorBuffer);
  gl.bindBuffer(gl.ARRAY_BUFFER, linesColorBuffer);
  gl.vertexAttribPointer(lineColorLocation, 4, gl.FLOAT, false, 0, 0);

  gl.drawArrays( gl.LINES, 0, linePoints.length );
}

function renderAxis()
{
    gl.bindBuffer(gl.ARRAY_BUFFER, axisBuffer);
    gl.vertexAttribPointer(vPositionLocation, 4, gl.FLOAT, false, 0, 0);

    gl.enableVertexAttribArray(axisColorLocation);
    gl.bindBuffer(gl.ARRAY_BUFFER, axisColorBuffer);
    gl.vertexAttribPointer(axisColorLocation, 4, gl.FLOAT, false, 0, 0);

    gl.drawArrays( gl.LINES, 0, axisPoints.length );
}
