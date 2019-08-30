/**
 * @module image-metadata
 *
 * Functions for getting metadata from an image.
 *
 * Dependencies:
 *  - exif-js (former 14876793, now node_module)
 *  - error-utils (9699359)
 *  - orientation (11927574)
 */

import EXIF from 'exif-js';
import * as error_utils from './9699359_error-utils';
import * as orientations from './11927574_orientations';

export const isJpegImage = (mime_type: string) => {
  const parsed_mime_type = mime_type.split('/');
  return (
    parsed_mime_type[0] === 'image' &&
    (parsed_mime_type[1] === 'jpeg' || parsed_mime_type[1] === 'pjpeg')
  );
};

function normalize_coordinate(
  coordinates: [EXIF.Coordinate, EXIF.Coordinate, EXIF.Coordinate]
) {
  return (
    coordinates[0].numerator +
    coordinates[1].numerator / (60 * coordinates[1].denominator) +
    coordinates[2].numerator / (3600 * coordinates[2].denominator)
  );
}

function get_location(
  metadata: EXIF.ImageMetadata
): { latitude: number; longitude: number } {
  if (!metadata.GPSLongitude || !metadata.GPSLatitude) return null;
  const latitude_ref = metadata.GPSLatitudeRef || 'N';
  const logitude_ref = metadata.GPSLongitudeRef || 'W';
  return {
    latitude:
      normalize_coordinate(metadata.GPSLatitude) *
      (latitude_ref === 'N' ? 1 : -1),
    longitude:
      normalize_coordinate(metadata.GPSLongitude) *
      (logitude_ref === 'E' ? 1 : -1)
  };
}

const has_flash = (metadata: EXIF.ImageMetadata): boolean =>
  !!metadata.Flash && metadata.Flash.startsWith('Flash fired');

interface ImageData {
  dataURL: string;
  image: HTMLImageElement;
  height: number;
  width: number;
  orientation: number;
  location: { latitude: number; longitude: number };
  flash: boolean;
  mirrored: boolean;
  rotationAngle: number;
}
export default (image_blob: Blob) =>
  new Promise<ImageData>((resolve, reject) => {
    const file_reader = new FileReader();

    file_reader.onload = (event) => {
      const image = new Image();

      image.onload = () => {
        let orientation = 0;
        let location: { latitude: number; longitude: number } = null;
        let flash = false;

        if (isJpegImage(image_blob.type))
          try {
            const metadata = EXIF.readFromBinaryFile(image_file);
            orientation = metadata.Orientation || 0;
            location = get_location(metadata);
            flash = has_flash(metadata);
          } catch (error) {
            if (error instanceof Error) {
              error.name = '[ReadImageFile] ' + error.name;
              error_utils.logError(error);
            }
          }
        const { degreesToRotate, mirrored } = orientations.getOrientationData(
          orientation
        );
        resolve({
          dataURL,
          image,
          height: image.height,
          width: image.width,
          orientation,
          location,
          flash,
          mirrored,
          rotationAngle: degreesToRotate
        });
      };

      image.onerror = (error) => {
        reject(error);
      };

      const image_file = (event.target as EventTarget & { result: any }).result;
      const dataURL = window.URL.createObjectURL(image_blob);
      image.src = dataURL;
    };

    file_reader.onerror = () => {
      reject(file_reader.error);
    };

    file_reader.readAsArrayBuffer(image_blob);
  });

export const isImage = (mime_type = 'null') =>
  mime_type.split('/')[0] === 'image';
