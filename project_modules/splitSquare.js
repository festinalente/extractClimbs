module.exports = (min_lon, max_lon, min_lat, max_lat, side_size)=>{
  let promise = new Promise((resolve, reject)=>{
    let ys = [];
    let xs = [];
    let squares = []

    ys.push(min_lat);
    if(min_lat + side_size < max_lat){
      while (min_lat < max_lat){
        min_lat += side_size;
        ys.push(min_lat);
      }
    }else{
      ys.push(max_lat)
    }

    xs.push(min_lon);
    if(min_lon + side_size < max_lon){
      while (min_lon < max_lon){
        min_lon += side_size;
        xs.push(min_lon);
      }
    }else{
      xs.push(max_lon)
      resolve({sw: [ys[0], xs[0]], ne: [ys[1], xs[1]]});
    }

    //{sw: [40,-10], ne: [43, -6]}
    for (let i = 0; i < ys.length; i++) {
      for (let j = 0; j < xs.length; j++) {
        if(xs[j+1] && ys[i+1]){
          squares.push({sw: [ys[i], xs[j]], ne: [ys[i+1], xs[j+1]]});
        }
        if(i === ys.length-1 && j === xs.length-1){
          resolve(squares);
        }
      }
    }
  });
  return promise;
}
