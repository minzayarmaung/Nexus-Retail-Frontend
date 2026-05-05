/** Myanmar NRC static data.
 *  Format: {regionNo}/{townshipCode}({citizenType}){serialNo}
 *  e.g.  12/LaKaNa(N)318903
 */

export interface NrcRegion {
  no: string; // "1" – "14"
  label: string;
}

export interface NrcTownship {
  code: string;      // e.g. "LaKaNa"
  burmese: string;   // Burmese display script
}

export type NrcCitizenType = 'N' | 'E' | 'P' | 'T' | 'Na' | 'Th';

export const NRC_CITIZEN_TYPES: { value: NrcCitizenType; label: string }[] = [
  { value: 'N',  label: 'N  (နိုင်) – Citizen' },
  { value: 'E',  label: 'E  (ဧည့်) – Guest' },
  { value: 'P',  label: 'P  (ပြု) – Naturalized' },
  { value: 'T',  label: 'T  (သာ) – Temporary' },
  { value: 'Na', label: 'Na (နာ) – Unknown Nationality' },
  { value: 'Th', label: 'Th (သ) – Other' },
];

export const NRC_REGIONS: NrcRegion[] = [
  { no: '1',  label: '1 – Sagaing Region' },
  { no: '2',  label: '2 – Mandalay Region' },
  { no: '3',  label: '3 – Magway Region' },
  { no: '4',  label: '4 – Bago Region' },
  { no: '5',  label: '5 – Tanintharyi Region' },
  { no: '6',  label: '6 – Yangon Region' },
  { no: '7',  label: '7 – Ayeyarwady Region' },
  { no: '8',  label: '8 – Kayah State' },
  { no: '9',  label: '9 – Kayin State' },
  { no: '10', label: '10 – Mon State' },
  { no: '11', label: '11 – Rakhine State' },
  { no: '12', label: '12 – Shan State' },
  { no: '13', label: '13 – Kachin State' },
  { no: '14', label: '14 – Chin State' },
];

