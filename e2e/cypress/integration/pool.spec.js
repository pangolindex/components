/// <reference types = "cypress"/>
import 'cypress-wait-until'
import selectors from '../fixtures/selectors.json'
const {poolsSideMenu, poolsSideMenuSelect, searchFieldPool, cardTitleSuper, cardTitleAllFarm, cardBody, cardtvlApr, cardTvl, tvlAprValues, rewardsInLogos, seeDetailsBtn, detailsTitle, detailsLinks, detailsCrossBtn, superFarmTitle} = selectors.pools
let array = ["PNG logo", 'XETA logo', 'ncash logo', 'LOST logo', 'KTE logo']
describe('Pools', () => {
    
    beforeEach('',() => {
        cy.visit('/')
        Cypress.on('uncaught:exception', (err, runnable) => {
            // returning false here prevents Cypress from
            // failing the test
            return false
        }) 
        cy.get('#pool').click()
    })

    /******************* Selecting pool from side menu **************************/
    it('TC-01, Verify that the pool and farm page can be accessed from the side menu', () => {
        cy.get(poolsSideMenu)
            .should("have.css", "background-color", "rgb(255, 200, 0)")
        cy.get(poolsSideMenuSelect)
            .should("have.class","ACTIVE")
    })

    /******************* Assertions on the pools page **************************/
    it('TC-02,08,09,11,14,17 Verify that the user is able to see all the farms when clicking on the "All Farms" Label', () => {
        //Searching for a specific farm
        cy.waitUntil(() => cy.get(searchFieldPool).type("PNG"))
        cy.wait(5000)
        cy.get(cardTitleSuper).each($titlePng => {
            cy.get($titlePng).should("contain","PNG")
        })
        cy.get(searchFieldPool).clear()
        cy.wait(5000)
        //Verifying all the farms to be visible
        cy.get(cardTitleAllFarm).each($titleAllFarm => {
            cy.get($titleAllFarm).scrollIntoView().should("be.visible")
            cy.get($titleAllFarm).find(cardBody).within( $tvlApr => {
                cy.get($tvlApr).find(cardtvlApr).eq(0).within($tvl => {
                    cy.wrap($tvl).find(cardTvl).should('contain', 'TVL')
                    cy.wrap($tvl).find(tvlAprValues).then($tvlValue => {
                        cy.contains($tvlValue[0].children[0].innerText).should('be.visible')
                    })
                })
                cy.wait(5000)
                cy.get($tvlApr).find(cardtvlApr).eq(1).within($apr => {
                    cy.wrap($apr).find(cardTvl).should('contain', 'APR')
                    cy.wrap($apr).find(tvlAprValues).then($aprValue => {
                        cy.waitUntil(() => cy.contains($aprValue[0].children[0].innerText).should('be.visible'))
                    })
                })
            })
            //Assertion on the rewards in logos
            cy.get($titleAllFarm).find (rewardsInLogos).
            each( $rewardsLogos => {
                array.forEach( tokenAttr => {
                    if($rewardsLogos[0].alt === tokenAttr){
                        cy.get($rewardsLogos).should('have.attr', 'alt', tokenAttr) 
                    }
                })
            })
            //Assertion on the Details menu
            cy.get($titleAllFarm).find(seeDetailsBtn).click()
            cy.get(detailsTitle).should("contain","Details")
            //Visiting links in the details menu of each farm
            cy.waitUntil(() => cy.get(detailsLinks).each(page => {
                    cy.request(page.prop('href')).as('link');
            }));
            cy.get('@link').should(response => {
                expect(response.status).to.eq(200);
            })
            cy.get(detailsCrossBtn).eq(3).click()
        })    
    })

    /******************* Assertions on the pools page **************************/
    it('TC-03,06,07, Verify that the user is able to see all the farms when clicking on the "All Farms" Label', () => {
        cy.wait(5000)
        cy.get('#superFarm').click()
        cy.get(cardTitleAllFarm).each( $titleSuperfarm => {
            cy.get($titleSuperfarm).scrollIntoView().should("be.visible")
            cy.get($titleSuperfarm).find(cardBody).within( $tvlApr => {
                cy.get($tvlApr).find(cardtvlApr).eq(0).within($tvl => {
                    cy.wrap($tvl).find(cardTvl).should('contain', 'TVL')
                    cy.wrap($tvl).find(tvlAprValues).then($tvlValue => {
                        cy.contains($tvlValue[0].children[0].innerText).should('be.visible')
                    })
                })
                cy.wait(5000)
                cy.get($tvlApr).find(cardtvlApr).eq(1).within($apr => {
                    cy.wrap($apr).find(cardTvl).should('contain', 'APR')
                    cy.wrap($apr).find(tvlAprValues).then($aprValue => {
                        cy.contains($aprValue[0].children[0].innerText).should('be.visible')
                    })
                })
            })
            cy.get($titleSuperfarm).find(superFarmTitle).should('contain', 'Super farm')
            cy.get($titleSuperfarm).find (rewardsInLogos).
            each($superRewardsLogos => {
                array.forEach( tokenAttr => {
                    if($superRewardsLogos[0].alt === tokenAttr){
                        cy.get($superRewardsLogos).should('have.attr', 'alt', tokenAttr) 
                    }
                })
            })
        })
    })
})