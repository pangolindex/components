import data from '../../fixtures/pangolin-data'


function pangolinUsefulLinks (sideMenuSel, URL, assertTitle){
cy.get(sideMenuSel)
    .invoke("removeAttr","target").click()
cy.url().should("include", URL)
cy.title().should('equal', assertTitle)
}
export{pangolinUsefulLinks}