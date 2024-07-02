const mongoose = require("mongoose");

const connectDB = async () => {     
  const dbUri = process.env.DATABASE_URI;
  
  try {
    // mongodb connection string
    const con = await mongoose.connect(dbUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,  
    });

    console.log(`MongoDB connected : ${con.connection.host}`);
  } catch (err) {
    console.log(err);
    process.exit(1);
  }
};

module.exports = connectDB;
