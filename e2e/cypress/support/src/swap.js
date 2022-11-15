import selectors from '../../fixtures/selectors.json'
const {settingBtn, slippageField} =selectors.swap
function switchingValues (selectIter, headerAssert, token) {
    cy.get('div[class="sc-eCYdqJ sc-brCFrO fEptdj gIDZHZ"] div[class="sc-eCYdqJ kMEFVW"]').within( $banner => {
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
    cy.get('div[class="sc-bdxVC htyzVf"]').should('have.attr','disabled')
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

export {switchingValues, tokenDisable, tokenSwitching, slippage, disconnectWallet, connectWallet1}
