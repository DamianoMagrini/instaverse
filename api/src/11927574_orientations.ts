/**
 * @module orientations
 *
 * List of possible image orientations.
 *
 * Dependencies: none
 */

const ORIENTATIONS = {
  1: { degreesToRotate: 0, mirrored: false },
  2: { degreesToRotate: 0, mirrored: true },
  3: { degreesToRotate: 180, mirrored: false },
  4: { degreesToRotate: 180, mirrored: true },
  5: { degreesToRotate: 90, mirrored: true },
  6: { degreesToRotate: 90, mirrored: false },
  7: { degreesToRotate: 270, mirrored: true },
  8: { degreesToRotate: 270, mirrored: false }
};

export default ORIENTATIONS;

export const getOrientationData = (index: number) => {
  return ORIENTATIONS[String(index)] || { degreesToRotate: 0, mirrored: false };
};
