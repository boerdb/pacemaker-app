import {
  heart,
  pulse,
  settings,
  flash,
  analytics,
  medkit,
  informationCircle,
  warning,
  checkmarkCircle,
  cloudDownload,
  refresh,
  close,
  wifi,
  batteryCharging,
  chevronForward,
  pause,
  bicycle,
  walk,
  warningOutline,
  play,
  cloudDownloadOutline,
  download,
  school,
  checkmarkCircleOutline,

} from 'ionicons/icons';

/* Centrale export van alle iconen.
  De 'key' is de naam die je straks in je HTML gebruikt.
*/
export const APP_ICONS = {
  // Navigatie & Algemeen
  'heart': heart,
  'dashboard': pulse,
  'settings': settings,
  'information-circle': informationCircle,
  'close': close,
  'school': school,

  // Pacemaker Specifiek
  'pacing': flash,          // Voor de elektrische puls
  'sensing': wifi,          // Voor het 'luisteren' van de lead
  'wifi': wifi,             // Wifi-icoon (voor connectie)
  'monitoring': analytics,  // Voor grafieken/ECG
  'battery': batteryCharging,
  'battery-charging': batteryCharging,
  'mode': medkit,           // VVI/DDD icoon
  'pulse': pulse,
  'medkit': medkit,

  // Status Meldingen
  'success': checkmarkCircle,
  'alert': warning,

  // PWA (Install & Update)
  'install': cloudDownload,
  'update': refresh,

  // Overig
  'chevron-forward': chevronForward,
  'pause': pause,
  'bicycle': bicycle,
  'walk': walk,
  'warning': warningOutline,
  'play': play,
  'cloud-download': cloudDownloadOutline,
  'download': download,
  'checkmark-circle': checkmarkCircleOutline,
};
