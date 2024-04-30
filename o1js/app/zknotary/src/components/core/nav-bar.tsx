"use client";

import * as React from "react";
import { useExamplesStore } from "@/stores/examples-store";
import { Button } from "../ui/button";

import { ChevronDownIcon } from "@radix-ui/react-icons";

import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function NavBar() {
  const {
    setActive,
    active,
    examples: storeExamples,
  } = useExamplesStore((state) => state);

  console.log("active", active);

  return (
    <div className="flex gap-x-4 items-center justify-center">
      <Button variant="ghost" onClick={() => setActive(null)}>
        Home
      </Button>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost">
            Examples <ChevronDownIcon className="ml-1" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          {storeExamples.map((example) => (
            <DropdownMenuCheckboxItem
              key={example}
              checked={active === example}
              onCheckedChange={(checked) => {
                if (checked) {
                  setActive(example);
                }
              }}
            >
              {example.charAt(0).toUpperCase() + example.slice(1)}
            </DropdownMenuCheckboxItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
