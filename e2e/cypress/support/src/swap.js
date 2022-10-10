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
    cy.get('div[class="sc-lmHNfd chzbHR"]').should('have.attr','disabled')
}
export {switchingValues, tokenDisable}