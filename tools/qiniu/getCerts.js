const qiniu = require("qiniu");
var fs = require("fs");
var Axios = require("axios");

/**
 * AK, SK, Mac
 */
const accessKey = process.env.QINIU_AK;
const secretKey = process.env.QINIU_SK;
const mac = new qiniu.auth.digest.Mac(accessKey, secretKey);

/**
 * config
 */
const config = new qiniu.conf.Config();
// config.useHttpsDomain = true;
config.zone = qiniu.zone.Zone_z0;

/**
 * Manager
 */
const bucketManager = new qiniu.rs.BucketManager(mac, config);
var downloadUrlCRT = bucketManager.privateDownloadUrl(
  process.env.CERT_ADDRESS,
  "_domain.crt",
  Date.now() + 10000000
);
var downloadUrlKEY = bucketManager.privateDownloadUrl(
  process.env.CERT_ADDRESS,
  "_domain.key",
  Date.now() + 10000000
);

function downloadFile() {
  Axios.get(downloadUrlCRT).then(data => {
    fs.writeFileSync("fishda.crt", data.data);
  });
  Axios.get(downloadUrlKEY).then(data => {
    fs.writeFileSync("fishda.key", data.data);
  });
}

downloadFile();
