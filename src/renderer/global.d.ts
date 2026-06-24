import { AddressBookApi } from '../main/preload';

declare global {
  interface Window {
    addressBook: AddressBookApi;
  }
}

export {};
