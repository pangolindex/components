import selectors from '../../../cypress/fixtures/selectors.json';
import data from '../../../cypress/fixtures/pangolin-data.json';
import { connectWalletftn, checkTokenBalanceftn } from '../../../cypress/src/dashboard';
import {
  tradeDetailsftn,
  selectTokensftn,
  confirmTradeDetailsftn,
  confirmBtnftn,
  limitSellBuyTokenftn,
  limitSellBuyConfirmDetailsftn,
  notificationftn,
  successfulCardftn,
  limitSellBuyTradeDetailsftn,
  limitOrdersftn,
  cancelLimitOrderftn,
  selectLimitTokensftn,
  enterAmountBtnftn,
  swapButtonftn,
} from '../../../cypress/src/swap';

let { swapSideMenu, walletAddress } = selectors.dashboard;
let {
  tokensToSwap,
  tokenSearch,
  selectTokens,
  selectTokensValue,
  selectTokensMenuClose,
  fromInput,
  toInput,
  swapBtn,
  percentBtns,
  percentBtnActive,
  confirmSwapDetails,
  confirmSwapBtn,
  swappingMsg,
  recentTransactions,
  transactionLinks,
  clearAll,
  transactionAppear,
  accountMenuCloseSwap,
  transactionRejected,
  buyBtn,
  swapSuccessfulTransactionLink,
  limitSuccessfulTransactionLink,
  cancelLimitSuccessfulTransactionLink,
  tradeDetails,
} = selectors.swap;
let { percentBtnArr, fromToken, toToken, sellTokenValue, buyTokenValue, swapValue } = data.swap;

