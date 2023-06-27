import selectors from '../fixtures/selectors.json'
let { tokenSearch, selectTokens, toEstimated, amountInTokensSwap, confirmSwap, toTokenChain, swappingMsg } = selectors.swap
let { createPairToken1, createPairToken2, createAddTokenValues, createAddConfirmBtn, createAddMaxBtn, createAddOutputMsg, createAddBtn, createAddAmountField, createAddSupplyBtn, createAddTokenNamesValues } = selectors.pools
function selectTokensPoolftn(token1, token2, pairBtn ) {
    cy.get(createPairToken1).eq(0).click()
    cy.get(tokenSearch).eq(0).should('have.attr', 'placeholder', 'Search').type(token1);
    cy.get(selectTokens).contains(token1).click()
    cy.get(createPairToken2).contains("Select a Token").click()
    cy.get(tokenSearch).eq(1).should('have.attr', 'placeholder', 'Search').type(token2);
    cy.get(selectTokens).contains(token2).click()
    cy.get(createAddBtn, { timeout: 30000 }).should('contain', pairBtn).click()

}

function pairDetailsCardftn() {
  for (var i = 0; i <= 1; i++) {
    cy.get(toEstimated).eq(i).should('be.visible');
    cy.get(createAddTokenValues).eq(i).invoke('text').should('match', /^\d+(\.\d+)?$/);
    cy.get(amountInTokensSwap).eq(i).invoke('text').should('match', /^(-|0%$)/);
    cy.get(createAddConfirmBtn).contains("Enter an amount").should('be.visible')
    cy.get(createAddMaxBtn).eq(0).should('be.visible').click()
    cy.get(amountInTokensSwap).eq(i).invoke('text').should('match', /\d+/);
    cy.get(createAddAmountField).eq(i).invoke('val').should('match', /\d+/);
    }
}

function createEnterValuesftn(cardName, supplyBtn, token1, token2) {
    for (var i = 0; i <= 1; i++) {
      // Entering values
      cy.get(createAddAmountField).eq(i).type("99999");
      cy.get(createAddConfirmBtn).contains(/Insufficient \w+ balance/i).should('be.visible');
      cy.get(createAddAmountField).eq(i).clear();
      cy.get(createAddAmountField).eq(i).type("0.001");
    }
  
    cy.get(createAddSupplyBtn).eq(0).should('contain', 'Supply').click();
  
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
export{selectTokensPoolftn, pairDetailsCardftn, createEnterValuesftn}