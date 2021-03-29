import { ElMessage } from 'element-plus'
import { ref, watch } from 'vue'

const musicOpen = ref(false)
const bgm = ref<HTMLAudioElement>()
const music = ref<HTMLAudioElement>()

watch(musicOpen, () => {
  if (musicOpen.value) {
    ElMessage.success({
      message: '抽奖音效已打开',
      type: 'success'
    })
    if (bgm.value) bgm.value.play()
  } else {
    if (bgm.value) bgm.value.pause()
    ElMessage({
      message: '抽奖音效已关闭',
      type: 'error'
    })
  }
})

const switchLotteryEffect = (state: boolean): void => {
  if (!musicOpen.value) return
  if (!music.value) return
  state ? music.value.play() : music.value.pause()
}

export { music, bgm, musicOpen, switchLotteryEffect }
