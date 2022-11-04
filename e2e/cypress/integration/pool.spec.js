/// <reference types = "cypress"/>
import 'cypress-wait-until'
import selectors from '../fixtures/selectors.json'
const {poolsSideMenu, poolsSideMenuSelect, searchFieldPool, cardTitleSuper, cardTitleAllFarm, cardBody, cardtvlApr, cardTvl, tvlAprValues, rewardsInLogos, seeDetailsBtn, detailsTitle, detailsLinks, detailsCrossBtn, superFarmTitle, addLiqBtn} = selectors.pools
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
    it('TC-02, Verify that the user is able to see all the farms when clicking on the "All Farms" Label', () => {
        cy.waitUntil( () => cy.get(cardTitleAllFarm)).each($titleAllFarm => {
            cy.get($titleAllFarm).scrollIntoView().should("be.visible")
        })
    })
    
    /******************* Assertions on TVL APR Rewards **************************/
    it('TC-08, Verify that the user is able to see the "TVL", "APR" and "Rewards in" on the card', () => {
        cy.waitUntil( () => cy.get(cardTitleAllFarm)).each($titleAllFarm => {
            cy.get($titleAllFarm).find(cardBody).within( $tvlApr => {
                cy.get($tvlApr).find(cardtvlApr).eq(0).within($tvl => {
                    cy.wrap($tvl).find(cardTvl).should('contain', 'TVL')
                    cy.wrap($tvl).find(tvlAprValues).then($tvlValue => {
                        cy.contains($tvlValue[0].children[0].innerText).scrollIntoView().should('be.visible')
                    })
                })
                cy.wait(1000)
                cy.get($tvlApr).find(cardtvlApr).eq(1).within($apr => {
                    cy.wrap($apr).find(cardTvl).should('contain', 'APR')
                    cy.wrap($apr).find(tvlAprValues).then($aprValue => {
                        cy.waitUntil(() => cy.contains($aprValue[0].children[0].innerText).should('be.visible'))
                    })
                })
            })
        })
        
    })

    /******************* Assertions on Rewards in logo **************************/
    it('TC-09, Verify that the native token appears under the title "Rewards in"', () => {
        cy.waitUntil( () => cy.get(cardTitleAllFarm)).each($titleAllFarm => {
            cy.get($titleAllFarm).find (rewardsInLogos).
            each( $rewardsLogos => {
                array.forEach( tokenAttr => {
                    if($rewardsLogos[0].alt === tokenAttr){
                        cy.get($rewardsLogos).should('have.attr', 'alt', tokenAttr) 
                    }
                })
            })
        })

    })

    /******************* Assertions on Searching Tocken **************************/
    it('TC-11, Verify that the user is able to search a pair by the token names', () => {
        cy.waitUntil(() => cy.get(searchFieldPool).type("PNG"))
        cy.wait(5000)
        cy.get(cardTitleSuper).each($titlePng => {
            cy.get($titlePng).should("contain","PNG")
        })
        cy.get(searchFieldPool).clear()
        
    })

    /******************* Assertions on Details **************************/
    it('TC-14, Verify that the user is able to see the details of the pair', () => {
        cy.waitUntil( () => cy.get(cardTitleAllFarm)).each($titleAllFarm => {
            cy.get($titleAllFarm).find(seeDetailsBtn).click({force:true})
            cy.get(detailsTitle).should("contain","Details")
            cy.get(detailsCrossBtn).eq(3).click()
        })
    })
    
    /**************** Assertions on Total Stake And Underlying Tokens *********************/
    it('TC-15, Verify that the user can see the values of the "Total Stake", "Underlying first token" and "Underlying second token" under the titles', () => {
        cy.waitUntil( () => cy.get(cardTitleAllFarm)).each($titleAllFarm => {
            cy.get($titleAllFarm).find(seeDetailsBtn).click({force:true})
            cy.get(detailsTitle).should("contain","Details")
            cy.wait(5000)
            
            cy.get('div[class="sc-eCYdqJ fEptdj"]').find('div[class="sc-gspIFj gSmSlS"]').eq(1).within($totalStake => {
                cy.wrap($totalStake).find('div[class="sc-jSMfEi hjZlDf"]').should('contain', 'Total Stake')
                cy.wrap($totalStake).find('div[class="sc-jSMfEi ePgoXL"]').then($totalStakeVal => {
                    cy.waitUntil(() => cy.contains($totalStakeVal[0].innerText).should('be.visible'))
                })
            })

            cy.get('[class="sc-eCYdqJ fEptdj"]').find('div[class="sc-gspIFj gSmSlS"]').eq(1).within($underlyingFirst => {
                cy.wrap($underlyingFirst).find('div[class="sc-jSMfEi hjZlDf"]').then($underlying => {
                    cy.contains($underlying[1].innerText).should("be.visible")
                })
                cy.wrap($underlyingFirst).find('div[class="sc-jSMfEi ePgoXL"]').then($underlyingFirstVal => {
                    console.log($underlyingFirstVal)
                    cy.waitUntil(() => cy.contains($underlyingFirstVal[1].innerText).should('be.visible'))
                })
            })

            cy.get('[class="sc-eCYdqJ fEptdj"]').find('div[class="sc-gspIFj gSmSlS"]').eq(1).within($underlyingSec => {
                cy.wrap($underlyingSec).find('div[class="sc-jSMfEi hjZlDf"]').then($underlying => {
                    cy.contains($underlying[2].innerText).should("be.visible")
                })
                cy.wrap($underlyingSec).find('div[class="sc-jSMfEi ePgoXL"]').then($underlyingSecVal => {
                    console.log($underlyingSecVal)
                    cy.waitUntil(() => cy.contains($underlyingSecVal[2].innerText).should('be.visible'))
                })
            })
            cy.get(detailsCrossBtn).eq(3).click()
        })
        
    })

    /******************* Assertions on the links **************************/
    it('TC-17, Verify that the user is redirected to the particular token site', () => {
        cy.waitUntil( () => cy.get(cardTitleAllFarm)).each($titleAllFarm => {
            cy.get($titleAllFarm).find(seeDetailsBtn).click({force:true})
            cy.get(detailsTitle).should("contain","Details")
            cy.wait(10000)
                cy.waitUntil(() => cy.get(detailsLinks).each(page => {
                cy.request(page.prop('href')).as('link');
            }));
            cy.get('@link').should(response => {
                expect(response.status).to.eq(200);
            })
            cy.get(detailsCrossBtn).eq(3).click()
        })        
    })
    
    /******************* Assertions on Super farm page **************************/
    it('TC-03,06,07, Verify that the user is able to see all the super farms when clicking on the "Super Farms" Label', () => {
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

    /******************* Assertions on the Your pools page **************************/
    it('TC-45, Verify that the user cannot see the pools in the Your Pools section if the wallet is not connected', () => {
        cy.wait(5000)
        cy.get('div[class="sc-jSMfEi sc-fzsDOv kMdDRR"]').contains("Your Pools").click({force:true})
        cy.get('div[class="sc-jSMfEi ZObtI"]').contains("Connect to a wallet to view your liquidity.").should("be.visible")
    })

    /******************* Assertions on Create card **************************/
    it('TC-46,47, Verify that the user cannot create a pair if the wallet is not connected', () => {
        cy.wait(5000)
        cy.get('a[class="sc-dTdPqK hkDJOQ"]').contains("Create a pair").click({force:true})
        cy.get('div[class="sc-eCYdqJ sc-iJRSss fEptdj bBumab"]').eq(0).click()
        cy.get('div[class="sc-jSMfEi icpGcW"]').contains("aaBLOCK").click()
        cy.get('div[class="sc-eCYdqJ sc-iJRSss fEptdj bBumab"]').eq(1).click()
        cy.get('div[class="sc-jSMfEi icpGcW"]').contains("AVAX").click()
        cy.get('div[class="sc-jSMfEi jLwZpX"]').contains("Connect to a wallet")
        .should("be.visible")
    })

    /******************* Assertions on Add Liquidity **************************/
    it('TC-48, Verify that the user is not able to add the liquidity from the details  section if the wallet is not connected', () => {
        cy.waitUntil( () => cy.get(cardTitleAllFarm)).each($titleAllFarm => {
            cy.get($titleAllFarm).find(seeDetailsBtn).click({force:true})
            cy.get(detailsTitle).should("contain","Details")
            cy.get('input[class="sc-iBkjds eslaVo"]').eq(3).type('12')
            cy.get('button[class="sc-gsnTZi dKnXIG"]').should("contain","Connect Wallet")
            cy.get(detailsCrossBtn).eq(3).click()
        }) 
    })

    /******************* Assertions on the Adding Liquidity **************************/
    it('TC-49, Verify that the user is not able to add the liquidity from the "All Farms" section if the wallet is not connected', () => {
        cy.waitUntil( () => cy.get(cardTitleAllFarm)).each($titleAllFarm => {
            cy.get($titleAllFarm).find(addLiqBtn).click()
            cy.get('button[class="sc-gsnTZi dKnXIG"]').should("contain","Connect Wallet")
            cy.get('div[class="sc-lbhYTY ghErwL"]').click()
        })
    })    
})