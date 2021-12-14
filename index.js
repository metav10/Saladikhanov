// index.js

// require('dotenv').config();
import dotenv from 'dotenv';
dotenv.config()
// import { fetch } from 'node-fetch'
// import { puppeteerService } from './services/puppeteer.service'
// import { mustache } from 'mustache'
import * as fs from 'fs';
import fetch from 'node-fetch';
import puppeteerService from './services/puppeteer.service.js';
import mustache from 'mustache';
// import { readFile, writeFileSync } from 'fs';
const MUSTACHE_MAIN_DIR = './main.mustache';
const { render } = mustache;

/**
  * DATA is the object that contains all
  * the data to be provided to Mustache
  * Notice the "name" and "date" property.
*/
let DATA = {
  name: 'Arsen',
  refresh_date: new Date().toLocaleDateString('en-GB', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
    timeZoneName: 'short',
    timeZone: 'Asia/Jerusalem',
  }),
};

async function setWeatherInformation() {
    await fetch(
      `https://api.openweathermap.org/data/2.5/weather?q=tel-aviv&appid=${process.env.OPEN_WEATHER_MAP_KEY}&units=metric`
    )
      .then(r => r.json())
      .then(r => {
        DATA.city_temperature = Math.round(r.main.temp);
        DATA.city_weather = r.weather[0].description;
        DATA.city_weather_icon = r.weather[0].icon;
        DATA.sun_rise = new Date(r.sys.sunrise * 1000).toLocaleString('en-GB', {
          hour: '2-digit',
          minute: '2-digit',
          timeZone: 'Asia/Jerusalem',
        });
        DATA.sun_set = new Date(r.sys.sunset * 1000).toLocaleString('en-GB', {
          hour: '2-digit',
          minute: '2-digit',
          timeZone: 'Asia/Jerusalem',
        });
      });
  }


async function setInstagramPosts() {
    const instagramImages = await puppeteerService.getLatestInstagramPostsFromAccount('israel_picture_', 3);
    DATA.img1 = instagramImages[0];
    DATA.img2 = instagramImages[1];
    DATA.img3 = instagramImages[2];
  }
/**
  * A - We open 'main.mustache'
  * B - We ask Mustache to render our file with the data
  * C - We create a README.md file with the generated output
  */
async function generateReadMe() {
  await fs.readFile(MUSTACHE_MAIN_DIR, (err, data) =>  {
    if (err) throw err;
    const output = render(data.toString(), DATA);
    fs.writeFileSync('README.md', output);
  });
}
async function action() {
    /**
     * Fetch Weather
     */
    await setWeatherInformation();
  
    /**
     * Get pictures
     */
    await setInstagramPosts();
  
    /**
     * Generate README
     */
    await generateReadMe();
  
    /**
     * Fermeture de la boutique 👋
     */
    await puppeteerService.close();
  }
  
  action();