# SupplyChainTracker
Dapp that allows actors in a supply chain to create, interact and validate products. (IN Development)

Interact with the code, as a Farmer, Distributor, Retailer or Consumer and watch how the item is created, logged and how its owner's address changes
during every crucial step in a supply chain.

Requirements: 

    Truffle v5.11.2 (core: 5.11.2)
    Ganache v7.9.0
    Solidity - 0.8.12 (solc-js)
    Node v18.16.0

Fixed Accounts were used for testing purpuses. 
If ganache-cli is run with this command, the accounts for the actors can be hard-coded into the (given the fact that
metamask is not allowing, at the moment, access to the addresses of its user's wallets, unless it is the one in the selection: 

    ganache-cli -m "spirit supply whale amount human item harsh scare congress discover talent hamster" 

Contract Owner: 0xba1d5313f63916588fbe5b912801c07d3a7ec0b6

Farmer:  0x0a896038580ef8c2ec81ccedb531f9ad484be6ca

Distributor: 0xb705dd03a3981590b942fafffe318470f05597f9

Retailer: 0x3dfe9d12025f4c4b9271b872a8820de44d82e9c5

Consumer: 0x18d0ed0cb978ddd066c9e681de8aafcfab497648
