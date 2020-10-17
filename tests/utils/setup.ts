import mongoose from "mongoose";

export const connect = async (done: any) => {
    await mongoose.connect(<string>process.env.MONGODB_URL, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        useFindAndModify: false,
    });
    console.log("Connection established.");
    done();
};

export const disconnect = async (done: any) => {
    await mongoose.connection.close();
    console.log("Connection closed.");
    done();
};
