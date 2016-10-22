/**
 * @fileoverview This is an implementation of the Diamond Square Algorithm 
 * It has functions to initialise the terrain, work through setting up the color buffer and teh normal vectors
 * the shader and the heightmap as a whole
 * @author Simran Patil sppatil2
 **/

//------------------------------------------------------------------------------
/**
* ArraySize(n)
* @define Initializes a height map data structure of size 2^n + 1 by 2^n + 1
* @params : n - factor to work with teh size of the grid, passed as gridN
* @ return none
**/
function Terrain(n) {
  this.size = Math.pow(2,n) + 1;
  this.max = this.size - 1; // max of x and y as zero indexed
  this.heightMap = new Float32Array(this.size * this.size);
}

/**
* getHeight
* @define : Returns height value stored at a particular coordinate
* The map data is stored in a row major order hence is accessed as y * size + x
* @params : x - The x coordinate of the vertex
* @params : y - the y coordinate of the vertex
* @ return -1 on failure
**/
Terrain.prototype.getHeight = function ( x, y ) {
  if(x < 0 || x > this.max || y < 0 || y > this.max )
    return -1;
  return this.heightMap[ y * this.size + x ];
};

/*
* setHeight
* @define : Initializes the map with the height values as per the algorithm
* @params : x - The x coordinate of the vertex
* @params : y - the y coordinate of the vertex
* @params : val - the height to be set
* The map data is stored in a row major order hence is accessed as y * size + x
* @ return -1 on failure
*/
Terrain.prototype.setHeight = function ( x, y, val ) {
  if(x < 0 || x > this.max || y < 0 || y > this.max )
    return -1;
  this.heightMap[ y * this.size + x ] = val;
};

/**
* render
* @define : Renders the terrain 
* Initialize the corner vertices toa specific value to begin with the algorithm
* This function calls division for actual implementation of the algorithm
* @params : factor is the roughness of the terrain
* @return : none
**/
Terrain.prototype.render = function( factor ) {

  /* Initialize the four corners to some height (here 10) */
  this.setHeight(0, 0, 0);
  this.setHeight(0, this.max, -2);
  this.setHeight(this.max, 0, 0);
  this.setHeight(this.max, this.max, 2);
  // Division actually executes the algorithm
  division( factor, this.max, this.max, this );
};

/**
* division
* @define : It applies the Diamond Square algorithm 
* Factor is a value between 0 and 1 indicating 0 for smooth to 1 for extremely rough
* @params : factor is the roughness of the terrain
* @params : size is the grid size
* @params : max is size-1
* @params : object is this object itself
* @ return none
**/
function division( factor, size, max, obj ){
  var x , y, mid = size /2;
  var scale = factor * size;
  if(mid < 1)
    return;
  for( y = mid; y < max; y += size ){
    for ( x = mid; x < max; x += size){
      InSquare(x, y, mid,  Math.random() *2* scale - scale , obj);
    }
  }
  for( y = 0; y < max; y += mid ){
    for ( x = (y + mid) % size ; x < max; x += mid ){
      InDiamond(x, y, mid, Math.random() *2*scale - scale , obj );
    }
  }
  // This is the recursive call to the function
  division( factor, size/2, max, obj);
}

/**
  * average
  * @define : Calculates the average across teh input array 
  * There are only two possible cases - length of 3 if vertex or 4 otherwise
  * @params : array - pass an array to average to get the value
  * @ return average
**/
function average (values) {
  if(values.length == 0)
    return -1;
  var sum = 0;
  var i = 0;
  for( i = 0; i < values.length; i ++ ){
    sum += values[i];
  }
  return sum / values.length;
}

/**
  * InSquare
  * @define : It divides the area into squares to work from
  * For each square in the array,
  * midpoint height = avg four corner points + random value 
  * @params : x - the x coordinate
  * @params : y - the y coordinate
  * @params : size - size of the grid
  * @params : random_value-a random value is passes
  * @params : obj is this
  * @ return none
**/
function InSquare( x, y, size, random_val , obj ) {
  var array = [];
  var val;
  val = obj.getHeight( x - size, y - size );
  if( val !== -1 )
    array.push(val);
  val = obj.getHeight ( x + size , y + size );
  if( val !== -1 )
    array.push(val);
  val = obj.getHeight( x + size, y - size );
  if( val !== -1 )
    array.push(val);
  val = obj.getHeight ( x - size , y + size );
  if( val !== -1 )
    array.push(val);

  var avg = average(array);
 
  obj.setHeight( x, y, avg + random_val);
}

/**
  * InSquare
  * @define : It divides the area into squares to work from
  * For each diamond in the array
  * midpoint height = avg four corner points + random value
  * @params : x - the x coordinate
  * @params : y - the y coordinate
  * @params : size - size of the grid
  * @params : random_value-a random value is passes
  * @params : obj is this
  * @ return none
**/
function InDiamond( x, y, size, random_val , obj ) {
  var array = [];
  var val;
  val = obj.getHeight( x , y - size );
  if( val !== -1 )
    array.push(val);
  val = obj.getHeight ( x + size , y  );
  if( val !== -1 )
    array.push(val);
  val = obj.getHeight( x , y + size );
  if( val !== -1 )
    array.push(val);
  val = obj.getHeight ( x - size , y );
  if( val !== -1 )
    array.push(val);

  var avg = average(array);
  obj.setHeight( x, y, avg + random_val);
}

