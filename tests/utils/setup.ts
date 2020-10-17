import mongoose from "mongoose";

export const connect = async () => {
    await mongoose.connect(<string>process.env.MONGODB_URL, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        useFindAndModify: false,
    });
    console.log("Connection established.");
};

export const disconnect = async () => {
    await mongoose.connection.close();
};
