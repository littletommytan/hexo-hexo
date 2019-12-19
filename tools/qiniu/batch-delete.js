/* eslint-disable no-console */
const qiniu = require("qiniu");

module.exports = async function batchDelete(bucket, bucketManager, keys) {
  if (keys.length < 1) return;
  // 每个operations的数量不可以超过1000个，如果总数量超过1000，需要分批发送
  //   var deleteOperations = [
  //     qiniu.rs.deleteOp(srcBucket, "qiniu1.mp4"),
  //     qiniu.rs.deleteOp(srcBucket, "qiniu2.mp4"),
  //     qiniu.rs.deleteOp(srcBucket, "qiniu3.mp4"),
  //     qiniu.rs.deleteOp(srcBucket, "qiniu4x.mp4")
  //   ];
  const deleteOperations = keys.map(key => qiniu.rs.deleteOp(bucket, key));

  return await new Promise(resolve => {
    bucketManager.batch(deleteOperations, function(err, respBody, respInfo) {
      if (err) {
        console.log(err);
        throw err;
      } else {
        // 200 is success, 298 is part success
        if (parseInt(respInfo.statusCode / 100) === 2) {
          respBody.forEach(function(item) {
            if (item.code === 200) {
              // console.log(item.code + "\tsuccess");
            } else {
              console.log(item.code + "\t" + item.data.error);
            }
          });
          resolve();
        } else {
          console.log(respInfo.deleteusCode);
          console.log(respBody);
        }
      }
    });
  });
};
