const { Sedra, HDate, HebrewCalendar } = require('@hebcal/core');
const sedraMap = {}

const getSedra = (hYear) => {
  if (!sedraMap[hYear]) {
    sedraMap[hYear] = new Sedra(hYear);
  }
  return sedraMap[hYear];
}

const CHAG_FLAG = 1;

const isYomTov = (holidays) => {
  if (!holidays || !holidays.length) return false;
  return holidays.some(h => {
    const flags = h.getFlags();
    return flags & CHAG_FLAG;
  });
}

const getHebInfo = (originDate) => {
  let date;
  try {
    date = new HDate(originDate);
  } catch (error) {
    console.error(error);
    return { hebDate: '', occasion: '' };
  }
  
  const sedra = getSedra(date.getFullYear());
  const parsha = sedra.getString(date).replace('Parashat ', '');
  const holidays = HebrewCalendar.getHolidaysOnDate(date);

  const hebDate = `${date.getDate()} ${date.getMonthName()}`;

  const occasion = isYomTov(holidays) ? holidays[0].desc : parsha;
  return { hebDate, occasion };
}

window.getHebInfo = getHebInfo;

module.exports = getHebInfo;
