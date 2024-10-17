import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import Web3 from 'web3';
import { WalletRepository } from '../../../domain/repository/wallet.repository';
//import '@polkadot/api-augment';
//import { web3Accounts, web3Enable, web3FromAddress } from '@polkadot/extension-dapp';
//import { decodeAddress} from "@gear-js/api";
import { AppConfig, UserSession, getUserData, showConnect } from '@stacks/connect';

declare let window: any;

@Injectable({
  providedIn: 'root'
})
export class XverseWalletService extends WalletRepository {
  /* private wallet: Web3 | null = null;

  private _currentAccountAddress: string | null = null;

  private _accountAddress = new BehaviorSubject<string | null>(this._currentAccountAddress);
  public accountAddress = this._accountAddress.asObservable(); */

  constructor() {
    super();

    /* if (typeof window.ethereum !== 'undefined') {
      this.wallet = new Web3(window.ethereum);
    } */
  }

  connect = async(): Promise<string[]> => {
    
    /*
    const allInjected = await web3Enable('LegacyKey Dapp');
    const allAccounts = await web3Accounts();
    console.log( decodeAddress(allAccounts[0].address)  ); */
    
    return new Promise<string[]>(async (resolve, reject) => {
      
      try {
        let accounts: string[] ;
        const appConfig = new AppConfig(['store_write', 'publish_data']);
        const userSession = new UserSession({ appConfig });
        
        showConnect({
          appDetails: {
            name: 'LegacyKey',
            icon: 'https://legacykey.tech/img/icon/icon-02-primary.png',
          },
          redirectTo: '/',
          onFinish: () => {
            let userData = userSession.loadUserData();
            accounts = [userData.profile.stxAddress.testnet];
            resolve(accounts);
            
          },
          userSession,
        });
        /* this.setAccountAddress(accounts[0]); */
        
        
      } catch (err) {
        reject(err);
      }
    });
  }

  /* private setAccountAddress(accountAddress: string | null) {
    this._currentAccountAddress = accountAddress;
    this._accountAddress.next(accountAddress);
  }

  getAccountAddress() {
    return this._currentAccountAddress;
  } */
}
