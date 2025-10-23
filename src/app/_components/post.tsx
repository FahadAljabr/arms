"use client";

import { useState } from "react";

import { api } from "~/trpc/react";

export function LatestPost() {
  const [latestPost] = api.post.getLatest.useSuspenseQuery();

  const utils = api.useUtils();
  const [roleName, setRoleName] = useState("");
  const createPost = api.post.create.useMutation({
    onSuccess: async () => {
      await utils.post.invalidate();
      setRoleName("");
    },
  });

  return (
    <div className="w-full max-w-xs">
      {latestPost ? (
        <p className="truncate">Your most recent role: {latestPost.roleName}</p>
      ) : (
        <p>No roles created yet.</p>
      )}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (!roleName.trim()) return;
          createPost.mutate({ roleName });
        }}
        className="flex flex-col gap-2"
      >
        <input
          type="text"
          placeholder="Role name"
          value={roleName}
          onChange={(e) => setRoleName(e.target.value)}
          className="w-full rounded-full bg-white/10 px-4 py-2 text-white"
        />
        <button
          type="submit"
          className="rounded-full bg-white/10 px-10 py-3 font-semibold transition hover:bg-white/20"
          disabled={createPost.isPending}
        >
          {createPost.isPending ? "Submitting..." : "Submit"}
        </button>
      </form>
    </div>
  );
}
