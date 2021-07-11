import { VoiceText } from "voice-text";
import conf from "config-reloadable";
import { writeFileSync } from "fs";
import player from "node-wav-player";
import schedule from "node-schedule";

const config = conf();

const voiceText = new VoiceText(config.get("voiceTextApiKey")); //Voice Text API key

const speak = async (rawMessage: string, pitch = 100, speed = 100) => {
  const message =
    rawMessage[rawMessage.length - 1] === "。" ? rawMessage : `${rawMessage}。`;
  console.log(message);
  const buffer = await voiceText.fetchBuffer(message, {
    format: "wav",
    speaker: config.get("voiceType"),
    pitch,
    speed,
  });
  writeFileSync("out/voice.wav", buffer);
  player.play({
    path: "out/voice.wav",
  });
};

schedule.scheduleJob("0 0,15,30,45 * * * *", (fireDate) => {
  speak(`現在の時刻は、${`${fireDate}`.substr(16, 8)}です。`);
});
