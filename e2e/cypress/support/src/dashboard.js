import selectors from '../../fixtures/selectors.json'
const {newsBtn, newsLinks1,newsNextBtn, linksSideMenu, linksSideMenuExp, socialMediaLinks, sideMenuCollapse, sideMenuExpand } = selectors.dashboard
function newsLinks(startPoint, endPoint, link, assertMsg) {
    cy.get(newsBtn).then(news => {
        for(var i = startPoint; i < endPoint; i++){
        cy.get(news).find(newsNextBtn).click({force: true})
        cy.wait(1000)
        }
        cy.get(newsLinks1).then(newsAssert => {
            cy.get(newsAssert).contains(link).scrollIntoView().invoke('removeAttr', 'target').click({force:true})
            cy.contains(assertMsg).should('be.visible')
    })
})
}

function socialLinks(iteration, socialLinkArray) {
    cy.get(sideMenuCollapse).should(visible => {
        expect(visible).to.be.visible
    }).then(sidemenu => {
        cy.get(sidemenu).trigger('mouseover')
        cy.get(sideMenuExpand).should('be.visible')
    })
    cy.get(socialMediaLinks).eq(iteration).invoke('removeAttr', 'target').then ( test => {
        if(iteration === 1) {
           cy.request('GET', 'https://t.me/pangolindexV2').then (res => {
            expect(res.status).to.equal(200)
           })
        } else {
            cy.get(test).click()
            cy.url().should('include', `${socialLinkArray}`)
        }
    })
    
}
export {newsLinks, socialLinks}