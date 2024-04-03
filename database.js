import mongoose from "mongoose";

const uri =
  "mongodb+srv://prueba:prueba@cluster0.noyz2br.mongodb.net/Resilencia";

export const connectDB = async () => {
  try {
    const db = await mongoose.connect(uri);
    console.log(`Base de datos conectada: ${db.connection.name}`);
  } catch (error) {
    console.log(`Error al conectar a la base de datos: ${error.message}`);
  }
};
