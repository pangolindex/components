import selectors from '../../../cypress/fixtures/selectors.json'
import { connectWalletftn } from '../../../cypress/src/dashboard'
import { nativeDetails } from '../../../cypress/src/dashboard'
import { notificationftn } from '../../../cypress/src/swap'
import { selectTokensPoolftn } from '../../../cypress/src/pool'
import { pairDetailsCardftn } from '../../../cypress/src/pool'
import { createEnterValuesftn } from '../../../cypress/src/pool'
import { selectTokensImportPoolftn } from '../../../cypress/src/pool'
import { importTokenDetailsftn } from '../../../cypress/src/pool'

let { connectToWallet, connectToMetamask, connectWallet, connected } = selectors.dashboard
let { poolsSideMenu, standardSideMenu, createPair, createAddTitle, noLiquidityBtn, poolSections } = selectors.pools


//To run each file
//npx  env-cmd -f env/.env npx synpress run --spec 'tests/e2e/specs/pool.spec.js' -cf synpress.json
describe('pool standard', () => {
    it('Connects with Metamask', () => {
        cy.visit('/dashboard')
        cy.get(poolsSideMenu).click()
        cy.get(standardSideMenu).click()

        //MetaMask connection
        cy.get(connectToWallet).click();
        cy.get(connectToMetamask).contains("Metamask").click();
        cy.get(connectWallet).click()

        // Switch to Metamask window and accept access
        cy.switchToMetamaskWindow();
        cy.acceptMetamaskAccess().should("be.true");
        cy.switchToCypressWindow();

        // Verify successful connection
        cy.get(connected).should("not.be.empty"); 

        // Verify changed network details
        nativeDetails(0)  
    }) 

    it('Details on Create a pair card', () => {
        cy.visit('/dashboard')
        cy.get(poolsSideMenu).click()
        cy.get(standardSideMenu).click()

        //MetaMask connection
        connectWalletftn()

        //Create a pair
        cy.get(createPair).contains("Create a pair").click()

        //select tokens that have no pair
        selectTokensPoolftn("GRELF","AKITAX","Create a pair")

        //create a pair card
        cy.get(createAddTitle).contains("Create a pair").should('be.visible')

        //Create a pair card details
        pairDetailsCardftn()
    })

    it('You are creating a pool card', () => {
        cy.visit('/dashboard')
        cy.get(poolsSideMenu).click()
        cy.get(standardSideMenu).click()

        //MetaMask connection
        connectWalletftn()

        //Creating the pair
        cy.get(createPair).contains("Create a pair").click()

        //select tokens that have no pair
        selectTokensPoolftn("GRELF","AKITAX","Create a pair")

        //entering values
        //You are creating a pool card
        createEnterValuesftn("You are creating a pool", "Create Pool & Supply", "GRELF", "AKITAX")

        //Approve transaction
        cy.confirmMetamaskTransaction()
        cy.wait(10000);

        //Notification
        notificationftn("Added")

        // //Successful card
        // successfulCardftn(confirmSwapBtn, limitSuccessfulTransactionLink)

    })

    it('Details on Add liquidity card', () => {
        cy.visit('/dashboard')
        cy.get(poolsSideMenu).click()
        cy.get(standardSideMenu).click()

        //MetaMask connection
        connectWalletftn()

        //Add Liquidity
        cy.get(createPair).contains("Create a pair").click()

        //select tokens that have a pair
        selectTokensPoolftn("GRELF","ZOO","Add Liquidity")

        //Add liquidity card
        cy.get(createAddTitle).contains("Add liquidity").should('be.visible')
        pairDetailsCardftn()
    })

    it('You will receive card', () => {
        cy.visit('/dashboard')
        cy.get(poolsSideMenu).click()
        cy.get(standardSideMenu).click()

        //MetaMask connection
        connectWalletftn()

        //Adding Liquidity
        cy.get(createPair).contains("Create a pair").click()

        //selecting tokens
        selectTokensPoolftn("GRELF","ZOO","Add Liquidity")

        //Add liquidity card
        cy.get(createAddTitle).contains("Add liquidity").should('be.visible')

        //entering values
        //You will receive card
        createEnterValuesftn("You will receive", "Confirm Supply", "GRELF", "ZOO")

        //Approve transaction
        cy.confirmMetamaskTransaction()
        cy.wait(10000);

        //Notification
        notificationftn("Added")

        // //Successful card
        //successfulCardftn(confirmSwapBtn, limitSuccessfulTransactionLink)
    })

    it('Import pool card', () => {
        cy.visit('/dashboard')
        cy.get(poolsSideMenu).click()
        cy.get(standardSideMenu).click()

        //MetaMask connection
        connectWalletftn()

        //Add Liquidity
        cy.get(createPair).contains("Import it.").click()
        cy.get(createAddTitle).contains("Import Pool").should('be.visible')

        //selecting tokens having no pool
        selectTokensImportPoolftn("GRELF", "USDt")
        cy.wait(10000)
        cy.get(noLiquidityBtn).contains("You don't have liquidity in this pool yet.").should('be.visible')
    })

    it('Pool found details', () => {
        cy.visit('/dashboard')
        cy.get(poolsSideMenu).click()
        cy.get(standardSideMenu).click()

        //MetaMask connection
        connectWalletftn()

        //Add Liquidity
        cy.get(createPair).contains("Import it.").click()
        cy.get(createAddTitle).contains("Import Pool").should('be.visible')
        
        //selecting tokens having no pool
        selectTokensImportPoolftn("ZOO", "GRELF")
        cy.wait(10000)
        importTokenDetailsftn("ZOO", "GRELF")
        cy.get(poolSections).eq(3).contains("Your Pools").should("have.css", "color", "rgb(255, 200, 0)")

    })
})
