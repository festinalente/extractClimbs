
/** INFO example:
[ { lat: 42.5435626,
    lng: 1.7358053,
    elevation: 2088.1658249631887 },
  { lat: 42.5435656,
    lng: 1.7357555,
    elevation: 2088.3031275519925 },
  { lat: 42.543523, lng: 1.7356935, elevation: 2088.872008719996 },
  { lat: 42.5434743,
    lng: 1.7355969,
    elevation: 2089.6190459248023 },
  { lat: 42.5434694,
    lng: 1.7355811,
    elevation: 2089.7156584096056 } ]
**/

const createWayInfo = function (info, cb) {
  const haversine = require('./haversine');

  let data = {
      climbs: [{ascent: 0, distance: 0, crow: 0, gradient: 0, straightness: 0, points: []}],
  };

  function extractClimbs(info){
    let promise = new Promise((resolve, reject)=>{
      for (let i = 1; i < info.length; i++) {
        let currentPoint = info[i-1],
            nextPoint = info[i],
            lastPoint = info[info.length -1],
            uphill = (currentPoint.elevation < nextPoint.elevation) ? true : false,
            lastTwoPointsAscent = nextPoint.elevation - currentPoint.elevation;

        if(uphill){
          if(data.climbs[data.climbs.length-2] && data.climbs[data.climbs.length-2].distance === 0){
            data.climbs.splice(data.climbs.length-2, 1);
          }
          let currentClimb = data.climbs[data.climbs.length-1];
              currentClimb.distance += haversine(currentPoint, nextPoint);
              currentClimb.ascent += nextPoint.elevation - currentPoint.elevation;
              currentClimb.points.push(currentPoint);

          let crowFlies = haversine(currentClimb.points[0], currentClimb.points[currentClimb.points.length-1]);
              currentClimb.crow = crowFlies;
              currentClimb.gradient = currentClimb.ascent / (currentClimb.distance * 1000);
              currentClimb.straightness = currentClimb.distance / crowFlies;
              currentClimb.points.push(nextPoint);
          /*
          if(i === info.length-1){

            resolve();
          }*/
        }else{
          data.climbs.push({ascent: 0, distance: 0, crow: 0, gradient: 0, straightness: 0, points: []})
        }


        if(i === info.length-1){
          resolve();
        }




      }
    });
    return promise;
  }

  (async()=>{
    let norm = await extractClimbs(info);
    //let reverse = await extractClimbs(info.reverse());
    if(data && Object.keys(data).length === 0 && data.constructor === Object){
      cb(null, null);
    }

    if(data && data.climbs){
      cb(null, data);
    }
  })();

};

module.exports = createWayInfo;
