export function regionDisplayName = (regionCode: any) => {
  switch(regionCode) {
    case 'tr1':
      return 'TR';
    case 'euw1':
      return 'EUW';
    case 'br1':
      return 'BR';
    case 'eun1':
      return 'EUN';
    case 'jp1':
      return 'JP1';
    case 'kr':
      return 'KR';
    case 'la1':
      return 'LA1';
    case 'la2':
      return 'LA2';
    case 'na1':
      return 'NA';
    case 'oc1':
      return 'OC';
    case 'ru':
      return 'RU';
    case 'ph2':
      return 'PH2';
    case 'sg2':
      return 'SG2';
    case 'th2':
      return 'TH2';
    case 'tw2':
      return 'TW2';
    case 'vn2':
      return 'VN2';
    default:
      return regionCode;
  }
}
