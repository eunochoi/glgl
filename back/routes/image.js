const express = require("express");
const router = express.Router();
const db = require("../models/index.js");
const { Image, Post } = db;
const Op = db.Sequelize.Op;

const { S3Client } = require('@aws-sdk/client-s3');
const multer = require('multer');
const multerS3 = require('multer-s3');

const ociNamespace = (process.env.OCI_NAMESPACE || "").trim();
const ociRegion = (process.env.OCI_REGION || "ap-chuncheon-1").trim();
const ociBucket = (process.env.OCI_BUCKET || "glgl").trim();

const s3 = new S3Client({
  endpoint: `https://${ociNamespace}.compat.objectstorage.${ociRegion}.oraclecloud.com`,
  region: ociRegion,
  credentials: {
    accessKeyId: process.env.OCI_ACCESS_KEY,
    secretAccessKey: process.env.OCI_SECRET_KEY,
  },
  forcePathStyle: true,
});

const upload = multer({
  storage: multerS3({
    s3: s3,
    bucket: ociBucket,
    key: function (req, file, cb) {
      cb(null, `${Date.now()}_${file.originalname}`);
    },
  }),
});

router.post('/upload', (req, res, next) => {
  if (!ociNamespace) {
    return res.status(503).json({ message: "OCI_NAMESPACE가 .env에 없습니다." });
  }
  upload.array('image')(req, res, (err) => {
    if (err) {
      console.error('❌ Multer-S3 미들웨어 에러:', err);
      return res.status(500).json(err);
    }

    try {
      const uploadedFiles = req.files.map((v) => decodeURIComponent(v.location));
      console.log('업로드 성공:', uploadedFiles);
      res.json(uploadedFiles);
    } catch (error) {
      console.error('결과 처리 중 에러:', error);
      next(error);
    }
  });
});

//images
router.get("/", async (req, res) => {
  const { type, pageParam, tempDataNum } = req.query;

  try {
    const Images = await Image.findAll({
      order: [["createdAt", "DESC"]],
      include: [
        {
          model: Post,
          attributes: ["type", "UserId"],
          where: [
            {
              type,
              UserId: { [Op.is]: !null },
            },
          ],
        },
      ],
    });
    if (!Images) {
      return res.status(401).json("이미지가 존재하지 않습니다. ");
    }
    return res
      .status(201)
      .json(
        Images.slice(
          tempDataNum * (pageParam - 1),
          tempDataNum * pageParam
        )
      );
  } catch (e) {
    console.error(e);
  }
});

module.exports = router;