//To run each file
//npx  env-cmd -f env/.env npx synpress run --spec 'tests/e2e/specs/swap.spec.js' -cf synpress.json
describe('Swap', () => {
  before(() => {
    //cheking the from token and gas token balances
    checkTokenBalanceftn();
  });

  it('Transaction Buttons on Trade card', () => {
    cy.visit('/');

    // Selecting swap side menu
    cy.get(swapSideMenu).click();

    //connecting MetaMask
    connectWalletftn();

    // Enter an amount button
    enterAmountBtnftn();

    // Tokens along balances in select tokens card
    cy.get(tokensToSwap).eq(0).contains('AVAX').click();
    cy.get(tokenSearch).eq(0).clear().type(fromToken);
    cy.wait(10000);
    cy.get(selectTokensValue, { timeout: 30000 })
      .invoke('text')
      .then((text) => {
        const incrementedValue = parseFloat(text) + 10;
        cy.get(selectTokens).eq(0).click();

        // Insufficient balance button
        cy.get(fromInput).type(incrementedValue);
        cy.wait(5000);
        cy.get(swapBtn).contains(`Insufficient ${fromToken} balance`).should('be.visible');
        cy.get(swapBtn)
          .contains(`Insufficient ${fromToken} balance`)
          .should('have.css', 'background-color', 'rgb(229, 229, 229)');
      });

    //disconnecting wallet
    cy.disconnectMetamaskWalletFromAllDapps();
  });

  it('Verify tokens with balance > 0 appear in the dropdown', () => {
    cy.visit('/');

    // Selecting swap side menu
    cy.get(swapSideMenu).click();

    //connecting MetaMask
    connectWalletftn();

    //Token along balances
    for (let i = 0; i <= 1; i++) {
      cy.get(tokensToSwap).eq(i).click();
      cy.wait(10000);
      cy.get(selectTokensValue).each((option) => {
        cy.wrap(option)
          .scrollIntoView()
          .invoke('text')
          .then((text) => {
            const balancePattern = /\d+\.\d+/;
            if (balancePattern.test(text)) {
              cy.wrap(option).should('be.visible');
            }
          });
      });

      cy.get(selectTokensMenuClose).eq(0).click();
    }

    //disconnecting wallet
    cy.disconnectMetamaskWalletFromAllDapps();
  });

  it('Details on Trade card', () => {
    cy.visit('/');

    // Selecting swap side menu
    cy.get(swapSideMenu).click();

    //connecting MetaMask
    connectWalletftn();

    // Select tokens by their titles
    selectTokensftn(fromToken, toToken, swapValue);

    // Percent buttons
    for (let i = 0; i <= 3; i++) {
      cy.get(percentBtns).eq(percentBtnArr[i]).click();
      cy.get(tradeDetails, { timeout: 30000 }).eq(0).should('be.visible');
      cy.get(percentBtnActive).should(($element) => {
        expect($element.css('color')).to.equal('rgb(255, 255, 255)');
      });
      cy.get(fromInput).should('not.have.value', '0.00');
      cy.get(toInput).should('not.have.value', '0.00');

      // See details by token names
      tradeDetailsftn(fromToken, toToken);
      cy.get(swapBtn, { timeout: 50000 }).should('be.visible');

      // Swap button
      swapButtonftn();
    }

    //disconnecting wallet
    cy.disconnectMetamaskWalletFromAllDapps();
  });

  it('Reject Transaction', () => {
    cy.visit('/');

    // Selecting swap side menu
    cy.get(swapSideMenu).click();

    //connecting MetaMask
    connectWalletftn();

    // Select tokens by their titles
    selectTokensftn(fromToken, toToken, swapValue);

    // See details by token names
    tradeDetailsftn(fromToken, toToken);
    cy.get(swapBtn, { timeout: 50000 }).should('be.visible');

    // Swap button
    swapButtonftn();
    cy.get(swapBtn).click();

    //confirm details
    confirmTradeDetailsftn(fromToken, toToken);

    // Confirm swap button
    confirmBtnftn(confirmSwapBtn, 'Confirm Swap');
    cy.wait(5000);

    // Reject transaction
    cy.rejectMetamaskTransaction();
    cy.get(transactionRejected).contains('Transaction rejected.').should('be.visible');

    // Dismiss button
    confirmBtnftn(confirmSwapBtn, 'Dismiss');
    cy.get(confirmSwapDetails).contains('Trade').should('be.visible');

    // Swap button
    cy.get(swapBtn).contains('Swap').should('be.visible');
    cy.get(swapBtn).contains('Swap').should('have.css', 'background-color', 'rgb(255, 200, 0)');

    //disconnecting wallet
    cy.disconnectMetamaskWalletFromAllDapps();
  });

  it('Details on Confirm swap card', () => {
    cy.visit('/');

    // Selecting swap side menu
    cy.get(swapSideMenu).click();

    //connecting MetaMask
    connectWalletftn();

    // Select tokens by their titles
    selectTokensftn(fromToken, toToken, swapValue);

    // See details by token names
    tradeDetailsftn(fromToken, toToken);
    cy.get(swapBtn, { timeout: 50000 }).should('be.visible');

    // Swap button
    swapButtonftn();
    cy.get(swapBtn).click();

    //confirm details
    confirmTradeDetailsftn(fromToken, toToken);

    // Confirm swap button
    confirmBtnftn(confirmSwapBtn, 'Confirm Swap');

    // Swapping message and confirm transaction
    const regexPattern = new RegExp(`Swapping \\d+(?:\\.\\d+)? ${fromToken} for \\d+(?:\\.\\d+)? ${toToken}`);
    cy.get(swappingMsg).invoke('text').should('match', regexPattern);
    cy.wait(10000);
    cy.confirmMetamaskTransaction();
    cy.wait(10000);

    // Notification
    const regexPatternNotification = new RegExp(`Swap \\d+(?:\\.\\d+)? ${fromToken} for \\d+(?:\\.\\d+)? ${toToken}`);
    notificationftn(regexPatternNotification);

    // Successful card
    cy.wait(5000);
    successfulCardftn(confirmSwapBtn, swapSuccessfulTransactionLink);

    // Recent Transactions
    cy.get(walletAddress).click();
    cy.get(recentTransactions).contains('Recent Transactions').should('be.visible');

    // Transaction Links
    cy.get(transactionLinks).each((page) => {
      cy.request(page.prop('href')).as('link');
    });
    cy.get('@link').should((response) => {
      expect(response.status).to.eq(200);
    });

    // Clear all Transactions
    cy.get(clearAll).contains('(clear all)').click();
    cy.get(transactionAppear).contains('Your transactions will appear here...').should('be.visible');
    cy.get(accountMenuCloseSwap).click();

    //disconnecting wallet
    cy.disconnectMetamaskWalletFromAllDapps();
  });

  it('Details on Limit Sell card', () => {
    cy.visit('/');

    // Selecting swap side menu
    cy.get(swapSideMenu).click();

    //connecting MetaMask
    connectWalletftn();

    //Select limit tokens
    selectLimitTokensftn(fromToken, toToken, sellTokenValue, 0);

    //Sell token detaisl
    limitSellBuyTradeDetailsftn();

    //On market price
    cy.get(swapBtn).contains('Only possible to place sell orders above market rate').should('be.visible');
    cy.get(swapBtn)
      .contains('Only possible to place sell orders above market rate')
      .should('have.css', 'background-color', 'rgb(229, 229, 229)');

    //Less than market price
    limitSellBuyTokenftn(0, 1);

    //disconnecting wallet
    cy.disconnectMetamaskWalletFromAllDapps();
  });

  it('Sell token Confirm card', () => {
    cy.visit('/');

    // Selecting swap side menu
    cy.get(swapSideMenu).click();

    //connecting MetaMask
    connectWalletftn();

    //Select limit tokens
    selectLimitTokensftn(fromToken, toToken, sellTokenValue, 0);

    //Less than market price
    limitSellBuyTokenftn(0, 1);

    //Placing the order
    cy.get(swapBtn).contains('Place Order').click();

    //confirm card
    limitSellBuyConfirmDetailsftn(fromToken, toToken);

    //Executing on higher limit price
    cy.get(confirmSwapBtn).contains('Confirm Order').click();
    cy.get(swappingMsg)
      .invoke('text')
      .should(
        'match',
        new RegExp(`Submitting order to swap \\d+(?:\\.\\d+)? ${fromToken} for \\d+(?:\\.\\d+)? ${toToken}`),
      );
    cy.wait(5000);
    cy.confirmMetamaskTransaction();
    cy.wait(3000);

    //Notification
    const regexPatternNotification = /Sell order placed\./;
    notificationftn(regexPatternNotification);
    cy.wait(5000);

    //Successful card
    successfulCardftn(confirmSwapBtn, limitSuccessfulTransactionLink);

    //Limit Orders OPEN
    limitOrdersftn('OPEN', 'open', fromToken, toToken);

    //disconnecting wallet
    cy.disconnectMetamaskWalletFromAllDapps();
  });

  it('Details on Limit Buy card', () => {
    cy.visit('/');

    // Selecting swap side menu
    cy.get(swapSideMenu).click();

    //connecting MetaMask
    connectWalletftn();

    //Select limit tokens
    selectLimitTokensftn(fromToken, toToken, buyTokenValue, 1);

    //buy token detaisl
    limitSellBuyTradeDetailsftn();

    //On market price
    cy.get(swapBtn).contains('Only possible to place buy orders below market rate').should('be.visible');
    cy.get(swapBtn)
      .contains('Only possible to place buy orders below market rate')
      .should('have.css', 'background-color', 'rgb(229, 229, 229)');

    //Greater than the market price
    limitSellBuyTokenftn(1, 0);

    //disconnecting wallet
    cy.disconnectMetamaskWalletFromAllDapps();
  });

  it('Buy token Confirm card', () => {
    cy.visit('/');

    // Selecting swap side menu
    cy.get(swapSideMenu).click();

    //connecting MetaMask
    connectWalletftn();

    //Select limit tokens
    selectLimitTokensftn(fromToken, toToken, buyTokenValue, 1);

    //Greater than the market price
    limitSellBuyTokenftn(1, 0);

    //Placing the order
    cy.get(swapBtn).contains('Place Order').click();

    //confirm card
    limitSellBuyConfirmDetailsftn(fromToken, toToken);

    //Executing on lower limit price
    cy.get(confirmSwapBtn).contains('Confirm Order').click();
    cy.get(swappingMsg)
      .invoke('text')
      .should(
        'match',
        new RegExp(`Submitting order to swap \\d+(?:\\.\\d+)? ${fromToken} for \\d+(?:\\.\\d+)? ${toToken}`),
      );
    cy.wait(5000);
    cy.confirmMetamaskTransaction();
    cy.wait(3000);

    //Notification
    const regexPatternNotification = /Buy order placed\./;
    notificationftn(regexPatternNotification);
    cy.wait(5000);

    //Successful card
    successfulCardftn(confirmSwapBtn, limitSuccessfulTransactionLink);

    //disconnecting wallet
    cy.disconnectMetamaskWalletFromAllDapps();
  });

  it('Reject Cancelling Limit Order', () => {
    cy.visit('/');

    // Selecting swap side menu
    cy.get(swapSideMenu).click();

    //connecting MetaMask
    connectWalletftn();

    //Select limit tokens
    selectLimitTokensftn(fromToken, toToken, sellTokenValue, 0);

    //Less than market price
    limitSellBuyTokenftn(0, 1);

    //Placing the order
    cy.get(swapBtn).contains('Place Order').click();

    //Executing on higher limit price
    cy.get(confirmSwapBtn).contains('Confirm Order').click();
    cy.wait(5000);
    cy.confirmMetamaskTransaction();
    cy.wait(3000);

    //Successful card
    successfulCardftn(confirmSwapBtn, limitSuccessfulTransactionLink);

    //Cancel Limit Orders
    cancelLimitOrderftn();

    //Reject transaction
    cy.wait(10000);
    cy.rejectMetamaskTransaction();
    cy.wait(5000);
    cy.get(confirmSwapBtn)
      .contains('MetaMask Tx Signature: User denied transaction signature.')
      .should('be.visible')
      .click();
    cy.wait(10000);
    cy.confirmMetamaskTransaction();

    //Successful card
    cy.wait(5000);
    successfulCardftn(confirmSwapBtn, cancelLimitSuccessfulTransactionLink);

    //disconnecting wallet
    cy.disconnectMetamaskWalletFromAllDapps();
  });

  it('Cancelling the Limit order', () => {
    cy.visit('/');

    // Selecting swap side menu
    cy.get(swapSideMenu).click();

    //connecting MetaMask
    connectWalletftn();

    //Select limit tokens
    selectLimitTokensftn(fromToken, toToken, sellTokenValue, 0);

    //Less than market price
    limitSellBuyTokenftn(0, 1);

    //Placing the order
    cy.get(swapBtn).contains('Place Order').click();

    //Executing on higher limit price
    cy.get(confirmSwapBtn).contains('Confirm Order').click();
    cy.wait(5000);
    cy.confirmMetamaskTransaction();
    cy.wait(3000);

    //Successful card
    successfulCardftn(confirmSwapBtn, limitSuccessfulTransactionLink);

    //Cancel Limit Orders
    cancelLimitOrderftn();

    //Accept transaction
    cy.wait(10000);
    cy.confirmMetamaskTransaction();

    //Successful card
    cy.wait(10000);
    successfulCardftn(confirmSwapBtn, cancelLimitSuccessfulTransactionLink);

    //Limit Orders CANCELLED
    cy.get(buyBtn).contains('CANCELLED').click();
    limitOrdersftn('CANCELLED', 'cancelled', fromToken, toToken);

    //disconnecting wallet
    cy.disconnectMetamaskWalletFromAllDapps();
  });
});
