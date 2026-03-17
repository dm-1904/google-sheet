import dotenv from 'dotenv';
import { generateStaticBlogPages } from '../services/staticBlogGenerator.js';

dotenv.config();

const run = async () => {
  const result = await generateStaticBlogPages();
  console.log(
    `Static blog generation complete. Posts: ${result.postCount}, categories: ${result.categoryCount}, output: ${result.outputDir}`,
  );
};

run().catch((error) => {
  console.error('Failed to generate static blog pages:', error);
  process.exitCode = 1;
});
