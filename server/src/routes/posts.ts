<<<<<<< ours
import { Router } from "express";
import { getAllPosts, getPostBySlug } from "../services/sheetsCms.js";

export const postsRouter = Router();

postsRouter.get("/", async (_req, res) => {
=======
import { Router } from 'express';
import { getAllPosts, getPostBySlug } from '../services/sheetsCms.js';

export const postsRouter = Router();

postsRouter.get('/', async (_req, res) => {
>>>>>>> theirs
  try {
    const posts = await getAllPosts();

    // Index payload excludes contentHtml to reduce payload size.
    const indexPosts = posts.map(({ contentHtml, ...post }) => post);
    res.json({ posts: indexPosts });
  } catch (error) {
<<<<<<< ours
    const message = error instanceof Error ? error.message : "Unknown error";
=======
    const message = error instanceof Error ? error.message : 'Unknown error';
>>>>>>> theirs
    res.status(500).json({ error: `Unable to fetch posts: ${message}` });
  }
});

<<<<<<< ours
postsRouter.get("/:slug", async (req, res) => {
  try {
    const post = await getPostBySlug(req.params.slug);
    if (!post) {
      res.status(404).json({ error: "Post not found" });
=======
postsRouter.get('/:slug', async (req, res) => {
  try {
    const post = await getPostBySlug(req.params.slug);
    if (!post) {
      res.status(404).json({ error: 'Post not found' });
>>>>>>> theirs
      return;
    }

    res.json({ post });
  } catch (error) {
<<<<<<< ours
    const message = error instanceof Error ? error.message : "Unknown error";
=======
    const message = error instanceof Error ? error.message : 'Unknown error';
>>>>>>> theirs
    res.status(500).json({ error: `Unable to fetch post: ${message}` });
  }
});
