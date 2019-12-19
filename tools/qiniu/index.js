/* eslint-disable no-console */
const qiniu = require("qiniu");
const listBucket = require("./list");
const batchDelete = require("./batch-delete");
const refreshCDN = require("./cdn-refresh");
const distFiles2QiniuKeys = require("./files");
const upload2Bucket = require("./upload");

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
const cdnManager = new qiniu.cdn.CdnManager(mac);

/**
 * constant
 */
const bucket = `blog-home`;
const root = "public";
const urlsToRefresh = [];
const dirsToRefresh = ["https://www.colorcat.online/"];

/**
 *  将dist部署至七牛云Bucket
 */
async function deployOnQiniuBucket() {
  try {
    const keysNow = await listBucket(bucket, bucketManager);
    console.log(`now keys length: `, keysNow.length);
    await batchDelete(bucket, bucketManager, keysNow);
    const keysNew = distFiles2QiniuKeys(root, root);
    console.log(`new keys length: `, keysNew.length);
    await upload2Bucket(keysNew, bucket, mac, root);
    await refreshCDN(cdnManager, urlsToRefresh, dirsToRefresh);
  } catch (error) {
    throw new Error("upload failed");
  }
}
deployOnQiniuBucket();
