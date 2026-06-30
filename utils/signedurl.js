const { GetObjectCommand } = require("@aws-sdk/client-s3");
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");
const r2 = require("../config/r2");

const BUCKET = process.env.R2_BUCKET;

const generateSignedUrl = async (fileKey) => {
  const command = new GetObjectCommand({
    Bucket: BUCKET,
    Key: fileKey,
  });

  const url = await getSignedUrl(r2, command, {
    expiresIn: 60 * 5, // 5 min valid link
  });

  return url;
};

module.exports = generateSignedUrl;