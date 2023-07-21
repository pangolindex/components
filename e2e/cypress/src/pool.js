import selectors from '../fixtures/selectors.json';
import data from '../fixtures/pangolin-data.json';

let { tokenSearch, selectTokens, toEstimated, amountInTokensSwap, confirmSwap, toTokenChain, swappingMsg } =
  selectors.swap;
let {
  createPairToken1,
  createPairToken2,
  createAddTokenValues,
  createAddConfirmBtn,
  createAddMaxBtn,
  createAddOutputMsg,
  createAddBtn,
  createAddAmountField,
  createAddSupplyBtn,
  createAddTokenNamesValues,
  importToken1,
  importSelectToken,
  poolFound,
  importTokenLogo,
  importTokenName,
  importTokenDetails,
  importTokenValues,
  importManageBtn,
  createApproveBtn,
  depositDetails,
  depositDetailsValues,
  farmPGL,
  farmApproveBtn,
  farmPercentBtns,
  farmPercentBtnsActive,
} = selectors.pools;
let { depositDetailsArr, depositDetailsValuesArr } = data.pools;
let { percentBtnArr } = data.swap;

function selectTokensPoolftn(token1, token2, pairBtn) {
  cy.get(createPairToken1).eq(0).click();
  cy.get(tokenSearch).eq(0).should('have.attr', 'placeholder', 'Search').type(token1);
  cy.get(selectTokens).contains(token1).click();
  cy.get(createPairToken2).contains('Select a Token').click();
  cy.get(tokenSearch).eq(1).should('have.attr', 'placeholder', 'Search').type(token2);
  cy.get(selectTokens).contains(token2).click();
  cy.get(createAddBtn, { timeout: 30000 }).should('contain', pairBtn).click();
}

function selectTokensImportPoolftn(token1, token2) {
  cy.get(importToken1).eq(0).click();
  cy.get(tokenSearch).eq(0).should('have.attr', 'placeholder', 'Search').type(token1);
  cy.get(selectTokens).contains(token1).click();
  cy.get(importSelectToken).contains('Select a token').click();
  cy.get(tokenSearch).eq(1).should('have.attr', 'placeholder', 'Search').type(token2);
  cy.get(selectTokens).contains(token2).click();
}

function pairDetailsCardftn(startIndex) {
  for (var i = startIndex; i <= startIndex + 1; i++) {
    cy.get(createAddAmountField).eq(i).clear();
    cy.get(createAddTokenValues)
      .eq(i)
      .invoke('text')
      .should('match', /^\d+(\.\d+)?$/);
    cy.get(amountInTokensSwap)
      .eq(i)
      .invoke('text')
      .should('match', /^(0|\d+(.\d+)?|-)(%)?$/);
    cy.get(createAddConfirmBtn).contains('Enter an amount').should('be.visible');
    cy.get(createAddMaxBtn).eq(startIndex).should('be.visible').click();
    cy.get(amountInTokensSwap).eq(i).invoke('text').should('match', /\d+/);
    cy.get(createAddAmountField).eq(i).invoke('val').should('match', /\d+/);
  }
}

function importTokenDetailsftn(token1, token2) {
  cy.get(poolFound).contains('Pool Found!').should('be.visible');
  cy.get(importTokenLogo).eq(0).should('have.attr', 'alt', `${token1} logo`);
  cy.get(importTokenLogo).eq(1).should('have.attr', 'alt', `${token2} logo`);
  cy.get(importTokenName).should(($div) => {
    expect($div).to.contain(token1);
    expect($div).to.contain('/');
    expect($div).to.contain(token2);
  });

  const poolFoundArr = ['PGL', 'Your pool share:', token1, token2];
  for (let i = 0; i < poolFoundArr.length; i++) {
    cy.get(importTokenDetails).contains(poolFoundArr[i]).should('be.visible');
    cy.get(importTokenValues).eq(i).should('not.be.empty');
  }

  cy.get(importManageBtn).contains('Manage').click();
}

