import mongoose, { Connection } from "mongoose";

const getMongooseConnection = async (): Promise<Connection> => {
    await mongoose.connect(<string>process.env.MONGODB_URL, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        useFindAndModify: false,
    });
    console.log("Database connection opened.");
    return mongoose.connection;
};

export default getMongooseConnection;
