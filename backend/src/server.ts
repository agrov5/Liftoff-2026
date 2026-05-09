import app from './app';
import { connectDB } from './config/database';

const PORT = process.env.PORT || 3000;

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Periodic Language API running on port ${PORT}`);
  });
});
