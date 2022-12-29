import fs from "node:fs/promises";
import path from "path";
import { dirname } from "path";
import { fileURLToPath } from "url";
import getMP3Length from "get-mp3-duration";
import Audic from "audic";

const __dirname = dirname(fileURLToPath(import.meta.url));

class musicPlayer {
  initPlayer(url, duration) {
    return new Promise((res, rej) => {
      const audic = new Audic(url);
      audic.play();
      setTimeout(() => {
        audic.destroy();
        res();
        console.log("Music Stopped");
      }, duration);
    });
  }

  async startMusic(duration = 0) {
    const currentTime = new Date();
    const [startTime, endTime] =
      this.array[this.currentIntervalIndex].split("_");
    const [startH, startM] = startTime.split(":");
    const [endH, endM] = endTime.split(":");
    if (!duration) {
      duration = (endM - startM) * 60000;
    }
    while (duration > 0) {
      const url = path.join(__dirname, "music/3_03.mp3");
      const track = await fs.readFile(url);
      let trackDuration = getMP3Length(track);
      if (trackDuration >= duration) {
        console.log("TO long");
        trackDuration = duration;
      }
      await this.initPlayer(url, trackDuration);
      duration -= trackDuration;
    }
  }

  async syncTimelines() {
    await this.array.forEach(async (interval) => {
      const currentTime = new Date();
      const [startTime, endTime] = interval.split("_");
      const [startH, startM] = startTime.split(":");
      const [endH, endM] = endTime.split(":");
      if (currentTime.getHours() == startH) {
        if (currentTime.getMinutes() < startM) {
          this.currentIntervalIndex = this.array.indexOf(interval);
        } else if (
          currentTime.getMinutes() >= startM &&
          currentTime.getMinutes() < endM
        ) {
          this.currentIntervalIndex = this.array.indexOf(interval);
          const duration =
            (endM - currentTime.getMinutes()) * 60000 -
            currentTime.getSeconds() * 1000;
          console.log(duration);

          await this.startMusic(duration);
        } else if (currentTime.getMinutes() > endM) {
          this.currentIntervalIndex = this.array.indexOf(interval) + 1;
        }
      }
    });
  }

  async init(array, url) {
    this.array = array;
    this.url = url;
    this.currentIntervalIndex = 0;
    await this.syncTimelines();
    console.log(this.currentIntervalIndex);
    let currentTime = new Date();
    let timeout = (60 - currentTime.getSeconds()) * 1000;
    setTimeout(() => {
      setInterval(async () => {
        currentTime = new Date();
        const [startTime, endTime] =
          this.array[this.currentIntervalIndex].split("_");
        const [startH, startM] = startTime.split(":");
        const [endH, endM] = endTime.split(":");
        console.log(startTime);
        if (
          currentTime.getHours() == startH &&
          currentTime.getMinutes() == startM &&
          !currentTime.getSeconds()
        ) {
          console.log("hello");
          await this.startMusic();
        }
      }, 1000);
    });
  }

  log() {
    console.table([this.array, this.url, this.i]);
  }
}

const player = new musicPlayer();
player.init(["18:19_18:28"], "url");
