import mongoose, { Connection } from "mongoose";

const getMongooseConnection = async (): Promise<Connection> => {
    await mongoose.connect(<string>process.env.MONGODB_URL, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        useFindAndModify: false,
    });
    const { connection } = mongoose;
    console.log("Database connection opened.");
    connection.on("error", (err: any) => console.log(err));
    connection.on("close", () => console.log("Database connection closed."));
    return connection;
};

export default getMongooseConnection;
