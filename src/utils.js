import { Vibration } from 'react-native';

export const vibrate = () => {
  Vibration.vibrate([500, 500, 500]); 
};