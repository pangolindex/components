import selectors from '../fixtures/selectors.json'

let { tokenSearch, selectTokens, toEstimated, amountInTokensSwap, confirmSwap, toTokenChain, swappingMsg } = selectors.swap
let { createPairToken1, createPairToken2, createAddTokenValues, createAddConfirmBtn, createAddMaxBtn, createAddOutputMsg, createAddBtn, createAddAmountField, createAddSupplyBtn, createAddTokenNamesValues, importToken1, importSelectToken, poolFound, importTokenLogo, importTokenName, importTokenDetails, importTokenValues, importManageBtn, createApproveBtn } = selectors.pools

function selectTokensPoolftn(token1, token2, pairBtn ) {
    cy.get(createPairToken1).eq(0).click()
    cy.get(tokenSearch).eq(0).should('have.attr', 'placeholder', 'Search').type(token1);
    cy.get(selectTokens).contains(token1).click()
    cy.get(createPairToken2).contains("Select a Token").click()
    cy.get(tokenSearch).eq(1).should('have.attr', 'placeholder', 'Search').type(token2);
    cy.get(selectTokens).contains(token2).click()
    cy.get(createAddBtn, { timeout: 30000 }).should('contain', pairBtn).click()

}

function selectTokensImportPoolftn(token1, token2) {
  cy.get(importToken1).eq(0).click()
  cy.get(tokenSearch).eq(0).should('have.attr', 'placeholder', 'Search').type(token1);
  cy.get(selectTokens).contains(token1).click()
  cy.get(importSelectToken).contains("Select a token").click()
  cy.get(tokenSearch).eq(1).should('have.attr', 'placeholder', 'Search').type(token2);
  cy.get(selectTokens).contains(token2).click()
}

function pairDetailsCardftn() {
  for (var i = 0; i <= 1; i++) {
    cy.get(createAddAmountField).eq(i).clear();
    cy.get(toEstimated).eq(i).should('be.visible');
    cy.get(createAddTokenValues).eq(i).invoke('text').should('match', /^\d+(\.\d+)?$/);
    cy.get(amountInTokensSwap).eq(i).invoke('text').should('match', /^(0|\d+(.\d+)?|-)(%)?$/);
    cy.get(createAddConfirmBtn).contains("Enter an amount").should('be.visible')
    cy.get(createAddMaxBtn).eq(0).should('be.visible').click()
    cy.get(amountInTokensSwap).eq(i).invoke('text').should('match', /\d+/);
    cy.get(createAddAmountField).eq(i).invoke('val').should('match', /\d+/);
    }
}

function importTokenDetailsftn(token1, token2) {
  cy.get(poolFound).contains("Pool Found!").should('be.visible');
  cy.get(importTokenLogo).eq(0).should('have.attr', 'alt', `${token1} logo`);
  cy.get(importTokenLogo).eq(1).should('have.attr', 'alt', `${token2} logo`);
  cy.get(importTokenName).should(($div) => {
    expect($div).to.contain(token1);
    expect($div).to.contain('/');
    expect($div).to.contain(token2);
  });

  const poolFoundArr = ["PGL", "Your pool share:", token1, token2];
  for (let i = 0; i < poolFoundArr.length; i++) {
    cy.get(importTokenDetails).contains(poolFoundArr[i]).should('be.visible');
    cy.get(importTokenValues).eq(i).should('not.be.empty');
  }

  cy.get(importManageBtn).contains("Manage").click();
  
}

function createEnterValuesftn(cardName, supplyBtn, token1, token2) {
    for (var i = 0; i <= 1; i++) {
      // Entering values
      cy.get(createAddAmountField).eq(i).clear();
      cy.get(createAddAmountField).eq(i).type("99999");
      cy.get(createAddConfirmBtn).contains(/Insufficient [\w.]+ balance/i).should('be.visible');
      cy.get(createAddAmountField).eq(i).clear();
      cy.get(createAddAmountField).eq(i).type("0.001");
      
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
    cy.get(createAddSupplyBtn, { timeout: 30000 }).eq(0).should('contain', 'Supply').click();
  
    // You will receive card
    cy.get(confirmSwap).contains(cardName).should('be.visible');
    cy.get(createAddTokenNamesValues).eq(0).contains(new RegExp(`^\\d+\\.\\d+ ${token1}$`)).should('be.visible');
    cy.get(createAddTokenNamesValues).eq(1).contains(new RegExp(`^\\d+\\.\\d+ ${token2}$`)).should('be.visible');
    cy.get(toTokenChain).contains("PGL").should('be.visible');
    cy.get(toTokenChain).contains("Share of Pool").should('be.visible');
    cy.get(createAddOutputMsg).contains("Output is estimated. If the price changes by more than 0.5% your transaction will revert.").should('be.visible');
    cy.get(createAddSupplyBtn).eq(1).should('contain', supplyBtn).click();
    cy.get(swappingMsg).contains(new RegExp(`^Supplying \\d+\\.\\d+ ${token1} and \\d+\\.\\d+ ${token2}$`)).should('be.visible');
  }
export{selectTokensPoolftn, pairDetailsCardftn, createEnterValuesftn, selectTokensImportPoolftn, importTokenDetailsftn}