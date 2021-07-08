let fs = require('fs-extra');
let paths = swiftMod('syncFolder').getArrayWithAllPathsInDir;
let loopClimbs = swiftMod('loopclimbs');

module.exports = function(app) {
  app.get('/*', function (req, res, next) {
    if (req.url.indexOf("/images/") === 0 || req.url.indexOf("/css/") === 0 || req.url.indexOf("/js/") === 0) {
        res.setHeader("Cache-Control", "public, max-age=2628000");
    }
    next();
  });

  app.get('/', (req, res, next)=>{
    res.render('master.pug')
  });

  app.post('/climbs', (req, res, next)=>{
    //gradientMax, gradientMin, distanceMax, distanceMin, straightness, allClimbs
    (async ()=>{
      let climbs = await loopClimbs(req.body.maxgradient,req.body.mingradient,req.body.maxdistance,
        req.body.mindistance,req.body.straightness,'data_by_country/Portugal/climbs/test.json');
        console.log('poo');
        res.send(climbs);

    })();
  });


  app.get('/gridlines', (req, res, next)=>{
    let path = './oneXoneMaps';
    fs.readdir(path, function (err, files) {
      files.forEach((filename, i)=>{
        files[i] = filename.match(/([0-9])+/g);
        if(i === files.length-1){
          sortLines(files);
          //res.send(files);
        }
      });

      function addMinus(num){
        if(typeof num !== 'string'){
          num = num.toString();
        }
        if(num[0] === '0'){
          num = num.replace('0', '-');
          console.log(num);
        }
        return parseInt(num);
      }

      function sortLines(files){
        let sorted = [];
        let bottomleft, bottomright, topleft, topright, square;
        files.forEach((item, i) => {
          if(parseInt(item)){
            bottomleft = [addMinus(item[0]), addMinus(item[1])];
            topleft = [(addMinus(item[0]) +1 ), addMinus(item[1])];
            topright = [(addMinus(item[0]) +1 ), (addMinus(item[1]) +1 )];
            bottomright = [addMinus(item[0]), (addMinus(item[1]) +1 )];
            square = [bottomleft, topleft, topright, bottomright, bottomleft];
            sorted.push(square);
          }
          if(i === files.length-1){
            console.log(sorted);
            res.send(sorted);
          }
        });

      }
    });
  });
}
