// This script is designed to test the solidity smart contract - SuppyChain.sol -- and the various functions within
// Declare a variable and assign the compiled smart contract artifact
var SupplyChain = artifacts.require('SupplyChain')

contract('SupplyChain', function(accounts) {
    // Declare few constants and assign a few sample accounts generated by ganache-cli
    var sku = 1
    var upc = 1
    const ownerID = accounts[0]
    const originFarmerID = accounts[1]
    const originFarmName = "John Doe"
    const originFarmInformation = "Yarray Valley"
    const originFarmLatitude = "-38.239770"
    const originFarmLongitude = "144.341490"
    var productID = sku + upc
    const productNotes = "Best beans for Espresso"
    const productPrice = web3.utils.toWei('1', "ether")
    var itemState = 0
    const distributorID = accounts[2]
    const retailerID = accounts[3]
    const consumerID = accounts[4]
    const emptyAddress = '0x00000000000000000000000000000000000000'

    ///Available Accounts
    ///==================
    ///(0) 0x27d8d15cbc94527cadf5ec14b69519ae23288b95
    ///(1) 0x018c2dabef4904ecbd7118350a0c54dbeae3549a
    ///(2) 0xce5144391b4ab80668965f2cc4f2cc102380ef0a
    ///(3) 0x460c31107dd048e34971e57da2f99f659add4f02
    ///(4) 0xd37b7b8c62be2fdde8daa9816483aebdbd356088
    ///(5) 0x27f184bdc0e7a931b507ddd689d76dba10514bcb
    ///(6) 0xfe0df793060c49edca5ac9c104dd8e3375349978
    ///(7) 0xbd58a85c96cc6727859d853086fe8560bc137632
    ///(8) 0xe07b5ee5f738b2f87f88b99aac9c64ff1e0c7917
    ///(9) 0xbd3ff2e3aded055244d66544c9c059fa0851da44

    console.log("ganache-cli accounts used here...")
    console.log("Contract Owner: accounts[0] ", accounts[0])
    console.log("Farmer: accounts[1] ", accounts[1])
    console.log("Distributor: accounts[2] ", accounts[2])
    console.log("Retailer: accounts[3] ", accounts[3])
    console.log("Consumer: accounts[4] ", accounts[4])

    // 1st Test
    it("Testing smart contract function harvestItem() that allows a farmer to harvest coffee", async() => {
        const supplyChain = await SupplyChain.deployed()
        
        let result1 = await supplyChain.addFarmer(originFarmerID,{from: ownerID});
        // Mark an item as Harvested by calling function harvestItem()
        let result2 = await supplyChain.harvestItem(upc, originFarmerID, originFarmName, originFarmInformation,
             originFarmLatitude, originFarmLongitude, productNotes, {from: originFarmerID})

        // Retrieve the just now saved item from blockchain by calling function fetchItem()
        const resultBufferOne = await supplyChain.fetchItemBufferOne.call(upc)
        const resultBufferTwo = await supplyChain.fetchItemBufferTwo.call(upc)

        // Verify the result set
        assert.equal(resultBufferOne[0], sku, 'Error: Invalid item SKU')
        assert.equal(resultBufferOne[1], upc, 'Error: Invalid item UPC')
        assert.equal(resultBufferOne[2], originFarmerID, 'Error: Missing or Invalid ownerID')
        assert.equal(resultBufferOne[3], originFarmerID, 'Error: Missing or Invalid originFarmerID')
        assert.equal(resultBufferOne[4], originFarmName, 'Error: Missing or Invalid originFarmName')
        assert.equal(resultBufferOne[5], originFarmInformation, 'Error: Missing or Invalid originFarmInformation')
        assert.equal(resultBufferOne[6], originFarmLatitude, 'Error: Missing or Invalid originFarmLatitude')
        assert.equal(resultBufferOne[7], originFarmLongitude, 'Error: Missing or Invalid originFarmLongitude')
        assert.equal(resultBufferTwo[5], 0, 'Error: Invalid item State')

        assert.equal(result1.logs[0].event, 'FarmerAdded', 'Error: Invalid event emitted')     
        assert.equal(result2.logs[0].event, 'Harvested', 'Error: Invalid event emitted')      
    })    

    // 2nd Test
    it("Testing smart contract function processItem() that allows a farmer to process coffee", async() => {
        const supplyChain = await SupplyChain.deployed()
        
        // Mark an item as Processed by calling function processtItem()
        let result = await supplyChain.processItem(upc, {from: originFarmerID });

        // Retrieve the just now saved item from blockchain by calling function fetchItem()
        const resultBufferTwo = await supplyChain.fetchItemBufferTwo.call(upc);

        // Verify the result set
        assert.equal(resultBufferTwo[5],1,'Error: invalid item State');
        assert.equal(result.logs[0].event,'Processed', 'Error: Invalid event emitted')
    })    

    // 3rd Test
    it("Testing smart contract function packItem() that allows a farmer to pack coffee", async() => {
        const supplyChain = await SupplyChain.deployed()


        // Mark an item as Packed by calling function packItem()
        let result = await supplyChain.packItem(upc, {from: originFarmerID});

        // Retrieve the just now saved item from blockchain by calling function fetchItem()
        const resultBufferTwo = await  supplyChain.fetchItemBufferTwo.call(upc);

        // Verify the result set
        assert.equal(resultBufferTwo[5],2,'Error: invalid item State');
        assert.equal(result.logs[0].event,'Packed', 'Error: Invalid event emitted')
    })    

    // 4th Test
    it("Testing smart contract function sellItem() that allows a farmer to sell coffee", async() => {
        const supplyChain = await SupplyChain.deployed()
       
        let result = await supplyChain.sellItem(upc,productPrice, {from: originFarmerID});// Mark an item as ForSale by calling function sellItem()

        // Retrieve the just now saved item from blockchain by calling function fetchItem()
        const resultBufferTwo = await  supplyChain.fetchItemBufferTwo.call(upc);

        // Verify the result set
        assert.equal(resultBufferTwo[5],3,'Error: invalid item State');
        assert.equal(resultBufferTwo[4],productPrice, 'Error: invalid item price');
        assert.equal(result.logs[0].event,'ForSale', 'Error: Invalid event emitted');
    })    

    // 5th Test
    it("Testing smart contract function buyItem() that allows a distributor to buy coffee", async() => {
        const supplyChain = await SupplyChain.deployed()
        
         // Add a Distributor account
        await supplyChain.addDistributor(distributorID, {from: ownerID});
        let farmerBalanceB4Tx = await web3.eth.getBalance(originFarmerID);
        let distributorBalancdB4Tx = await web3.eth.getBalance(distributorID);
        let result = await supplyChain.buyItem(upc,{from: distributorID, value: web3.utils.toWei("1.5","ether")})
        
        let farmerBalanceAfterTx  = await web3.eth.getBalance(originFarmerID);
        // Mark an item as Sold by calling function buyItem()
        const resultBufferOne = await  supplyChain.fetchItemBufferOne.call(upc);
        const resultBufferTwo = await  supplyChain.fetchItemBufferTwo.call(upc);
        // Verify the result set
        assert.equal(resultBufferTwo[5],4,'Error: invalid item State');
        assert.equal(resultBufferTwo[6],distributorID, 'Error: invalid distributor address')
        assert.equal(resultBufferOne[2], distributorID, "Error: Distributor is not the owner")
        assert.equal(Number(resultBufferTwo[4]), Number(farmerBalanceAfterTx) - Number(farmerBalanceB4Tx), "Value sent to Farmer Account is not equal to its price")
        assert.equal(result.logs[0].event,'Sold', 'Error: Invalid event emitted');
    })    

    // 6th Test
     it("Testing smart contract function shipItem() that allows a distributor to ship coffee", async() => {
         const supplyChain = await SupplyChain.deployed()
        
         // Mark an item as Sold by calling function shipItem()
         let result = await supplyChain.shipItem(upc,{from: distributorID})
         
         // Retrieve the just now saved item from blockchain by calling function fetchItem()
         const resultBufferOne = await  supplyChain.fetchItemBufferOne.call(upc);
         const resultBufferTwo = await  supplyChain.fetchItemBufferTwo.call(upc);

         // Verify the result set
         assert.equal(resultBufferTwo[5],5,'Error: invalid item State');
         assert.equal(resultBufferTwo[6],distributorID, 'Error: invalid distributor address')
         assert.equal(resultBufferOne[2], distributorID, "Error: Distributor is not the owner")
         assert.equal(result.logs[0].event,'Shipped', 'Error: Invalid event emitted');
              
     })    

     // 7th Test
     it("Testing smart contract function receiveItem() that allows a retailer to mark coffee received", async() => {
         const supplyChain = await SupplyChain.deployed()
         
        // Add a retailer account
        await supplyChain.addRetailer(retailerID, {from: ownerID});

         // Mark an item as Sold by calling function receiveItem()
        let result = await supplyChain.receiveItem(upc,{from: retailerID});

         // Retrieve the just now saved item from blockchain by calling function fetchItem()
         const resultBufferOne = await  supplyChain.fetchItemBufferOne.call(upc);
         const resultBufferTwo = await  supplyChain.fetchItemBufferTwo.call(upc);

        // Verify the result set
        assert.equal(resultBufferTwo[5],6,'Error: invalid item State');
        assert.equal(resultBufferTwo[7],retailerID, 'Error: Invalid retailer address')
        assert.equal(resultBufferOne[2], retailerID, "Error: Retailer is not the owner")
        assert.equal(result.logs[0].event,'Received', 'Error: Invalid event emitted');
     })    

    // 8th Test
     it("Testing smart contract function purchaseItem() that allows a consumer to purchase coffee", async() => {
         const supplyChain = await SupplyChain.deployed()
         
        // Add a Consumer Account
        await supplyChain.addConsumer(consumerID, {from: ownerID});
         // Mark an item as Sold by calling function purchaseItem()
        let result = await supplyChain.purchaseItem(upc, {from: consumerID});

         // Retrieve the just now saved item from blockchain by calling function fetchItem()
        const resultBufferOne = await  supplyChain.fetchItemBufferOne.call(upc);
        const resultBufferTwo = await  supplyChain.fetchItemBufferTwo.call(upc);

        assert.equal(resultBufferTwo[5],7,'Error: invalid item State');
        assert.equal(resultBufferTwo[8],consumerID, 'Error: Invalid consumer address')
        assert.equal(resultBufferOne[2], consumerID, "Error: Consumer is not the owner")
        assert.equal(result.logs[0].event,'Purchased', 'Error: Invalid event emitted');

         // Verify the result set
        
     })    

     // 9th Test
     it("Testing smart contract function fetchItemBufferOne() that allows anyone to fetch item details from blockchain", async() => {
         const supplyChain = await SupplyChain.deployed()

         // Retrieve the just now saved item from blockchain by calling function fetchItem()
         const resultBufferOne = await  supplyChain.fetchItemBufferOne.call(upc);
        
         // Verify the result set:
         assert.equal(resultBufferOne[0], sku, "Error: Missing or Invalid sku")
         assert.equal(resultBufferOne[1], upc, "Error: Missing or Invalid upc")
         assert.equal(resultBufferOne[2], consumerID, "Error: Consumer is not the owner")
         assert.equal(resultBufferOne[3], originFarmerID, "Error: Missing or Invalid originFarmerID");
         assert.equal(resultBufferOne[4], originFarmName, "Error: Missing or Invalid originFarmName");
         assert.equal(resultBufferOne[5], originFarmInformation, "Error: Missing or Invalid originFarmName");
         assert.equal(resultBufferOne[6], originFarmLatitude, "Error: Missing or Invalid originFarmLatitude");
         assert.equal(resultBufferOne[7], originFarmLongitude, "Error: Missing or Invalid originFarmLongitude");
         
        
     })

     // 10th Test
     it("Testing smart contract function fetchItemBufferTwo() that allows anyone to fetch item details from blockchain", async() => {
        const supplyChain = await SupplyChain.deployed()

        // Retrieve the just now saved item from blockchain by calling function fetchItem()
        const resultBufferTwo = await  supplyChain.fetchItemBufferTwo.call(upc);
       
        // Verify the result set:
        assert.equal(resultBufferTwo[0], sku, "Error: Missing or Invalid sku")
        assert.equal(resultBufferTwo[1], upc, "Error: Missing or Invalid upc")
        assert.equal(resultBufferTwo[2], productID, "Error: Missing or Invalid productID")
        assert.equal(resultBufferTwo[3], productNotes, "Error: Missing or Invalid originFarmerID");
        assert.equal(resultBufferTwo[4], productPrice, "Error: Missing or Invalid Product Price");
        assert.equal(resultBufferTwo[5], 7, "Error: Missing or Invalid itemState");
        assert.equal(resultBufferTwo[6], distributorID, "Error: Invalid distributorID");
        assert.equal(resultBufferTwo[7], retailerID, "Error: Invalid retailerID");
        assert.equal(resultBufferTwo[8], consumerID, "Error: Invalid ConsumerID")
     
     })

});

