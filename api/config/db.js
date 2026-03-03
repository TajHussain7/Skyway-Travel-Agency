import connectMongoDB, { getConnectionStatus } from "./mongodb.js";

const connectDB = async () => {
  try {
    await connectMongoDB();
  } catch (error) {
    throw error;
  }
};

export default connectDB;
export { getConnectionStatus };
