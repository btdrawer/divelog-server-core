import mongoose, { Connection } from "mongoose";

const getMongooseConnection = async (): Promise<Connection> => {
    await mongoose.connect(<string>process.env.MONGODB_URL, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        useFindAndModify: false,
    });
    const { connection } = mongoose;
    connection.on("error", (err: any) => console.log(err));
    return connection;
};

export default getMongooseConnection;
