
import { BusRoute } from '../../parsers/osaka-bus';

// 大阪バスの時刻表データ
export const osakaBusRoutes: BusRoute[] = [
  {
    name: "近畿大学東門前→俊徳道駅前",
    stops: [
      {
        stopName: "近畿大学東門前",
        schedule: {
          A: [
            { hour: 7, minutes: [46] },
            { hour: 8, minutes: [17, 27, 46, 58] },
            { hour: 9, minutes: [55] },
            { hour: 10, minutes: [26, 37] },
            { hour: 11, minutes: [15] },
            { hour: 12, minutes: [45] },
            { hour: 13, minutes: [13] },
            { hour: 14, minutes: [50] },
            { hour: 15, minutes: [15] },
            { hour: 16, minutes: [0, 40] },
            { hour: 17, minutes: [0, 30, 55] },
            { hour: 18, minutes: [18] }
          ],
          B: [
            { hour: 8, minutes: [8, 48] },
            { hour: 10, minutes: [3] },
            { hour: 11, minutes: [3] },
            { hour: 15, minutes: [16] },
            { hour: 16, minutes: [32] },
            { hour: 17, minutes: [12] }
          ]
        }
      },
    ]
  }
];
