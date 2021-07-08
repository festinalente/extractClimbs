module.exports = function placeAndPath(way){
  let t = way.tags();
  if(
    t.highway &&
    t.highway !== 'track' &&
    t.highway !== 'path' &&
    t.highway !== 'footway'){
      return true;
    }
    else{
      return false;
    }
}
