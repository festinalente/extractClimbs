module.exports = (boundsArray, parentfile, outputDirectory)=>{
  console.log(parentfile);
  console.log(outputDirectory);
  const fs = require('fs-extra');

  let promise = new Promise((resolve, reject)=>{

    console.log(`spliting ${boundsArray.length}`);
    let promises = [];
    if(boundsArray.length <=1){
      reject('No bounds in bounds array');
    }
    else{
      let i = 0;
      splitSection(boundsArray[i], it);
      function it(){
        i++;
        if(i < boundsArray.length){
          splitSection(boundsArray[i], it);
        }
        if(i === boundsArray.length){
          resolve('Map split');
        }
      };

    }
  });
  return promise;

  async function splitSection(bounds, cb){
    console.log(`splitting ${bounds}`);
    let n = bounds.sw[0].toString().replace('-', '0');
    let w = bounds.sw[1].toString().replace('-', '0');
    const { spawn } = require('child_process');
    const exists = await fs.pathExists(parentfile);
    console.warn('merge if duplicate (e.g. border regions).')
    if(exists){
      const ensure = await fs.ensureDir(`oneXoneMaps`);
      const process = spawn('osmium', [
        'extract',
        '-b', `${bounds.sw[1]},${bounds.sw[0]},${bounds.ne[1]},${bounds.ne[0]}`,
        parentfile,
        '-o', `oneXoneMaps/N${n}W${w}.pbf`,
        '--overwrite'
      ]);
      process.on('exit', (code) => {
        if(code === 0){
          console.log(`Map split successfully ${code}`);
        }
        cb();
      });
    }
  }
}
