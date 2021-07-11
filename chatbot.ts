import { VoiceText } from "voice-text";
import conf from "config-reloadable";
import { writeFileSync } from "fs";
import player from "node-wav-player";
import schedule from "node-schedule";

const config = conf();

const voiceText = new VoiceText(config.get("voiceTextApiKey")); //Voice Text API key

const speak = async (
  message: string,
  pitch = 100,
  speed = 100,
  volume = 50,
  emotion?: {
    type: "happiness" | "anger" | "sadness";
    level: 1 | 2 | 3 | 4;
  }
) => {
  console.log(message);
  const buffer = await voiceText.fetchBuffer(message, {
    format: "wav",
    speaker: config.get("voiceType"),
    pitch,
    speed,
    volume,
    emotion: emotion?.type,
    emotion_level: emotion?.level,
  });
  writeFileSync("out/voice.wav", buffer);
  player.play({
    path: "out/voice.wav",
  });
};

const every10sec = "0,10,20,30,40,50 * * * * *";
const every15min = "0 0,15,30,45 * * * *";
schedule.scheduleJob(every15min, (fireDate) => {
  speak(`現在の時刻は、${`${fireDate}`.substr(16, 8)}です。`);
});
