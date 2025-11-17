import app from "./app";
import { PORT } from "./config/env";

app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`Ochiga backend running on http://localhost:${PORT}`);
});
