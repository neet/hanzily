declare module 'resources.json' {
  export interface Character {
    kyuji: string;
    unicode: string;
  }

  export interface Resources {
    [key: string]: Character;
  }

  const resources: Resources;
  export default resources;
}
