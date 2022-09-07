/// <reference types = "Cypress"/>
import selectors from '../fixtures/selectors.json'
import data from '../fixtures/pangolin-data.json'
describe('Dashboard', () => {
    const {returnToLegacyBtn, languageBtn, lightMood, darkMood, noOfLanguages, watchListBtn, watchlistDropDown, tokenSearch, tokenSelect, tokenAssert, tokenMouseOver, crossBtn, switchToken,tokenSection, watchListTokenAssert, languageDropdown, watchlistTimeBtn, watchlistLinkBtn, watchlistTradeBtn} = selectors.dashboard
    const {returnToLegacy, array, tokenName, AvaxToken, switchArray} = data
    const legUrl = "https://legacy.pangolin.exchange/#/"
    beforeEach('',() => {
        cy.visit('/dashboard')
    })

    it('Verify that Return to lagacy site button redirects the user to the "Legacy site" page', () => {
        cy.get(returnToLegacyBtn)
            .should('contain', returnToLegacy)
            .invoke('removeAttr', 'target').click()
        cy.url().should('include', legUrl)
    })

    it('Verify that the user can change the language', () => {
        for(var i=1; i < noOfLanguages+1; i++){
            cy.get(languageBtn).click()
            cy.get(`${languageDropdown}:nth-child(${i})`).click();
            cy.get(returnToLegacyBtn).scrollIntoView()
                .should('contain', array[i-1])
        }
    })

    it('Verify that the user can change the theme to light mode', () => {
        cy.get(lightMood)
            .invoke('attr', 'alt')
            .should('contain', 'Setting')
        cy.get(lightMood).click()
        cy.get(darkMood)
            .invoke('attr', 'alt')
            .should('contain', 'NightMode')
    })

    it('Verify that the user can change the theme to dark mode', () => {
        cy.get(lightMood).click()
        cy.get(darkMood).click()
        cy.get(lightMood)
            .invoke('attr', 'alt')
            .should('contain', 'Setting')
    })

    it('Verify that the user can search for a specific token to add to the watchlist', () => {
        cy.contains(/Dashboard/)
        cy.get(watchListBtn).
            should('be.visible').click()
        cy.get(watchlistDropDown)
            .should('be.visible')
        cy.get(tokenSearch).type(tokenName)
        cy.get(tokenSelect).eq(0).click()
        cy.get(tokenAssert)
            .should("contain",tokenName)
    })

    it("Verify that the user can add the token to the watchlist", () => {
        cy.contains(/Dashboard/)
        cy.get(watchListBtn)
            .should('be.visible').click()
        cy.get(watchlistDropDown)
            .should('be.visible')
        cy.get(tokenSelect).eq(0).click()
        cy.get(tokenAssert)
            .should("contain", AvaxToken)
    })

    it('verify that the user is able to switch between the tokens in watchlist', () => {
        cy.contains(/Dashboard/i)
        // let switchArray = ['PNG','AGF', 'AVAX']
        for (var i =1; i < 3; i++) {
            cy.get(`${switchToken}:nth-child(${i})`).click()
            cy.get(watchListTokenAssert)
                .should('contain',switchArray[i-1])
        }
    })

    let chartTimeArray = ['1D', '1W', '1M', '1Y', 'ALL']
    chartTimeArray.forEach( time => {
    it(`Verify that the chart is updated by pressing ${time} in watchlist`, () => {
        cy.get(watchlistTimeBtn)
            .should('have.attr', 'color', 'text1')
                .contains(time).click()
        cy.get(watchlistTimeBtn)
            .contains(time)
            .should('have.attr', 'color', 'mustardYellow')
            .should('have.class','sc-gsnTZi gPFlPI')
    })
})

    it('Verify that the user can remove the token from the watchlist', () => {
        cy.contains(/Dashboard/)
        cy.get(tokenSection).then($avax => {
            if($avax.text().includes(AvaxToken)){
                cy.get(tokenMouseOver).eq(0)
                    .trigger("mouseover")
                cy.get(crossBtn).click()
            } 
            else {
                cy.get(watchListBtn)
                    .should('be.visible').click()
                cy.get(watchlistDropDown)
                    .should('be.visible')
                cy.get(tokenSearch).type(tokenName)
                cy.get(tokenSelect).eq(0).click()
                cy.get(tokenAssert)
                    .should("contain",tokenName)
                cy.get(tokenAssert).eq(0).trigger("mouseover")
                cy.get(crossBtn).click()
            }
        })  
    })

    it('Verify that Link button redirects the user to the info.exchange page', () => {
        let linkUrl = "https://info.pangolin.exchange/#/token/0x60781C2586D68229fde47564546784ab3fACA982"
        cy.get(watchlistLinkBtn)
            .invoke("removeAttr","target").click()
        cy.url().should("include", linkUrl)
        cy.contains(/pangolin/i)
            .should("be.visible")
    })

    it('Verify that the user can make a trade from the Dashboard', () => {
        let swap = "https://dev.pangolin.exchange/#/swap"
        cy.get(watchlistTradeBtn)
            .contains(/trade/i).click()
        cy.url()
            .should("include", swap)
        cy.contains(/24H Change/i)
            .should("be.visible")
    })
})