/**
 * 奖品
 */
interface Prize {
  type: number
  count: number
  text: string
  title: string
  img: string
}

/**
 * 抽奖记录
 */
interface LotteryRecord {
  avatar: string
  name: string
  prize: string
  prizeIndex: number
}

/**
 * 用户
 */
interface Person {
  id: number
  name: string
  avatar: string
}
