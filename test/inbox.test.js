const assert = require('assert');
const ganache = require('ganache-cli');
const Web3 = require('web3');

// Import the bytecode and ABI from the previously compiled contract
const{interface, bytecode} = require('../compile')

// Create a new instance of the web3 object
// and use the built in ganache provider to connect to it
const provider = ganache.provider();
const web3 = new Web3(provider);

let accounts;
let inbox;
const INITIAL_STRING = 'Hi there';
const MOD_STRING = "Bye"

beforeEach(async () => {

    // Get a list of unlocked account of ganache accounts
    // This uses the async-await features of the 1.0 web3 dependency
    accounts = await web3.eth.getAccounts();

    // Use one of the accounts to deploy the contract
    // de web3 library will pasre the ABI, and defines methods that can be called in the contract
    inbox = await new web3.eth.Contract(JSON.parse(interface))
        
        // Deploy the contract, deployment is always async!
        .deploy({ data: bytecode, arguments: [INITIAL_STRING]})
        
        // Send a transaction to the network for the contract deployment
        .send({ from: accounts[0], gas: '1000000'})
    
    // In this web3 version you have to manually add the provider to the contract.
    inbox.setProvider(provider);
    });

describe('Inbox', () => {
    it('deploys a contract', () =>{

        // If a contract has a an address value, you can assume that it has been successfully deployed.
        assert.ok(inbox.options.address);
    });

    it('has a default message', async () => {

        // Check that message is generated with a default value
        // We reference the contract, and access the methods parameter. Then call the method described 'message' and make the call.
        const message = await inbox.methods.message().call();
        assert.equal(message,INITIAL_STRING);
    })

    it('can update message', async () => {

        // Send the new transaction to the chain. If the transaction is unsuccessful, no assert will be made.
        await inbox.methods.setMessage(MOD_STRING).send({ from: accounts[0]});
        const message = await inbox.methods.message().call();
        assert.equal(message,MOD_STRING);
    })
});