const cron = require('node-cron');
const axios = require('axios');
const Helper = require('./helper');

const categoryList = ['small', 'medium', 'big', 'large'];
const carparkCategoryMap = new Map();
// Default carpark available info
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
  cron.schedule('* * * * *', async () => {
    const result = await axios.get(
      `https://api.data.gov.sg/v1/transport/carpark-availability`
    );

    if (result.status === 200) {
      const carparkList = result.data.items[0].carpark_data;

      carparkList.map((item) => {
        const carparkInfo = item.carpark_info;

        // Count the sum of two fields
        const lotsInfo = carparkInfo.reduce(
          (count, lot) => {
            count.totalLots += +lot.total_lots;
            count.lotsAvailable += +lot.lots_available;

            return count;
          },
          { totalLots: 0, lotsAvailable: 0 }
        );

        const category = Helper.getCategory(lotsInfo.totalLots);

        // Check if hashmap contains the category
        if (!carparkCategoryMap.has(category)) {
          carparkAvailableInfo.lowest.lots_available = lotsInfo.totalLots; // Set min = total lots to compare
          carparkCategoryMap.set(category, carparkAvailableInfo);
        }

        // Min and max comparators
        const comparator = { ...carparkCategoryMap.get(category) };
        let maxCarparkNumber = comparator.highest.carpark_number;
        let maxLotsAvailable = comparator.highest.lots_available;
        let minCarparkNumber = comparator.lowest.carpark_number;
        let minLotsAvailable = comparator.lowest.lots_available;

        // If current lots available is greater than max lots available
        if (lotsInfo.lotsAvailable > maxLotsAvailable) {
          maxLotsAvailable = lotsInfo.lotsAvailable;
          maxCarparkNumber = [];
        }

        // If current lots available is equal to max lots available
        if (lotsInfo.lotsAvailable === maxLotsAvailable) {
          if (maxCarparkNumber.indexOf(item.carpark_number) === -1) {
            maxCarparkNumber.push(item.carpark_number);
          }
        }

        // If current lots available is less than min lots available
        if (lotsInfo.lotsAvailable < minLotsAvailable) {
          minLotsAvailable = lotsInfo.lotsAvailable;
          minCarparkNumber = [];
        }

        // If current lots available is equal to lots available
        if (lotsInfo.lotsAvailable === minLotsAvailable) {
          if (minCarparkNumber.indexOf(item.carpark_number) === -1) {
            minCarparkNumber.push(item.carpark_number);
          }
        }

        // Save the updated values into hashmap
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

      // Rearrange the display order based on size
      categoryList.map((size) => {
        carparkUpdate.push({ ...carparkCategoryMap.get(size), name: size });
      });

      // Send the updated values to the frontend
      io.emit('updated', carparkUpdate);
    } else {
      console.log('Error');
    }
  });
}

module.exports = cron_service;
