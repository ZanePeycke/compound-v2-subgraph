/* eslint-disable prefer-const */ // to satisfy AS compiler

import {
  MarketEntered,
  MarketExited,
  NewCloseFactor,
  NewCollateralFactor,
  NewLiquidationIncentive,
  NewMaxAssets,
  NewPriceOracle,
  MarketListed,
} from '../types/Comptroller/Comptroller'

import { CToken } from '../types/templates'
import { Market, Comptroller, Account } from '../types/schema'
import { mantissaFactorBD, updateCommonCTokenStats, createAccount } from './helpers'
import { createMarket } from './markets'
import { Address, log } from '@graphprotocol/graph-ts'

//I am having some issues with try catch statements for safer handling of new markets
//See handleMarketListed for more details

//For the time being we are going to have a valid market list, and manually approve
//new markets to avoid issues with subgraph indexing.
let valid_markets: string[] = ['0x3fda67f7583380e67ef93072294a7fac882fd7e7',
                                '0x6c8c6b02e7b2be14d4fa6022dfd6d75921d90e4e',
                                '0x5d3a536e4d6dbd6114cc1ead35777bab948e3643',
                                '0x4ddc2d193948926d02f9b1fe9e1daa0718270ed5',
                                '0xc00e94cb662c3520282e6f5717214004a7f26888',
                                '0x3d9819210a31b4961b30ef54be2aed79b9c9cd3b',
                                '0xf859a1ad94bcf445a406b892ef0d3082f4174088',
                                '0x158079ee67fce2f58472a96584a73c7ab9ac95c1',
                                '0x35a18000230da775cac24873d00ff85bccded550',
                                '0x39aa39c021dfbae8fac545936693ac917d5e7563',
                                '0xf650c3d88d12db855b8bf7d11be6c55a4e07dcc9',
                                '0xc11b1268c1a384e55c48c2391d8d480264a3a7f4',
                                '0xb3319f5d18bc0d84dd1b4825dcde5d5f7266d407',
                                '0xa7ff0d561cd15ed525e31bbe0af3fe34ac2059f6',
                                '0x1449e0687810bddd356ae6dd87789244a46d9adb',
                                '0xcec237e83a080f3225ab1562605ee6dedf5644cc',
                                '0xfe83af639f769ead20bad76067abc120245a06a9',
                                '0xc0da01a04c3f3e0be433606045bb7017a7323e38',
                                '0x1055be4bf7338c7606d9efdcf80593f180ba043e',
                                '0x02557a5e05defeffd4cae6d83ea3d173b272c904',
                                '0x9e77ad51e5c0825d6e440f49e49ef1a1bca37b5d',
                                '0xe7664229833ae4abf4e269b8f23a86b657e2338d',
                                '0xddc46a3b076aec7ab3fc37420a8edd2959764ec4',
                                '0xd25c029a607ee888bdbdbe054515e25ec6f3fff9',
                                '0x0a97f822272519d5296e21de278a86cd3ce3c96a',
                                '0x16c2a19edbc68780dfc03708bc9021ef34db2e33',
                                '0xcdaf8cb1839952cbe6d98d248e593b782a2419c7',
                                '0xd928c8ead620bb316d2cefe3caf81dc2dec6ff63',
                                '0x8ac03df808efae9397a9d95888230ee022b997f4',
                                '0xe65cdb6479bac1e22340e4e755fae7e509ecd06c',
                                '0x70e36f6bf80a52b3b46b3af8e106cc0ed743e8e4',
                                '0xface851a4921ce59e912d19329929ce6da6eb0c7',
                                '0x95b4ef2869ebd94beb4eee400a99824bf5dc325b',
                                '0xf5dce57282a584d2746faf1593d3121fcac444dc',
                                '0x4b0181102a0112a2ef11abee5563bb4a3176c9d7',
                                '0x12392f67bdf24fae0af363c24ac620a2f67dad86',
                                '0xccf4429db6322d5c611ee964527d42e5d685dd6a',
                                '0x80a2ae356fc9ef4305676f7a3e2ed04e12c33946',
                                '0x6d903f6003cca6255d85cca4d3b5e5146dc33925',
                                '0x041171993284df560249b57358f931d9eb7b925d', //cUSDP
                                '0x7713dd9ca933848f6819f38b8352d9a15ea73f67'//cFEI
                              ]


