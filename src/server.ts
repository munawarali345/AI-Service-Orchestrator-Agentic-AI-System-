import "dotenv/config";
import app from "./app.js";



// server listening port
const Port = process.env.Port || 5000
app.listen(Port, () => {
    console.log(`server is Running on Port ${Port}`);
});
