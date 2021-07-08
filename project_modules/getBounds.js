function getBounds(map){
  let promise = new Promise((resolve, reject)=>{
    let osmium = require('osmium'),
        reader = new osmium.BasicReader(map),
        header = reader.header(),
        bounds = header.bounds[0],
        min_lon = Math.floor(bounds.left()),
        max_lon = Math.ceil(bounds.right()),
        min_lat = Math.floor(bounds.bottom()),
        max_lat = Math.ceil(bounds.top());
        
    reader.close();
    resolve([min_lon, max_lon, min_lat, max_lat]);
  });
  return promise;
}

module.exports = getBounds;
