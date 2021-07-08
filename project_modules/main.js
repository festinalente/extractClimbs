const toolKit = {},
      fs = require('fs-extra');
      climbFinder = require('./newProcessInApp');
      splitSquare = require('./splitSquare');
      getBounds = require('./getBounds');
      splitMap = require('./splitMap');

      toolKit.getBounds = async(pbf) =>  {
        try {
          let bounds = await getBounds(pbf);
          return bounds
        } catch (e) {
          console.log('An Error occured fetching bounds: ' + e);
        }
      }

      toolKit.allInFolder = (parentFolder) => {
        //let promise = new Promise((resolve, reject)=>{
          let allFiles = fs.readdir(parentFolder).then((hgts)=>{
            console.log(hgts);
            readFiles(hgts);
            async function readFiles(hgts) {
              for(const file of hgts) {
                console.log(file);
                await climbFinder('cache', `${parentFolder}/${file}`, 'finalclimbs');
              }
            };
          });
        //});
        //return promise;
      };

      toolKit.SpecificTile = (tile) => {
        //no trailing dir -/
        climbFinder('cache', tile, 'finalclimbs');
      };

      /**
        * Spits latlng squre into smaller squares;
        * Return an array of smaller squares.
        **/
      toolKit.getSquares = getSquares;

      function getSquares(pbf, subdivision_size){
        let promise = new Promise((resolve, reject)=>{
          (async ()=>{try {
            let min_lon, max_lon, min_lat, max_lat;
            //subdivision size defaults to 1 degree
            let sub = (subdivision_size) ? subdivision_size : 1;
            [min_lon, max_lon, min_lat, max_lat] =  await getBounds(pbf);
            let squares = await splitSquare(min_lon, max_lon, min_lat, max_lat, sub);
            resolve(squares);
            } catch (e) {
              console.log('An Error occured making squares: ' + e);
            }
          })();

        });
        return promise;
      }


      toolKit.splitMap = splitMap;
      //bounds array === getSquares
      function splitMap(parentfile, boundsArray, outputDirectory){
        let promise = new Promise((resolve, reject)=>{
          (async ()=>{
            try {
              let bounds = (boundsArray) ? boundsArray : await getSquares(parentfile);
              let out = (outputDirectory) ? outputDirectory : 'oneByOneMaps';
              console.warn('Not able to pass directory name to splitMap... Bug');
              let split = await splitMap(boundsArray, parentfile, out);
              console.log('map split');
            } catch (e) {
              console.log('An Error occured splitting map: ' + e);
            }
          })()
        });
        return promise;
      }

module.exports = toolKit;
