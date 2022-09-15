function newsLinks(startPoint, endPoint, link, assertMsg) {
    cy.get('div.cOhaaa .fEptdj .iNbpQO .sc-gzzPqb').then(news => {
        for(var i = startPoint; i < endPoint; i++){
        cy.get(news).find(`div.qPvDD:nth-child(2)`).click()
        cy.wait(1000)
        }
        cy.get('div.slick-current div[class="sc-eCYdqJ sc-hjriPb fEptdj jYTHXE"] p').then(newsAssert => {
            cy.get(newsAssert).contains(link).scrollIntoView().invoke('removeAttr', 'target').click()
            cy.contains(assertMsg).should('be.visible')
    })
})
}
function socialLinks(iteration, socialLinkArray) {
    cy.get('div[class="sc-bsbRJL jTTilZ"]').should(visible => {
        expect(visible).to.be.visible
    }).then(sidemenu => {
        cy.get(sidemenu).trigger('mouseover')
        cy.get('div[class="sc-bsbRJL hLwfbT"]').should('be.visible')
    })
    cy.get('div[class="sc-hXRMBi dfHWNS"] a').eq(iteration).invoke('removeAttr', 'target').click()
    cy.url().should('include', `${socialLinkArray}`)
}
export {newsLinks, socialLinks}