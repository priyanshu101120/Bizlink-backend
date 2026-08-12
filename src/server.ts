import app from "./app";
import { env } from "./config/env";

app.listen(env.PORT, () => {
  console.log(`🚀 BizLink backend running on port ${env.PORT}`);
});