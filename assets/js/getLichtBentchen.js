const LAMBDA = 'https://us-central1-torah-campaigns.cloudfunctions.net/donor-tally';
const SHEET_ID = '1iPVpsf4qmJvukKopHezrSrfIzPSIpBlHaPWOeHhVLm4';

/**
 * Sunrise/sunset script. By Matt Kane. Adopted for NPM use by Alexey Udivankin.
 *
 * Based loosely and indirectly on Kevin Boone's SunTimes Java implementation
 * of the US Naval Observatory's algorithm.
 *
 * Copyright © 2012 Triggertrap Ltd. All rights reserved.
 *
 * This library is free software; you can redistribute it and/or modify it under the terms of the GNU Lesser General
 * Public License as published by the Free Software Foundation; either version 2.1 of the License, or (at your option)
 * any later version.
 *
 * This library is distributed in the hope that it will be useful,but WITHOUT ANY WARRANTY; without even the implied
 * warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU Lesser General Public License for more
 * details.
 * You should have received a copy of the GNU Lesser General Public License along with this library; if not, write to
 * the Free Software Foundation, Inc., 51 Franklin Street, Fifth Floor, Boston, MA  02110-1301  USA,
 * or connect to: http://www.gnu.org/licenses/old-licenses/lgpl-2.1.html
 */


/**
 * Default zenith
 */
const DEFAULT_ZENITH = 90.8333;

/**
 * Degrees per hour
 */
const DEGREES_PER_HOUR = 360 / 24;

/**
 * Msec in hour
 */
const MSEC_IN_HOUR = 60 * 60 * 1000;

/**
 * Msec in day
 */
const MSEC_IN_DAY = 8.64e7;

/**
 * Get day of year
 */
function getDayOfYear(date) {
  return Math.ceil(
    (date.getTime() - new Date(date.getFullYear(), 0, 1).getTime()) /
      MSEC_IN_DAY
  );
}

/**
 * Get sin of value in deg
 */
function sinDeg(deg) {
  return Math.sin((deg * 2.0 * Math.PI) / 360.0);
}

/**
 * Get acos of value in deg
 */
function acosDeg(x) {
  return (Math.acos(x) * 360.0) / (2 * Math.PI);
}

/**
 * Get asin of value in deg
 */
function asinDeg(x) {
  return (Math.asin(x) * 360.0) / (2 * Math.PI);
}

/**
 * Get tan of value in deg
 */
function tanDeg(deg) {
  return Math.tan((deg * 2.0 * Math.PI) / 360.0);
}

/**
 * Get cos of value in deg
 */
function cosDeg(deg) {
  return Math.cos((deg * 2.0 * Math.PI) / 360.0);
}

/**
 * Get ramainder
 */
function mod(a, b) {
  const result = a % b;

  return result < 0 ? result + b : result;
}

/**
 * Calculate Date for either sunrise or sunset
 */
