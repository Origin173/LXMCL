export interface GameInstanceSummary {
  id: number;
  uuid: string;
  iconUrl: string;
  name: string;
  description: string;
}

// only for test
export const mockGameInstanceSummaryList: GameInstanceSummary[] = [
  {
    id: 1,
    uuid: "aaaaaaaa-XXXX-XXXX-XXXX-XXXXXXXXXXXX",
    iconUrl: "http://localhost:3000/images/GrassBlock.webp",
    name: "1.20.1 纯净生存整合包",
    description: "1.20.1, Fabric: 0.15.6",
  },
  {
    id: 2,
    uuid: "00000000-0000-0000-0000-000000000000",
    iconUrl: "http://localhost:3000/images/Anvil.webp",
    name: "Better MC [FORGE]",
    description: "1.20.1, Forge: 47.2.17",
  },
];
