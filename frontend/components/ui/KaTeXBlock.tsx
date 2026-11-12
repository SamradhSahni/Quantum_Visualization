"use client";

import React, { useMemo } from "react";
import katex from "katex";

interface KaTeXBlockProps {
  math: string;
  displayMode?: boolean;
  className?: string;
}

export const KaTeXBlock: React.FC<KaTeXBlockProps> = ({
  math,
  displayMode = false,
  className = "",
}) => {
  const rendered = useMemo(() => {
    try {
      const html = katex.renderToString(math, {
        displayMode,
        throwOnError: false,
        strict: "warn",
        trust: false,
        maxSize: 20,
        maxExpand: 100,
      });
      return { ok: true as const, html };
    } catch {
      return { ok: false as const, html: "" };
    }
  }, [math, displayMode]);

  if (!rendered.ok) {
    return (
      <code className={`font-mono text-xs text-amber-300 ${className}`.trim()}>
        {math}
      </code>
    );
  }

  if (displayMode) {
    return (
      <div
        className={`w-full overflow-x-auto overflow-y-hidden ${className}`.trim()}
        dangerouslySetInnerHTML={{ __html: rendered.html }}
      />
    );
  }

  return (
    <span
      className={className}
      dangerouslySetInnerHTML={{ __html: rendered.html }}
    />
  );
};