function calculate(latitude, longitude, isSunrise, zenith, date) {
  const dayOfYear = getDayOfYear(date);
  const hoursFromMeridian = longitude / DEGREES_PER_HOUR;
  const approxTimeOfEventInDays = isSunrise
    ? dayOfYear + (6 - hoursFromMeridian) / 24
    : dayOfYear + (18.0 - hoursFromMeridian) / 24;

  const sunMeanAnomaly = 0.9856 * approxTimeOfEventInDays - 3.289;
  const sunTrueLongitude = mod(
    sunMeanAnomaly +
      1.916 * sinDeg(sunMeanAnomaly) +
      0.02 * sinDeg(2 * sunMeanAnomaly) +
      282.634,
    360
  );
  const ascension = 0.91764 * tanDeg(sunTrueLongitude);

  let rightAscension;
  rightAscension = (360 / (2 * Math.PI)) * Math.atan(ascension);
  rightAscension = mod(rightAscension, 360);

  const lQuadrant = Math.floor(sunTrueLongitude / 90) * 90;
  const raQuadrant = Math.floor(rightAscension / 90) * 90;
  rightAscension = rightAscension + (lQuadrant - raQuadrant);
  rightAscension /= DEGREES_PER_HOUR;

  const sinDec = 0.39782 * sinDeg(sunTrueLongitude);
  const cosDec = cosDeg(asinDeg(sinDec));
  const cosLocalHourAngle =
    (cosDeg(zenith) - sinDec * sinDeg(latitude)) / (cosDec * cosDeg(latitude));

  const localHourAngle = isSunrise
    ? 360 - acosDeg(cosLocalHourAngle)
    : acosDeg(cosLocalHourAngle);

  const localHour = localHourAngle / DEGREES_PER_HOUR;
  const localMeanTime =
    localHour + rightAscension - 0.06571 * approxTimeOfEventInDays - 6.622;
  const time = mod(localMeanTime - longitude / DEGREES_PER_HOUR, 24);
  const utcMidnight = Date.UTC(
    date.getFullYear(),
    date.getMonth(),
    date.getDate()
  );

  // Created date will be set to local (system) time zone.
  return new Date(utcMidnight + time * MSEC_IN_HOUR);
}

/**
 * Calculate Sunrise time for given longitude, latitude, zenith and date
 */
function getSunrise(latitude, longitude, date = new Date()) {
  return calculate(latitude, longitude, true, DEFAULT_ZENITH, date);
}

/**
 * Calculate Sunset time for given longitude, latitude, zenith and date
 */
function getSunset(latitude, longitude, date = new Date()) {
  return calculate(latitude, longitude, false, DEFAULT_ZENITH, date);
}

function getNextFriday() {
  const today = new Date();
  const dayOfWeek = today.getDay();
  const daysUntilFriday = (5 - dayOfWeek + 7) % 7;

  today.setDate(today.getDate() + daysUntilFriday);
  return today;
}

const getUpcomingSunset = () => {
  const LATITUDE = 41.268871;
  const LONGITUDE = -75.890617;

  const friday = getNextFriday();

  return getSunset(LATITUDE, LONGITUDE, friday);
};

function getUpcomingKingstonLichtBentchen() {

  sunset.setMinutes(sunset.getMinutes() - 18);

  return new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).format(sunset);
}

const formatTime = (date) => {
  return new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).format(date);
}

const candleLighting = (date) => {
  date.setMinutes(date.getMinutes() - 18)
  return formatTime(roundTo5(date));
}

const roundTo5 = (date) => {
  return date.setMinutes(Math.round(date.getMinutes() / 5) * 5);
}

const kabolasShabbos = () => {
  const date = getUpcomingSunset();
  date.setMinutes(date.getMinutes() + 25);
  return formatTime(roundTo5(date));
}

const shabbosMincha = () => {
  const date = getUpcomingSunset();
  date.setMinutes(date.getMinutes() - 25)
  return formatTime(roundTo5(date));
}

const loadDonorData = async () => {
  const url = `${LAMBDA}?id=${SHEET_ID}`;
let data;
  try {
     const res = await fetch(url);
     data = await res.json();    
  } catch (error) {
    
  }
  document.getElementById('kiddush-sponsor').innerHTML = data.values[0][1];
}

function setPageTimes() {
  const sunset = getUpcomingSunset();
  const candleLightingTime = candleLighting(sunset);
  const kabolasShabbosTime = kabolasShabbos(sunset);
  const shabbosMinchaTime = shabbosMincha(sunset);
  document.getElementById("licht-time").innerHTML = candleLightingTime;
  document.getElementById("ks-time").innerHTML = kabolasShabbosTime;
  document.getElementById("shabbos-mincha-time").innerHTML = shabbosMinchaTime;
  loadDonorData();
  document.getElementById("parsha-name").innerHTML = getHebInfo(getNextFriday()).occasion;
}

setPageTimes();
