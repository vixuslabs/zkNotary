"use client";

import React from "react";

import { GithubIcon } from "lucide-react";

import Link from "next/link";

export default function Footer() {
  return (
    <footer className="flex items-center justify-between h-16 px-4 md:px-6">
      <div className="flex space-x-4">
        <Link
          className="text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-50"
          href="https://github.com/vixuslabs/zkNotary"
        >
          <GithubIcon className="h-6 w-6" />
          <span className="sr-only">Github</span>
        </Link>
      </div>
      <div className="text-sm text-gray-500 dark:text-gray-400">
        An Apache-2.0 Open Source Project.
      </div>
    </footer>
  );
}
