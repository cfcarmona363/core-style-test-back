import "dotenv/config";
const app = require("./api/index");

// Local development server
if (process.env.NODE_ENV !== "production" && require.main === module) {
  const PORT = Number(process.env.PORT) || 3000;
  app.listen(PORT, () => {
    console.log(`Mail service listening on port ${PORT}`);
  });
}
