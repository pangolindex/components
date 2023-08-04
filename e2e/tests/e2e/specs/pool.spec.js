import selectors from '../../../cypress/fixtures/selectors.json';
import data from '../../../cypress/fixtures/pangolin-data.json';
import { connectWalletftn, checkTokenBalancePoolftn } from '../../../cypress/src/dashboard';
import { notificationftn } from '../../../cypress/src/swap';
import {
  selectTokensPoolftn,
  pairDetailsCardftn,
  createEnterValuesftn,
  selectTokensImportPoolftn,
  importTokenDetailsftn,
} from '../../../cypress/src/pool';

let { poolsSideMenu, standardSideMenu, createPair, createAddTitle, poolSections, poolSearch, seeDetailsBtn } =
  selectors.pools;

let {
  createPairToken1,
  createPairToken2,
  addliquidityToken1,
  addliquidityToken2,
  noPoolToken1,
  noPoolToken2,
  poolFoundToken1,
  poolFoundToken2,
} = data.pools;

//To run each file
//npx  env-cmd -f env/.env npx synpress run --spec 'tests/e2e/specs/pool.spec.js' -cf synpress.json
describe('pool standard', () => {
  before(() => {
    //cheking the from token and gas token balances
    checkTokenBalancePoolftn();
  });

  it.only('Details on Create a pair card', () => {
    cy.visit('/');

    // Selecting swap side menu
    cy.get(poolsSideMenu).click();
    cy.get(standardSideMenu).click();

    //connecting MetaMask
    connectWalletftn();

    //Create a pair
    cy.get(createPair).contains('Create a pair').click();

    //select tokens that have no pair
    selectTokensPoolftn(createPairToken1, createPairToken2, 'Create a pair');

    //create a pair card
    cy.get(createAddTitle).contains('Create a pair').should('be.visible');

    //Create a pair card details
    pairDetailsCardftn(0);

    //disconnecting wallet
    cy.disconnectMetamaskWalletFromAllDapps();
  });

  it('You are creating a pool card', () => {
    cy.visit('/');

    // Selecting swap side menu
    cy.get(poolsSideMenu).click();
    cy.get(standardSideMenu).click();

    //connecting MetaMask
    connectWalletftn();

    //Creating the pair
    cy.get(createPair).contains('Create a pair').click();

    //select tokens that have no pair
    selectTokensPoolftn(createPairToken1, createPairToken2, 'Create a pair');

    //entering values
    //You are creating a pool card
    createEnterValuesftn('You are creating a pool', 'Create Pool & Supply', createPairToken1, createPairToken2);

    //Approve transaction
    cy.confirmMetamaskTransaction();
    cy.wait(10000);

    //Notification
    notificationftn('Added');

    // //Successful card
    // successfulCardftn(confirmSwapBtn, limitSuccessfulTransactionLink)

    //disconnecting wallet
    cy.disconnectMetamaskWalletFromAllDapps();
  });

  it('Details on Add liquidity card', () => {
    cy.visit('/');

    // Selecting swap side menu
    cy.get(poolsSideMenu).click();
    cy.get(standardSideMenu).click();

    //connecting MetaMask
    connectWalletftn();

    //Add Liquidity
    cy.get(createPair).contains('Create a pair').click();

    //select tokens that have a pair
    selectTokensPoolftn(addliquidityToken1, addliquidityToken2, 'Add Liquidity');

    //Add liquidity card details
    cy.get(createAddTitle).contains('Add liquidity').should('be.visible');
    pairDetailsCardftn(0);

    //disconnecting wallet
    cy.disconnectMetamaskWalletFromAllDapps();
  });

  it('You will receive card', () => {
    cy.visit('/');

    // Selecting swap side menu
    cy.get(poolsSideMenu).click();
    cy.get(standardSideMenu).click();

    //connecting MetaMask
    connectWalletftn();

    //Adding Liquidity
    cy.get(createPair).contains('Create a pair').click();

    //select tokens that have a pair
    selectTokensPoolftn(addliquidityToken1, addliquidityToken2, 'Add Liquidity');

    //Add liquidity card
    cy.get(createAddTitle).contains('Add liquidity').should('be.visible');

    //entering values
    //You will receive card
    createEnterValuesftn('You will receive', 'Confirm Supply', addliquidityToken1, addliquidityToken2);

    //Approve transaction
    cy.confirmMetamaskTransaction();
    cy.wait(10000);

    //Notification
    notificationftn('Added');

    // //Successful card
    //successfulCardftn(confirmSwapBtn, limitSuccessfulTransactionLink)

    //disconnecting wallet
    cy.disconnectMetamaskWalletFromAllDapps();
  });

  it('Import pool card', () => {
    cy.visit('/');
    cy.get(poolsSideMenu).click();
    cy.get(standardSideMenu).click();

    //MetaMask connection
    connectWalletftn();

    //Add Liquidity
    cy.get(createPair).contains('Import it.').click();
    cy.get(createAddTitle).contains('Import Pool').should('be.visible');

    //selecting tokens having no pool
    selectTokensImportPoolftn(noPoolToken1, noPoolToken2, 'No pool found.');
  });

  it('Pool found details', () => {
    cy.visit('/');
    cy.get(poolsSideMenu).click();
    cy.get(standardSideMenu).click();

    //MetaMask connection
    connectWalletftn();

    //Add Liquidity
    cy.get(createPair).contains('Import it.').click();
    cy.get(createAddTitle).contains('Import Pool').should('be.visible');

    //selecting tokens having no pool
    selectTokensImportPoolftn(poolFoundToken1, poolFoundToken2, 'Pool Found!');
    importTokenDetailsftn(poolFoundToken1, poolFoundToken2);
    cy.get(poolSections).eq(2).contains('Your Pools').should('have.css', 'color', 'rgb(255, 200, 0)');
  });

  it('Add Liquidity', () => {
    cy.visit('/');
    cy.get(poolsSideMenu).click();
    cy.get(standardSideMenu).click();

    //MetaMask connection
    connectWalletftn();

    //Add Liquidity
    cy.get(poolSearch).type(addliquidityToken1, { force: true });
    cy.wait(5000);
    cy.get(seeDetailsBtn).eq(1).should('be.visible').click();
    cy.wait(5000);

    //Add liquidity card details
    pairDetailsCardftn(2);

    //entering values
    //You will receive card
    createEnterValuesftn('You will receive', 'Confirm Supply', addliquidityToken1, addliquidityToken2);

    //Approve transaction
    cy.confirmMetamaskTransaction();
    cy.wait(10000);

    //Notification
    notificationftn('Added');

    // //Successful card
    //successfulCardftn(confirmSwapBtn, limitSuccessfulTransactionLink)
  });
});
