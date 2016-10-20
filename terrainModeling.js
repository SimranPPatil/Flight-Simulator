/* This is an implementation of the Diamond Square Algorithm */

/*
ArraySize(n)
DESCRIPTION : Initializes a height map data structure of size 2^n + 1 by 2^n + 1
INPUTS : n
*/
function Terrain(n) {
  this.size = Math.pow(2,n) + 1;
  this.max = this.size - 1; // max of x and y as zero indexed
  this.heightMap = new Float32Array(this.size * this.size);
}

/*
getHeight
DESCRIPTION : Returns height value stored at a particular coordinate
INPUTS : x , y
The map data is stored in a row major order hence is accessed as y * size + x
*/
Terrain.prototype.getHeight = function ( x, y ) {
  if(x < 0 || x > this.max || y < 0 || y > this.max )
    return -1;
  return this.heightMap[ y * this.size + x ];
};

/*
setHeight
DESCRIPTION : Initializes the map with the height values as per the algorithm
INPUTS : x , y, val - the height to be set
The map data is stored in a row major order hence is accessed as y * size + x
*/
Terrain.prototype.setHeight = function ( x, y, val ) {
  if(x < 0 || x > this.max || y < 0 || y > this.max )
    return -1;
  this.heightMap[ y * this.size + x ] = val;
};

Terrain.prototype.render = function( factor ) {

  /* Initialize the four corners to some height (here 10) */
  this.setHeight(0, 0, 2);
  this.setHeight(0, this.max, 4);
  this.setHeight(this.max, 0, 3);
  this.setHeight(this.max, this.max, 2);
  
  division( factor, this.max, this.max, this );
};

// factor is a value between 0 and 1 indicating 0 for smooth to 1 for extremely rough
function division( factor, size, max, obj ){
  var x , y, mid = size / 2;
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
  division( factor, size/2, max, obj);
}


/* 
pass an array to average to get the value :
There are only two possible cases - length of 3 if vertex or 4 otherwise
*/
function average (values) {
  if( values.length < 3 || values.length > 4)
    return -1;
  var sum = 0;
  var i = 0;
  for( i = 0; i < values.length; i ++ ){
    sum += values[i];
  }
  return sum / values.length;
}


/* For each square in the array,
midpoint height = avg four corner points + random value 
*/
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

/*For each diamond in the array
midpoint height = avg four corner points + random value
*/
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



//-------------------------------------------------------------------------
function terrainFromIteration(n, minX,maxX,minY,maxY, vertexArray, faceArray,normalArray, heightMap, colors)
{
    var edge = Math.pow(2,n) + 1;
    var deltaX=(maxX-minX)/n;
    var deltaY=(maxY-minY)/n;
    for(var i=0;i<=edge;i++)
       for(var j=0;j<=edge;j++)
       {
           vertexArray.push(minX+deltaX*j);
           vertexArray.push(minY+deltaY*i);
           vertexArray.push(heightMap[j + i*edge]);

           if(heightMap[j + i*edge] > 1.5){
            colors.push(1.0);
            colors.push(1.0);
            colors.push(1.0);
            colors.push(1.0);
           }
           else if(heightMap[j + i*edge] > 0 && heightMap[j + i*edge] <= 1.5){
            colors.push(0.22);
            colors.push(0.0);
            colors.push(0.0);
            colors.push(1.0);
           }
           else{
            colors.push(0.0);
            colors.push(0.0);
            colors.push(0.33);
            colors.push(1.0);
           }
           
           normalArray.push(0);
           normalArray.push(0);
           normalArray.push(1);
       }
     
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
    console.log(heightMap);
    console.log(colors);
    return numT;
}
//-------------------------------------------------------------------------
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

//-------------------------------------------------------------------------


