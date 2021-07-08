const fse = require('fs-extra');

exports.getArrayWithAllPathsInDir = function getArrayWithAllPathsInDir(path){
  let promise = new Promise((resolve, reject)=>{
    let fullPaths = [];


      fse.readdir(path, function (err, files) {
        if (err) reject(err);
        if(files && files.length > 0){
          for (let i = 0; i < files.length; i++) {
            fullPaths.push(files);
            if(i === files.length -1){
              resolve(fullPaths);
            }
          }
        }else{
          resolve([]);
        }
      });

  });
  return promise;
}
