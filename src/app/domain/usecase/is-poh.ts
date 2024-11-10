import { Injectable } from "@angular/core";
import { UseCase } from "../base/use-case";
import { AlgorandRepository } from "../repository/algorand.respository";
import { Blockchain } from "../type/blockchain.type";
import { EthereumRepository } from "../repository/ethereum.respository";

@Injectable({
  providedIn: 'root'
})
export class IsPohUseCase implements UseCase<IsPohParams, boolean> {
  constructor(
    private algoRepository: AlgorandRepository,
    private ethRepository: EthereumRepository,
  ) {

  }

  async execute(params: IsPohParams): Promise<boolean> {
    switch (params.walletChain) {
      case "ethereum":
        return this.ethRepository.isProofOfHumanity(params.walletAddress);
        break;
      case "algorand":
        break;
      case "stacks":
        console.log("stacks");
        break;
    }
    return Promise.resolve(false);
  }
}

export type IsPohParams = {
  walletChain: Blockchain,
  walletAddress: string
};