/**
  * terrainFromIteration
  * @define : Build the buffers 
  * This also creates faces and averaged normals 
  * we average out the normals and apply it to a vertex to get the vertx normal
  * @params : n - The grid size initialiser
  * @params : minX : min x value
  * @params : maxX : max x value
  * @params : minY: min y value 
  * @params : maxY: max y value
  * @params : vertexArray - to be built
  * @params : faceArray - maintains the indices of the verties in teh vertex array
  * @params : normalArray - Avereages value of the normals per vertex
  * @params : heightMap - keeps a track of the z values for all teh coordinates
  * @params : colors - The buffer for maintaining the colors of the buffers
  * @ return numof triangles
**/
function terrainFromIteration(n, minX,maxX,minY,maxY, vertexArray, faceArray,normalArray, heightMap, colors)
{
    var edge = Math.pow(2,n)+1;
    var deltaX=(maxX-minX)/n;
    var deltaY=(maxY-minY)/n;
    for(var i=0;i<=edge;i++)
       for(var j=0;j<=edge;j++)
       { 
           // This builds the vertex buffer
           vertexArray.push(minX+deltaX*j);
           vertexArray.push(minY+deltaY*i);
           vertexArray.push(heightMap[j + i*edge]);
          
           // This inputs colors to the color buffer based on the height ranges
           if(heightMap[j + i*edge] > 1.2){
            colors.push(1.0);
            colors.push(1.0);
            colors.push(1.0);
            colors.push(0.4);
           }
           else if(heightMap[j + i*edge] > 0.4 && heightMap[j + i*edge] <= 1.2){
            colors.push(0.64);
            colors.push(0.4);
            colors.push(0.30);
            colors.push(0.9);
           }
           else if(heightMap[j + i*edge] > -0.2 && heightMap[j + i*edge] <= 0.4){
            colors.push(0.21);
            colors.push(0.65);
            colors.push(0.38);
            colors.push(1.0);
           }
           else{
            colors.push(0.02);
            colors.push(0.14);
            colors.push(0.36);
            colors.push(1.0);
           }
            // Initialise the normalarray buffer to all zeros
            normalArray.push(0);
            normalArray.push(0);
            normalArray.push(0);
       }

    // this creates the faces
    var numT=0;
    for(var i=0;i<edge;i++)
       for(var j=0;j<edge;j++)
       {
           var vid = i*(edge+1) + j;
           faceArray.push(vid);
           faceArray.push(vid+1);
           faceArray.push(vid+edge+1);
           
           faceArray.push(vid+1);
           faceArray.push(vid+1+edge+1);
           faceArray.push(vid+edge+1);
           numT+=2;
       }

    var numTris=faceArray.length/3;
    for(var f=0;f<numTris;f++)
    {
        var fid=f*3;
        
        var index1 = faceArray[fid];
        index1 = index1 * 3;
        var vertex1 = vec3.fromValues(vertexArray[index1], vertexArray[index1+1], vertexArray[index1+2]);
        index1 = faceArray[fid + 1];
        index1 = index1 * 3;
        var vertex2 = vec3.fromValues(vertexArray[index1], vertexArray[index1+1], vertexArray[index1+2]);
        index1 = faceArray[fid + 2];
        index1 = index1 * 3;
        var vertex3 = vec3.fromValues(vertexArray[index1], vertexArray[index1+1], vertexArray[index1+2]);
        var norm = normalForFace( vertex1, vertex2, vertex3);
        vec3.normalize(norm, norm);
       
        // This is used to update the normalArray with teh averaged values
        index1 = faceArray[fid];
        normalArray[index1*3] += norm[0];
        normalArray[index1*3 + 1] += norm[1];
        normalArray[index1*3 + 2*3] += norm[2];

        index1= faceArray[fid + 1];
        normalArray[index1*3] += norm[0];
        normalArray[index1*3 + 1] += norm[1];
        normalArray[index1*3 + 2] += norm[2];

        index1 = faceArray[fid + 2];
        normalArray[index1*3] += norm[0];
        normalArray[index1*3 + 1] += norm[1];
        normalArray[index1*3 + 2] += norm[2];
    }
    
    return numT;
}
//-------------------------------------------------------------------------------------
function generateLinesFromIndexedTriangles(faceArray,lineArray)
{
    numTris=faceArray.length/3;
    for(var f=0;f<numTris;f++)
    {
        var fid=f*3;
        lineArray.push(faceArray[fid]);
        lineArray.push(faceArray[fid+1]);
        
        lineArray.push(faceArray[fid+1]);
        lineArray.push(faceArray[fid+2]);
        
        lineArray.push(faceArray[fid+2]);
        lineArray.push(faceArray[fid]);
    }
}

/**
  * normalForFace
  * @define : Calculates the normal for the face
  * @params : n - The grid size initialiser
  * @params : vertex1 - The vector to vertex 1
  * @params : vertex2 - The vector to vertex 2
  * @params : vertex3 - The vector to vertex 3
  * @ return num of triangles
**/
function normalForFace( vertex1, vertex2, vertex3){
  var edge1 = vec3.create();
  var edge2 = vec3.create();
  var norm = vec3.create();
  vec3.subtract(edge1, vertex1, vertex2);
  vec3.subtract(edge2, vertex3, vertex2);
  vec3.cross(norm, edge2, edge1);
  return norm;
}
