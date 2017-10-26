const path = require("path");
const fs = require("fs");
const ini = require("ini");

let credentials = function(file) {
  // If it starts with ~, substitute the user's home directory
  if (file.indexOf("~") === 0) {
    const homePath =
      process.env[process.platform == "win32" ? "USERPROFILE" : "HOME"];
    file = path.join(homePath, file.substring(2));
  }
  this.file = file;
};

credentials.prototype.get = (section, callback) => {
  section = section || "default";

  return new Promise((resolve, reject) => {
    function error(err) {
      if (typeof callback === "function") {
        return callback(err, null);
      }
      return reject(err);
    }
    fs.readFile(this.file, "utf-8", function(err, data) {
      if (err) {
        return error(err);
      }

      let config = ini.parse(data);

      // Does the section exist?
      config = config[section];

      if (!config) {
        return error(new Error("Unable to find the account '" + section + "'"));
      }

      if (typeof callback === "function") {
        return callback(null, config);
      }

      return resolve(config);
    });
  });
};

module.exports = credentials;
