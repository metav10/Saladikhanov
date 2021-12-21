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
        if(!r) throw new Error("response is undefind");
        const { weather, main: { temp }, sys: { sunrise, sunset}} = r;
        const { description, icon } = weather[0];
     
        if(!description || !icon || !temp || !sunrise || !sunset) throw new Error("some data is undefind");;
         
        const timezonePreset = {
          hour: '2-digit',
          minute: '2-digit',
          timeZone: 'Asia/Jerusalem',
        };
        const sun_rise = new Date(sunrise * 1000).toLocaleString('en-GB', timezonePreset);
        const sun_set = new Date(sunset * 1000).toLocaleString('en-GB', timezonePreset);
     
        const data = {
         city_temperature: Math.round(temp),
         city_weather: description,
         city_weather_icon: icon,
         sun_rise,
         sun_set
        }
        DATA = { ...DATA, ...data };
      }).catch(error => {
        console.log(error.message);
      });
  }


async function setInstagramPosts() {
  try {
     const instagramImages = await puppeteerService.getLatestInstagramPostsFromAccount('israel', 3);
     DATA.img1 = instagramImages[0];
     DATA.img2 = instagramImages[1];
     DATA.img3 = instagramImages[2];
  } catch (error) {
    console.log(error.message);
  }
}
/**
  * A - We open 'main.mustache'
  * B - We ask Mustache to render our file with the data
  * C - We create a README.md file with the generated output
  */
async function generateReadMe() {
 try {
  await fs.readFile(MUSTACHE_MAIN_DIR, (err, data) =>  {
    if (err) throw err;
    const output = render(data.toString(), DATA);
    fs.writeFileSync('README.md', output);
  });
 } catch (error) {
    console.log(error.message);
  }
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
