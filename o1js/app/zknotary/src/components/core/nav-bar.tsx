"use client";

import * as React from "react";
import Link from "next/link";

import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  navigationMenuTriggerStyle,
  NavigationMenuContent,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import { cn } from "@/lib/utils";
import { usePathname, useSearchParams } from "next/navigation";
import { useRouter } from "next/navigation";
import { useExamplesStore } from "../examples-store";

type ExamplesMenuContext = {
  title: string;
  description: string;
};

const examples: ExamplesMenuContext[] = [
  {
    title: "GitHub",
    description:
      "A demo where you can verify the history of a user's repositories",
  },
  {
    title: "Discord",
    description:
      "A demo where you can verify the history of a user's conversation history",
  },
];

export function NavBar() {
  const {
    setActive,
    active,
    examples: storeExamples,
  } = useExamplesStore((state) => state);
  const searchParams = useSearchParams();
  const createQueryString = React.useCallback(
    (name: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set(name, value);

      return params.toString();
    },
    [searchParams]
  );

  return (
    <NavigationMenu>
      <NavigationMenuList>
        <NavigationMenuItem>
          <NavigationMenuLink className={navigationMenuTriggerStyle()}>
            Home
          </NavigationMenuLink>
        </NavigationMenuItem>

        <NavigationMenuItem>
          <NavigationMenuTrigger>Examples</NavigationMenuTrigger>
          <NavigationMenuContent>
            <ul className="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2 lg:w-[600px] ">
              {examples.map((example, i) => (
                <ListItem
                  createQueryString={createQueryString}
                  key={example.title}
                  title={example.title}
                  example={i === 0 ? "github" : "discord"}
                >
                  {example.description}
                </ListItem>
              ))}
            </ul>
          </NavigationMenuContent>
        </NavigationMenuItem>
      </NavigationMenuList>
    </NavigationMenu>
  );
}

// <NavigationMenuItem>
//   <NavigationMenuTrigger>Examples</NavigationMenuTrigger>
//   <NavigationMenuContent>
//     <ul className="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2 lg:w-[600px] ">
//       {examples.map((example) => (
//         <ListItem
//           createQueryString={createQueryString}
//           key={example.title}
//           title={example.title}
//         >
//           {example.description}
//         </ListItem>
//       ))}
//     </ul>
//   </NavigationMenuContent>
// </NavigationMenuItem>

interface ListItemProps extends React.ComponentPropsWithoutRef<"button"> {
  example: string;
  createQueryString: (name: string, value: string) => string;
}

// Wanted to see how it would work with searchParams, simply not needed
const ListItem = React.forwardRef<React.ElementRef<"button">, ListItemProps>(
  (
    { createQueryString, className, title, children, example, ...props },
    ref
  ) => {
    const pathname = usePathname();
    const router = useRouter();

    return (
      <li>
        <NavigationMenuLink asChild>
          <button
            ref={ref}
            className={cn(
              "block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
              className
            )}
            onClick={() => {
              router.push(
                pathname + "?" + createQueryString("example", example)
              );
            }}
            {...props}
          >
            <div className="text-sm font-medium leading-none">{title}</div>
            <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
              {children}
            </p>
          </button>
        </NavigationMenuLink>
      </li>
    );
  }
);
ListItem.displayName = "ListItem";
