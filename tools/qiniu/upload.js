/* eslint-disable no-console */
const qiniu = require("qiniu");
var path = require("path");

module.exports = async function upload2Bucket(keys, bucket, mac, root) {
  for (const key of keys) {
    var options = {
      scope: bucket + ":" + key
    };
    var putPolicy = new qiniu.rs.PutPolicy(options);
    var uploadToken = putPolicy.uploadToken(mac);
    var config = new qiniu.conf.Config();

    var localFile = path.resolve(`${root}/${key}`);
    var formUploader = new qiniu.form_up.FormUploader(config);
    var putExtra = new qiniu.form_up.PutExtra();

    let count = 0;
    let success = false;
    while (!success && count < 5) {
      await new Promise(resolve => {
        formUploader.putFile(uploadToken, key, localFile, putExtra, function(
          respErr,
          respBody,
          respInfo
        ) {
          if (respErr) {
            console.error(respErr);
            count += 1;
            resolve();
          }

          console.log({
            key,
            status: respInfo.statusCode,
            code: 10012
          });
          success = true;
          resolve();
        });
      });
    }
    if (success) console.log(`200. ${key} uploaded`);
    else throw new Error(`file upload failed, key: `, key);
  }
  // await new Promise(resolve => {
  //   for (const key of keys) {
  //     var options = {
  //       scope: bucket + ":" + key
  //     };
  //     var putPolicy = new qiniu.rs.PutPolicy(options);

  //     var uploadToken = putPolicy.uploadToken(mac);
  //     var config = new qiniu.conf.Config();
  //     var localFile = path.resolve(`${root}/${key}`);

  //     var formUploader = new qiniu.form_up.FormUploader(config);
  //     var putExtra = new qiniu.form_up.PutExtra();

  //     formUploader.putFile(uploadToken, key, localFile, putExtra, function(
  //       respErr,
  //       respBody,
  //       respInfo
  //     ) {
  //       if (respErr) {
  //         throw respErr;
  //       }

  //       if (respInfo.statusCode === 200) {
  //         console.log(respInfo.statusCode, respBody);
  //       } else {
  //         console.log(respInfo.statusCode, respBody);
  //       }
  //     });
  //   }
  //   setTimeout(() => {
  //     resolve();
  //   }, 15000);
  // });
};
