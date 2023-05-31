import { JwtService } from "@nestjs/jwt";
import { S3 } from "aws-sdk";
import { join } from "node:path";
import { ensureDir, writeFile, remove } from "fs-extra";

export default class APIFeatures {

  // Upload images
  static async upload(files) {
    return new Promise((resolve, reject) => {
      const s3 = new S3({
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_KEY
      });

      let images = [];

      files.forEach(async (file) => {
        const splitFile = file.originalname.split(".");
        const random = Date.now();

        const fileName = `${splitFile[0]}_${random}.${splitFile[1]}`;

        const params = {
          Bucket: `${process.env.AWS_S3_BUCKET_NAME}/restaurants`,
          Key: fileName,
          Body: file.buffer
        };

        const uploadResponse = await s3.upload(params).promise();

        images.push(uploadResponse);

        if (images.length === files.length) {
          resolve(images);
        }
      });
    });
  }

  // Delete images
  static async deleteImages(images) {
    const s3 = new S3({
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_KEY
    });

    let imagesKeys = images.map((image) => ({ Key: image.Key }));

    const params = {
      Bucket: `${process.env.AWS_S3_BUCKET_NAME}`,
      Delete: {
        Objects: imagesKeys,
        Quiet: false
      }
    };

    return new Promise((resolve, reject) => {
      s3.deleteObjects(params, function(err, data) {
        if (err) {
          console.log(err);
          reject(false);
        } else {
          resolve(true);
        }
      });
    });
  }


  // Upload images
  static async uploadLocal(files: Array<Express.Multer.File>) {
    const uploadFolder = join(process.cwd(), "uploads");
    await ensureDir(uploadFolder);

    const res: string[] = [];

    for (const file of files) {
      const nameFile = `${Date.now()}-${file.originalname}`;
      await writeFile(join(uploadFolder, nameFile), file.buffer);
      res.push(nameFile);
    }

    return res;
  }

  // Delete images
  static async deleteImagesLocal(images: string[]) {
    const uploadFolder = join(process.cwd(), "uploads");

    for (const image of images) {
      await remove(join(uploadFolder, image));
    }

    return true;
  }


  // Generate Jwt
  static async assignJwtToken(userId: string, jwtService: JwtService): Promise<string> {
    const payload = { id: userId };
    return jwtService.sign(payload);
  }

}
