-- Migration: 20261026000000_add_cover_image_to_blog_posts.sql
-- Description: Add cover_image column to blog_posts table

ALTER TABLE public.blog_posts 
  ADD COLUMN IF NOT EXISTS cover_image TEXT;
