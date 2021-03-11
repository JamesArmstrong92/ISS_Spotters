const request = require('request');

const nextISSTimesForMyLocation = function(callback) {
  
  const fetchMyIP = function(callback) {
    let url = `https://api64.ipify.org?format=json`;
    request(url, (error, response, body) => {
      
      if (error) {
        callback(error, null);
        return;
      }
      if (response.statusCode !== 200) {
        const msg = `Status Code ${response.statusCode} when fetching IP. Response: ${body}`;
        callback(Error(msg), null);
        return;
      }
      const ip = JSON.parse(body);
      callback(null, ip.ip);
    });
  };
  
  const fetchCoordsByIP = function(ip, callback) {
    let url = `https://freegeoip.app/json/${ip}`;
  
    request(url, (error, response, body) => {
      
      if (error) {
        callback(error, null);
        return;
      }
      if (response.statusCode !== 200) {
        const msg = `Status Code ${response.statusCode} when fetching coords. Response: ${body}`;
        callback(Error(msg), null);
        return;
      }
      let longitude = JSON.parse(body).longitude;
      let latitude  = JSON.parse(body).latitude;
      let city      = JSON.parse(body).city;
      let longLat   = { longitude, latitude, city };
      
      callback(error, longLat);
    });
  };
  
  const fetchISSFlyOverTimes = function(longLat, callback) {
    let url = `http://api.open-notify.org/iss-pass.json?lat=${longLat.latitude}&lon=${longLat.longitude}`;
    request(url, (error, response, body) => {
      if (error) {
        callback(error, null);
        return;
      }
      if (response.statusCode !== 200) {
        const msg = `Status Code ${response.statusCode} when fetching flyover. Response: ${body}`;
        callback(Error(msg), null);
        return;
      }
  
      let flyOver = JSON.parse(body).response;
      
      callback(error, flyOver);
    });
  };
  fetchMyIP((error, ip) => {
    if (error) {
      console.log("It didn't work!" , error);
      return;
    }
    fetchCoordsByIP(ip, (error, coordinates) => {
      if (error) {
        console.log("It didn't work!" , error);
      }
      fetchISSFlyOverTimes(coordinates,(error, flyOver) => {
        if (error) {
          console.log("It didn't work!" , error);
        }
        for (const pass of flyOver) {
          const datetime = new Date(0);
          datetime.setUTCSeconds(pass.risetime);
          const duration = pass.duration;
          console.log(`Next pass at ${datetime} for ${duration} seconds!`);
        }
      });
    });
  });
};







module.exports = { nextISSTimesForMyLocation };
