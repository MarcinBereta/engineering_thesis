import {Dimensions} from 'react-native';
import {PixelRatio} from 'react-native';

const {width: SCREEN_WIDTH, height: SCREEN_HEIGHT} = Dimensions.get('window');

const widthBaseScale = SCREEN_WIDTH / 360;
const heightBaseScale = SCREEN_HEIGHT / 800;

function normalize(size: number, based = 'width') {
  const newSize =
    based === 'height' ? size * heightBaseScale : size * widthBaseScale;
  return Math.round(PixelRatio.roundToNearestPixel(newSize));
}
//Width
export const widthPixel = (size: number) => {
  return normalize(size, 'width');
};
//Height
export const heightPixel = (size: number) => {
  return normalize(size, 'height');
};
//Font size
export const fontPixel = (size: number) => {
  return heightPixel(size);
};
//Margin and Padding vertical
export const pixelSizeVertical = (size: number) => {
  return heightPixel(size);
};
//Margin and Padding horizontal
export const pixelSizeHorizontal = (size: number) => {
  return widthPixel(size);
};
