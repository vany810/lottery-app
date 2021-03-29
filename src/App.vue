<template>
  <div>
    <!-- 音频相关 -->
    <audio ref="music" preload="auto" loop :src="musicFile" />
    <audio ref="bgm" preload="auto" loop :src="bgmFile" />

    <!-- 背景装饰图片 -->
    <div class="heng-fu">
      <el-image :src="hengFuImg" />
    </div>
    <div class="deng-long-left">
      <el-image :src="dengLongImg" />
    </div>
    <div class="deng-long-right">
      <el-image :src="dengLongImg" />
    </div>
    <div class="niu-left">
      <el-image :src="niuLeftImg" />
    </div>
    <div class="niu-right">
      <el-image :src="niuRightImg" />
    </div>

    <!-- 按钮相关 -->
    <div class="music-btn">
      <input
        type="image"
        :src="musicImg"
        title="音乐开关"
        class="btn-music"
        @click="musicOpen = !musicOpen"
      />
    </div>
    <el-tooltip content="抽奖" placement="top" effect="light">
      <input
        type="image"
        :src="jinLiImg"
        class="btn-jin-li"
        @click="lotteryBtnClick"
      />
    </el-tooltip>
    <el-tooltip content="奖品" placement="top" effect="light">
      <input
        type="image"
        :src="hongBaoImg"
        class="btn-hong-bao"
        @click="prizeDrawer = true"
      />
    </el-tooltip>
    <el-tooltip content="中奖名单" placement="top" effect="light">
      <input
        type="image"
        :src="huaDuoImg"
        class="btn-hua-duo"
        @click="recordDrawer = true"
      />
    </el-tooltip>

    <!-- 中间头像相关 -->
    <div class="avatar">
      <el-avatar
        :size="200"
        :src="avatarUrl"
        shape="square"
        class="avatar-border"
        @click="retryLottery"
      />
      <div class="name-label">{{ currentName }}</div>
    </div>

    <!-- 奖品清单侧边栏 -->
    <el-drawer v-model="prizeDrawer" title="奖品清单" size="400">
      <div style="padding: 0 20px 20px 20px">
        <el-select v-model="currentPrizeTitle" placeholder="请选择抽取的奖品">
          <el-option
            v-for="prize in prizes"
            :key="prize.type"
            :label="prize.title"
            :value="prize.title"
            :disabled="isPrizeUnavailable(prize.title)"
          >
            <span style="float: left">{{ prize.title }}</span>
            <span style="float: right; color: #8492a6; font-size: 13px">{{
              prize.text
            }}</span>
          </el-option>
        </el-select>
      </div>
      <el-space direction="vertical">
        <el-card v-for="prize in prizes" :key="prize.type" class="prize-card">
          <el-image
            style="width: 100px; height: 100px"
            :src="prize.img"
            fit="contain"
          />
          <div style="margin-left: 20px">
            <h4>{{ prize.text }} / {{ prize.count }}个</h4>
            <h5>{{ prize.title }}</h5>
          </div>
        </el-card>
      </el-space>
    </el-drawer>

    <!-- 中奖名单侧边栏 -->
    <el-drawer v-model="recordDrawer" title="中奖名单" size="400">
      <el-empty v-if="lotteryRecords.length <= 0" description="暂无记录" />
      <el-space v-else direction="vertical" :size="0">
        <div
          v-for="(record, index) in lotteryRecords"
          :key="index"
          class="lottery-record"
        >
          <div class="lottery-record-content">
            <el-avatar :size="50" :src="record.avatar" />
            <div style="margin-left: 20px">
              <span style="font-weight: bold">{{ record.name }}</span> 抽中
              <span style="font-weight: bold">{{ record.prize }}</span>
            </div>
          </div>
          <el-divider style="margin: 10px 0" />
        </div>
      </el-space>
    </el-drawer>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, ref, watch } from 'vue'
