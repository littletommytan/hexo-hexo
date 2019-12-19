/* eslint-disable no-console */
var fs = require("fs");
var path = require("path");

const files = [];

module.exports = function distFiles2QiniuKeys(root, top) {
  var r = path.join(root);
  var pa = fs.readdirSync(r);
  pa.forEach(ele => {
    var info = fs.statSync(r + "/" + ele);
    if (info.isDirectory()) {
      distFiles2QiniuKeys(r + "/" + ele, top);
    } else {
      files.push(`${r}/${ele}`.substr(top.length + 1));
    }
  });
  return files;
};
