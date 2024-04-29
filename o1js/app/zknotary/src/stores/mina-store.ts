import { create } from "zustand";

export type NetworkName = "devnet";

export type WalletProfile =
  | {
      isSignedIn: true;
      address: string;
      activeNetwork: NetworkName;
    }
  | {
      isSignedIn: false;
      address: null;
      activeNetwork: null;
    };

export type MinaState = {
  localMode: boolean;
  hasPendingTransaction: boolean;
  wallet: WalletProfile;
};

export type MinaAction = {
  setLocalMode: (localMode: boolean) => void;
  setPendingTransaction: (hasPendingTransaction: boolean) => void;
  setWallet: (wallet: WalletProfile) => void;
  signOut: () => void;
};

export type MinaStore = MinaState & MinaAction;

export const defaultMinaState: MinaState = {
  localMode: false,
  hasPendingTransaction: false,
  wallet: {
    isSignedIn: false,
    address: null,
    activeNetwork: null,
  },
};

export const createMinaStore = (initialStore = defaultMinaState) => {
  return create<MinaStore>()((set) => ({
    ...initialStore,
    setLocalMode: (localMode) => set({ localMode }),
    setPendingTransaction: (hasPendingTransaction) =>
      set({ hasPendingTransaction }),
    setWallet: (wallet) => set({ wallet }),
    signOut: () => {
      set((state) => {
        return {
          ...state,
          wallet: {
            isSignedIn: false,
            address: null,
            activeNetwork: null,
          },
        };
      });
    },
  }));
};
