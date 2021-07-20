import { VoiceText } from "voice-text";
import conf from "config-reloadable";
import { writeFileSync } from "fs";
import player from "node-wav-player";
import schedule from "node-schedule";
import readline from "readline";
import ping from "ping";

process.stdin.setEncoding("utf8");
const reader = readline.createInterface({
  input: process.stdin,
});

const config = conf();

const voiceText = new VoiceText(config.get("voiceTextApiKey")); //Voice Text API key

type SpeechOption = {
  pitch: number;
  speed: number;
  volume: number;
  emotion?: {
    type: "happiness" | "anger" | "sadness";
    level: 1 | 2 | 3 | 4;
  };
};

const queuePlayer = async () => {
  const { message, option } = speechQueue[0];
  console.log(message);
  const buffer = await voiceText.fetchBuffer(message, {
    format: "wav",
    speaker: config.get("voiceType"),
    pitch: option.pitch,
    speed: option.speed,
    volume: option.volume,
    emotion: option.emotion?.type,
    emotion_level: option.emotion?.level,
  });
  writeFileSync("out/voice.wav", buffer);
  await player.play({
    path: "out/voice.wav",
  });
  speechQueue.splice(0, 1);
  if (speechQueue.length > 0) {
    queuePlayer();
  }
};

const speechQueue: {
  message: string;
  option: SpeechOption;
}[] = [];
const speak = (
  message: string,
  option: SpeechOption = {
    pitch: 100,
    speed: 100,
    volume: 50,
  }
) => {
  speechQueue.push({ message, option });
  if (speechQueue.length === 1) {
    queuePlayer();
  }
};

// 時報
const timeSignal = (fireDate: Date) => {
  speak(`${`${fireDate}`.substr(16, 8)}です。`);
};

// タイマー
const timer = (message: string) => {
  if (message.match(/^\d$/)) {
    const time = parseInt(message);
    speak(`${time}分経ったら教えます。`);
    setTimeout(() => speak(`${time}分経ちました。`), time * 60 * 1000);
  }
};

// バッテリーチェック
const checkAliveDevices = () => {
  config.get("devices").forEach((device) => {
    ping.sys.probe(device[0], (isAlive) => {
      if (!isAlive) {
        speak(`${device[1]}のバッテリーが切れています。`);
      }
    });
  });
};

schedule.scheduleJob("0 */30 * * * *", timeSignal);
schedule.scheduleJob("0 */5 * * * *", checkAliveDevices);
reader.on("line", (message) => {
  timer(message);
});
