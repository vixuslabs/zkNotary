"use client";

import React, { useEffect, useState } from "react";

import { Textarea } from "@/components/ui/textarea";
import { useExamplesStore, NotorizedRawData } from "@/stores/examples-store";

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

const stringifiedDummyData = JSON.stringify(DUMMY_DATA, null, 2);

export default function VerifiedDataContainer() {
  const { verifiedData, active } = useExamplesStore((state) => state);
  const [jsonData, setJsonData] = useState<string>(stringifiedDummyData);

  useEffect(() => {
    switch (active) {
      case "etherscan":
        // let etherscanJson = JSON.stringify(verifiedData.etherscan, null, 2);
        setJsonData(verifiedData.etherscan ?? "");
        break;
      case "github":
        // let json = JSON.stringify(verifiedData.github, null, 2);
        setJsonData(verifiedData.github ?? "");
        break;
      default:
        setJsonData("");
        break;
    }

    // if (active === "etherscan")
    //   setJsonData(JSON.stringify(notorizedData.etherscan, null, 2) as string);
    // if (active === "github") setJsonData(notorizedData.github);
    //
    // setJsonData(JSON.stringify(DUMMY_DATA, null, 2) as string);
  }, [verifiedData, active]);

  return (
    <Textarea
      disabled
      className="w-full p-4 border border-gray-300 dark:border-gray-700 rounded-lg my-auto min-h-[calc(520px-36px)] max-h-[calc(520px-36px)] h-full"
      value={jsonData}
    />
  );
}
