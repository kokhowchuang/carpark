const cron = require('node-cron');
const axios = require('axios');
const Helper = require('./helper');

const categoryList = ['small', 'medium', 'big', 'large'];
const carparkCategoryMap = new Map();
const carparkAvailableInfo = {
  highest: {
    carpark_number: [],
    lots_available: 0,
  },
  lowest: {
    carpark_number: [],
    lots_available: 0,
  },
};

function cron_service(io) {
  cron.schedule('*/1 * * * * *', async () => {
    const now = new Date().toISOString();

    const result = await axios.get(
      `https://api.data.gov.sg/v1/transport/carpark-availability`
    );

    if (result.status === 200) {
      const carparkList = result.data.items[0].carpark_data;

      carparkList.map((item) => {
        const carparkInfo = item.carpark_info;

        const lotsInfo = carparkInfo.reduce(
          (count, lot) => {
            count.totalLots += +lot.total_lots;
            count.lotsAvailable += +lot.lots_available;

            return count;
          },
          { totalLots: 0, lotsAvailable: 0 }
        );

        const category = Helper.getCategory(lotsInfo.totalLots);

        if (!carparkCategoryMap.has(category)) {
          carparkAvailableInfo.lowest.lots_available = lotsInfo.totalLots;
          carparkCategoryMap.set(category, carparkAvailableInfo);
        }

        const comparator = { ...carparkCategoryMap.get(category) };
        let maxCarparkNumber = comparator.highest.carpark_number;
        let maxLotsAvailable = comparator.highest.lots_available;
        let minCarparkNumber = comparator.lowest.carpark_number;
        let minLotsAvailable = comparator.lowest.lots_available;

        if (lotsInfo.lotsAvailable > maxLotsAvailable) {
          maxLotsAvailable = lotsInfo.lotsAvailable;
          maxCarparkNumber = [item.carpark_number];
        }

        if (lotsInfo.lotsAvailable === maxLotsAvailable) {
          if (maxCarparkNumber.indexOf(item.carpark_number) === -1) {
            maxCarparkNumber.push(item.carpark_number);
          }
        }

        if (lotsInfo.lotsAvailable < minLotsAvailable) {
          minLotsAvailable = lotsInfo.lotsAvailable;
          minCarparkNumber = [item.carpark_number];
        }

        if (lotsInfo.lotsAvailable === minLotsAvailable) {
          if (minCarparkNumber.indexOf(item.carpark_number) === -1) {
            minCarparkNumber.push(item.carpark_number);
          }
        }

        const param = {
          ...comparator,
          highest: {
            lots_available: maxLotsAvailable,
            carpark_number: maxCarparkNumber,
          },
          lowest: {
            lots_available: minLotsAvailable,
            carpark_number: minCarparkNumber,
          },
        };
        carparkCategoryMap.set(category, param);
        console.log(carparkCategoryMap.get(category));
      });

      const carparkUpdate = [];

      categoryList.map((item) => {
        carparkUpdate.push({ ...carparkCategoryMap.get(item), name: item });
      });

      io.emit('updated', carparkUpdate);
    }
  });
}

module.exports = cron_service;
