/**
 * Supabase Storage helpers for photos + scripts
 * Uses @supabase/supabase-js (storage module from supabase/storage)
 */
(function (global) {
  "use strict";

  let client = null;

  function isConfigured() {
    const cfg = global.SUPABASE_CONFIG || {};
    return Boolean(cfg.url && cfg.anonKey && global.supabase?.createClient);
  }

  function getClient() {
    if (!isConfigured()) return null;
    if (client) return client;
    const { url, anonKey } = global.SUPABASE_CONFIG;
    client = global.supabase.createClient(url, anonKey);
    return client;
  }

  function bucket(name) {
    const cfg = global.SUPABASE_CONFIG;
    return cfg.buckets?.[name] || name;
  }

  function publicUrl(bucketName, path) {
    const sb = getClient();
    if (!sb) return "";
    const { data } = sb.storage.from(bucket(bucketName)).getPublicUrl(path);
    return data?.publicUrl || "";
  }

  async function listFiles(bucketName) {
    const sb = getClient();
    if (!sb) return { data: [], error: new Error("Supabase not configured") };

    const { data, error } = await sb.storage
      .from(bucket(bucketName))
      .list("", { limit: 100, sortBy: { column: "created_at", order: "desc" } });

    if (error) return { data: [], error };

    const files = (data || [])
      .filter((f) => f.name && !f.name.startsWith(".") && f.id)
      .map((f) => ({
        id: f.id || f.name,
        name: f.name,
        path: f.name,
        size: f.metadata?.size,
        updatedAt: f.updated_at || f.created_at,
        src: publicUrl(bucketName, f.name),
      }));

    return { data: files, error: null };
  }

  async function uploadFile(bucketName, file) {
    const sb = getClient();
    if (!sb) return { data: null, error: new Error("Supabase not configured") };

    const safeName = file.name.replace(/[^\w.\-()+ ]+/g, "_");
    const path = `${Date.now()}-${safeName}`;

    const { data, error } = await sb.storage
      .from(bucket(bucketName))
      .upload(path, file, {
        cacheControl: "3600",
        upsert: false,
        contentType: file.type || undefined,
      });

    if (error) return { data: null, error };

    return {
      data: {
        path: data.path,
        name: file.name,
        src: publicUrl(bucketName, data.path),
      },
      error: null,
    };
  }

  async function removeFile(bucketName, path) {
    const sb = getClient();
    if (!sb) return { error: new Error("Supabase not configured") };
    const { error } = await sb.storage.from(bucket(bucketName)).remove([path]);
    return { error };
  }

  async function downloadText(bucketName, path) {
    const sb = getClient();
    if (!sb) return { data: "", error: new Error("Supabase not configured") };
    const { data, error } = await sb.storage.from(bucket(bucketName)).download(path);
    if (error) return { data: "", error };
    const text = await data.text();
    return { data: text, error: null };
  }

  async function downloadBlobUrl(bucketName, path) {
    const sb = getClient();
    if (!sb) return { data: "", error: new Error("Supabase not configured") };
    const { data, error } = await sb.storage.from(bucket(bucketName)).download(path);
    if (error) return { data: "", error };
    return { data: URL.createObjectURL(data), error: null };
  }

  global.PortfolioStorage = {
    isConfigured,
    listFiles,
    uploadFile,
    removeFile,
    downloadText,
    downloadBlobUrl,
  };
})(window);