import { ElMessage, ElNotification, ElMessageBox } from 'element-plus'
import personJsonData from './assets/json/person.json'
import { prizes } from './models/prize'
import { res } from './composables/res'
import {
  musicOpen,
  switchLotteryEffect,
  music,
  bgm
} from './composables/music-control'

export default defineComponent({
  name: 'App',
  setup() {
    /** 是否打开奖品侧边栏 */
    const prizeDrawer = ref(false)
    /** 中奖名单侧边栏是否打开 */
    const recordDrawer = ref(false)
    /** 抽奖是否结束 */
    const lotteryFinish = ref(false)
    // 所有人员名单
    const personList = ref<Person[]>(personJsonData)
    // 当前人员头像
    const avatarUrl = ref(personList.value[0].avatar)
    // 当前人员姓名
    const currentName = ref(personList.value[0].name)

    const availablePersons = computed(() => {
      // 设置当前可以获奖的人员名单，移除已经获奖的
      const personToRemove = lotteryRecords.value.map((item) => item.name)
      const filterArr = personList.value.filter(
        (item) => personToRemove.indexOf(item.name) < 0
      )
      return filterArr
    })

    // 中奖记录
    const lotteryRecords = ref<LotteryRecord[]>([])

    watch(
      lotteryRecords,
      () => {
        if (lotteryRecords.value.length > 0) {
          // 判断奖品是否抽完以及自动切换奖品
          const isCurrentPrizeUnavailable = isPrizeUnavailable(
            currentPrizeTitle.value
          )
          if (isCurrentPrizeUnavailable) {
            const prePrize = currentPrizeTitle.value
            if (currentPrizeIndex.value > 0) {
              currentPrizeIndex.value--
              ElNotification({
                title: '消息提醒',
                message: `奖品 【${prePrize}】 已经抽完，开始抽取奖品 【${
                  prizes[currentPrizeIndex.value].title
                }】`,
                position: 'top-left',
                type: 'info'
              })
            } else {
              lotteryFinish.value = true
              ElNotification({
                title: '消息提醒',
                message: '奖品全部抽完，抽奖已经结束',
                position: 'top-left',
                type: 'warning'
              })
            }
          }
        }
      },
      { deep: true }
    )

    // 设置可抽奖人数的随机最大index
    const maxIndex = computed(() => availablePersons.value.length - 1)

    // 是否正在抽奖
    const lotteryRunning = ref(false)
    watch(lotteryRunning, () => {
      switchLotteryEffect(lotteryRunning.value)
    })

    // 抽奖定时器
    let timer: NodeJS.Timeout

    // 抽奖
    const lottery = () => {
      lotteryRunning.value = true
      const index = Math.round(Math.random() * maxIndex.value)
      avatarUrl.value = availablePersons.value[index].avatar
      currentName.value = availablePersons.value[index].name
      timer = setTimeout(lottery, 50)
    }

    // 停止抽奖
    const stopLottery = () => {
      lotteryRunning.value = false
      clearTimeout(timer)

      const record: LotteryRecord = {
        avatar: avatarUrl.value,
        name: currentName.value,
        prize: currentPrizeTitle.value,
        prizeIndex: currentPrizeIndex.value
      }
      lotteryRecords.value.unshift(record)
    }

    // 监听是否正在抽奖
    watch(lotteryRunning, () => {
      if (lotteryRunning.value) {
        ElMessage.success({
          message: `正在抽取 ${currentPrize.value.text} / ${currentPrize.value.title}`,
          type: 'success'
        })

        lottery()
      } else {
        stopLottery()
      }
    })

    /**
     * 抽奖按钮点击
     */
    const lotteryBtnClick = () => {
      if (lotteryFinish.value) {
        ElNotification({
          title: '消息提醒',
          message: '奖品全部抽完，抽奖已经结束',
          position: 'top-left',
          type: 'warning'
        })
      } else {
        lotteryRunning.value = !lotteryRunning.value
      }
    }

    /**
     * 头像点击重新抽奖
     */
    const retryLottery = () => {
      console.log('retryLottery')
      if (lotteryRecords.value.length <= 0) return

      ElMessageBox.confirm('此操作将重新抽取刚才的奖品，是否继续？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(() => {
          const recordToRemove = lotteryRecords.value[0]
          if (recordToRemove.prizeIndex !== currentPrizeIndex.value) {
            currentPrizeIndex.value = recordToRemove.prizeIndex
          }

          lotteryRecords.value.splice(0, 1)
          ElMessage.success({
            message: '操作成功，请继续进行抽奖',
            type: 'success'
          })
        })
        .catch(() => {
          console.log('cancel')
        })
    }

    /** 当前奖品的对应数组的index */
    const currentPrizeIndex = ref(prizes.length - 1)

    /** 监听当前奖品的index */
    watch(
      currentPrizeIndex,
      () => (currentPrizeTitle.value = prizes[currentPrizeIndex.value].title)
    )

    /** 当前奖品的名称 */
    const currentPrizeTitle = ref(prizes[currentPrizeIndex.value].title)

    /** 当前正在抽的奖品 */
    const currentPrize = computed(() => {
      const filterArr = prizes.filter(
        (item) => item.title === currentPrizeTitle.value
      )
      return filterArr.length > 0 ? filterArr[0] : <Prize>{}
    })

    /** 判断奖品是否抽满 */
    const isPrizeUnavailable = (prizeTitle: string) => {
      const filterPrizes = prizes.filter((item) => item.title === prizeTitle)
      if (filterPrizes.length <= 0) return false

      const prize = filterPrizes[0]
      const filterRecords = lotteryRecords.value.filter(
        (item) => item.prize === prizeTitle
      )
      return prize.count <= filterRecords.length
    }

    return {
      ...res,
      avatarUrl,
      currentName,
      lotteryBtnClick,
      retryLottery,
      prizeDrawer,
      prizes,
      currentPrizeTitle,
      isPrizeUnavailable,
      lotteryRecords,
      recordDrawer,
      musicOpen,
      music,
      bgm
    }
  }
})
</script>

