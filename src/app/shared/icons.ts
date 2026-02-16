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

  // Pacemaker Specifiek
  'pacing': flash,          // Voor de elektrische puls
  'sensing': wifi,          // Voor het 'luisteren' van de lead
  'monitoring': analytics,  // Voor grafieken/ECG
  'battery': batteryCharging,
  'mode': medkit,           // VVI/DDD icoon

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
};