/** Township codes keyed by region number */
export const NRC_TOWNSHIPS: Record<string, NrcTownship[]> = {
  '1': [
    { code: 'AhNaPha',  burmese: 'အနဖ' },
    { code: 'AhLaNa',   burmese: 'အလန' },
    { code: 'KaLayNa',  burmese: 'ကလန' },
    { code: 'KaLaNa',   burmese: 'ကလန' },
    { code: 'MaYaNa',   burmese: 'မြန' },
    { code: 'MaNaYa',   burmese: 'မနယ' },
    { code: 'MaHtaNa',  burmese: 'မထ' },
    { code: 'ShwePyiTha', burmese: 'ရွှေပြည်' },
    { code: 'SaGaing',  burmese: 'စစ်ကိုင်း' },
    { code: 'YaYaNa',   burmese: 'ရရန' },
  ],
  '2': [
    { code: 'AhMaNa',   burmese: 'အမန' },
    { code: 'MANaLA',   burmese: 'မန္တလေး' },
    { code: 'MaHaNa',   burmese: 'မဟန' },
    { code: 'PaLaNa',   burmese: 'ပလန' },
    { code: 'ThaKa',    burmese: 'သကာ' },
    { code: 'PyiGyi',   burmese: 'ပြည်ကြီး' },
    { code: 'MeiKhtiLa', burmese: 'မိတ္ထီလာ' },
    { code: 'YaMetHin', burmese: 'ရမည်းသင်း' },
    { code: 'NyaungU',  burmese: 'ညောင်ဦး' },
  ],
  '3': [
    { code: 'AhNaTha',  burmese: 'အနသ' },
    { code: 'GaNaNa',   burmese: 'ဂနန' },
    { code: 'HtiLin',   burmese: 'ထီးလင်း' },
    { code: 'Magway',   burmese: 'မကွေး' },
    { code: 'MinBu',    burmese: 'မင်းဘူး' },
    { code: 'PaPun',    burmese: 'ပဒိတ်' },
    { code: 'ThaYetMyo', burmese: 'သရက်မြို့' },
    { code: 'YeSaGyo',  burmese: 'ရဆယ်' },
  ],
  '4': [
    { code: 'BaGo',     burmese: 'ပဲခူး' },
    { code: 'Hanthawaddy', burmese: 'ဟံသာဝတီ' },
    { code: 'KaWkTadhar', burmese: 'ကောက်ကြိုး' },
    { code: 'OkKaTa',   burmese: 'အုက္ကမ' },
    { code: 'Pyay',     burmese: 'ပြည်' },
    { code: 'TaungNgu', burmese: 'တောင်ငူ' },
    { code: 'ThaTon',   burmese: 'သထုံ' },
  ],
  '5': [
    { code: 'DaWei',    burmese: 'ဒေါ်' },
    { code: 'KaWThaung', burmese: 'ကော်သောင်း' },
    { code: 'MaWLaMaYine', burmese: 'မော်လမြိုင်' },
    { code: 'MyeIk',   burmese: 'မြိတ်' },
  ],
  '6': [
    { code: 'AhLone',   burmese: 'အလုံ' },
    { code: 'BaHan',    burmese: 'ဗဟန်း' },
    { code: 'DaGon',    burmese: 'ဒဂုံ' },
    { code: 'HLaing',   burmese: 'လှိုင်' },
    { code: 'Hlaingthaya', burmese: 'လှိုင်သာယာ' },
    { code: 'Insein',   burmese: 'အင်းစိန်' },
    { code: 'KaMarYut', burmese: 'ကမာရွတ်' },
    { code: 'LanMaDaw', burmese: 'လမ်းမတော်' },
    { code: 'Latha',    burmese: 'လသာ' },
    { code: 'MaHaAungMyay', burmese: 'မဟာအောင်မြေ' },
    { code: 'MaNdale',  burmese: 'မြောက်ဒဂုံ' },
    { code: 'Mingalar', burmese: 'မင်္ဂလာ' },
    { code: 'Pazundaung', burmese: 'ပဇုန်ဒေါင်း' },
    { code: 'SanChaung', burmese: 'ဆည်ချောင်း' },
    { code: 'Seikkan',  burmese: 'စိတ္တကမ်း' },
    { code: 'Shwepyitha', burmese: 'ရွှေပြည်သာ' },
    { code: 'TaKeTa',   burmese: 'တိုက်ကြီး' },
    { code: 'ThaKeTa',  burmese: 'သာကေတ' },
    { code: 'Tharkayta', burmese: 'သာကြာ' },
    { code: 'ThinGanGyun', burmese: 'သင်္ကန်းကျွန်း' },
    { code: 'TwanTay',  burmese: 'တွံတေး' },
    { code: 'YangonWest', burmese: 'ရန်ကုန်အနောက်' },
  ],
  '7': [
    { code: 'Bassein',  burmese: 'ဘားစိမ်း' },
    { code: 'Hinthada', burmese: 'ဟင်္သာတ' },
    { code: 'Labutta',  burmese: 'လပွတ္တာ' },
    { code: 'Maubin',   burmese: 'မော်ဘင်' },
    { code: 'Pathein',  burmese: 'ပုသိမ်' },
    { code: 'Pyapon',   burmese: 'ဖျာပုံ' },
    { code: 'Wakema',   burmese: 'ဝါးခယ်မ' },
  ],
  '8': [
    { code: 'BaLuChaung', burmese: 'ဗလုချောင်း' },
    { code: 'DeMaWso',  burmese: 'ဒီမော့ဆို' },
    { code: 'Loikaw',   burmese: 'လွိုင်ကော်' },
  ],
  '9': [
    { code: 'KaWKaRaik', burmese: 'ကော်ကကြိုင်' },
    { code: 'Myawaddy', burmese: 'မြဝတီ' },
    { code: 'PaAn',     burmese: 'ဖာအန်' },
    { code: 'Pharpon',  burmese: 'ဖာပွန်' },
  ],
  '10': [
    { code: 'Bilin',    burmese: 'ဘီးလင်း' },
    { code: 'Kyaikto',  burmese: 'ကျိုက်ထို' },
    { code: 'MaWLaMaYine', burmese: 'မောလမြိုင်' },
    { code: 'Mudon',    burmese: 'မုဒုံ' },
    { code: 'Paung',    burmese: 'ပေါင်' },
    { code: 'Thaton',   burmese: 'သထုံ' },
    { code: 'Ye',       burmese: 'ရေး' },
  ],
  '11': [
    { code: 'AhPaung',  burmese: 'အောင်' },
    { code: 'Ann',      burmese: 'အမ်း' },
    { code: 'Kyaukpyu', burmese: 'ကျောက်ဖြူ' },
    { code: 'Maungdaw', burmese: 'မောင်တော' },
    { code: 'Myebon',   burmese: 'မြဲဘွန်း' },
    { code: 'Ramree',   burmese: 'ရမ်းဗြဲ' },
    { code: 'Sittway',  burmese: 'စစ်တွေ' },
    { code: 'Thandwe',  burmese: 'သံတွဲ' },
    { code: 'Toungup',  burmese: 'တောင်ကုတ်' },
  ],
  '12': [
    { code: 'KaKhan',   burmese: 'ကခမ်း' },
    { code: 'KaYaNi',   burmese: 'ကရည်' },
    { code: 'KaYarNi',  burmese: 'ကရားနီ' },
    { code: 'LaKaNa',   burmese: 'လကန' },
    { code: 'LaShio',   burmese: 'လားရှိုး' },
    { code: 'MaHaNa',   burmese: 'မဟာန' },
    { code: 'MaNa',     burmese: 'မန' },
    { code: 'MuHtaNa',  burmese: 'မဟတ' },
    { code: 'TachilekNa', burmese: 'တာချီလိတ်' },
    { code: 'TaungGyi', burmese: 'တောင်ကြီး' },
    { code: 'Thibaw',   burmese: 'သီပေါ' },
    { code: 'YaZa',     burmese: 'ရာဇ' },
  ],
  '13': [
    { code: 'ChiPhwi',  burmese: 'ချီဖွေ' },
    { code: 'Hpakant',  burmese: 'ဖားကန့်' },
    { code: 'KaTha',    burmese: 'ကသာ' },
    { code: 'Mogaung',  burmese: 'မော်ကောင်း' },
    { code: 'Momauk',   burmese: 'မိုးမောက်' },
    { code: 'MyitKyina', burmese: 'မြစ်ကြီးနား' },
    { code: 'PuTao',    burmese: 'ပူတာဦး' },
    { code: 'Shwegu',   burmese: 'ရွှေကူ' },
    { code: 'WaingMaw', burmese: 'ဝိုင်းမော်' },
  ],
  '14': [
    { code: 'Falam',    burmese: 'ဖလမ်း' },
    { code: 'Hakha',    burmese: 'ဟားခါး' },
    { code: 'Kanpetlet', burmese: 'ကန်ပက်လက်' },
    { code: 'Matupi',   burmese: 'မတူပီ' },
    { code: 'MinDat',   burmese: 'မင်းတပ်' },
    { code: 'Paletwa',  burmese: 'ပလက်ဝ' },
    { code: 'Tedim',    burmese: 'တီဒင်း' },
    { code: 'Thantlang', burmese: 'သံတလင်း' },
  ],
};

/** Build NRC string for backend from parts */
export function buildNrcString(
  regionNo: string,
  townshipCode: string,
  citizenType: string,
  serialNo: string,
): string {
  if (!regionNo || !townshipCode || !citizenType || !serialNo) return '';
  return `${regionNo}/${townshipCode}(${citizenType})${serialNo}`;
}
