import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { PayServiceUseCase } from '../../../domain/usecase/pay-service.use-case';
import { Blockchain } from '../../../domain/type/blockchain.type';
import { GetAccountUseCase } from '../../../domain/usecase/get-account.use-case';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { LoaderDialog } from '../../components/dialogs/loader/loader.dialog';
//import '@polkadot/api-augment';
//import { web3Accounts, web3Enable, web3FromAddress,web3FromSource } from '@polkadot/extension-dapp';
//import { decodeAddress, ProgramMetadata, GearApi} from "@gear-js/api";
import { pagar } from './RegistroSC';
import { StacksTestnet } from '@stacks/network';
import { openContractCall, getUserData } from '@stacks/connect';
import { PostConditionMode } from '@stacks/transactions';
import { someCV,bufferCV,standardPrincipalCV, principalCV, uintCV, listCV, trueCV, optionalCVOf} from '@stacks/transactions';
import {
  makeContractCall,
  broadcastTransaction,
  AnchorMode,
  FungibleConditionCode,
  makeStandardSTXPostCondition,
  createAssetInfo,
  makeStandardFungiblePostCondition,
  bufferCVFromString, Pc
} from '@stacks/transactions';

@Component({
  selector: 'app-payment',
  templateUrl: './payment.component.html',
  styleUrls: ['./payment.component.scss']
})
export class PaymentComponent implements OnInit {
  walletChain: Blockchain = "ethereum";
  wallterAddress: string | null = null;
  asset = "usdt";
  amount = 100;
  errorMessage: string | null = null;
  dialogRef?: MatDialogRef<LoaderDialog>;

  constructor(
    private router: Router,
    private dialog: MatDialog,
    private getAccountUseCase: GetAccountUseCase,
    private payServiceUseCase: PayServiceUseCase
  ) {
  }

  ngOnInit(): void {
    this.getAccountUseCase.execute()
      .then(acc => {
        this.wallterAddress = acc.address;
      });
  }

  async pago() {
    await pagar();   

    try {
      const senderAddress = (await getUserData()).profile.stxAddress.testnet;
    const recipientAddress = 'ST2PHRTBJ1CN8XRBBHTX3ES49JZAGTC0FWAGJFR8T';

    // Contract details
    const contractAddress = 'ST2KMEEVZBBKN1AN856MB356GD3G3TTN8X8N0B05D';
    const contractName = 'TestStableCoin';
    
    // Token details
    const amountToTransfer = 100; // Number of tokens to transfer
    const memo = Buffer.from('Enviando tokens a Brian'); // Memo as a Buffer

    openContractCall({
      network: new StacksTestnet(),
      anchorMode: AnchorMode.Any, // which type of block the tx should be mined in    
      contractAddress: 'ST2KMEEVZBBKN1AN856MB356GD3G3TTN8X8N0B05D',
      contractName: 'TestStableCoin',
      functionName: 'transfer',
      functionArgs: [
        uintCV(amountToTransfer),
        standardPrincipalCV(senderAddress),
        standardPrincipalCV(recipientAddress),
        someCV(bufferCV(memo)) // Memo as a Some(buff 34)
      ],
    
      postConditionMode: PostConditionMode.Deny, // whether the tx should fail when unexpected assets are transferred
      postConditions: [
        makeStandardFungiblePostCondition(
          senderAddress,
          FungibleConditionCode.Equal,
          amountToTransfer,
          createAssetInfo(contractAddress, contractName, 'clarity-coin-btc')
        )
      ],
    
      onFinish: response => {
        console.log('Se realizó el pago correctamente');
      },
      onCancel: () => {
        console.log('No se realizó el pago');
      },
    });
      
      this.onSuccessPayment();

      return {
        status: 201,
        message: 'Transaction Success',
        
        // result: this.convertBigintToString(transaction),
      };
    } catch (error: unknown) {
      if (error instanceof Error) {
        // Maneja los errores y los registra
        console.log('=> error:', error);
        
      }
      throw error;
    }   

  }

  async onPay() {
    if (this.wallterAddress == null) {
      return;
    }

    //await this.pago();
    this.showLoader();

    this.payServiceUseCase.execute({
      walletChain: this.walletChain,
      walletAddress: this.wallterAddress,
      asset: this.asset,
      amount: this.amount
    }).then(() => {
      this.onSuccessPayment();
    }).catch(e => {
      console.log(e);
      this.errorMessage = e.message;
    }).finally(() => {
      this.dialogRef?.close();
    });
  }

  onSuccessPayment() {
    this.showPopup(
      "Pago exitoso",
      "¡Tu pago se ha generado con éxito! Ahora vamos a confirmar la información de tu herencia.",
      "Continuar",
      "success"
    );
  }

  showPopup(title: string, description: string, button: string, icon?: string) {
    const success = confirm(title + "\n" + description);
    if (success) {
      this.goToNext();
    }
  }

  goToNext() {
    this.router.navigate(['contract'])
      .catch();
  }

  showLoader() {
    this.dialogRef = this.dialog.open(LoaderDialog, {
      disableClose: true
    });
  }
}