<style>
body {
  margin: 0;
}

#app {
  width: 100vw;
  height: 100vh;
  background-color: #f39f86;
  background-image: linear-gradient(315deg, #f39f86 0%, #f9d976 74%);
}

.heng-fu {
  position: absolute;
  top: 24px;
  left: 50%;
  transform: translateX(-50%);
}

.deng-long-left {
  position: absolute;
  left: 30px;
  top: 0;
}

.deng-long-right {
  position: absolute;
  right: 30px;
  top: 0;
}

.niu-left {
  position: absolute;
  bottom: 0;
  left: 30px;
}

.niu-right {
  position: absolute;
  bottom: 0;
  right: 30px;
}

.btn-jin-li {
  position: absolute;
  bottom: 55px;
  left: calc(50% - 250px);
  width: 130px;
  height: 60px;
}

.btn-hong-bao {
  position: absolute;
  bottom: 30px;
  left: 50%;
  width: 130px;
  height: 133px;
  transform: translateX(-50%);
}

.btn-hua-duo {
  position: absolute;
  bottom: 0;
  left: calc(50% + 120px);
  width: 85px;
  height: 130px;
}

.music-btn {
  position: absolute;
  right: 15px;
  top: 15px;
}

.btn-music {
  width: 40px;
  height: 40px;
}

.avatar {
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translateX(-50%) translateY(-50%);
}

.avatar-border {
  padding: 5px;
  background: white;
}

.name-label {
  margin-top: 10px;
  font-size: 30px;
  color: #fff;
  font-weight: bold;
  text-align: center;
}

input:focus {
  outline: none;
}

.prize-card {
  margin: 0 20px;
  width: 360px;
}

.el-card__body {
  padding: 0;
  height: 100px;
  display: flex;
  flex-direction: row;
}

.el-drawer {
  width: 400px;
  overflow: auto;
  display: flex;
  flex-direction: column;
}

.lottery-record {
  margin: 0 20px;
  width: 360px;
}

.lottery-record-content {
  display: flex;
  flex-direction: row;
  align-items: center;
}
</style>
