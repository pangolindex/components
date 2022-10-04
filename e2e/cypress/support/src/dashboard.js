function newsLinks(startPoint, endPoint, link, assertMsg) {
    cy.get('div.cOhaaa .fEptdj .sc-fmrZth').then(news => {
        for(var i = startPoint; i < endPoint; i++){
        cy.get(news).find(`div.sc-gzzPqb:nth-child(2)`).click()
        cy.wait(1000)
        }
        cy.get('div.slick-slider div[class="sc-eCYdqJ sc-fWjsSh fEptdj kQILAI"] p a').then(newsAssert => {
            cy.get(newsAssert).contains(link).scrollIntoView().invoke('removeAttr', 'target').click({force:true})
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