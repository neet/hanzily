declare module 'resources.json' {
  export interface Character {
    ID: number;
    Shinji: string;
    Kyuji: string;
    Kyuji_Unicode: string;
    Kyuji_Unicode_with_IVS: string;
    CID: string;
  }

  const resources: Character[];
  export default resources;
}
