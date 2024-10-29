import { Contract, JsonRpcProvider, formatUnits } from "ethers";

import { ChainKey, balanceAPI } from "utils/constants";
import ArrakisFactoryABI from "utils/abis/arrakis-factory";
import ArrakisHelperABI from "utils/abis/arrakis-helper";
import ArrakisVaultABI from "utils/abis/arrakis-vault";
import CommonPoolABI from "utils/abis/common-pool";
import ERC20ABI from "utils/abis/arrakis-vault";

interface WeweValut {
  address: string;
  balance: BigInt;
  shares: string;
  value: number;
}

export default class WeweProvider {
  private CONTRACT_ADDRESSES = {
    HELPER: "0x76B4B28194170f9847Ae1566E44dCB4f2D97Ac24",
    USDC: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",
    WEWE: "0x6b9bb36519538e0C073894E964E90172E1c0B41F",
    WEWE_VAULT_FACTORY: "0x7Af5148b733354FC25eAE912Ad5189e0E0a90670",
    WEWE_USDC_CONTRACT: "0x6f71796114b9cdaef29a801bc5cdbcb561990eeb",
  };

  private provider = new JsonRpcProvider(balanceAPI[ChainKey.BASE]);

  constructor() {}

  private getPricePerAddressInUsdc = (address: string): Promise<number> => {
    return new Promise((resolve, reject) => {
      const _address = address.toLowerCase();

      if (this.CONTRACT_ADDRESSES.USDC.toLowerCase() === _address) {
        resolve(1);
      } else if (this.CONTRACT_ADDRESSES.WEWE.toLowerCase() === _address) {
        const contract = new Contract(
          this.CONTRACT_ADDRESSES.WEWE_USDC_CONTRACT,
          CommonPoolABI,
          this.provider
        );

        contract.slot0().then((slot0) => {
          resolve(Math.pow(1.0001, Number(slot0.tick)) * Math.pow(10, 12));
        });
      } else {
        reject("Not supported token on price service");
      }
    });
  };

  private calculateTlvForTokens = (
    address: string,
    token0: string,
    token1: string
  ): Promise<number> => {
    return new Promise((resolve) => {
      const arrakisHelper = new Contract(
        this.CONTRACT_ADDRESSES.HELPER,
        ArrakisHelperABI,
        this.provider
      );

      const token0Contract = new Contract(token0, ERC20ABI, this.provider);
      const token1Contract = new Contract(token1, ERC20ABI, this.provider);

      Promise.all([
        arrakisHelper.totalUnderlying(address),
        token0Contract.decimals(),
        token1Contract.decimals(),
        this.getPricePerAddressInUsdc(token0),
        this.getPricePerAddressInUsdc(token1),
      ])
        .then(
          ([
            [token0balance, token1balance],
            token0decimals,
            token1decimals,
            priceInUsdToken0,
            priceInUsdToken1,
          ]) => {
            const tlvToken0 =
              Number(formatUnits(token0balance.toString(), token0decimals)) *
              priceInUsdToken0;
            const tlvToken1 =
              Number(formatUnits(token1balance.toString(), token1decimals)) *
              priceInUsdToken1;

            resolve(tlvToken0 + tlvToken1);
          }
        )
        .catch(() => {
          resolve(0);
        });
    });
  };

  private getVaultBalance = (
    userAddress: string,
    vaultAddress: string
  ): Promise<{ balance: BigInt; balanceInUsdc: number }> => {
    return new Promise((resolve) => {
      const vaultContract = new Contract(
        vaultAddress,
        ArrakisVaultABI,
        this.provider
      );

      Promise.all([
        vaultContract.balanceOf(userAddress),
        vaultContract.token0(),
        vaultContract.token1(),
      ]).then(([balance, token0, token1]) => {
        Promise.all([
          vaultContract.balanceOf(userAddress),
          vaultContract.totalSupply(),
          this.calculateTlvForTokens(vaultAddress, token0, token1),
        ]).then(([userBalance, totalSupply, tlv]) => {
          resolve({
            balance,
            balanceInUsdc:
              (Number(formatUnits(userBalance.toString())) /
                Number(formatUnits(totalSupply.toString()))) *
              tlv,
          });
        });
      });
    });
  };

  public getPositions = (
    address: string,
    price: number
  ): Promise<WeweValut[]> => {
    return new Promise((resolve) => {
      const arrakisFactory = new Contract(
        this.CONTRACT_ADDRESSES.WEWE_VAULT_FACTORY,
        ArrakisFactoryABI,
        this.provider
      );

      arrakisFactory.numVaults().then((weweVaultNumber) => {
        arrakisFactory
          .vaults(0, weweVaultNumber)
          .then((weweVaults: { [key: string]: string }) => {
            const vaults: WeweValut[] = [];

            Object.values(weweVaults).map((address) =>
              vaults.push({
                address,
                balance: BigInt(0),
                value: 0,
                shares: "",
              })
            );

            const promises = vaults.map((vault) =>
              this.getVaultBalance(address, vault.address).then(
                ({ balance, balanceInUsdc }) => {
                  vault.balance = balance;
                  vault.value = balanceInUsdc * price;
                  vault.shares = Number(
                    formatUnits(balance.toString())
                  ).toFixed(2);
                }
              )
            );

            Promise.all(promises).then(() => {
              resolve(vaults);
            });
          });
      });
    });
  };
}
