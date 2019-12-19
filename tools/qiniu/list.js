/* eslint-disable no-console */

// @param options 列举操作的可选参数
//                prefix    列举的文件前缀
//                marker    上一次列举返回的位置标记，作为本次列举的起点信息
//                limit     每次返回的最大列举文件数量
//                delimiter 指定目录分隔符
const options = {
  limit: 200
};

module.exports = async function listBucket(bucket, bucketManager) {
  return await new Promise(resolve => {
    // eslint-disable-next-line handle-callback-err
    bucketManager.listPrefixV2(bucket, options, function(
      err,
      respBody,
      respInfo
    ) {
      if (respInfo.status !== 200) {
        throw new Error(
          `list bucket:${bucket} error:\n ${JSON.stringify(respInfo)}`
        );
      }

      var itemStrings = [];

      if (typeof respBody === "string") {
        console.log(`info:桶里有一堆文件将会返回string，用\\n分隔`);
        itemStrings = respBody.trim().split(`\n`);
      } else if (typeof respBody === "object" && respBody) {
        console.log(`info:桶里只有一个文件将会返回一个对象`);
        itemStrings.push(respBody);
      }

      const items = [];
      /**
       * items对应也分为两种情况：
       * 情况1：多文件
       * 情况2：单一文件
       * 情况3：无文件
       * 区别在于，多文件使用JSON.parse，单一文件使用Object.assign，无文件不操作
       */
      if (itemStrings.length > 1) {
        for (const str of itemStrings) {
          try {
            const item = JSON.parse(str);
            items.push(item);
          } catch (err) {
            console.log(
              `warning: ${JSON.stringify(str)} parse json error:\n ${err}`
            );
            continue;
          }
        }
      } else if (itemStrings.length === 1) {
        items.push(itemStrings[0]);
      } else {
        console.log(`info: no file in bucket`);
        resolve([]);
      }

      const keysInBucket = items.map(i => i.item.key);

      resolve(keysInBucket);
    });
  });
};
