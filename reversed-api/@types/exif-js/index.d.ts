declare module 'exif-js' {
  export interface Coordinate {
    numerator: number;
    denominator: number;
  }
  export interface ImageMetadata {
    GPSLongitude?: [Coordinate, Coordinate, Coordinate];
    GPSLatitude?: [Coordinate, Coordinate, Coordinate];
    GPSLatitudeRef?: string;
    GPSLongitudeRef?: string;
    Flash?: string;
    Orientation?: number;
  }

  export function getData(
    url: string,
    callback: (metadata: ImageMetadata) => void
  ): ImageMetadata;
  export function getTag(img: any, tag: any): ImageMetadata;
  export function getAllTags(img: any): ImageMetadata;
  export function pretty(img: any): string;
  export function readFromBinaryFile(file: any): ImageMetadata;
}