function createEnterValuesftn(cardName, supplyBtn, token1, token2) {
  for (var i = 0; i <= 1; i++) {
    // Entering values
    cy.get(createAddAmountField).eq(i).clear();
    cy.get(createAddAmountField).eq(i).type('99999');
    cy.get(createAddConfirmBtn)
      .contains(/Insufficient [\w.]+ balance/i)
      .should('be.visible');
    cy.get(createAddAmountField).eq(i).clear();
    cy.get(createAddAmountField).eq(i).type('0.001');
  }

  // Verify and approve if needed
  for (var i = 0; i <= 1; i++) {
    const btnSelector = i === 0 ? createApproveBtn : createAddSupplyBtn;

    cy.get(btnSelector, { timeout: 30000 })
      .eq(0)
      .then(($buttons) => {
        const approveButton = Cypress.$($buttons).filter((_, button) => {
          const buttonText = Cypress.$(button).text().trim();
          return buttonText.startsWith('Approve');
        });

        if (approveButton.length) {
          cy.wrap(approveButton).click();
          cy.wait(5000);
          cy.confirmMetamaskPermissionToSpend();
          cy.wait(15000);
        }
      });
  }

  //Supply button
  cy.get(createAddSupplyBtn, { timeout: 50000 }).eq(0).should('contain', 'Supply').click();

  // You will receive card

  cy.contains('You will receive').invoke('text').should('include', cardName);
  cy.get(createAddTokenNamesValues)
    .eq(0)
    .contains(new RegExp(`^\\d+\\.\\d+ ${token1}$`))
    .should('be.visible');
  cy.get(createAddTokenNamesValues)
    .eq(1)
    .contains(new RegExp(`^\\d+\\.\\d+ ${token2}$`))
    .should('be.visible');
  cy.get(toTokenChain).contains('PGL').should('be.visible');
  cy.get(toTokenChain).contains('Share of Pool').should('be.visible');
  cy.get(createAddOutputMsg)
    .contains('Output is estimated. If the price changes by more than 0.5% your transaction will revert.')
    .should('be.visible');
  cy.get(createAddSupplyBtn).eq(1).should('contain', supplyBtn).click();
  cy.get(swappingMsg)
    .contains(new RegExp(`^Supplying \\d+\\.\\d+ ${token1} and \\d+\\.\\d+ ${token2}$`))
    .should('be.visible');
}

function depositDetailsftn() {
  //Deposit Details
  cy.get(confirmSwap).contains('Deposit').should('be.visible');
  cy.get(toEstimated)
    .invoke('text')
    .should('match', /^Balance: \d+\.\d+$/);
  for (var i = 0; i <= 2; i++) {
    cy.get(depositDetails).eq(i).should('contain', depositDetailsArr[i]);
    cy.get(depositDetailsValues).eq(i).invoke('text').should('match', new RegExp(depositDetailsValuesArr[i]));
  }
}

function percentBtnsFtn() {
  //Trade buttons
  cy.get(farmPGL).clear();
  cy.get(farmApproveBtn).contains('Approve').should('have.css', 'background-color', 'rgb(229, 229, 229)');
  cy.get(farmApproveBtn).contains('Enter an amount').should('be.visible');

  //Percent buttons
  for (let i = 3; i > 0; i--) {
    cy.get(farmPercentBtns).eq(percentBtnArr[i]).click();
    cy.get(farmPercentBtnsActive).should(($element) => {
      expect($element.css('background-color')).to.equal('rgb(255, 200, 0)');
    });
    cy.get(farmPGL).should('not.have.value', '0.00');
    cy.get(importManageBtn).contains('Approve').should('have.css', 'background-color', 'rgb(255, 200, 0)');
  }
}
export {
  selectTokensPoolftn,
  pairDetailsCardftn,
  createEnterValuesftn,
  selectTokensImportPoolftn,
  importTokenDetailsftn,
  depositDetailsftn,
  percentBtnsFtn,
};
