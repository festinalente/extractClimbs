/**
  * @param {number} gradient in decimal e.g. 15% is 0.15
  * @param {number} distance in decimal (km) e.g 1000 m is 1
  * @param {number} gradient in decimal where 1 is completely straight. 1.g 1.05 is very straight
  **/
  //0.2, 0.13, 10, 0.5, 1.06,
/*
module.exports = (gradientMax, gradientMin, distanceMax, distanceMin, straightness, allClimbs)=>{
  //let climbFile = require(allClimbs);
  const fs = require('fs');
  let promise = new Promise((resolve, reject)=>{

    fs.readFile(allClimbs, 'utf-8', (err, data) => {
      if (err) throw err;

      let climbFile = JSON.parse(data);
      let keys = Object.keys(climbFile);
      let desiredClimbs = [];


      keys.forEach((key, i)=>{
        climbFile[key].climbs.forEach((climb, j)=>{
          if( climb.gradient <  gradientMax &&
              climb.gradient >  gradientMin &&
              climb.distance < distanceMax &&
              climb.distance > distanceMin &&
              climb.straightness > 1 &&
              climb.straightness < straightness){
            desiredClimbs.push(climb);
          };
          if(i === keys.length-1){
            console.log(climbFile[key]);
            // && (!climbFile[key].climbs || j === climbFile[key].climbs-1)){

            resolve(desiredClimbs);
          }
        });
      });

    });
  });
  return promise;
}*/

module.exports = (gradientMax, gradientMin, distanceMax, distanceMin, straightness, allClimbs)=>{
  //let climbFile = require(allClimbs);
  let promise = new Promise((resolve, reject)=>{

    const {chain}  = require('stream-chain');
    const {parser} = require('stream-json');
    const {pick}   = require('stream-json/filters/Pick');
    const {ignore} = require('stream-json/filters/Ignore');
    const {streamValues} = require('stream-json/streamers/StreamValues');
    const {streamObject} = require('stream-json/streamers/StreamObject');
    const fs   = require('fs');
    const zlib = require('zlib');


    let allResults;
    let desiredClimbs = [];
    let tempClimbs = [];
    const pipeline = chain([
        fs.createReadStream(allClimbs),
        //zlib.createGunzip(),
        parser(),
        //pick({filter: 'climbs'}),
        //ignore({filter: /\b_meta\b/i}),
        streamObject(),


        wayClimbs => {
          let array = wayClimbs.value.climbs;
          for (var i = 0; i < array.length; i++) {
            let climb = array[i];
            if( climb.gradient <  gradientMax &&
              climb.gradient >  gradientMin &&
              climb.distance < distanceMax &&
              climb.distance > distanceMin &&
              climb.straightness > 1 &&
              climb.straightness < straightness){
                tempClimbs.push(climb);
              };
            if(i === array.length -1){
              //console.log(JSON.stringify(tempClimbs));
              return tempClimbs;
            }
          }
        }
    ]);

    pipeline.on('error', error => console.log(error));

    pipeline.on('data', () => {
      tempClimbs.forEach((item, i) => {
        desiredClimbs.push(item);
        if(i=== tempClimbs.length-1){
          tempClimbs.length = 0;
        }
      });

    });
    pipeline.on('end', () => {
      //console.log(JSON.stringify(desiredClimbs));
      resolve(desiredClimbs);
    });

  });
  return promise;
};
