"use client";

import * as React from "react";
import Link from "next/link";

// import {
//   NavigationMenu,
//   NavigationMenuItem,
//   NavigationMenuLink,
//   NavigationMenuList,
//   navigationMenuTriggerStyle,
//   NavigationMenuContent,
//   NavigationMenuTrigger,
// } from "@/components/ui/navigation-menu";
import { cn } from "@/lib/utils";
import { usePathname, useSearchParams } from "next/navigation";
import { useRouter } from "next/navigation";
import { useExamplesStore } from "../examples-store";
import { Button } from "../ui/button";

import { DropdownMenuCheckboxItemProps } from "@radix-ui/react-dropdown-menu";

import { ArrowDownIcon, ChevronDownIcon } from "@radix-ui/react-icons";

import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// type ExamplesMenuContext = {
//   title: string;
//   description: string;
// };

// const examples: ExamplesMenuContext[] = [
//   {
//     title: "GitHub",
//     description:
//       "A demo where you can verify the history of a user's repositories",
//   },
//   {
//     title: "Discord",
//     description:
//       "A demo where you can verify the history of a user's conversation history",
//   },
// ];

export function NavBar() {
  const {
    setActive,
    active,
    examples: storeExamples,
  } = useExamplesStore((state) => state);

  console.log("active", active);

  return (
    <div className="flex gap-x-4 w-full items-center justify-center">
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

// interface ListItemProps extends React.ComponentPropsWithoutRef<"button"> {
//   example: string;
//   createQueryString: (name: string, value: string) => string;
// }

// Wanted to see how it would work with searchParams, simply not needed
// const ListItem = React.forwardRef<React.ElementRef<"button">, ListItemProps>(
//   (
//     { createQueryString, className, title, children, example, ...props },
//     ref
//   ) => {
//     const pathname = usePathname();
//     const router = useRouter();
//
//     return (
//       <li>
//         <NavigationMenuLink asChild>
//           <button
//             ref={ref}
//             className={cn(
//               "block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
//               className
//             )}
//             onClick={() => {
//               router.push(
//                 pathname + "?" + createQueryString("example", example)
//               );
//             }}
//             {...props}
//           >
//             <div className="text-sm font-medium leading-none">{title}</div>
//             <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
//               {children}
//             </p>
//           </button>
//         </NavigationMenuLink>
//       </li>
//     );
//   }
// );
// ListItem.displayName = "ListItem";
