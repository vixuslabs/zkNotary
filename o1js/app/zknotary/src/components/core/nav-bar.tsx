"use client";

import React, { useState } from "react";
import { useExamplesStore } from "@/stores/examples-store";
import { MotionConfig, motion } from "framer-motion";

import { cn } from "@/lib/utils";

const navBarExamples = ["Home", "Github", "Etherscan"];

export function NavBar() {
  const { setActive, active } = useExamplesStore((state) => state);

  const [activeItem, setActiveItem] = useState<string>("Home");

  return (
    <div className="flex gap-x-4 items-center justify-center">
      <MotionConfig transition={{ type: "spring", bounce: 0, duration: 0.4 }}>
        <motion.ul
          onMouseLeave={() => {
            switch (active) {
              case null:
                setActiveItem("Home");
                break;
              case "github":
                setActiveItem("Github");
                break;
              case "etherscan":
                setActiveItem("Etherscan");
                break;
              default:
                break;
            }
          }}
          layout
          className="mx-auto flex w-fit gap-2 justify-center"
        >
          {navBarExamples.map((item) => (
            <motion.li
              layout
              className={cn(
                "relative cursor-pointer px-3 py-2 text-sm outline-none transition-colors",
                activeItem === item ? "text-gray-800" : "text-gray-700"
              )}
              tabIndex={0}
              key={item}
              onFocus={() => setActiveItem(item)}
              onMouseOver={() => setActiveItem(item)}
              onClick={() => {
                switch (item) {
                  case "Home":
                    setActive(null);
                    break;
                  case "Github":
                    setActive("github");
                    break;
                  case "Etherscan":
                    setActive("etherscan");
                    break;
                  default:
                    break;
                }
              }}
            >
              {activeItem === item ? (
                <motion.div
                  layoutId="tab-indicator"
                  className="absolute inset-0 rounded-lg bg-black/5"
                />
              ) : null}
              <span className="relative text-inherit">{item}</span>
            </motion.li>
          ))}
        </motion.ul>
      </MotionConfig>
    </div>
  );
}
