import dotenv from "dotenv";
import app from "./app";
dotenv.config();

/* SERVER */
const port = process.env.PORT || 3002;
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
