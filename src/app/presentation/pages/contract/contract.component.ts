import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, Validators, FormArray } from '@angular/forms';
import { MatStepper } from '@angular/material/stepper';
import { LegacyContract, Person } from '../../../domain/model/legacy-contract.model';
import { GetAccountUseCase } from '../../../domain/usecase/get-account.use-case';
import { SaveLegacyUseCase } from '../../../domain/usecase/save-legacy.use-case';
import { Blockchain } from '../../../domain/type/blockchain.type';
import { GetDataLegacyUseCase } from '../../../domain/usecase/get-data-legacy.use-case';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { LoaderDialog } from '../../components/dialogs/loader/loader.dialog';
import { StacksTestnet } from '@stacks/network';
import { AnchorMode, trueCV } from '@stacks/transactions';
import { openContractCall } from '@stacks/connect';
import { PostConditionMode } from '@stacks/transactions';
import { stringCV, principalCV, uintCV, listCV, BooleanCV} from '@stacks/transactions';

@Component({
  selector: 'app-contract',
  templateUrl: './contract.component.html',
  styleUrls: ['./contract.component.scss']
})
export class ContractComponent implements OnInit {
  walletChain: Blockchain = "ethereum";
  wallterAddress: string | null = null;
  contract = new LegacyContract();
  amount = 0;
  errorMessage: string | null = null;

  @ViewChild('stepper') stepper!: MatStepper;
  dialogRef?: MatDialogRef<LoaderDialog>;

  constructor(
    private router: Router,
    private dialog: MatDialog,
    private _formBuilder: FormBuilder,
    private getAccountUseCase: GetAccountUseCase,
    private saveLegacyUseCase: SaveLegacyUseCase,
    private getDataLegacyUseCase: GetDataLegacyUseCase
  ) {
  }

  grantorFormGroup = this._formBuilder.group({
    grantor_first_name: ['', Validators.required],
    grantor_last_name: ['', Validators.required],
    grantor_document_id: ['', Validators.required],
    grantor_email: ['', [Validators.required, Validators.email]],
    grantor_phonenumber: ['', Validators.required],
    beneficiarys_amount: ['', Validators.required],
    approveStaking: false,
  });
  beneficiariesFormGroup = this._formBuilder.group({
    beneficiaries: this._formBuilder.array([])
  });
  validatorsFormGroup = this._formBuilder.group({
    validators_qty: ['', Validators.required],
    validator_inactivity_time: ['', Validators.required],
    validators: this._formBuilder.array([])
  });



  ngOnInit(): void {
    this.getAccountUseCase.execute()
      .then(acc => {
        if (acc.address) {
          this.wallterAddress = acc.address;
          this.getContractData(acc.address);
          this.onAddBeneficiary();
        }
      });
  }

  getContractData(account: string): void {
    this.getDataLegacyUseCase.execute({
      walletChain: this.walletChain,
      walletAddress: account
    }).then(data => {
      console.log("data", data);
    }).catch(e => console.error(e));
  }

  get beneficiaryArr(): FormArray {
    return this.beneficiariesFormGroup.get('beneficiaries') as FormArray;
  }

  onAddBeneficiary(): void {
    let fg = this._formBuilder.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      phonenumber: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      amount: ['', Validators.required],
      token: ['', Validators.required],
      walletAddress: ['', Validators.required],
      sendInfo: false,
    });
    this.beneficiaryArr.push(fg);
  }

  get validatorArr(): FormArray {
    return this.validatorsFormGroup.get('validators') as FormArray;
  }

  addValidator(): void {
    let fg = this._formBuilder.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      walletAddress: ['', Validators.required]
    });
    this.validatorArr.push(fg);
  }

  onValidatorsQtyChange(qty: string) {
    //const diff = qty - this.contract.validators.length;
    const diff = parseInt(qty) - this.validatorArr.length;
    if (diff > 0) {
      for (let i = 0; i < diff; i++) {
        this.addValidator();
      }
    } else {
      for (let i = 0; i < diff * -1; i++) {
        this.validatorArr.removeAt(this.validatorArr.length - 1);
      }
    }
  }

  async savePress() { /*
    if (this.wallterAddress == null) {
      return;
    }

    if(!this.grantorFormGroup.valid) {
      this.stepper.selectedIndex = 0;
      return;
    }
    if(!this.beneficiariesFormGroup.valid) {
      this.stepper.selectedIndex = 1;
      return;
    }
    if(!this.validatorsFormGroup.valid) {
      this.stepper.selectedIndex = 2;
      return;
    }*/

    this.showLoader();
    const signer = async() =>{}
    let ben=[];
    for (let heir of this.beneficiaryArr.value){
      ben.push(principalCV(heir.walletAddress));
    }
    console.log("beneciciarios: ",ben);


    let tes=[];
    for (let wit of this.validatorArr.value){
      tes.push(principalCV(wit.walletAddress));
    }
    console.log("testigos: ",tes);

    try {
      const heredero=listCV(ben);
      const validador=listCV(tes);
      console.log(heredero,validador);
      openContractCall({
        network: new StacksTestnet(),
        anchorMode: AnchorMode.Any, // which type of block the tx should be mined in

        contractAddress: 'ST2KMEEVZBBKN1AN856MB356GD3G3TTN8X8N0B05D',
        contractName: 'LegacyKeyV1',
        functionName: 'newMember',
        functionArgs: [heredero,validador,uintCV(12),uintCV(1000),trueCV()],

        postConditionMode: PostConditionMode.Deny, // whether the tx should fail when unexpected assets are transferred
        postConditions: [], // for an example using post-conditions, see next example

        onFinish: response => {
          console.log('Se realizó el registro de herencia correctamente');
        },
        onCancel: () => {
          console.log('No se realizó el registro de herencia');
        },
      });



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

    /* let vali = [];
    let bene = [];

    for (var i = 0; i < this.contract.beneficiaries.length; i++) {
      try {
        bene.push(this.contract.beneficiaries[i].walletAddress);
      }
      catch { }
    }
    console.log(this.contract.validators.length);
    for (var i = 0; i < this.contract.validators.length; i++) {
      try {
        vali.push(this.contract.validators[i].walletAddress);
      }
      catch { }
    } */

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
      "¡Tu contrato se ha guardo con éxito!",
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
