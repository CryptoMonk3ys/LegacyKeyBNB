import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { cobroHeir } from '../../../domain/model/legacy-contract.model';
import { GetAccountUseCase } from '../../../domain/usecase/get-account.use-case';
import { CollectLegacyUseCase } from '../../../domain/usecase/collect-legacy.use-case';
import { Blockchain } from '../../../domain/type/blockchain.type';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { LoaderDialog } from '../../components/dialogs/loader/loader.dialog';
//import '@polkadot/api-augment';
//import { web3Accounts, web3Enable, web3FromAddress,web3FromSource } from '@polkadot/extension-dapp';
//import { decodeAddress, ProgramMetadata, GearApi} from "@gear-js/api";
import { AppConfig, UserSession, getUserData, showConnect } from '@stacks/connect';
import { StacksTestnet } from '@stacks/network';
import { AnchorMode } from '@stacks/transactions';
import { openContractCall } from '@stacks/connect';
import { PostConditionMode } from '@stacks/transactions';
import { stringCV, principalCV, uintCV, listCV, trueCV, optionalCVOf} from '@stacks/transactions';

@Component({
  selector: 'app-cobro',
  templateUrl: './cobro.component.html',
  styleUrls: ['./cobro.component.scss']
})
export class CobroComponent implements OnInit {
  walletChain: Blockchain = "ethereum";
  wallterAddress: string | null = null;
  heir = new cobroHeir();
  errorMessage: string | null = null;
  dialogRef?: MatDialogRef<LoaderDialog>;

  constructor(
    private router: Router,
    private dialog: MatDialog,
    private getAccountUseCase: GetAccountUseCase,
    private collectLegacyUseCase: CollectLegacyUseCase
  ) {

  }

  ngOnInit(): void {
    this.getAccountUseCase.execute()
      .then(acc => {
        this.wallterAddress = acc.address;
      });
  }

  async cobro() {
    /*
    if (this.wallterAddress == null || this.heir.idWithdraw == null) {
      return;
    }*/

    this.showLoader();
    const cantidad=uintCV(1);
    openContractCall({
        network: new StacksTestnet(),
        anchorMode: AnchorMode.Any, // which type of block the tx should be mined in

        contractAddress: 'ST2KMEEVZBBKN1AN856MB356GD3G3TTN8X8N0B05D',
        contractName: 'LegacyKeyV1',
        functionName: 'withDrawHeir',
        functionArgs: [cantidad],

        postConditionMode: PostConditionMode.Deny, // whether the tx should fail when unexpected assets are transferred
        postConditions: [], // for an example using post-conditions, see next example

        onFinish: response => {
          console.log('Cobro procesado con éxito');
        },
        onCancel: () => {
          console.log('No se procesó el cobro');
        },
    });

    const signer = async () => {
      /*
      try {
        await transferExtrinsic
          .signAndSend(
            account ,
            { signer: injector.signer }
          )
          .catch((error: any) => {
            console.log(":( transaction failed", error);
          }); 
      } catch (error) {
        console.log(error);
      }*/
    }

    signer().then(() => {
      this.onSuccessSave();
    }).catch(e => {
      console.log(e);
      this.errorMessage = e.message;
    }).finally(() => {
      this.dialogRef?.close();
    });
  }

  onSuccessSave() {
    this.showPopup(
      "Guardado satisfactorio",
      "¡Tu herencia se ha cobrado con éxito!",
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

  showLoader() {
    this.dialogRef = this.dialog.open(LoaderDialog, {
      disableClose: true
    });
  }

  goToNext() {
    this.router.navigate(['menu'])
      .catch();
  }
}