export function handleMarketListed(event: MarketListed): void {
  // Is the market in our approved list? If so return, otherwise proceed
  if (valid_markets.indexOf(event.params.cToken.toHexString()) == -1) {
    return
  }

  // Original idea was to encapsulate the next code block in a try, and catch errors
  // I cannot compile when using this approach, and even empty try catch blocks do not compile
  // Best guess now is that this is related to the old version of assemblyscript being used
  // Dynamically index all new listed tokens
  CToken.create(event.params.cToken)
  let market = createMarket(event.params.cToken.toHexString())
  market.save()
}

export function handleMarketEntered(event: MarketEntered): void {
  let market = Market.load(event.params.cToken.toHexString())
  // Null check needed to avoid crashing on a new market added. Ideally when dynamic data
  // sources can source from the contract creation block and not the time the
  // comptroller adds the market, we can avoid this altogether
  if (market != null) {
    let accountID = event.params.account.toHex()
    let account = Account.load(accountID)
    if (account == null) {
      createAccount(accountID)
    }

    let cTokenStats = updateCommonCTokenStats(
      market.id,
      market.symbol,
      accountID,
      event.transaction.hash,
      event.block.timestamp,
      event.block.number,
      event.logIndex,
    )
    cTokenStats.enteredMarket = true
    cTokenStats.save()
  }
}

export function handleMarketExited(event: MarketExited): void {
  let market = Market.load(event.params.cToken.toHexString())
  // Null check needed to avoid crashing on a new market added. Ideally when dynamic data
  // sources can source from the contract creation block and not the time the
  // comptroller adds the market, we can avoid this altogether
  if (market != null) {
    let accountID = event.params.account.toHex()
    let account = Account.load(accountID)
    if (account == null) {
      createAccount(accountID)
    }

    let cTokenStats = updateCommonCTokenStats(
      market.id,
      market.symbol,
      accountID,
      event.transaction.hash,
      event.block.timestamp,
      event.block.number,
      event.logIndex,
    )
    cTokenStats.enteredMarket = false
    cTokenStats.save()
  }
}

export function handleNewCloseFactor(event: NewCloseFactor): void {
  let comptroller = Comptroller.load('1')
  comptroller.closeFactor = event.params.newCloseFactorMantissa
  comptroller.save()
}

export function handleNewCollateralFactor(event: NewCollateralFactor): void {
  let market = Market.load(event.params.cToken.toHexString())
  // Null check needed to avoid crashing on a new market added. Ideally when dynamic data
  // sources can source from the contract creation block and not the time the
  // comptroller adds the market, we can avoid this altogether
  if (market != null) {
    market.collateralFactor = event.params.newCollateralFactorMantissa
      .toBigDecimal()
      .div(mantissaFactorBD)
    market.save()
  }
}

// This should be the first event acccording to etherscan but it isn't.... price oracle is. weird
export function handleNewLiquidationIncentive(event: NewLiquidationIncentive): void {
  let comptroller = Comptroller.load('1')
  comptroller.liquidationIncentive = event.params.newLiquidationIncentiveMantissa
  comptroller.save()
}

export function handleNewMaxAssets(event: NewMaxAssets): void {
  let comptroller = Comptroller.load('1')
  comptroller.maxAssets = event.params.newMaxAssets
  comptroller.save()
}

export function handleNewPriceOracle(event: NewPriceOracle): void {
  let comptroller = Comptroller.load('1')
  // This is the first event used in this mapping, so we use it to create the entity
  if (comptroller == null) {
    comptroller = new Comptroller('1')
  }
  // To resolve issues introduced by governance proposal 117 and 119 we will temporarily
  // Not consider the new oracle https://etherscan.io/tx/0x58ad039bedcf34caf010bc9513435b16856c9ec1a0b7e46cad3422264120ddf4
  // If this oracle is fixed and redeployed at the same address, we will omit this in the future
  let new_Price_Oracle_Address = event.parameters[1].value.toAddress()
  if (new_Price_Oracle_Address == Address.fromString('0xAd47d5A59B6d1Ca4DC3EbD53693fdA7d7449f165')){
    comptroller.save()
  } else {
  comptroller.priceOracle = event.params.newPriceOracle
  comptroller.save()
  }
}
