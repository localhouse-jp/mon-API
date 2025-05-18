import { BusRoute } from '../../parsers/kintetsu-bus';

// 近鉄バスの時刻表データ
export const kintetsuBusRoutes: BusRoute[] = [
  {
    name: "八戸ノ里駅前→近畿大学東門前",
    stops: [
      {
        stopName: "八戸ノ里駅前",
        schedule: {
          A: [
            { hour: 7, minutes: [20, 30, 43, 55] },
            { hour: 8, minutes: [0, 8, 20, 30, 40, 53] },
            { hour: 9, minutes: [3, 15, 25, 40, 55] },
            { hour: 10, minutes: [10, 25, 40, 55] },
            { hour: 11, minutes: [10, 25, 40, 55] },
            { hour: 12, minutes: [10, 25, 40, 55] },
            { hour: 13, minutes: [10, 25, 40, 55] },
            { hour: 14, minutes: [10, 25, 40, 55] },
            { hour: 15, minutes: [10, 25, 40, 55] },
            { hour: 16, minutes: [10, 25, 40, 55] },
            { hour: 17, minutes: [10, 25, 40, 55] },
            { hour: 18, minutes: [10, 25, 40] }
          ],
          B: [
            { hour: 7, minutes: [20, 30, 43, 55] },
            { hour: 8, minutes: [8, 20, 40, 53] },
            { hour: 9, minutes: [15, 25, 55] },
            { hour: 10, minutes: [25, 40, 55] },
            { hour: 11, minutes: [25, 55] },
            { hour: 12, minutes: [25, 40, 55] },
            { hour: 13, minutes: [10, 40] },
            { hour: 14, minutes: [10, 25, 40, 55] },
            { hour: 15, minutes: [25, 40] },
            { hour: 16, minutes: [10, 40, 55] },
            { hour: 17, minutes: [25, 55] },
            { hour: 18, minutes: [25] }
          ]
        }
      },
      {
        stopName: "近畿大学東門前",
        schedule: {
          A: [
            { hour: 7, minutes: [31, 43, 56] },
            { hour: 8, minutes: [8, 16, 23, 33, 46, 56] },
            { hour: 9, minutes: [6, 16, 28, 40, 55] },
            { hour: 10, minutes: [10, 25, 40, 55] },
            { hour: 11, minutes: [10, 25, 40, 55] },
            { hour: 12, minutes: [10, 25, 40, 55] },
            { hour: 13, minutes: [10, 25, 40, 55] },
            { hour: 14, minutes: [10, 25, 40, 55] },
            { hour: 15, minutes: [10, 25, 40, 55] },
            { hour: 16, minutes: [10, 25, 40, 55] },
            { hour: 17, minutes: [10, 25, 40, 55] },
            { hour: 18, minutes: [10, 25, 40, 55] }
          ],
          B: [
            { hour: 7, minutes: [31, 43, 56] },
            { hour: 8, minutes: [8, 23, 33, 56] },
            { hour: 9, minutes: [6, 28, 40] },
            { hour: 10, minutes: [10, 40, 55] },
            { hour: 11, minutes: [10, 40] },
            { hour: 12, minutes: [10, 40, 55] },
            { hour: 13, minutes: [10, 25, 55] },
            { hour: 14, minutes: [25, 40, 55] },
            { hour: 15, minutes: [10, 40, 55] },
            { hour: 16, minutes: [25, 55] },
            { hour: 17, minutes: [10, 40] },
            { hour: 18, minutes: [10, 40] }
          ]
        }
      }
    ]
  },
  {
    name: "近畿大学東門前→八戸ノ里駅前",
    stops: [
      {
        stopName: "近畿大学東門前",
        schedule: {
          A: [
            { hour: 7, minutes: [31, 43, 56] },
            { hour: 8, minutes: [8, 16, 23, 33, 46, 56] },
            { hour: 9, minutes: [6, 16, 28, 40, 55] },
            { hour: 10, minutes: [10, 25, 40, 55] },
            { hour: 11, minutes: [10, 25, 40, 55] },
            { hour: 12, minutes: [10, 25, 40, 55] },
            { hour: 13, minutes: [10, 25, 40, 55] },
            { hour: 14, minutes: [10, 25, 40, 55] },
            { hour: 15, minutes: [10, 25, 40, 55] },
            { hour: 16, minutes: [10, 25, 40, 55] },
            { hour: 17, minutes: [10, 25, 40, 55] },
            { hour: 18, minutes: [10, 25, 40, 55] }
          ],
          B: [
            { hour: 7, minutes: [31, 43, 56] },
            { hour: 8, minutes: [8, 23, 33, 56] },
            { hour: 9, minutes: [6, 28, 40] },
            { hour: 10, minutes: [10, 40, 55] },
            { hour: 11, minutes: [10, 40] },
            { hour: 12, minutes: [10, 40, 55] },
            { hour: 13, minutes: [10, 25, 55] },
            { hour: 14, minutes: [25, 40, 55] },
            { hour: 15, minutes: [10, 40, 55] },
            { hour: 16, minutes: [25, 55] },
            { hour: 17, minutes: [10, 40] },
            { hour: 18, minutes: [10, 40] }
          ]
        }
      },
      {
        stopName: "八戸ノ里駅前",
        schedule: {
          A: [
            { hour: 7, minutes: [20, 30, 43, 55] },
            { hour: 8, minutes: [0, 8, 20, 30, 40, 53] },
            { hour: 9, minutes: [3, 15, 25, 40, 55] },
            { hour: 10, minutes: [10, 25, 40, 55] },
            { hour: 11, minutes: [10, 25, 40, 55] },
            { hour: 12, minutes: [10, 25, 40, 55] },
            { hour: 13, minutes: [10, 25, 40, 55] },
            { hour: 14, minutes: [10, 25, 40, 55] },
            { hour: 15, minutes: [10, 25, 40, 55] },
            { hour: 16, minutes: [10, 25, 40, 55] },
            { hour: 17, minutes: [10, 25, 40, 55] },
            { hour: 18, minutes: [10, 25, 40] }
          ],
          B: [
            { hour: 7, minutes: [20, 30, 43, 55] },
            { hour: 8, minutes: [8, 20, 40, 53] },
            { hour: 9, minutes: [15, 25, 55] },
            { hour: 10, minutes: [25, 40, 55] },
            { hour: 11, minutes: [25, 55] },
            { hour: 12, minutes: [25, 40, 55] },
            { hour: 13, minutes: [10, 40] },
            { hour: 14, minutes: [10, 25, 40, 55] },
            { hour: 15, minutes: [25, 40] },
            { hour: 16, minutes: [10, 40, 55] },
            { hour: 17, minutes: [25, 55] },
            { hour: 18, minutes: [25] }
          ]
        }
      }
    ]
  },
  {
    name: "76 中央環状線（八戸ノ里駅前方面）", // 路線名（方面を明記）
    stops: [
      {
        stopName: "東上小阪",
        schedule: {
          // 平日・休日共通のスケジュール
          A: [
            { hour: 7, minutes: [4, 45] },
            { hour: 8, minutes: [28] },
            { hour: 9, minutes: [8, 52] },
            { hour: 10, minutes: [33] },
            { hour: 16, minutes: [9, 49] },
            { hour: 17, minutes: [39] },
            { hour: 18, minutes: [29] },
            { hour: 19, minutes: [9] },
          ],
          B: [ // 平日と同じデータを休日に設定
            { hour: 7, minutes: [4, 45] },
            { hour: 8, minutes: [28] },
            { hour: 9, minutes: [8, 52] },
            { hour: 10, minutes: [33] },
            { hour: 16, minutes: [9, 49] },
            { hour: 17, minutes: [39] },
            { hour: 18, minutes: [29] },
            { hour: 19, minutes: [9] },
          ],
        },
      },
    ],
  },
];
