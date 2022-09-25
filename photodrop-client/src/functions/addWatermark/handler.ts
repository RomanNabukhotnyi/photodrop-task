import * as AWS from 'aws-sdk';
import jimp from 'jimp';

const S3 = new AWS.S3();

const addWatermark = async (event) => {
    const { outputRoute, outputToken, inputS3Url } = event.getObjectContext;

    try {
        const image = await jimp.read(inputS3Url);
        const watermark = await (await jimp.read(process.env.WATERMARK_URL));
        const width = image.bitmap.width;
        const height = image.bitmap.height;
        const resizedWatermark = watermark.resize(width / 2, jimp.AUTO);
        const watermarkWidth = resizedWatermark.bitmap.width;
        const watermarkHeight = resizedWatermark.bitmap.height;
        const x = width / 2 - watermarkWidth / 2;
        const y = height / 2 - watermarkHeight / 2;
        image.composite(resizedWatermark, x, y, {
            mode: jimp.BLEND_SOURCE_OVER,
            opacitySource: 0.5,
            opacityDest: 1,
        });

        const buffer = await image.getBufferAsync(jimp.MIME_JPEG);

        await S3.writeGetObjectResponse({
            RequestRoute: outputRoute,
            RequestToken: outputToken,
            Body: buffer,
        }).promise();

        return {
            statusCode: 200,
        };
    } catch (err) {
        await S3.writeGetObjectResponse({
            RequestRoute: outputRoute,
            RequestToken: outputToken,
            Body: err,
        }).promise();

        return {
            statusCode: 500,
        };
    }
};

export const main = addWatermark;