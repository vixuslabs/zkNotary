"use client";

import React from "react";

import { Button } from "@/components/ui/button";

import { Textarea } from "@/components/ui/textarea";

const DUMMY_DATA = {
  test1: "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
  test2: "Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
  test3:
    "Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.",
  test4:
    "Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.",
  test5:
    "Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.",
  test6: "Curabitur pretium tincidunt lacus. Nulla gravida orci a odio.",
  test7:
    "Integer in mauris eu nibh euismod gravida. Duis ac tellus et risus vulputate vehicula.",
  test8:
    "Donec lobortis risus a elit. Etiam tempor. Ut ullamcorper, ligula eu tempor congue, eros est euismod turpis, id tincidunt sapien risus a quam.",
  test9:
    "Suspendisse ac efficitur metus. Suspendisse maximus rhoncus euismod. Pellentesque a enim eget eros posuere tincidunt. Nullam nec tortor vel tortor faucibus ultricies quis eget velit. Sed auctor, libero eget fringilla convallis, leo ex cursus turpis, eu finibus mauris nibh sed ligula. Proin auctor enim ipsum, vel feugiat tellus rhoncus at. Mauris vitae volutpat mauris.",
  test10:
    "Sed auctor, libero eget fringilla convallis, leo ex cursus turpis, eu finibus mauris nibh sed ligula. Proin auctor enim ipsum, vel feugiat tellus rhoncus at. Mauris vitae volutpat mauris.",
};

export default function RawDataContainer() {
  return (
    <Textarea
      disabled
      className="w-full p-4 border border-gray-300 dark:border-gray-700 rounded-lg my-auto min-h-[calc(520px-36px)] h-full"
      value={JSON.stringify(DUMMY_DATA, null, 2)}
    />
  );
}
