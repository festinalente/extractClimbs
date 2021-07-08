module.exports = (cacheDir, tileset, destinationDir)=>{
  let promise = new Promise((resolve, reject)=>{

    const argv = [cacheDir, tileset, destinationDir],
          fs = require('fs-extra'),
          path = require('path'),
          async = require('async'),
          osmium = require('osmium'),
          haversine = require('./haversine'),
          status = require('node-status'),
          createWayInfo = require('./createWayInfo2'),
          filter = require('./wayFilter'),
          wayinfoMap = {};

          fs.ensureDir(cacheDir);
          fs.ensureDir(destinationDir);

    const TileSet = require('node-hgt').TileSet,
          tileSet = new TileSet(argv[0] || './data/'),

          console = status.console();

    const name = (()=>{
      const reader = new osmium.BasicReader(argv[1]),
            header = reader.header(),
            bounds = header.bounds[0],
            min_lon = (bounds) ? Math.floor(bounds.left()).toString().replace('-', '0') : null,
            max_lon = (bounds) ? Math.ceil(bounds.right()).toString().replace('-', '0') : null,
            min_lat = (bounds) ? Math.floor(bounds.bottom()).toString().replace('-', '0') : null,
            max_lat = (bounds) ? Math.ceil(bounds.top()).toString().replace('-', '0') : null;
        reader.close();
        return `N${min_lat}W${min_lon}.json`;
      })();
    console.log(`new name: ${name}`);

      if (argv.length < 2) {
          console.log('Missing arguments.');
          console.log('Expected arguments:');
          console.log(argv[0], argv[1], '[--cache_dir=CACHE_DIR] [OSM FILE] [DEST FILE]');
          process.exit(1);
      }

      let fillNodeElevations = function (coords, cb) {
          let wait = coords.length;
          coords.forEach(function(c) {
              tileSet.getElevation(c, function(err, elevation) {
                  if (!err) {
                      c.elevation = elevation;
                      wait--;
                  } else {
                      cb(err);
                      return;
                  }

                  if (wait === 0) {
                      cb(null, coords);
                  }
              });
          });
      };

      let countWays = function (cb) {
          let file = new osmium.File(argv[1]),
              reader = new osmium.Reader(file, { way: true }),
              handler = new osmium.Handler(),
              count = 0;

          handler.on('way', function (way) {
              if (filter(way)) {
                  count++;
                  countWaysJob.inc();
              }
          });

          function next () {
              let buffer = reader.read();
              if (buffer) {
                  osmium.apply(buffer, handler);
                  setImmediate(next);
              } else {
                  cb(count);
              }
          }

          next();
      }

      /**Way appearance:
        Way {
          nodes_count: 23,
          type: 'way',
          user: '',
          uid: 0,
          timestamp_seconds_since_epoch: 1459865385,
          visible: true,
          changeset: 0,
          version: 5,
          id: 115173591 }
      **/

      let wayHandler = function(tasks, way) {
          let wayId, coords, nodeCount, firstNode, lastNode;
          if (filter(way)) {
              try {
                  wayId = way.id,
                  coords = way.node_coordinates().map(function(c) { return { lat: c.lat, lng: c.lon }; });
                  nodeCount = way.nodes_count,
                  //nodes are an array, the argument is the array index:
                  firstNode = way.node_refs(0),
                  lastNode = way.node_refs(nodeCount-1);
              } catch (e) {
                  console.warn('Error for way', way.id, ': ' + e.message);
                  return;
              }
              tasks.push(function(cb) {
                  processWaysJob.inc();
                  async.waterfall([
                      fillNodeElevations.bind(this, coords),
                      createWayInfo], function(err, wayInfo) {
                          if (err) {
                              return cb(err);
                          }
                          wayinfoMap[wayId] = wayInfo;
                          cb(undefined, wayInfo);
                      });
              });
          }
      };

      let countWaysJob = status.addItem('count'),
          processWaysJob;

      status.start({
          pattern: 'Ways: {count.default.green} | ' +
              'Processed: {process.bar.cyan} {process.percentage.green} | ' +
              '{uptime.yellow} {spinner.cyan}',
          precision: 0
      });

      countWays(function (numberWays) {
          processWaysJob = status.addItem('process', {
              max: numberWays
          });

          let file = new osmium.File(argv[1]),
              reader = new osmium.Reader(file, { node: true, way: true }),
              locationHandler = new osmium.LocationHandler(),
              handler = new osmium.Handler(),
              tasks = [];

          handler.on('way', wayHandler.bind(this, tasks));

          function next() {
              tasks.length = 0;
              let buffer = reader.read();

              if (buffer) {
                  osmium.apply(buffer, locationHandler, handler);
                  async.parallelLimit(tasks, 4, function(err) {
                      if (!err) {
                          setImmediate(function () { next(); });
                      } else {
                          console.error(err);
                          return process.exit(1);
                      }
                  });
              } else {
                  let p = path.join(path.resolve('./') +'/'+ argv[2] + '/' + name);
                  console.log(`writing to ${p}`);
                  fs.writeFileSync(p, JSON.stringify(wayinfoMap));
                  process.exit(0);
                  resolve(`Done writing ${name}`);
              }
          }

          next();
      });
  });
  return promise;
}
