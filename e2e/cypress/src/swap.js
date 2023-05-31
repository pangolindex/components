import selectors from '../fixtures/selectors.json'
let {settingBtn, slippageField, tradeDetails, tradeDetailsValues, toEstimated, unitPrice, tokensToSwap, selectTokens, fromInput, confirmSwap, confirmSwapDetails, confirmSwapMsg, confirmSwapBtn} = selectors.swap
function switchingValues (selectIter, headerAssert, token) {
    cy.get('div[class="sc-eCYdqJ sc-dkdnUF fEptdj gilYEX"] div[class="sc-eCYdqJ fEptdj"]').within( $banner => {
        cy.wrap($banner).find(`div[class="sc-eCYdqJ fEptdj"]:nth-child(${selectIter})`).within( fromToken => {
            cy.get(fromToken).contains('div[class="sc-eCYdqJ jqkPHT"]', `${headerAssert}`).should('be.visible').within( fromTokenValBtn => {
                cy.get(fromTokenValBtn).find(' ~ div[class="sc-eCYdqJ sc-gKXOVf fEptdj cjBzGg"] button.open-currency-select-button').then(fromTokenVal => {
                    cy.get(fromTokenVal).find('span.token-symbol-container').should('contain', `${token}`)
                })       
            })  
        })
    })
}
function tokenDisable (iter, value, token, toTokon) {
    switchingValues(iter, value, token)
    cy.get('div[class="sc-eCYdqJ fEptdj"] div[class="sc-eCYdqJ jqkPHT"] ~ div[class="sc-eCYdqJ sc-gKXOVf fEptdj cjBzGg"] button.open-currency-select-button').eq(toTokon).click()
    cy.get('div[class="sc-eCYdqJ sc-iNFqmR fEptdj hMCpHj"]').should('have.attr','disabled')
}
function tokenSwitching (iter, value, token, toTokon) {
    switchingValues(iter, value, token)
    cy.get('div[class="sc-eCYdqJ fEptdj"] div[class="sc-eCYdqJ jqkPHT"] ~ div[class="sc-eCYdqJ sc-gKXOVf fEptdj cjBzGg"] button.open-currency-select-button').eq(toTokon).click()
    cy.get('div[class="sc-jSMfEi icpGcW"]').contains('AVAX').click()
}
function slippage(type, selector, message){
    cy.get(settingBtn).click()
    cy.get('div[class="sc-jSMfEi bjuyXL"]').should("contain","Settings")
    cy.get(slippageField).eq(0).clear().type(type)
    cy.get(selector).should('have.text', message)
}
function disconnectWallet (fromSelector, toSelector){
    cy.get(fromSelector).should(fromValue => {
        // From field
        expect(fromValue).have.attr('placeholder','0.00')
    
    })
    cy.get(toSelector).should(toValue => {
        // To field
        expect(toValue).have.attr('placeholder','0.00')
    })
}
function connectWallet1 (fromSelector, toSelector, connectWalletBtnSel) {
    disconnectWallet(fromSelector, toSelector)
    cy.get(connectWalletBtnSel).should(enterAmountBtn => {
        expect(enterAmountBtn).to.contain('Connect Wallet')
        expect(enterAmountBtn).have.css('background-color','rgb(255, 200, 0)')
    })
}
function tradeDetailsftn (fromToken, toTokon) {
    cy.get(tradeDetails).contains("Minimum Received").should('be.visible');
    cy.get(tradeDetailsValues).should('contain', toTokon);
    cy.get(tradeDetails).contains("Price Impact").should('be.visible');
    cy.get(tradeDetails).contains("Liquidity Provider Fee").should('be.visible');
    cy.get(tradeDetailsValues).should('contain', fromToken);
    cy.get(tradeDetailsValues).eq(0).should('not.be.empty');
    cy.get(tradeDetailsValues).eq(1).should('not.be.empty');
    cy.get(toEstimated).contains("To (estimated)").should('be.visible'); 
    cy.get(unitPrice).contains("Price").should('be.visible');
    cy.get(unitPrice).contains(toTokon).should('be.visible'); 
}
function selectTokensftn (fromTokenTitle, toTokenTitle){
    cy.get(tokensToSwap).eq(0).contains("AVAX").click()
    cy.wait(15000)
    cy.get(selectTokens).eq(2).should('have.attr', 'title', fromTokenTitle).should('be.visible', { timeout: 30000 })
    cy.get(selectTokens).eq(2).should('have.attr', 'title', fromTokenTitle).click()
    cy.get(tokensToSwap).eq(1).contains("USDC").click()
    cy.get(selectTokens).eq(7).should('have.attr', 'title', toTokenTitle).should('be.visible', { timeout: 30000 })
    cy.get(selectTokens).eq(7).should('have.attr', 'title', toTokenTitle).click()
    cy.get(fromInput).type('0.001')
}
function confirmTradeDetailsftn (toTokenTitle){
    cy.get(confirmSwap).contains("Confirm Swap").should('be.visible')
    cy.get(confirmSwapDetails).contains("PNG").should('be.visible')
    cy.get(confirmSwapDetails).contains("USDt").should('be.visible')
    cy.get(confirmSwapDetails).eq(1).should('not.be.empty');
    cy.get(confirmSwapDetails).eq(3).should('not.be.empty');
    const regexPattern = new RegExp(`.*${toTokenTitle}.*`);
    cy.get(confirmSwapMsg).invoke('text').should('match', regexPattern);
}
function confirmBtnftn (btnName){
    cy.get(confirmSwapBtn).contains(btnName).should('be.visible');
    cy.get(confirmSwapBtn).contains(btnName).should("have.css", "background-color", "rgb(255, 200, 0)");
    cy.get(confirmSwapBtn).contains(btnName).click()
    
}


export {switchingValues, tokenDisable, tokenSwitching, slippage, disconnectWallet, connectWallet1, tradeDetailsftn, selectTokensftn, confirmTradeDetailsftn, confirmBtnftn}
