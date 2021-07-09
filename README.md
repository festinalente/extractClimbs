# climbFinder

node --max-old-space-size=4000 newProcess.js --cache-dir data ../data_by_country/Portugal/portugal-latest.osm.pbf ../data_by_country/Portugal/climbs/test.json

> let write = require('./project_modules/main.js');

> write.getSquares('./data_by_country/Portugal/portugal-latest.osm.pbf').then((sq)=>{
    write.splitMap(sq, './data_by_country/Portugal/portugal-latest.osm.pbf');
  });
