const mongoose = require("mongoose");
const initData = require("./data.js");
const Listing = require("../models/listing.js");

main()
  .then(() => {
    console.log("Database Connected");
  })
  .catch((err) => {
    console.log(err);
  });

async function main() {
  await mongoose.connect("mongodb://127.0.0.1:27017/WonderLust");
}

const initDB = async () => {
  await Listing.deleteMany({});

  const data = initData.data.map((obj) => ({
    ...obj,
    owner: new mongoose.Types.ObjectId("6a4d18e88b01b05808ce359c"),
  }));

  await Listing.insertMany(data);

  console.log("Data Saved Successfully");
  mongoose.connection.close();
};

initDB();
