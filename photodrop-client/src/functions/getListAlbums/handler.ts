import { middyfy } from '../../libs/lambda';
import { ClientPhotos } from '../../db/entity/clientPhotos';

const getListAlbums = async (event) => {
    const number: string = event.requestContext.authorizer.principalId;
    const { Items } = await ClientPhotos.query(number, {
        attributes: ['name', 'location', 'date', 'key', 'watermark'],
    });

    const result = Items.reduce((acc, photo) => {
        if (!acc.albums.find(album => album.name === photo.name)) {
            acc.albums.push({
                name: photo.name,
                location: photo.location,
                date: photo.date,
                image: `https://${process.env.PHOTOGRAPHER_BUCKET_NAME}.s3.amazonaws.com/original/${photo.key}`,
            });
            Items.forEach(item => {
                if (item.name == photo.name) {
                    acc.allPhotos.push({
                        album: item.name,
                        url: item.watermark 
                            ? `https://${process.env.PHOTOGRAPHER_BUCKET_NAME}.s3.amazonaws.com/watermark/${item.key}` 
                            : `https://${process.env.PHOTOGRAPHER_BUCKET_NAME}.s3.amazonaws.com/original/${item.key}`,
                        watermark: item.watermark,
                    });
                }
            });
        }
        return acc;
    }, {
        albums: [],
        allPhotos: [],
    }) ?? {
        albums: [],
        allPhotos: [],
    };

    return result;
};

export const main = middyfy(getListAlbums);