/* eslint-disable no-console */

module.exports = async function refreshCDN(
  cdnManager,
  urlsToRefresh,
  dirsToRefresh
) {
  // 刷新链接
  await new Promise(resolve => {
    // 一起刷新
    cdnManager.refreshUrlsAndDirs(urlsToRefresh, dirsToRefresh, function(
      err,
      respBody,
      respInfo
    ) {
      if (err) {
        throw err;
      }
      if (respInfo.statusCode === 200) {
        const jsonBody = JSON.parse(respBody);
        console.log(
          `info: code:${jsonBody.code} UrlSurplusDay:${jsonBody.urlSurplusDay} DirSurplusDay:${jsonBody.dirSurplusDay}`
        );
        resolve();
      } else {
        throw new Error("error in statusCode not 200 in refreshCDN");
      }
    });
  });
};

// //刷新url
//   cdnManager.refreshUrls(urlsToRefresh, function(err, respBody, respInfo) {
//     if (err) {
//       throw err;
//     }
//     console.log(respInfo.statusCode);
//     if (respInfo.statusCode == 200) {
//       const jsonBody = JSON.parse(respBody);
//       console.log(jsonBody.code);
//       console.log(jsonBody.error);
//       console.log(jsonBody.requestId);
//       console.log(jsonBody.invalidUrls);
//       console.log(jsonBody.invalidDirs);
//       console.log(jsonBody.urlQuotaDay);
//       console.log(jsonBody.urlSurplusDay);
//       console.log(jsonBody.dirQuotaDay);
//       console.log(jsonBody.dirSurplusDay);
//     }
//   });
// //刷新目录，刷新目录需要联系七牛技术支持开通权限
// cdnManager.refreshDirs(dirsToRefresh, function(err, respBody, respInfo) {
//   if (err) {
//     throw err;
//   }

//   console.log(respInfo.statusCode);
//   if (respInfo.statusCode == 200) {
//     const jsonBody = JSON.parse(respBody);
//     console.log(jsonBody.code);
//     console.log(jsonBody.error);
//     console.log(jsonBody.requestId);
//     console.log(jsonBody.invalidUrls);
//     console.log(jsonBody.invalidDirs);
//     console.log(jsonBody.urlQuotaDay);
//     console.log(jsonBody.urlSurplusDay);
//     console.log(jsonBody.dirQuotaDay);
//     console.log(jsonBody.dirSurplusDay);
//   }
// });
