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
export {newsLinks}