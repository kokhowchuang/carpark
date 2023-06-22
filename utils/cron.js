const cron = require('node-cron');
const axios = require('axios');
const Helper = require('./helper');

function cron_service(io) {
  cron.schedule('*/1 * * * * *', async () => {
    const now = new Date().toISOString();

    const result = await axios.get(
      `https://api.data.gov.sg/v1/transport/carpark-availability?date_time=${now}`
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

        console.log(category);
      });
    }
  });
}

function findMinMax() {}

module.exports = cron_service;
