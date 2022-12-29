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
  async getRandomTrack() {
    const index = Math.floor(Math.random() * this.musicArrayLength);
    return `${this.url}\\${this.musicArray[index]}`;
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
      const url = await this.getRandomTrack();
      console.log(url);
      const track = await fs.readFile(url);
      let trackDuration = getMP3Length(track);
      if (trackDuration >= duration) {
        console.log("TO long");
        trackDuration = duration;
      }
      await this.initPlayer(url, trackDuration);
      duration -= trackDuration;
    }
    if (this.currentIntervalIndex != this.array.length - 1) {
      console.log("Marire");
      this.currentIntervalIndex++;
    } else {
      console.log("Resetare`");
      this.currentIntervalIndex = 0;
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
          (currentTime.getMinutes() < endM || endM == "00")
        ) {
          this.currentIntervalIndex = this.array.indexOf(interval);
          const duration =
            (60 - currentTime.getMinutes()) * 60000 -
            currentTime.getSeconds() * 1000;
          if (endM != "00") {
            const duration =
              (endM - currentTime.getMinutes()) * 60000 -
              currentTime.getSeconds() * 1000;
          }

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
    this.musicArray = await fs.readdir(url);
    this.musicArrayLength = this.musicArray.length;
  }
  log() {
    console.log(this.array);
    console.log(this.url);
    console.log(this.currentIntervalIndex);
    console.log(this.musicArray);
    console.log(this.musicArrayLength);
  }

  async play(array, url) {
    await this.init(array, url);
    this.log();
    await this.syncTimelines();

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
}

export default musicPlayer;
