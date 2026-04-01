export interface Port {
  name: string;
  country: string;
  code: string;
}

export const CHINA_PORTS: Port[] = [
  { name: "Shanghai", country: "China", code: "CNSHA" },
  { name: "Shenzhen (Yantian)", country: "China", code: "CNYAN" },
  { name: "Shenzhen (Shekou)", country: "China", code: "CNSHK" },
  { name: "Ningbo-Zhoushan", country: "China", code: "CNNGB" },
  { name: "Guangzhou (Nansha)", country: "China", code: "CNNSA" },
  { name: "Qingdao", country: "China", code: "CNTAO" },
  { name: "Tianjin (Xingang)", country: "China", code: "CNTSN" },
  { name: "Xiamen", country: "China", code: "CNXMN" },
  { name: "Dalian", country: "China", code: "CNDLC" },
  { name: "Fuzhou", country: "China", code: "CNFOC" },
  { name: "Lianyungang", country: "China", code: "CNLYG" },
  { name: "Zhongshan", country: "China", code: "CNZSN" },
  { name: "Zhuhai", country: "China", code: "CNZUH" },
  { name: "Dongguan", country: "China", code: "CNDGG" },
  { name: "Foshan", country: "China", code: "CNFOS" },
  { name: "Jiangmen", country: "China", code: "CNJMN" },
  { name: "Nanjing", country: "China", code: "CNNJG" },
  { name: "Suzhou", country: "China", code: "CNSZH" },
  { name: "Wuhan", country: "China", code: "CNWUH" },
  { name: "Chongqing", country: "China", code: "CNCKG" },
];

export const US_PORTS: Port[] = [
  { name: "Los Angeles", country: "USA", code: "USLAX" },
  { name: "Long Beach", country: "USA", code: "USLGB" },
  { name: "New York / New Jersey", country: "USA", code: "USNYC" },
  { name: "Savannah", country: "USA", code: "USSAV" },
  { name: "Houston", country: "USA", code: "USHOU" },
  { name: "Seattle / Tacoma", country: "USA", code: "USSEA" },
  { name: "Norfolk", country: "USA", code: "USORF" },
  { name: "Charleston", country: "USA", code: "USCHS" },
  { name: "Oakland", country: "USA", code: "USOAK" },
  { name: "Miami", country: "USA", code: "USMIA" },
  { name: "Baltimore", country: "USA", code: "USBAL" },
  { name: "Philadelphia", country: "USA", code: "USPHL" },
  { name: "Jacksonville", country: "USA", code: "USJAX" },
  { name: "Portland", country: "USA", code: "USPDX" },
  { name: "San Francisco", country: "USA", code: "USSFO" },
  { name: "New Orleans", country: "USA", code: "USMSY" },
  { name: "Tampa", country: "USA", code: "USTPA" },
  { name: "Boston", country: "USA", code: "USBOS" },
];

export function searchPorts(ports: Port[], query: string): Port[] {
  if (!query || query.length < 1) return ports.slice(0, 8);
  const lower = query.toLowerCase();
  return ports.filter(
    (p) =>
      p.name.toLowerCase().includes(lower) ||
      p.code.toLowerCase().includes(lower) ||
      p.country.toLowerCase().includes(lower)
  );
}
