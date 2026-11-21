import Constants from 'expo-constants';

const hostUri = Constants.expoConfig?.hostUri;
const ipDoComputador = hostUri ? hostUri.split(':')[0] : 'localhost';

export const API_SERVIDOR = `http://${ipDoComputador}:5252`;
