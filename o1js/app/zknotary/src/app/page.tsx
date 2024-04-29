import { NavBar } from "@/components/core/nav-bar";
import Footer from "@/components/core/footer";

import MainSectionContainer from "@/components/main-section";
import { ExamplesProvider } from "@/components/providers/examples-provider";

import NetworkDropdown from "@/components/mina/network-dropdown";
import WalletSection from "@/components/mina/wallet-section";
import LocalToggle from "@/components/mina/local-toggle";
import { ThemeModeToggle } from "@/components/home/theme-toggle";
import { MinaProvider } from "@/components/providers/mina-provider";
import MinaEventHandler from "@/components/mina/mina-event-handler";
export default function Home() {
  return (
    <ExamplesProvider>
      <MinaEventHandler />
      <div className="flex flex-col min-h-screen">
        <header className="flex items-center justify-between h-16 p-6 lg:px-8 sm:px-6">
          <NavBar />
          <div className="flex items-center gap-2">
            <WalletSection />
            <ThemeModeToggle />
          </div>
        </header>

        <main className="flex flex-grow w-full min-h-full items-center justify-center">
          <MainSectionContainer />
        </main>

        <footer>
          <Footer />
        </footer>
      </div>
    </ExamplesProvider>
  );
}
