import mongoose from "mongoose";

const uri =
  "mongodb+srv://prueba:prueba@cluster0.noyz2br.mongodb.net/Resilencia";

export const connectDB = async () => {
  try {
    const db = await mongoose.connect(uri);
    console.log(`Connected BaseData: ${db.connection.name}`);
  } catch (error) {
    console.log(`Error connecting to dataBase: ${error.message}`);
  }
};
