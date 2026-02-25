import { Router } from "express";
import { getAllPosts, getPostBySlug } from "../services/sheetsCms.js";

export const postsRouter = Router();

postsRouter.get("/", async (_req, res) => {
  try {
    const posts = await getAllPosts();

    // Index payload excludes contentHtml to reduce payload size.
    const indexPosts = posts.map(({ contentHtml, ...post }) => post);
    res.json({ posts: indexPosts });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    res.status(500).json({ error: `Unable to fetch posts: ${message}` });
  }
});

postsRouter.get("/:slug", async (req, res) => {
  try {
    const post = await getPostBySlug(req.params.slug);
    if (!post) {
      res.status(404).json({ error: "Post not found" });
      return;
    }

    res.json({ post });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    res.status(500).json({ error: `Unable to fetch post: ${message}` });
  }
});
